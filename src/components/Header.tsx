"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("Utilisateur");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('full_name, username')
          .eq('id', session.user.id)
          .single();

        if (data) {
          // Use username as the primary display, then full_name, then email
          setUserName(data.username || data.full_name || session.user.email || "Utilisateur");
        } else if (session.user.user_metadata?.username) {
          // Fallback to metadata if DB lookup fails (e.g. before sync)
          setUserName(session.user.user_metadata.username);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dev_bypass');
    }
    router.push('/login');
  };
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-2xl">radar</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LeadScanner</h1>
      </div>
      <div className="flex items-center gap-3 relative">
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-surface-light dark:border-surface-dark"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucune nouvelle notification.</p>
              </div>
            </div>
          )}
        </div>

        <Link href="/settings" className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </Link>
        <div className="ml-2 flex items-center gap-2 pl-2 border-l border-border-light dark:border-border-dark">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 uppercase font-bold text-xs">
            {userName.substring(0, 2)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-none truncate max-w-[150px]" title={userName}>{userName}</p>
            <p
              onClick={handleLogout}
              className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors"
            >
              Déconnexion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
