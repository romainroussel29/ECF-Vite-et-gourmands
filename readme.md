# Vite & Gourmands

Application web du traiteur **Vite & Gourmands** (Bordeaux), réalisée pour la société **FastDev** : consultation des menus, commande en ligne, espaces client, employé et administrateur.

Projet réalisé dans le cadre de l'ECF du **Titre Professionnel Développeur Web et Web Mobile** (Studi).

## Liens utiles

| Ressource | Lien |
|---|---|
| Application déployée | À compléter |
| Dépôt GitHub | À compléter |
| Gestion de projet (Kanban) | À compléter |
| Charte graphique et maquettes | À compléter |
| Documentation technique | À compléter |
| Manuel d'utilisation | À compléter |

## Fonctionnalités

### Visiteur
- Page d'accueil (présentation, avis clients, contact)
- Consultation des menus avec filtres sans rechargement de page :
  - recherche par nom ou description (sans tenir compte des accents)
  - thème, régime, prix maximum, fourchette de prix et nombre de personnes minimum
  - tri par pertinence, prix croissant ou décroissant, minimum de personnes
  - compteur de résultats, résumé des filtres actifs, message si aucun menu ne correspond, bouton de réinitialisation
- Détail de chaque menu (4 pages) : galerie d'images, tarif et stock, conditions du menu, plats au choix avec allergènes, conditions de conservation
- Bouton « Commander » : redirige vers la connexion si l'utilisateur n'est pas connecté, sinon vers l'espace de commande
- Page de contact : vérification des champs (titre, description, e-mail) avec messages d'erreur sous chaque champ, puis confirmation d'envoi
- Mentions légales et conditions générales de vente (CGV)
- Inscription et connexion
- Mot de passe oublié : demande de lien par e-mail, puis page de nouveau mot de passe avec vérification des règles pendant la saisie (10 caractères, majuscule et minuscule, chiffre, caractère spécial) et de la confirmation

### Client
- Espace de commande en 3 étapes : coordonnées et lieu de prestation, menu et nombre de convives avec choix de l'entrée, du plat et du dessert, récapitulatif (remise, frais de livraison, total TTC) et confirmation de la commande
- Mon compte
- Déconnexion : efface le rôle enregistré et revient à l'accueil avec le header public
- À compléter (suivi, historique, avis...)

### Employé
- À compléter

### Administrateur
- À compléter

## Technologies utilisées

- **Front-end** : HTML5, CSS3 (variables CSS, Grid, Flexbox, responsive), JavaScript vanilla (ES modules pour le routeur, un script par page pour les interactions)
- **Architecture** : application monopage (SPA) avec un routeur JavaScript maison (`History API`), header et pages chargés dynamiquement par `fetch`
- **Serveur de développement** : PHP (serveur intégré)
- **Back-end** : À compléter
- **Base de données** : À compléter
- **Outils** : Git / GitHub, Visual Studio Code, Figma

## Prérequis

