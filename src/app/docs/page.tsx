"use client";

import Link from 'next/link';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <header className="z-20 flex w-full items-center justify-between px-6 py-3 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Retour au Scanner</h1>
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          Documentation
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Intro */}
        <section className="space-y-4 text-center">
          <h2 className="text-4xl font-extrabold text-primary">Comment utiliser LeadScanner ?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Le guide complet pour générer, qualifier et contacter vos prospects B2B de manière automatisée.
          </p>
        </section>

        {/* Interface */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark shadow-sm space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 border-b border-border-light dark:border-border-dark pb-4">
            <span className="material-symbols-outlined text-primary text-3xl">dashboard</span>
            Découverte de l&apos;interface
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined">search</span>
                La Barre de Recherche
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Entrez un mot clé (ex: &quot;Restaurants&quot;) et un lieu (ex: &quot;Paris&quot;). Laisssez le mot clé vide pour chercher toutes les entreprises.
                Le bouton <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Dernier Scan</span> permet de recharger la dernière recherche sans utiliser de nouveau vos précieux tokens !
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined">filter_list</span>
                Les Filtres & La Carte
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Cliquez sur l&apos;icône de carte dans la barre de localisation pour afficher/masquer la vue géographique avec un rayon (en km). En dessous, les filtres rapides vous permettent de cibler précisément des prospects sans site web ou sans téléphone en un clic.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <span className="material-symbols-outlined">favorite</span>
                Sauvegarde des prospects
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Cliquez sur l&apos;icône cœur en bout de ligne pour enregistrer le prospect. Ses données complètes (email, téléphone, audit) sont sauvegardées dans votre base de données personnelle.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined">toll</span>
                Le système de Tokens
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Chaque compte a une limite d&apos;usage pour éviter les abus (les recherches coûtent cher !). Votre solde est affiché en haut à droite avec une icône dorée. Chaque Scan consomme 1 Token.
              </p>
            </div>
          </div>
        </section>

        {/* Scores */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark shadow-sm space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 border-b border-border-light dark:border-border-dark pb-4">
            <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
            Comment sont calculés les scores ?
          </h3>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-6">
            LeadScanner ne vous donne pas juste des emails. Il audite chaque entreprise en temps réel pour déterminer s&apos;ils ont besoin de vos services d&apos;agence web ou de SEO.
          </p>

          <div className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-border-light dark:border-border-dark">
              <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">target</span>
                Le Score de Pertinence (Opp. Score)
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                C&apos;est un score sur <strong>10</strong>. Plus il est haut (rouge), plus l&apos;entreprise a un besoin urgent de transformation digitale.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><strong className="text-red-500">Pas de site web (+4 pts)</strong> : C&apos;est une opportunité immédiate de création de site internet.</li>
                <li><strong className="text-orange-500">Fiche Google non revendiquée (+2 pts)</strong> : Le propriétaire ne gère pas sa présence, opportunité de conseil SEO local.</li>
                <li><strong className="text-amber-500">Site très lent (+3 pts)</strong> : Si le Google PageSpeed est inférieur à 50/100, vous pouvez proposer une refonte ou une optimisation de performance technique.</li>
                <li><strong className="text-yellow-500">Mauvaise note globale (+1 pt)</strong> : Si la note Google Maps est inférieure à 3.5, il y a un problème de réputation en ligne à gérer.</li>
              </ul>
              <div className="mt-4 flex gap-4 text-xs font-bold uppercase">
                <span className="text-red-500">8 à 10 : Critique (Pépite)</span>
                <span className="text-orange-500">5 à 7 : Moyen (Optimisable)</span>
                <span className="text-green-500">0 à 4 : Faible (A déjà un bon site)</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
