# Mises à jour : Sprint 3

Voici le résumé des nouveautés ajoutées dans ce sprint et les actions que vous devez réaliser pour mettre à jour votre projet.

## 🛠 Actions requises (Important)

Pour que toutes les nouvelles fonctionnalités marchent (Favoris, Tokens, Administration), la base de données doit être mise à jour :

1. Connectez-vous à votre [Dashboard Supabase](https://supabase.com/dashboard).
2. Ouvrez le **SQL Editor** (l'icône `>_`).
3. Copiez-collez l'intégralité du nouveau contenu du fichier `schema.sql` (disponible à la racine du projet).
4. Cliquez sur **Run**.

*Si vous aviez déjà créé les anciennes tables, le plus simple est de tout effacer avant, ou de simplement exécuter les requêtes "ALTER TABLE" et "CREATE TABLE public.favorites". Je recommande de repartir de zéro sur votre projet Supabase si vous étiez en phase de test.*

## ✨ Nouveautés de cette version

- **Tokens de recherche :** Affichage de vos jetons dans le header.
- **Tableau de bord Admin :** Une interface `/admin` pour surveiller l'utilisation des tokens par les utilisateurs (seulement pour les utilisateurs avec `is_admin = true`).
- **Système de Favoris :** Une icône cœur ajoutée dans la grille de données pour sauvegarder vos meilleurs prospects.
- **Avatars Animaux :** Remplacement des initiales tristes par des avatars d'animaux dessinés à la main via DiceBear.
- **Mode Sombre / Clair :** Bouton dans le menu profil pour basculer le thème.
- **Grille de données avancée (DataGrid) :**
  - Tri des colonnes (Score de pertinence, Nom, Réputation).
  - Sélection du nombre de résultats par page (10, 20, 50).
  - Boutons d'export des données au format CSV.
- **Filtres et Cache :**
  - Les filtres visuels sont désormais fonctionnels.
  - Ajout du bouton "Dernier Scan" pour éviter de griller des tokens inutilement si on veut juste recharger la dernière recherche.
- **Documentation :** Ajout d'une page `/docs` expliquant comment l'Opp Score est calculé et comment utiliser l'interface.
## 🗺️ Google Maps Platform & Quotas Gratuits

Pour la fonctionnalité de recherche via la carte, ce projet requiert une clé API Google Maps.

**Quotas et Crédit Mensuel (Free Tier) :**
Google Maps Platform offre **200 $ de crédit gratuit par mois** à tous les utilisateurs.

Voici ce que cela représente concrètement pour LeadScanner :
- **Text Search (Places API) :** Coûte environ 0.032 $ par requête.
- **Places Details (Places API) :** Coûte environ 0.017 $ par lieu détaillé (selon les champs demandés).

**Combien de scans gratuits par mois ?**
Avec 200 $, vous pouvez effectuer environ :
- ~6 000 requêtes de recherche Text Search par mois.
- Ou ~11 000 requêtes de détails d'établissements par mois.
*Une utilisation normale de l'application (quelques dizaines de recherches par jour) sera donc totalement couverte par ce crédit de 200 $ et vous ne paierez rien.*

> ⚠️ **Important :** N'oubliez pas d'ajouter votre clé API `GOOGLE_MAPS_API_KEY=AIzaSy...` dans le fichier `.env.local` ! Vous pouvez générer cette clé via la [Google Cloud Console](https://console.cloud.google.com/).
