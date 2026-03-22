import React from 'react';

import { useState } from 'react';

interface SearchSectionProps {
  onScan: (sector: string, location: string) => void;
  isLoading: boolean;
}

export default function SearchSection({ onScan, isLoading }: SearchSectionProps) {
  const [sector, setSector] = useState("Burger Joints");
  const [location, setLocation] = useState("Austin, TX");

  const handleScan = () => {
    if (sector.trim() && location.trim()) {
      onScan(sector, location);
    }
  };

  return (
    <div className="flex flex-col border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-end">
        <div className="flex flex-1 gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Sector</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">storefront</span>
              <input
                className="h-11 w-full rounded-lg border border-border-light bg-background-light pl-10 pr-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white dark:placeholder-slate-500"
                placeholder="e.g. Dentists, Restaurants"
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">location_on</span>
              <input
                className="h-11 w-full rounded-lg border border-border-light bg-background-light pl-10 pr-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white dark:placeholder-slate-500"
                placeholder="City, State or Zip"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleScan}
          disabled={isLoading}
          className={`flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-lg active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
          ) : (
            <span className="material-symbols-outlined text-[20px]">search</span>
          )}
          {isLoading ? 'Scanning...' : 'Scan Area'}
        </button>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto px-6 pb-4 scrollbar-hide">
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide mr-2">Filters:</span>
        <button className="group flex items-center gap-1.5 rounded-full border border-border-light bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary hover:text-primary dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:border-primary">
          <span className="material-symbols-outlined text-[16px]">public_off</span>
          No Website
          <span className="material-symbols-outlined ml-1 text-[14px] text-slate-400 group-hover:text-primary">close</span>
        </button>
        <button className="group flex items-center gap-1.5 rounded-full border border-border-light bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary hover:text-primary dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:border-primary">
          <span className="material-symbols-outlined text-[16px]">star_half</span>
          Rating &lt; 3.0
          <span className="material-symbols-outlined ml-1 text-[14px] text-slate-400 group-hover:text-primary">close</span>
        </button>
        <button className="group flex items-center gap-1.5 rounded-full border border-border-light bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary hover:text-primary dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:border-primary">
          <span className="material-symbols-outlined text-[16px]">mark_email_unread</span>
          Missing Email
          <span className="material-symbols-outlined ml-1 text-[14px] text-slate-400 group-hover:text-primary">close</span>
        </button>
        <button className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Filter
        </button>
      </div>
    </div>
  );
}