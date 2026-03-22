"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-display">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">radar</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">LeadScanner</h2>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Connectez-vous à votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Ou{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">
            créez un nouveau compte
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-light dark:bg-surface-dark py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-border-light dark:border-border-dark">
          <form className="space-y-6" onSubmit={handleLogin}>
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">mail</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 h-11 appearance-none rounded-lg border border-border-light bg-background-light px-3 py-2 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">lock</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 h-11 appearance-none rounded-lg border border-border-light bg-background-light px-3 py-2 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm dark:border-border-dark dark:bg-background-dark dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-primary h-11 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-primary/20 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-all items-center"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  // Bypass authentication and force redirection to the dashboard
                  sessionStorage.setItem('dev_bypass', 'true');
                  router.push('/');
                }}
                className="flex w-full justify-center rounded-lg bg-slate-200 dark:bg-slate-700 h-11 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all items-center"
              >
                Passer (Dev Mode)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
