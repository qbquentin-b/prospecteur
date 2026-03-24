import React, { useState, useMemo } from 'react';
import { Lead } from '../types/lead';

interface DataGridProps {
  leads: Lead[];
  isLoading: boolean;
  onRowClick: (lead: Lead) => void;
  selectedLeadId?: string;
  onToggleFavorite?: (lead: Lead) => void;
  favoriteIds?: string[];
}

type SortField = 'name' | 'rating' | 'pageSpeed' | 'opportunityScore';
type SortOrder = 'asc' | 'desc';

export default function DataGrid({ leads, isLoading, onRowClick, selectedLeadId, onToggleFavorite, favoriteIds = [] }: DataGridProps) {
  const [sortField, setSortField] = useState<SortField>('opportunityScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      let aVal: string | number = 0;
      let bVal: string | number = 0;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'rating':
          aVal = a.googleBusiness.rating;
          bVal = b.googleBusiness.rating;
          break;
        case 'pageSpeed':
          aVal = a.techAudit.pageSpeedScore || 0;
          bVal = b.techAudit.pageSpeedScore || 0;
          break;
        case 'opportunityScore':
        default:
          aVal = a.opportunityScore;
          bVal = b.opportunityScore;
          break;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const currentLeads = sortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    // Simplistic CSV export
    const headers = ['Nom', 'Adresse', 'Email', 'Téléphone', 'Note GMB', 'Avis', 'Website', 'Score Perf', 'Score Opp'];
    const rows = leads.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.address.replace(/"/g, '""')}"`,
      `"${(l.contact.email || []).join(', ')}"`,
      `"${(l.contact.phone || []).join(', ')}"`,
      l.googleBusiness.rating,
      l.googleBusiness.reviewCount,
      `"${l.techAudit.website || ''}"`,
      l.techAudit.pageSpeedScore || 'N/A',
      l.opportunityScore
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leadscanner_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="material-symbols-outlined text-[14px] opacity-30 ml-1">unfold_more</span>;
    return <span className="material-symbols-outlined text-[14px] ml-1">{sortOrder === 'asc' ? 'expand_less' : 'expand_more'}</span>;
  };

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

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-border-light bg-surface-light shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="rounded-full bg-slate-100 p-4 text-slate-400 dark:bg-slate-800">
          <span className="material-symbols-outlined text-4xl">travel_explore</span>
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Aucun prospect trouvé</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Ajustez vos filtres ou lancez un nouveau scan avec d&apos;autres mots-clés pour trouver des entreprises à accompagner.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-light bg-surface-light shadow-sm dark:border-border-dark dark:bg-surface-dark">

      {/* Top Action Bar */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-400">Afficher</span>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="text-sm border-border-light rounded-md dark:bg-surface-dark dark:border-border-dark dark:text-slate-300 focus:ring-primary focus:border-primary"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-slate-600 dark:text-slate-400">résultats</span>
        </div>
        <div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-slate-50 hover:text-primary transition-colors shadow-sm dark:bg-surface-dark dark:border-border-dark dark:text-slate-300 dark:hover:text-primary dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exporter CSV
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 dark:bg-slate-800/20 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold w-[30%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 select-none transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center">Identité {renderSortIcon('name')}</div>
              </th>
              <th className="px-6 py-4 font-semibold w-[20%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 select-none transition-colors" onClick={() => handleSort('rating')}>
                <div className="flex items-center">Réputation {renderSortIcon('rating')}</div>
              </th>
              <th className="px-6 py-4 font-semibold w-[25%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 select-none transition-colors" onClick={() => handleSort('pageSpeed')}>
                <div className="flex items-center">Audit Tech {renderSortIcon('pageSpeed')}</div>
              </th>
              <th className="px-6 py-4 font-semibold w-[15%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 select-none transition-colors" onClick={() => handleSort('opportunityScore')}>
                <div className="flex items-center text-primary">Score de pertinence {renderSortIcon('opportunityScore')}</div>
              </th>
              <th className="px-6 py-4 font-semibold text-right w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {currentLeads.map((lead) => (
              <tr
                key={lead.id}
                className={`group transition-colors cursor-pointer ${selectedLeadId === lead.id ? 'bg-slate-50 dark:bg-slate-800/60 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}
                onClick={() => onRowClick(lead)}
              >
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-1">
                    <div className="font-bold text-slate-900 text-base dark:text-white">{lead.name}</div>
                    {lead.googleBusiness.googleMapsUri ? (
                      <a
                        href={lead.googleBusiness.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-xs flex items-center gap-1 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate max-w-[200px]">{lead.address}</span>
                      </a>
                    ) : (
                      <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate max-w-[200px]">{lead.address}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      {lead.contact.email && lead.contact.email.length > 0 ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" title="Email Found">
                          <span className="material-symbols-outlined text-[14px]">mail</span>
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" title="Missing Email">
                          <span className="material-symbols-outlined text-[14px]">mail_lock</span>
                        </div>
                      )}

                      {lead.contact.phone && lead.contact.phone.length > 0 ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" title="Phone Found">
                          <span className="material-symbols-outlined text-[14px]">call</span>
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" title="Missing Phone">
                          <span className="material-symbols-outlined text-[14px]">phone_disabled</span>
                        </div>
                      )}

                      {!lead.contact.linkedin && (
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" title="LinkedIn Missing">
                          <span className="material-symbols-outlined text-[14px]">person_off</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-orange-400">
                      {[...Array(Math.floor(lead.googleBusiness.rating))].map((_, i) => (
                        <span key={`f-${i}`} className="material-symbols-outlined text-[18px] fill-current">star</span>
                      ))}
                      {lead.googleBusiness.rating % 1 >= 0.5 && <span className="material-symbols-outlined text-[18px]">star_half</span>}
                      {[...Array(5 - Math.floor(lead.googleBusiness.rating) - (lead.googleBusiness.rating % 1 >= 0.5 ? 1 : 0))].map((_, i) => (
                        <span key={`e-${i}`} className="material-symbols-outlined text-[18px] text-slate-300 dark:text-slate-600">star</span>
                      ))}
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{lead.googleBusiness.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-slate-500">({lead.googleBusiness.reviewCount} avis)</span>

                    {!lead.googleBusiness.isClaimed && (
                      <span
                        className="inline-flex items-center gap-1 w-max rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 mt-1 cursor-help"
                        title="Cette entreprise n'a pas revendiqué sa fiche Google. C'est une excellente opportunité pour lui proposer d'en prendre le contrôle."
                      >
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        Non revendiqué
                      </span>
                    )}
                    {lead.googleBusiness.isClaimed && (
                      <span
                        className="inline-flex items-center gap-1 w-max rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-600 bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400 mt-1 cursor-help"
                        title="Cette fiche Google est gérée par le propriétaire de l'établissement."
                      >
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        Revendiqué
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {lead.techAudit.hasWebsite ? (
                        <>
                          <span className="material-symbols-outlined text-green-500 text-[18px]">lock</span>
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{lead.techAudit.website}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">public_off</span>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 italic">Pas de Site</span>
                        </>
                      )}
                    </div>

                    {lead.techAudit.hasWebsite ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {lead.techAudit.cms && (
                          <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800">
                            <span className="material-symbols-outlined text-[12px]">code</span>
                            {lead.techAudit.cms}
                          </span>
                        )}
                        {lead.techAudit.pageSpeedScore !== undefined && (
                          <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800">
                            <span className="material-symbols-outlined text-[12px]">speed</span>
                            {lead.techAudit.pageSpeedScore < 50 ? 'Lent' : lead.techAudit.pageSpeedScore < 80 ? 'Moyen' : 'Rapide'} ({lead.techAudit.pageSpeedScore})
                          </span>
                        )}
                        {lead.techAudit.pageSpeedScore !== undefined && (
                          <div className="w-full mt-1">
                            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                              <div
                                className={`h-full ${lead.techAudit.pageSpeedScore < 50 ? 'bg-red-500' : lead.techAudit.pageSpeedScore < 80 ? 'bg-orange-400' : 'bg-green-500'}`}
                                style={{ width: `${lead.techAudit.pageSpeedScore}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700 mt-1">
                        <div className="h-full w-[0%] bg-slate-300"></div>
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0">
                      <svg
                        className={`circular-chart ${
                          lead.opportunityScore >= 8 ? 'text-red-500' :
                          lead.opportunityScore >= 5 ? 'text-orange-500' :
                          'text-green-500'
                        }`}
                        viewBox="0 0 36 36"
                      >
                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                        <path
                          className="circle stroke-current"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          strokeDasharray={`${Math.round(lead.opportunityScore * 10)}, 100`}
                        ></path>
                        <text className="percentage" x="18" y="21.5">{Math.round(lead.opportunityScore * 10)}</text>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold uppercase
                        ${lead.opportunityScore >= 8 ? 'text-red-600 dark:text-red-400' :
                          lead.opportunityScore >= 5 ? 'text-orange-600 dark:text-orange-400' :
                          'text-green-600 dark:text-green-400'}`}
                      >
                        {lead.opportunityScore >= 8 ? 'Critique' : lead.opportunityScore >= 5 ? 'Moyen' : 'Faible'}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-tight">
                        {lead.opportunityScore >= 8 ? 'Fort potentiel' : lead.opportunityScore >= 5 ? 'A optimiser' : 'Présence solide'}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 align-middle text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if(onToggleFavorite) onToggleFavorite(lead);
                    }}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors mr-2 ${
                      favoriteIds.includes(lead.id)
                        ? 'border-red-200 bg-red-50 text-red-500 dark:bg-red-900/20 dark:border-red-900/30'
                        : 'border-border-light text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:border-border-dark dark:hover:bg-red-900/20 dark:hover:border-red-900/30'
                    }`}
                    title={favoriteIds.includes(lead.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${favoriteIds.includes(lead.id) ? 'fill-current' : ''}`}>favorite</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-light text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-border-dark dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    title="Plus d'actions"
                  >
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border-light bg-surface-light px-6 py-4 dark:border-border-dark dark:bg-surface-dark">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Affichage de <span className="font-semibold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, leads.length)}</span> sur <span className="font-semibold text-slate-900 dark:text-white">{leads.length}</span> résultats
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:border-border-dark dark:bg-surface-dark dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {/* Dynamic Pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && page - array[index - 1] > 1 && (
                  <span className="text-slate-400">...</span>
                )}
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded border ${currentPage === page ? 'border-primary bg-primary text-white shadow-sm' : 'border-border-light bg-white text-slate-600 hover:bg-slate-50 dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
