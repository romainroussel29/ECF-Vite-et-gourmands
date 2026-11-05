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
- Consultation des menus avec filtres
- Page de contact
- Mentions légales et conditions générales de vente (CGV)
- Inscription et connexion

### Client
- À compléter (commande, suivi, historique, avis...)

### Employé
- À compléter

### Administrateur
- À compléter

## Technologies utilisées

- **Front-end** : HTML5, CSS3, JavaScript (vanilla, ES modules)
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
├── router.php                 # Routeur du serveur PHP (fallback vers index.html)
└── frontend/
    ├── index.html             # Point d'entrée : header, main et footer communs
    ├── assets/                # Images et logo
    ├── components/            # Headers selon le rôle (public, client, employé, admin)
    ├── pages/                 # Pages HTML chargées dans <main>
    ├── router/                # Router.js, route.js, allRoutes.js
    └── styles/                # base, layout, home, menus, auth (CSS)
```

## Fonctionnement du routeur

- `allRoutes.js` liste les routes : URL, titre et chemin du fichier HTML (et éventuellement du script JS) de chaque page.
- `Router.js` lit l'URL, charge la page correspondante dans `<main id="main-page">` et affiche une page 404 si la route est inconnue.
- Le header est chargé selon le rôle de l'utilisateur (`visitor`, `client`, `employee`, `admin`).
- Les liens internes (qui commencent par `/`) sont interceptés pour naviguer sans recharger la page.

### Ajouter une page

1. Créer le fichier HTML dans `frontend/pages/`.
2. Déclarer la route dans `frontend/router/allRoutes.js` :

```js
new Route("/ma-page", "Titre de la page", "/frontend/pages/public/ma-page.html"),
```

3. Ajouter un lien `<a href="/ma-page">` : l'écouteur global gère la navigation.

## Déploiement

À compléter (hébergeur, procédure de mise en ligne, variables d'environnement).

## Gestion de projet et Git

- **Branches** : `main` (production), `develop` (intégration), `feature/*` (une branche par fonctionnalité)
- **Commits** : convention [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `refactor`, `style`, `docs`, `chore`)

Exemple : `feat(auth): add sign-in and sign-up pages`

## Auteur

**À compléter** : Développeur Web et Web Mobile, Studi, 2026