- [Git](https://git-scm.com/)
- [PHP](https://www.php.net/) 8.0 ou supérieur
- À compléter (serveur de base de données, Composer...)

## Installation et lancement en local

1. Cloner le dépôt :

```bash
git clone https://github.com/<compte>/<depot>.git
cd <depot>
```

2. Lancer le serveur depuis la **racine du projet** :

```bash
php -S localhost:3000 router.php
```

3. Ouvrir le site : [http://localhost:3000/](http://localhost:3000/)

> Ouvrir `http://localhost:3000/` et non `/frontend/index.html`. Le fichier `router.php` renvoie `index.html` pour toutes les routes de l'application (`/menus`, `/contact`, `/cgv`...) et un vrai 404 pour les fichiers inexistants.

> Certains antivirus (Norton notamment) peuvent supprimer `router.php` par erreur. Dans ce cas, ajouter le dossier du projet aux exclusions de l'antivirus, puis restaurer le fichier depuis la quarantaine ou avec `git checkout router.php`.

Pour arrêter le serveur : `Ctrl + C` dans le terminal.

4. Configuration de la base de données : À compléter (création de la base, import du script SQL, fichier `.env` à partir de `.env.example`).

## Comptes de test

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Administrateur | À compléter | À compléter |
| Employé | À compléter | À compléter |
| Client | À compléter | À compléter |

> Comptes de démonstration uniquement.

## Structure du projet

```
.
├── router.php                     # Routeur du serveur PHP (fallback vers index.html)
└── frontend/
    ├── index.html                 # Point d'entrée : header, main et footer communs
    ├── images/                    # Logo et photos des menus
    ├── components/                # Headers selon le rôle (public, client, employé, admin)
    ├── pages/                     # Pages HTML chargées dans <main>
    │   ├── public/                # Accueil, menus, contact, CGV, mentions légales, 404
    │   │   └── menus-detail/      # Une page de détail par menu
    │   ├── auth/                  # Connexion, inscription, mot de passe oublié, nouveau mot de passe
    │   └── account/               # Mon compte, espace de commande
    ├── router/                    # Router.js, Route.js, allRoutes.js
    ├── scripts/                   # Un script par page (filtres, galerie, formulaires...)
    └── styles/                    # CSS : base, layout, home, menus, menu-detail, auth, order
```

## Pages du front-end

| Route | Page | Script |
|---|---|---|
| `/` ou `/home` | Accueil | — |
| `/menus` | Tous les menus avec filtres et tri | `menus.js` |
| `/menu-table-de-saison` | Détail : Table de saison | `menu-detail.js` |
| `/menu-jardin-vegetal` | Détail : Jardin végétal | `menu-detail.js` |
| `/menu-reception-conviviale` | Détail : Réception conviviale | `menu-detail.js` |
| `/menu-festin-de-noel` | Détail : Festin de Noël | `menu-detail.js` |
| `/contact` | Formulaire de contact | `contact.js` |
| `/signin` | Connexion | — |
| `/signup` | Inscription | — |
| `/forgot-password` | Mot de passe oublié | `forgot-password.js` |
| `/reset-password` | Nouveau mot de passe | `reset-password.js` |
| `/account` | Mon compte | — |
| `/commande` | Espace de commande | `order.js` |
| `/cgv` | Conditions générales de vente | — |
| `/mentions` | Mentions légales | — |
| `/404` | Page introuvable (aussi affichée pour toute route inconnue) | — |

## Fonctionnement du routeur

- `allRoutes.js` liste les routes : URL, titre et chemin du fichier HTML (et éventuellement du script JS) de chaque page.
- `Router.js` lit l'URL, charge la page correspondante dans `<main id="main-page">` et affiche une page 404 si la route est inconnue.
- Le script de la page est ajouté après le chargement du HTML, et l'ancien est retiré à chaque navigation.
- Le header est chargé selon le rôle de l'utilisateur, enregistré dans `localStorage` sous la clé `userRole` (`visitor`, `client`, `employee`, `admin`).
- Les liens internes (qui commencent par `/`) sont interceptés pour naviguer sans recharger la page.
- Un lien portant l'attribut `data-logout` efface le rôle avant de naviguer : c'est le lien « Déconnexion » des headers connectés.

### Ajouter une page

1. Créer le fichier HTML dans `frontend/pages/`.
2. Si la page a besoin d'interactions, créer son script dans `frontend/scripts/`.
3. Déclarer la route dans `frontend/router/allRoutes.js` (le 4ᵉ paramètre, le script, est facultatif) :

```js
new Route("/ma-page", "Titre de la page", "/frontend/pages/public/ma-page.html", "/frontend/scripts/ma-page.js"),
```

4. Ajouter un lien `<a href="/ma-page">` : l'écouteur global gère la navigation.

> Ne pas écrire de `<script>` directement dans le HTML d'une page : il est injecté avec `innerHTML` et ne serait pas exécuté. Le script doit être déclaré dans la route.

> Le script d'une page est rechargé à chaque visite : l'encapsuler dans une fonction exécutée immédiatement, `(() => { ... })();`, pour éviter les erreurs de variables déjà déclarées.

## Déploiement

À compléter (hébergeur, procédure de mise en ligne, variables d'environnement).

## Gestion de projet et Git

- **Branches** : `main` (production), `develop` (intégration), `feature/*` (une branche par fonctionnalité)
- **Commits** : convention [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `refactor`, `style`, `docs`, `chore`)

Exemple : `feat(auth): add sign-in and sign-up pages`

## Auteur

**À compléter** : Développeur Web et Web Mobile, Studi, 2026
