# Débat Technique & Fonctionnel : La Limite des 60 Résultats Google

## Le Problème
L'API Google Places (Text Search) limite le nombre de résultats maximum retournés pour une requête donnée à **60 établissements** (3 pages de 20 résultats). Google filtre ces résultats selon son propre algorithme de "pertinence", ce qui introduit une dose d'aléatoire ou de classement biaisé.
Par conséquent, si vous cherchez "Restaurant à Amiens" dans un rayon de 10km (qui compte probablement des centaines de restaurants), Google n'en renverra que 60. Scanner 12 fois la même zone vous ramènera très souvent les mêmes 60 établissements "les plus pertinents", et vous empêchera de découvrir les plus petits, souvent ceux qui ont le plus besoin de nos services !

## Solution A : Scan par Quadrillage Dynamique (La plus robuste)
Plutôt que d'augmenter arbitrairement le rayon depuis le centre de la ville, nous devrions modifier la carte interactive pour permettre de **"Scanner cette zone exacte"**.
1. L'utilisateur zoome sur un quartier précis de la carte (ex: 1km²).
2. L'application sauvegarde les "carrés" déjà scannés sur la carte (en les grisant ou en affichant un "déjà scanné").
3. Ainsi, en déplaçant la carte manuellement, l'utilisateur force l'API Google à chercher des résultats dans un centre géographique différent, contournant la limite de 60 et ramenant les "petits poissons" ignorés lors des recherches globales.

**Avantages :**
- Méthode infaillible pour aspirer 100% d'une ville sans jamais rater un prospect.
- Historique visuel très gratifiant pour le commercial.
**Inconvénients :**
- Demande plus de manipulations de la part de l'utilisateur (scroll sur la carte).

## Solution B : Augmentation des pages & Réduction du Rayon automatique (La plus automatisée)
1. On force un rayon maximum plus faible sur les grandes villes via l'interface (ex: bloquer à 2km au lieu de 10km).
2. On implémente un système d'alerte : si le scanner atteint exactement la limite de 60 résultats, un message avertit l'utilisateur : *"La limite de l'API a été atteinte. De nombreux résultats sont cachés. Veuillez réduire le rayon de recherche et vous déplacer sur la carte."*

## Décision à prendre
Voulez-vous que l'on implémente la Solution A lors du prochain Sprint ? Cela transformerait la carte en un véritable outil de ratissage local.
