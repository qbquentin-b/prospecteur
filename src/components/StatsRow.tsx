import React from 'react';

export default function StatsRow() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Leads</div>
        <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">1,248</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
          <span className="material-symbols-outlined text-[14px]">trending_up</span>
          <span>+12% vs last scan</span>
        </div>
      </div>
      <div className="rounded-xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">High Opportunity</div>
        <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">86</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-primary">
          <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
          <span>Hot leads</span>
        </div>
      </div>
      <div className="rounded-xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Missing Websites</div>
        <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">342</div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-[27%] bg-red-500"></div>
        </div>
      </div>
      <div className="rounded-xl border border-border-light bg-surface-light p-4 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Unclaimed GMB</div>
        <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">156</div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full w-[12%] bg-orange-500"></div>
        </div>
      </div>
    </div>
  );
}