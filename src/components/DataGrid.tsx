import React from 'react';
import { Lead } from '../types/lead';

interface DataGridProps {
  leads: Lead[];
  isLoading: boolean;
  onRowClick: (lead: Lead) => void;
  selectedLeadId?: string;
}

export default function DataGrid({ leads, isLoading, onRowClick, selectedLeadId }: DataGridProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border-light bg-surface-light shadow-sm dark:border-border-dark dark:bg-surface-dark animate-pulse">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 dark:bg-slate-800/20 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold w-[30%]">Identité</th>
                <th className="px-6 py-4 font-semibold w-[20%]">Réputation</th>
                <th className="px-6 py-4 font-semibold w-[25%]">Audit Technique</th>
                <th className="px-6 py-4 font-semibold w-[15%]">Score d&apos;Opp.</th>
                <th className="px-6 py-4 font-semibold text-right w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div></td>
                  <td className="px-6 py-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full"></div></td>
                  <td className="px-6 py-4"><div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
                  <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded inline-block"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1 text-orange-400">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`f-${i}`} className="material-symbols-outlined text-[18px] fill-current">star</span>
        ))}
        {hasHalfStar && <span className="material-symbols-outlined text-[18px]">star_half</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`e-${i}`} className="material-symbols-outlined text-[18px] text-slate-300">star</span>
        ))}
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border-light bg-surface-light shadow-sm dark:border-border-dark dark:bg-surface-dark">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 dark:bg-slate-800/20 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold w-[30%]">Identité</th>
              <th className="px-6 py-4 font-semibold w-[20%]">Réputation</th>
              <th className="px-6 py-4 font-semibold w-[25%]">Audit Technique</th>
              <th className="px-6 py-4 font-semibold w-[15%]">Score d&apos;Opp.</th>
              <th className="px-6 py-4 font-semibold text-right w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {leads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;
              const isHot = lead.opportunityScore >= 7;

              return (
                <tr
                  key={lead.id}
                  className={`group transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-l-4 border-l-primary'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                  onClick={() => onRowClick(lead)}
                >
                  <td className={`px-6 py-4 align-top ${isSelected ? 'pl-5' : ''}`}>
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-slate-900 text-base dark:text-white">{lead.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {lead.address}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {lead.contact.email && lead.contact.email.length > 0 ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" title="Email Trouvé">
                            <span className="material-symbols-outlined text-[14px]">mail</span>
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" title="Email Manquant">
                            <span className="material-symbols-outlined text-[14px]">mail_lock</span>
                          </div>
                        )}
                        {lead.contact.phone && lead.contact.phone.length > 0 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" title="Téléphone Trouvé">
                            <span className="material-symbols-outlined text-[14px]">call</span>
                          </div>
                        )}
                        {lead.contact.linkedin ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" title="LinkedIn Trouvé">
                            <span className="material-symbols-outlined text-[14px]">work</span>
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" title="LinkedIn Manquant">
                            <span className="material-symbols-outlined text-[14px]">person_off</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      {renderStars(lead.googleBusiness.rating)}
                      <span className="text-xs text-slate-500">({lead.googleBusiness.reviewCount} avis)</span>
                      {!lead.googleBusiness.isClaimed ? (
                        <span className="inline-flex items-center gap-1 w-max rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 mt-1">
                          <span className="material-symbols-outlined text-[12px]">warning</span>
                          Non Revendiquée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 w-max rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-600 bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400 mt-1">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          Revendiquée
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-2">
                      {lead.techAudit.hasWebsite ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[18px] ${lead.techAudit.hasWebsite && !lead.googleBusiness.isClaimed ? 'text-red-500' : 'text-green-500'}`}>
                              {lead.googleBusiness.isClaimed ? 'lock' : 'lock_open'}
                            </span>
                            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{lead.techAudit.website}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {lead.techAudit.cms && (
                              <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800">
                                <span className="material-symbols-outlined text-[12px]">code</span>
                                {lead.techAudit.cms}
                              </span>
                            )}
                            {lead.techAudit.pageSpeedScore !== undefined && (
                              <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800">
                                <span className="material-symbols-outlined text-[12px]">speed</span>
                                {lead.techAudit.pageSpeedScore < 50 ? 'Lent' : lead.techAudit.pageSpeedScore < 80 ? 'Moyen' : 'Rapide'} ({lead.techAudit.pageSpeedScore}/100)
                              </span>
                            )}
                          </div>
                          {lead.techAudit.pageSpeedScore !== undefined && (
                            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700 mt-1">
                              <div
                                className={`h-full ${lead.techAudit.pageSpeedScore < 50 ? 'bg-red-500' : lead.techAudit.pageSpeedScore < 80 ? 'bg-orange-400' : 'bg-green-500'}`}
                                style={{ width: `${lead.techAudit.pageSpeedScore}%` }}
                              ></div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">public_off</span>
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 italic">Aucun Site Web</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800">
                              <span className="material-symbols-outlined text-[12px]">help</span>
                              CMS Inconnu
                            </span>
                          </div>
                          <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700 mt-1">
                            <div className="h-full w-[0%] bg-slate-300"></div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-black text-lg shadow-sm ${
                        isHot
                          ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-500'
                          : lead.opportunityScore >= 4
                            ? 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-900/10 dark:border-orange-900/30 dark:text-orange-500'
                            : 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-500'
                      }`}>
                        {lead.opportunityScore.toFixed(1)}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold uppercase ${
                          isHot ? 'text-red-600 dark:text-red-400' : lead.opportunityScore >= 4 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {isHot ? 'Critique' : lead.opportunityScore >= 4 ? 'Moyen' : 'Faible'}
                        </span>
                        <span className="text-[10px] text-slate-500 leading-tight">
                          {!lead.techAudit.hasWebsite ? 'Présence web manquante' : !lead.googleBusiness.isClaimed ? 'Haut potentiel web & SEO' : 'Opportunités d\'optimisation'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-right">
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-light text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-border-dark dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                      title="Détails"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(lead);
                      }}
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border-light bg-surface-light px-6 py-4 dark:border-border-dark dark:bg-surface-dark">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-900 dark:text-white">1</span> to <span className="font-semibold text-slate-900 dark:text-white">{leads.length}</span> of <span className="font-semibold text-slate-900 dark:text-white">1,248</span> results
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:border-border-dark dark:bg-surface-dark dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded border border-primary bg-primary text-white shadow-sm">1</button>
          <button className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-white text-slate-600 hover:bg-slate-50 dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:bg-slate-800">2</button>
          <button className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-white text-slate-600 hover:bg-slate-50 dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:bg-slate-800">3</button>
          <span className="text-slate-400">...</span>
          <button className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-white text-slate-600 hover:bg-slate-50 dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:bg-slate-800">42</button>
          <button className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}