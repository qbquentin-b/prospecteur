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

  if (!lead.googleBusiness.isClaimed) {
    score += 4;
  }

  if (lead.googleBusiness.rating < 3.5) {
    score += 2;
  }

  if (!lead.techAudit.hasWebsite) {
    score += 5;
  } else if (lead.techAudit.pageSpeedScore !== undefined) {
    if (lead.techAudit.pageSpeedScore < 50) {
      score += 3;
    } else if (lead.techAudit.pageSpeedScore <= 89) {
      score += 1;
    }
  }

  return score; // Max possible is normally 10
}
