# Configuration Supabase (Action Requise)

Pour que certaines fonctionnalités avancées de LeadScanner fonctionnent (notamment **la connexion avec le nom d'utilisateur** et l'**historique des recherches**), vous **devez** configurer votre base de données Supabase.

C'est une étape manuelle obligatoire car l'application Next.js ne peut pas créer ces tables et fonctions de sécurité pour vous.

## Comment faire ?

1. Connectez-vous à votre [Dashboard Supabase](https://supabase.com/dashboard).
2. Sélectionnez votre projet LeadScanner.
3. Dans le menu de gauche, cliquez sur **"SQL Editor"** (l'icône avec le symbole `>_`).
4. Cliquez sur **"New query"**.
5. Ouvrez le fichier `schema.sql` qui se trouve à la racine de ce dossier de code.
6. **Copiez tout le texte de `schema.sql` et collez-le dans l'éditeur SQL de Supabase.**
7. Cliquez sur le bouton vert **"Run"** (ou tapez `Ctrl+Enter` / `Cmd+Enter`).

Si vous voyez le message "Success. No rows returned", c'est que l'installation a réussi !

---

## Pourquoi est-ce nécessaire ? (Explications techniques)

### 1. La connexion par Nom d'utilisateur (Username)
Supabase Auth (le système de connexion intégré) ne permet **par défaut que de se connecter avec une adresse Email et un Mot de passe**.

Pour contourner cette limitation et vous permettre de vous connecter avec votre **Nom d'utilisateur**, l'application fait ceci :
1. Vous tapez votre Nom d'utilisateur (ex: `johndoe`) et votre mot de passe.
2. L'application appelle une fonction spéciale dans la base de données : `get_email_by_username('johndoe')`.
3. Cette fonction (qui a été créée par le script `schema.sql`) cherche le profil `johndoe` et renvoie l'email associé en toute sécurité (sans exposer la base de données entière aux pirates).
4. L'application utilise ensuite cet email caché pour vous connecter via le système Supabase normal.

**Si vous n'exécutez pas `schema.sql`, la fonction `get_email_by_username` n'existera pas, l'application ne pourra pas trouver votre email, et la connexion échouera avec le message "Nom d'utilisateur introuvable."**

### 2. La synchronisation du Profil (Triggers)
Lorsque vous vous inscrivez, votre compte est créé dans un espace sécurisé et caché par Supabase (le schéma `auth.users`). L'application "publique" n'a pas accès à cet espace pour lire votre nom d'utilisateur ou votre nom complet.

Le script `schema.sql` crée :
- Une table `public.users` (qui est votre profil public).
- Des **Triggers** (des déclencheurs automatiques).
Dès que vous vous inscrivez, le trigger copie automatiquement vos informations (username, nom) de l'espace caché vers la table publique. Cela permet au site d'afficher vos initiales en haut à droite !

### 3. Les paramètres de Sécurité (RLS)
Le script ajoute des règles (Row Level Security) pour s'assurer qu'un utilisateur X ne peut pas modifier les paramètres du profil de l'utilisateur Y.