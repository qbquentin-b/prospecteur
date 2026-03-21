# Document de Spécifications Produit (PRD) : LeadScanner Dashboard

| Attribut | Détail |
| :--- | :--- |
| **Version** | 1.2 (Consolidée avec Sidebar) |
| **Date** | Mars 2026 |
| **Auteur** | Product Manager / Fondateur |
| **Statut** | Prêt pour Développement (V1) |

---

## 1. Introduction & Executive Summary
Ce document définit les spécifications fonctionnelles et techniques du tableau de bord principal **LeadScanner**. Son but : permettre aux utilisateurs de scanner, identifier et qualifier des prospects B2B locaux. L'interface présentera ces prospects avec des "angles de vente" (sales angles) exploitables immédiatement, via une présentation dense en données, très lisible, mettant en valeur les opportunités chaudes.

## 2. Objectif du Projet
Livrer un tableau de bord intuitif comprenant un moteur de recherche par métier/localisation, et une grille de résultats (DataGrid) qui met en évidence les lacunes digitales des prospects (fiche Google, performance web) pour faciliter la prospection commerciale.

## 3. Cible (Target Audience)
SDR (Sales Development Representatives), professionnels du marketing, agences web et indépendants cherchant à identifier et qualifier des leads locaux rapidement.

---

## 4. Interface & Fonctionnalités (Front-end)

### Zone de Recherche (Top Section)
* **F1 : Champ Métier/Mot-clé** : Grand champ texte (Placeholder : "ex: Plombier", "Restaurant").
* **F2 : Champ Localisation** : Champ texte adjacent (Placeholder : "ex: 75011", "Bordeaux").
* **F3 : Bouton "Scanner la zone"** : Déclencheur principal (Bouton primaire, couleur Indigo).

### Structure de la Grille de Résultats (DataGrid)
Design aéré avec un "Padding" généreux pour une lisibilité maximale, divisé en 4 blocs visuels par ligne :

* **Bloc 1 : Identité**
    * Nom de l'entreprise (Inter Semibold, Gras).
    * Adresse (Texte plus petit, gris).
    * Icônes de contact discrètes (Téléphone / Email) si disponibles.
* **Bloc 2 : Alerte Google (Réputation)**
    * Affichage de la note sur 5 (ex: "3.5/5").
    * Badge d'alerte visuelle rouge (Red-600 sur fond Slate-50) avec la mention **"Non Revendiquée"** si applicable.
* **Bloc 3 : Alerte Technique (Audit Web)**
    * Logo de la technologie détectée (ex: icône WordPress, Wix).
    * Pastille de performance web (Vert / Orange / Rouge).
    * Mention "Pas de site" si aucun site n'est détecté.
* **Bloc 4 : Score & Action**
    * **Score d'Opportunité** : Large badge circulaire affichant la note sur 10. Couleur rouge stricte pour les scores > 7/10 (prospects très chauds).
    * **Bouton CTA** : Bouton "Détails" en bout de ligne pour ouvrir le panneau latéral (Sidebar) d'audit complet.

---

## 5. Architecture des Données (Back-end & Stack Low-Cost)

Pour garantir la viabilité économique de la V1, les sources de données suivantes doivent être utilisées en priorité :

| Indicateur | Source de Données (API) | Méthode & Remarques |
| :--- | :--- | :--- |
| **Identité, Adresse, Note** | Google Places API (Text Search) | Utilisation du crédit gratuit mensuel Google (200$). |
| **Fiche Non Revendiquée** | Script / Google API | Déduction via la présence du lien "Revendiquer cet établissement" (scraping léger si API muette). |
| **Performance Web** | Google PageSpeed Insights | API 100% gratuite. Renvoie le score de vitesse (détermine la couleur de la pastille). |
| **Détection du CMS** | Script de Scraping Maison | Lecture des balises `<meta>` du code source de la page d'accueil (évite les coûts de Wappalyzer). |

---

## 6. Algorithme du Score Final d'Opportunité (/10)

Le score est calculé dynamiquement pour chaque prospect selon la règle métier suivante (Base 0/10, addition des points) :

| Critère Évalué | Condition Détectée | Points Ajoutés |
| :--- | :--- | :--- |
| **Présence Google** | Fiche "Non Revendiquée" | **+ 4** |
| **Présence Google** | Note inférieure à 3.5/5 | **+ 2** |
| **Site Web** | Aucun site web détecté | **+ 5** |
| **Site Web** | Site détecté mais lent (PageSpeed Rouge) | **+ 3** |
| **Site Web** | Site détecté moyen (PageSpeed Orange) | **+ 1** |

---

## 7. Gestion des États, Limites et Erreurs (UX/Tech)

