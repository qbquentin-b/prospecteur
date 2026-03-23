"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Settings() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const devBypass = sessionStorage.getItem('dev_bypass');

      if (!session && !devBypass) {
        router.push('/login');
        return;
      }

      if (session?.user) {
        setEmail(session.user.email || '');

        // Fetch full name from public profile
        const { data } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        if (data && data.full_name) {
          setFullName(data.full_name);
        } else {
          setFullName(session.user.user_metadata?.full_name || '');
        }
      }
    };

    fetchUserData();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (fullName) {
      updates.data = { full_name: fullName };
    }

    const { data: { user }, error: authError } = await supabase.auth.updateUser(updates);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (fullName && user) {
      // Update public.users profile
      const { error: profileError } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }
    }

    setMessage("Profil mis à jour avec succès.");
    setPassword(''); // clear password field
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      <header className="z-20 flex w-full items-center justify-between px-6 py-3 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Retour au Scanner</h1>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-light dark:bg-surface-dark shadow-sm sm:rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-border-light dark:border-border-dark">
            <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">
              Paramètres du profil
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Modifiez vos informations personnelles.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form className="space-y-6" onSubmit={handleUpdate}>
              {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              {message && (
                <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-300">{message}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nom complet
                </label>
                <div className="mt-1 relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">badge</span>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 h-11 appearance-none rounded-lg border border-border-light bg-background-light px-3 py-2 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nouvelle adresse email
                </label>
                <div className="mt-1 relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">mail</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 h-11 appearance-none rounded-lg border border-border-light bg-background-light px-3 py-2 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Un email de confirmation sera envoyé à la nouvelle adresse.</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nouveau mot de passe
                </label>
                <div className="mt-1 relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">lock</span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Laissez vide pour conserver l&apos;actuel"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 h-11 appearance-none rounded-lg border border-border-light bg-background-light px-3 py-2 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex justify-center rounded-lg bg-primary h-11 px-6 py-2 text-sm font-bold text-white shadow-sm shadow-primary/20 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-all items-center"
                >
                  {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
