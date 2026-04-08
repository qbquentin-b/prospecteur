import React, { useEffect, useMemo } from 'react';
import { Lead } from '../types/lead';

interface SidebarProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  allLeads?: Lead[];
}

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function Sidebar({ lead, isOpen, onClose, allLeads = [] }: SidebarProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const localCompetitors = useMemo(() => {
    if (!lead || !lead.lat || !lead.lng || !allLeads || allLeads.length <= 1) return [];

    // Sort all other leads by distance
    const withDistance = allLeads
      .filter(l => l.id !== lead.id && l.lat && l.lng)
      .map(l => ({
        ...l,
        distance: calculateDistance(lead.lat!, lead.lng!, l.lat!, l.lng!)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Get top 3 closest competitors

    return withDistance;
  }, [lead, allLeads]);

  if (!isOpen || !lead) return null;

  return (
    <div aria-labelledby="slide-over-title" aria-modal="true" className="absolute inset-0 z-30 flex justify-end overflow-hidden" role="dialog">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative w-full max-w-xl bg-surface-light dark:bg-surface-dark shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex-none px-6 py-6 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-start gap-4 pr-10">
            <div className="h-16 w-16 flex-none rounded-lg bg-white border border-border-light flex items-center justify-center text-2xl font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:border-border-dark dark:text-slate-200">
              {lead.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1 w-full">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white" id="slide-over-title">{lead.name}</h2>
              {lead.googleBusiness.googleMapsUri ? (
                <a
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
                  href={lead.googleBusiness.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {lead.address}
                </a>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {lead.address}
                </div>
              )}
              <div className="mt-2 flex items-center gap-3">
                {lead.techAudit.website && (
                  <a className="group flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark transition-colors" href={lead.techAudit.website} target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    {lead.techAudit.website}
                    <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                  </a>
                )}
                <button className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  Copy Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              Audit Rapide
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border-light bg-slate-50 p-3 text-center dark:border-border-dark dark:bg-slate-800/50">
                <div className="text-[10px] font-semibold uppercase text-slate-500">Score</div>
                <div className={`mt-1 text-xl font-bold ${lead.opportunityScore >= 7 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {lead.opportunityScore.toFixed(1)}/10
                </div>
                <div className="mt-1 text-[10px] text-slate-400">{lead.opportunityScore >= 7 ? 'Chaud' : 'Tiède'}</div>
              </div>
              <div className="rounded-lg border border-border-light bg-slate-50 p-3 text-center dark:border-border-dark dark:bg-slate-800/50">
                <div className="text-[10px] font-semibold uppercase text-slate-500">Performance</div>
                <div className={`mt-1 text-xl font-bold ${
                  (lead.techAudit.pageSpeedScore || 0) < 50 ? 'text-red-600 dark:text-red-400' :
                  (lead.techAudit.pageSpeedScore || 0) < 80 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'
                }`}>
                  {lead.techAudit.pageSpeedScore ?? 'N/A'}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  {lead.techAudit.pageSpeedScore !== undefined
                    ? (lead.techAudit.pageSpeedScore < 50 ? 'Lent' : lead.techAudit.pageSpeedScore < 80 ? 'Moyen' : 'Rapide')
                    : (lead.techAudit.hasWebsite ? 'Non testé' : 'Pas de Site')}
                </div>
              </div>
              <div className="rounded-lg border border-border-light bg-slate-50 p-3 text-center dark:border-border-dark dark:bg-slate-800/50">
                <div className="text-[10px] font-semibold uppercase text-slate-500">Sécurité</div>
                <div className={`mt-1 text-xl font-bold ${lead.googleBusiness.isClaimed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {lead.googleBusiness.isClaimed ? '95' : '42'}
                </div>
                <div
                  className="mt-1 text-[10px] text-slate-400 cursor-help"
                  title={lead.googleBusiness.isClaimed ? "Cette fiche Google est gérée par le propriétaire." : "Cette entreprise n'a pas revendiqué sa fiche Google. Opportunité de service."}
                >
                  {lead.googleBusiness.isClaimed ? 'Revendiqué' : 'Non revendiqué'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">store</span>
              Profil Google Business
            </h3>

            {!lead.googleBusiness.isClaimed && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10 mb-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-red-100 p-1.5 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Fiche Google non revendiquée</h4>
                    <p className="mt-1 text-xs text-red-700/80 dark:text-red-400/80 leading-relaxed">
                      Cette entreprise n&apos;a pas revendiqué sa fiche Google. C&apos;est une excellente opportunité pour proposer des services d&apos;optimisation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="flex text-orange-400 text-sm">
                    {[...Array(Math.floor(lead.googleBusiness.rating))].map((_, i) => (
                      <span key={`f-${i}`} className="material-symbols-outlined text-[16px] fill-current">star</span>
                    ))}
                    {lead.googleBusiness.rating % 1 >= 0.5 && <span className="material-symbols-outlined text-[16px]">star_half</span>}
                    {[...Array(5 - Math.floor(lead.googleBusiness.rating) - (lead.googleBusiness.rating % 1 >= 0.5 ? 1 : 0))].map((_, i) => (
                      <span key={`e-${i}`} className="material-symbols-outlined text-[16px] text-slate-300">star</span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{lead.googleBusiness.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">({lead.googleBusiness.reviewCount} avis)</span>
                </div>
                <a className="text-xs font-medium text-primary hover:underline" href="#">Voir Tout</a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">contact_page</span>
              Coordonnées
            </h3>
            <div className="flex flex-col gap-3">
              {lead.contact.email && lead.contact.email.map((email, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-border-light bg-white p-3 shadow-sm dark:border-border-dark dark:bg-background-dark">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white"><a href={`mailto:${email}`}>{email}</a></div>
                      <div className="text-[10px] text-slate-500">Email Trouvé</div>
                    </div>
                  </div>
                  <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              ))}
              {lead.contact.phone && lead.contact.phone.map((phone, idx) => (
                <div key={`p-${idx}`} className="flex items-center justify-between rounded-lg border border-border-light bg-white p-3 shadow-sm dark:border-border-dark dark:bg-background-dark">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-50 p-2 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                      <span className="material-symbols-outlined text-[18px]">phone</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white"><a href={`tel:${phone.replace(/\D/g,'')}`}>{phone}</a></div>
                      <div className="text-[10px] text-slate-500">Numéro de Téléphone</div>
                    </div>
                  </div>
                  <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-3 mt-2">
                {lead.contact.facebook ? (
                  <a className="flex flex-1 items-center justify-center gap-2 rounded border border-border-light bg-slate-50 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all dark:border-border-dark dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" href={lead.contact.facebook} target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">thumb_up</span>
                    Facebook
                  </a>
                ) : (
                  <span className="flex flex-1 items-center justify-center gap-2 rounded border border-border-light bg-slate-50 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all dark:border-border-dark dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 opacity-50 cursor-not-allowed">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">person_off</span>
                    Pas de Facebook
                  </span>
                )}

                {lead.contact.linkedin ? (
                  <a className="flex flex-1 items-center justify-center gap-2 rounded border border-border-light bg-slate-50 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all dark:border-border-dark dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" href={lead.contact.linkedin} target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">work</span>
                    LinkedIn
                  </a>
                ) : (
                  <span className="flex flex-1 items-center justify-center gap-2 rounded border border-border-light bg-slate-50 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all dark:border-border-dark dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 opacity-50 cursor-not-allowed">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">person_off</span>
                    Pas de LinkedIn
                  </span>
                )}
              </div>
            </div>
          </div>

          {localCompetitors.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">radar</span>
                Analyse Concurrentielle Locale (Top 3)
              </h3>
              <div className="flex flex-col gap-3">
                {localCompetitors.map((competitor, idx) => (
                  <div key={idx} className="flex flex-col gap-2 rounded-lg border border-border-light bg-slate-50 p-3 dark:border-border-dark dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[200px]" title={competitor.name}>
                        {competitor.name}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        à {(competitor.distance * 1000).toFixed(0)}m
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-orange-400">star</span>
                        <span className="font-bold">{competitor.googleBusiness.rating.toFixed(1)}</span>
                        <span className="text-slate-400">({competitor.googleBusiness.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-blue-500">speed</span>
                        <span className={`font-bold ${competitor.techAudit.pageSpeedScore ? (competitor.techAudit.pageSpeedScore >= 80 ? 'text-green-600' : competitor.techAudit.pageSpeedScore < 50 ? 'text-red-600' : 'text-orange-500') : 'text-slate-400'}`}>
                          {competitor.techAudit.pageSpeedScore ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                    {/* FOMO Actionable Insights */}
                    {competitor.googleBusiness.rating > lead.googleBusiness.rating && (
                      <div className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium">
                        🚨 Ce concurrent direct est mieux noté sur Google ({competitor.googleBusiness.rating.toFixed(1)} contre {lead.googleBusiness.rating.toFixed(1)}).
                      </div>
                    )}
                    {(competitor.techAudit.pageSpeedScore ?? 0) > (lead.techAudit.pageSpeedScore ?? 0) + 15 && lead.techAudit.hasWebsite && (
                      <div className="mt-1 text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                        ⚠️ Leur site web est beaucoup plus rapide que le leur.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              Angles d&apos;attaque (Icebreakers)
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {!lead.googleBusiness.isClaimed && (
                <li><strong className="text-red-600 dark:text-red-400">Argument :</strong> Proposer de sécuriser sa fiche Google pour éviter le vol de trafic.</li>
              )}
              {!lead.techAudit.hasWebsite && (
                <li><strong className="text-red-600 dark:text-red-400">Argument :</strong> Opportunité de création web d&apos;urgence, l&apos;entreprise est invisible hors de Google.</li>
              )}
              {lead.techAudit.pageSpeedScore && lead.techAudit.pageSpeedScore < 50 && (
                <li><strong className="text-orange-600 dark:text-orange-400">Argument :</strong> Son site met beaucoup de temps à charger, proposer une optimisation pour réduire l&apos;abandon client.</li>
              )}
              {lead.googleBusiness.isClaimed && lead.techAudit.pageSpeedScore && lead.techAudit.pageSpeedScore > 80 && lead.opportunityScore < 5 && (
                <li><strong className="text-slate-600 dark:text-slate-400">Argument :</strong> Féliciter pour sa bonne présence digitale et proposer d&apos;amplifier sa portée via la publicité.</li>
              )}
            </ul>
          </div>

        </div>

        <div className="flex-none p-6 border-t border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark">
          <button className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark p-4 text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
            <span className="material-symbols-outlined text-[24px] animate-pulse">auto_awesome</span>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold">Draft AI Outreach</span>
              <span className="text-[10px] opacity-90 font-medium">Personalized for {lead.name}</span>
            </div>
            <span className="material-symbols-outlined ml-auto opacity-70 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}