* **Limitation V1** : Les requêtes retournent un maximum de 60 résultats au total.
* **Pagination** : Chargement par lots de 20 résultats. Présence d'un bouton "Charger 20 de plus" en bas de la grille. Pas de scroll infini.
* **État de chargement** : Utilisation de "Skeleton Loaders" (lignes grises animées) dans le tableau pendant l'appel aux APIs, avec un texte dynamique (ex: *"Analyse des sites web en cours..."*).
* **Erreur Zéro Résultat** : Affichage d'un Empty State (illustration + message clair invitant à élargir la recherche).
* **Erreur d'Analyse (Timeout)** : Affichage d'une pastille grise avec un "!" et la mention "Analyse impossible" dans la colonne concernée pour ne pas bloquer l'affichage des autres leads.

---

## 8. Lignes Directrices de Design (Guidelines)

* **Esthétique** : UI moderne, claire, inspirée de l'écosystème Shadcn/Tailwind.
* **Hiérarchie Visuelle** : Utilisation stricte de la couleur pour guider l'œil (Indigo pour les actions de l'utilisateur, Rouge pour les alertes de vente et les hauts scores).
* **Accessibilité** : Contraste élevé, typographie lisible.

## 9. Hors Périmètre (Out of Scope) pour la V1

* Barre de progression "Live scan" (remplacée par les Skeleton Loaders).
* Export en masse (Bulk export vers CRM).
* Personnalisation des colonnes du tableau (Afficher/Masquer).
* Filtres avancés.

## 10. Métriques de Succès (KPIs)

* **Efficacité** : Réduction du temps passé par les utilisateurs à qualifier un prospect.
* **Engagement** : Taux de clic élevé sur le bouton "Détails" des prospects scorés > 7/10.
* **Performance Technique** : Temps de chargement du premier lot de 20 résultats inférieur à un seuil acceptable malgré l'appel aux multiples APIs.

---

## 11. Panneau Latéral "Détails" (Sidebar)

### 11.1. Comportement UI
* **Déclencheur** : Clic sur le bouton "Détails" d'une ligne du tableau.
* **Animation** : Le panneau glisse (slide-in) depuis la droite de l'écran, superposé à la grille principale (avec un léger assombrissement du fond - backdrop).
* **Fermeture** : Clic sur l'icône "X" en haut à droite, ou clic en dehors du panneau, ou touche "Échap".

### 11.2. Structure du Contenu (Fiche Prospect de préparation à l'appel)

Le panneau est pensé comme une "fiche de préparation à l'appel" pour le SDR. Il est divisé en blocs clairs.

**Bloc 1 : En-tête (Header) & Actions Rapides**
* Grand titre : Nom de l'entreprise.
* Rappel du Score Global bien visible (ex: "Score Opportunité : 9/10").
* **Boutons d'action primaire** :
    * Bouton "Appeler" (lien `tel:`).
    * Bouton "Envoyer Email" (lien `mailto:` si email trouvé).
    * Bouton "Visiter le site" (ouvre un nouvel onglet).

**Bloc 2 : Coordonnées Complètes**
* Adresse postale complète.
* Liste des numéros de téléphone trouvés.
* Liste des adresses emails extraites (via scraping de la page contact si possible).
* Liens Réseaux Sociaux (Facebook, LinkedIn, Instagram) détectés sur le site web.

**Bloc 3 : Audit Profond - Google Business**
* Statut de revendication ("Revendiquée" ou "Non Revendiquée" en rouge).
* Note exacte et **Volume d'avis** (ex: "3.5/5 basé sur 142 avis").
* Catégorie Google principale (ex: "Plombier chauffagiste").

**Bloc 4 : Audit Profond - Site Web (Performance)**
* Technologies détectées : Liste exhaustive des outils trouvés (ex: "CMS : WordPress", "Analytics : Google Analytics", "Pixel : Facebook").
* Vitesse exacte de chargement : Affichage du temps en secondes (ex: "LCP: 4.2 secondes") issu de PageSpeed Insights.
* Statut Mobile : Indicateur "Optimisé pour mobile : Oui/Non".

**Bloc 5 : "Angles d'attaque" (Points de discussion recommandés)**
* Une liste à puces dynamique basée sur le score, générant des "icebreakers" simples pour le commercial.
    * *Si Fiche non revendiquée* : "Argument : Proposer de sécuriser sa fiche Google pour éviter le vol de trafic."
    * *Si Site lent* : "Argument : Son site met 4 secondes à charger, proposer une optimisation pour réduire l'abandon client."
    * *Si Pas de site* : "Argument : Opportunité de création web d'urgence, l'entreprise est invisible hors de Google."