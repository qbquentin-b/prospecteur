"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("Utilisateur");

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
          setUserName(data.full_name || data.username || session.user.email || "Utilisateur");
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
      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-surface-light dark:border-surface-dark"></span>
        </button>
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
