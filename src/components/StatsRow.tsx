import React from 'react';

import { Lead } from '../types/lead';

interface StatsRowProps {
  leads: Lead[];
}

export default function StatsRow({ leads }: StatsRowProps) {
  const totalLeads = leads.length;
  const highOpp = leads.filter((l) => l.opportunityScore >= 7).length;
  const missingWebsites = leads.filter((l) => !l.techAudit.hasWebsite).length;
  const unclaimedGmb = leads.filter((l) => !l.googleBusiness.isClaimed).length;

  const missingWebsitesPct = totalLeads ? Math.round((missingWebsites / totalLeads) * 100) : 0;
  const unclaimedGmbPct = totalLeads ? Math.round((unclaimedGmb / totalLeads) * 100) : 0;

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Leads</div>
        <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{totalLeads}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
          <span className="material-symbols-outlined text-[14px]">trending_up</span>
          <span>+12% vs dernier scan</span>
        </div>
      </div>
      <div className="rounded-xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Haute Opportunité</div>
        <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{highOpp}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-primary">
          <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
          <span>Leads chauds</span>
        </div>
      </div>
      <div className="rounded-xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Sites Web Manquants</div>
        <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{missingWebsites}</div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className={`h-full bg-red-500`} style={{ width: `${missingWebsitesPct}%` }}></div>
        </div>
      </div>
      <div className="rounded-xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Fiches Non Revendiquées</div>
        <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{unclaimedGmb}</div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className={`h-full bg-orange-500`} style={{ width: `${unclaimedGmbPct}%` }}></div>
        </div>
      </div>
    </div>
  );
}