"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface UserData {
  id: string;
  email: string;
  username: string;
  full_name: string;
  tokens: number;
  is_admin: boolean;
  created_at: string;
}

export default function Admin() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      const { data: currentUser } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!currentUser?.is_admin) {
        // Redirection if not admin
        router.push('/');
        return;
      }

      // Fetch all users
      const { data: allUsers, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else if (allUsers) {
        setUsers(allUsers);
      }
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-background-dark dark:text-white">Chargement du dashboard admin...</div>;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      <header className="z-20 flex w-full items-center justify-between px-6 py-3 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Retour au Scanner</h1>
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400">
          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
          Espace Admin
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Utilisateurs et Consommation (Tokens)</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Supervisez l&apos;utilisation des ressources par vos clients.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Erreur: {error}</h3>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border-light bg-surface-light shadow-sm dark:border-border-dark dark:bg-surface-dark">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 dark:bg-slate-800/20 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Identifiant</th>
                  <th className="px-6 py-4 font-semibold">Username</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Tokens Restants</th>
                  <th className="px-6 py-4 font-semibold">Admin</th>
                  <th className="px-6 py-4 font-semibold">Date d&apos;inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 dark:text-slate-500">{user.id.split('-')[0]}...</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">@{user.username}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 font-bold ${user.tokens < 10 ? 'text-red-500' : 'text-amber-500'}`}>
                        <span className="material-symbols-outlined text-[16px]">toll</span>
                        {user.tokens}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_admin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Admin</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">User</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
