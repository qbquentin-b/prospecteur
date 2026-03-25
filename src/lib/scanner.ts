import * as cheerio from 'cheerio';
import { Lead } from '../types/lead';

export async function detectCMS(url: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return undefined;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Look for meta generator tags
    const generator = $('meta[name="generator"]').attr('content');
    if (generator) {
      if (generator.toLowerCase().includes('wordpress')) return 'WordPress';
      if (generator.toLowerCase().includes('wix')) return 'Wix';
      if (generator.toLowerCase().includes('shopify')) return 'Shopify';
      if (generator.toLowerCase().includes('squarespace')) return 'Squarespace';
    }

    // Look for path signatures in source
    if (html.includes('/wp-content/')) return 'WordPress';
    if (html.includes('window.Shopify')) return 'Shopify';
    if (html.includes('wix.com')) return 'Wix';
    if (html.includes('ghost.org')) return 'Ghost';
    if (html.includes('_next/static')) return 'Next.js';

    return undefined;
  } catch {
    // If it aborts due to timeout, return undefined
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchPageSpeed(url: string): Promise<number | undefined> {
  // Using an arbitrary API key if process.env isn't set
  // This is a free tier limit without a key
  const API_KEY = process.env.GOOGLE_API_KEY || '';
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${API_KEY ? `&key=${API_KEY}` : ''}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s for pagespeed

  try {
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return undefined;

    const data = await res.json();
    // Score is typically 0.0 to 1.0, convert to 0-100
    const score = data.lighthouseResult?.categories?.performance?.score;
    return score !== undefined ? Math.round(score * 100) : undefined;
  } catch (error) {
    console.error('PageSpeed Fetch error:', error);
    return undefined; // Analysis failed
  } finally {
    clearTimeout(timeoutId);
  }
}

export function calculateScore(lead: Omit<Lead, 'opportunityScore'>): number {
  let score = 0;

  // L'impact de la fiche non revendiquée est réduit de 4 à 2 points.
  // Une fiche non revendiquée reste une opportunité, mais moins critique qu'un site inexistant ou très lent.
  if (!lead.googleBusiness.isClaimed) {
    score += 2;
  }

  if (lead.googleBusiness.rating < 3.5) {
    score += 2;
  }

  if (!lead.techAudit.hasWebsite) {
    score += 5;
  } else {
    // Le site existe, analysons sa performance.
    if (lead.techAudit.pageSpeedScore !== undefined) {
      if (lead.techAudit.pageSpeedScore < 50) {
        score += 3;
      } else if (lead.techAudit.pageSpeedScore <= 89) {
        score += 1;
      }
    } else {
      // Si on n'a pas pu récupérer le score (erreur PageSpeed ou timeout),
      // on pénalise légèrement l'incertitude (peut refléter un site bloquant ou très lent).
      score += 1.5;
    }

    // Ajout de pénalités liées aux technologies détectées.
    // Un site fait maison avec un constructeur low-cost ou inconnu est souvent une bonne cible pour une refonte pro.
    if (lead.techAudit.cms) {
      const cms = lead.techAudit.cms.toLowerCase();
      if (cms === 'wix' || cms === 'squarespace' || cms === '1&1' || cms === 'weebly') {
        score += 2; // Constructeur grand public : forte opportunité d'upsell vers une solution pro (WordPress/Next.js)
      } else if (cms === 'wordpress') {
        score += 0.5; // WordPress : opportunité de maintenance ou refonte si le score de perf est mauvais
      }
    } else {
      // Pas de CMS détecté (site custom obsolète, HTML pur ou outil propriétaire type "DISH Digital")
      score += 2.5;
    }
  }

  return Math.min(score, 10); // Plafonne le score à 10 maximum
}
