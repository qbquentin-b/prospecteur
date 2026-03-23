import React from 'react';

import { useState } from 'react';

interface SearchSectionProps {
  onScan: (sector: string, location: string, radiusKm: number) => void;
  isLoading: boolean;
  isMapVisible: boolean;
  onToggleMap: () => void;
  activeFilters: string[];
  onToggleFilter: (filterId: string) => void;
  onLoadLastScan: () => void;
}

export default function SearchSection({ onScan, isLoading, isMapVisible, onToggleMap, activeFilters, onToggleFilter, onLoadLastScan }: SearchSectionProps) {
  const [sector, setSector] = useState("Restaurants");
  const [location, setLocation] = useState("Paris, FR");
  const [radius, setRadius] = useState(5);

  const handleScan = () => {
    if (location.trim()) {
      // If sector is empty, use 'All' or a catch-all term that the API handles
      onScan(sector.trim() || "All", location.trim(), radius);
    }
  };

  return (
    <div className="flex flex-col border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-end">
        <div className="flex flex-1 gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Métier/Mot-clé</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">storefront</span>
              <input
                className="h-11 w-full rounded-lg border border-border-light bg-background-light pl-10 pr-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white dark:placeholder-slate-500"
                placeholder="ex: Plombier, Restaurant (laisser vide pour tout)"
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-32">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rayon (km)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">radar</span>
              <input
                className="h-11 w-full rounded-lg border border-border-light bg-background-light pl-10 pr-4 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white dark:placeholder-slate-500"
                type="number"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Localisation</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">location_on</span>
              <input
                className="h-11 w-full rounded-lg border border-border-light bg-background-light pl-10 pr-12 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white dark:placeholder-slate-500"
                placeholder="ex: 75011, Bordeaux"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
              <button
                onClick={onToggleMap}
                className={`absolute right-2 top-1.5 p-1.5 rounded-md transition-colors ${isMapVisible ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                title="Afficher/Masquer la carte"
              >
                <span className="material-symbols-outlined text-[18px]">map</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row w-full md:w-auto">
          <button
            onClick={onLoadLastScan}
            disabled={isLoading}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-200 dark:bg-slate-700 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 disabled:opacity-50"
            title="Recharger le dernier scan sans utiliser de tokens"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span className="hidden xl:inline">Dernier Scan</span>
          </button>
          <button
            onClick={handleScan}
            disabled={isLoading}
            className={`flex flex-1 md:flex-none h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">search</span>
            )}
            {isLoading ? 'Analyse...' : 'Scanner la zone'}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto px-6 pb-4 scrollbar-hide">
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide mr-2">Filtres:</span>

        {[
          { id: 'no-website', icon: 'public_off', label: 'Pas de site web' },
          { id: 'low-rating', icon: 'star_half', label: 'Note < 3.0' },
          { id: 'no-email', icon: 'mark_email_unread', label: 'Email manquant' },
          { id: 'no-phone', icon: 'phone_disabled', label: 'Sans Téléphone' },
          { id: 'unclaimed-gmb', icon: 'location_off', label: 'GMB Non revendiqué' },
        ].map(filter => {
          const isActive = activeFilters.includes(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => onToggleFilter(filter.id)}
              className={`group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dark'
                : 'border-border-light bg-white text-slate-600 hover:border-primary hover:text-primary dark:border-border-dark dark:bg-surface-dark dark:text-slate-300 dark:hover:border-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{filter.icon}</span>
              {filter.label}
              {isActive && <span className="material-symbols-outlined ml-1 text-[14px] text-primary cursor-pointer">close</span>}
            </button>
          );
        })}

        <button
          className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-1 dark:focus:ring-offset-background-dark"
          onClick={() => alert("Fonctionnalité 'Créer un filtre personnalisé' bientôt disponible ! (Sprint 3)")}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Créer un filtre
        </button>
      </div>
    </div>
  );
}