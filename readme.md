# Vite & Gourmands

Application web du traiteur **Vite & Gourmands** (Bordeaux), réalisée pour la société **FastDev** : consultation des menus, commande en ligne, espaces client, employé et administrateur.

Projet réalisé dans le cadre de l'ECF du **Titre Professionnel Développeur Web et Web Mobile** (Studi).

## Liens utiles

| Ressource | Lien |
|---|---|
| Application déployée | Pas encore déployée : lancement en local (voir « Installation et lancement en local ») |
| Dépôt GitHub | [github.com/romainroussel29/ECF-Vite-et-gourmands](https://github.com/romainroussel29/ECF-Vite-et-gourmands) |
| Gestion de projet (Kanban) | https://github.com/users/romainroussel29/projects/1/views/1 |
| Charte graphique et maquettes | https://www.figma.com/design/s2llQKCWL1qJg8LJRm3mGO/Vite---Gourmand?node-id=70-10873&t=9nvsaZ584ek3FK5x-1 |
| Documentation technique | En cours de rédaction : sera ajoutée une fois le back-end terminé |
| Manuel d'utilisation | En cours de rédaction : sera ajouté une fois le site déployé |

## Fonctionnalités

### Visiteur
- Page d'accueil (présentation, derniers avis clients validés par l'équipe, contact)
- Consultation des menus avec filtres sans rechargement de page :
  - recherche par nom ou description (sans tenir compte des accents)
  - thème, régime, prix maximum, fourchette de prix et nombre de personnes minimum
  - tri par pertinence, prix croissant ou décroissant, minimum de personnes
  - compteur de résultats, résumé des filtres actifs, message si aucun menu ne correspond, bouton de réinitialisation
- Détail de chaque menu (`/menu-<nom-du-menu>`) : galerie d'images, tarif et stock, conditions du menu, plats au choix avec allergènes, conditions de conservation
- Bouton « Commander » : redirige vers la connexion (puis revient à la commande, menu présélectionné) si l'utilisateur n'est pas connecté
- Page de contact : vérification des champs (titre, description, e-mail) avec messages d'erreur sous chaque champ, puis confirmation d'envoi
- Mentions légales et conditions générales de vente (CGV)
- Inscription (création d'un compte client) et connexion
- Mot de passe oublié : demande de lien par e-mail, puis page de nouveau mot de passe avec vérification des règles pendant la saisie (10 caractères, majuscule et minuscule, chiffre, caractère spécial) et de la confirmation
- Horaires du pied de page mis à jour depuis l'espace équipe

### Client
- Passer une commande en 3 étapes : coordonnées préremplies depuis le compte, lieu et date de prestation (délai minimum du menu), menu et nombre de convives, choix de l'entrée, du plat et du dessert, récapitulatif recalculé en direct
- Calcul du prix : prix par personne × convives, remise de 10 % sur le menu à partir de 5 convives au-delà du minimum, livraison offerte dans Bordeaux et 5 € + 0,59 €/km au-delà
- Le stock du menu diminue à chaque commande (et remonte en cas d'annulation)
- Mes commandes : historique complet avec statut et actions adaptées
- Détail d'une commande selon son statut :
  - en attente : modification (le menu reste verrouillé) et annulation avec confirmation
  - acceptée et après : suivi de la commande étape par étape, matériel à restituer
  - terminée : dépôt d'un avis (note de 1 à 5 et commentaire), publié après validation
- Mes informations : modification des coordonnées et de l'adresse du compte
- Déconnexion

### Employé
- Commandes : recherche par client **ou** par statut, accès au détail
- Détail d'une commande :
  - suivi opérationnel avec motif obligatoire à chaque changement de statut (horodaté et attribué)
  - contact préalable obligatoire (GSM ou e-mail, date, motif citant le mode) avant toute modification ou annulation
  - modification de la date, de l'heure, des convives et de l'adresse avec comparatif de prix avant confirmation
  - matériel prêté : ajout, restitution, passage automatique à « Terminée », alerte et pénalité de 600 € au-delà de 10 jours ouvrés
  - journal de traçabilité de toutes les actions
- Avis : validation ou refus (motif obligatoire) des avis en attente, aperçu de l'accueil
- Catalogue : liste et suppression des menus, bibliothèque de plats partagés (création, modification, allergènes, retrait d'un menu, suppression bloquée si le plat est utilisé)
- Gestion d'un menu : création et modification (présentation, galerie, plats associés, minimum, prix, stock, délai, conditions, publication)
- Horaires : éditeur des 7 jours avec plusieurs plages par jour, jour fermé, contrôle des chevauchements

### Administrateur
- Toutes les fonctionnalités de l'employé
- Comptes employés : création (rôle Employé imposé, règles du mot de passe, identifiant unique), désactivation avec motif, réactivation
- Statistiques : commandes terminées et chiffre d'affaires net de remise par menu, sur une période et pour un ou tous les menus (indicateurs, graphique et tableau)

> Les espaces client, employé et administrateur sont protégés côté front : un visiteur est redirigé vers la connexion, un utilisateur sans le bon rôle voit « Accès refusé ». Le back-end devra aussi vérifier ces droits.

## Technologies utilisées

- **Front-end** : HTML5, CSS3 (variables CSS, Grid, Flexbox, responsive), JavaScript vanilla (ES modules pour le routeur, un script par page pour les interactions)
- **Architecture** : application monopage (SPA) avec un routeur JavaScript maison (`History API`), header et pages chargés dynamiquement par `fetch`
- **Données côté front** : en attendant le back-end, menus, plats, commandes, avis, horaires et comptes sont enregistrés dans le `localStorage` du navigateur (`frontend/scripts/store.js`)
- **Serveur de développement** : PHP (serveur intégré)
- **Back-end** : en cours de développement. En attendant, les données sont gérées dans le navigateur par `frontend/scripts/store.js`
- **Base de données** : en cours de développement (base relationnelle pour l'application, base NoSQL pour les statistiques)
- **Outils** : Git / GitHub, Visual Studio Code, Figma

## Prérequis

- [Git](https://git-scm.com/)
- [PHP](https://www.php.net/) 8.0 ou supérieur
- Aucun autre prérequis pour la version actuelle : le back-end et sa base de données ajouteront les leurs

## Installation et lancement en local

1. Cloner le dépôt :

```bash
git clone https://github.com/romainroussel29/ECF-Vite-et-gourmands.git
cd ECF-Vite-et-gourmands
```

2. Lancer le serveur depuis la **racine du projet** :

```bash
php -S localhost:3000 router.php
```

3. Ouvrir le site : [http://localhost:3000/](http://localhost:3000/)

> Ouvrir `http://localhost:3000/` et non `/frontend/index.html`. Le fichier `router.php` renvoie `index.html` pour toutes les routes de l'application (`/menus`, `/contact`, `/cgv`...) et un vrai 404 pour les fichiers inexistants.

> Certains antivirus (Norton notamment) peuvent supprimer `router.php` par erreur. Dans ce cas, ajouter le dossier du projet aux exclusions de l'antivirus, puis restaurer le fichier depuis la quarantaine ou avec `git checkout router.php`.

Pour arrêter le serveur : `Ctrl + C` dans le terminal.

4. Aucune base de données à configurer pour la version actuelle : les menus, commandes, avis et comptes de départ sont créés automatiquement dans le navigateur au premier chargement (voir « Comptes de test »).

## Comptes de test

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Administrateur | jose@vite-et-gourmands.fr | Admin2026! |
| Employé | julie@vite-et-gourmands.fr | Employe2026! |
| Client | camille.martin@example.com | Gourmand2026! |

> Ces comptes sont créés au premier chargement du site, avec des menus, des commandes et des avis de départ. Pour revenir à ces données initiales, exécuter `localStorage.clear()` dans la console du navigateur puis recharger la page.

## Structure du projet

```
.
├── router.php                     # Routeur du serveur PHP (fallback vers index.html)
└── frontend/
    ├── index.html                 # Point d'entrée : header, main et footer communs
    ├── images/                    # Logo et photos des menus
    ├── components/                # Headers selon le rôle (public, client, employé, admin)
    ├── pages/                     # Pages HTML chargées dans <main>
    │   ├── public/                # Accueil, menus, détail d'un menu, contact, CGV, mentions légales, 403, 404
    │   ├── auth/                  # Connexion, inscription, mot de passe oublié, nouveau mot de passe
    │   ├── account/               # Espace client : commandes, informations, commande, modification
    │   └── staff/                 # Espace équipe et administration
    ├── router/                    # Router.js, Route.js, allRoutes.js
    ├── scripts/                   # store.js (données), ui.js (blocs communs), puis un script par page
    └── styles/                    # CSS : base, layout, home, menus, menu-detail, auth, order, app
```

## Pages du front-end

| Route | Page | Accès |
|---|---|---|
| `/` ou `/home` | Accueil | Public |
| `/menus` | Tous les menus avec filtres et tri | Public |
| `/menu-<nom>` | Détail d'un menu (ex. `/menu-table-de-saison`) | Public |
| `/contact` | Formulaire de contact | Public |
| `/signin`, `/signup` | Connexion, inscription | Public |
| `/forgot-password`, `/reset-password` | Mot de passe oublié, nouveau mot de passe | Public |
| `/cgv`, `/mentions` | Conditions générales de vente, mentions légales | Public |
| `/commande?menu=<nom>` | Passer une commande | Client |
| `/account` | Mes commandes | Client |
| `/account-info` | Mes informations | Client |
| `/account-order?id=<n°>` | Détail, suivi et avis d'une commande | Client |
| `/account-order-edit?id=<n°>` | Modifier une commande en attente | Client |
| `/staff-orders` | Commandes (recherche par client ou statut) | Employé, Administrateur |
| `/staff-order?id=<n°>` | Détail d'une commande, suivi, contact préalable, matériel, journal | Employé, Administrateur |
| `/staff-reviews` | Modération des avis | Employé, Administrateur |
| `/staff-catalogue` | Menus, bibliothèque de plats et horaires | Employé, Administrateur |
| `/staff-menu-edit?id=<id>` | Créer ou modifier un menu | Employé, Administrateur |
| `/admin-accounts` | Comptes employés | Administrateur |
| `/admin-stats` | Statistiques par menu | Administrateur |
| `/404` | Page introuvable (aussi affichée pour toute route inconnue) | Public |

Chaque page a son script du même nom dans `frontend/scripts/`.

## Fonctionnement du routeur

- `allRoutes.js` liste les routes : URL, titre, chemin du fichier HTML, script JS (facultatif) et rôles autorisés (vide = page publique).
- Une route terminée par `*` accepte toutes les URL qui commencent pareil : `/menu-*` sert la page de détail de chaque menu, retrouvé à partir de l'URL.
- Si la page est réservée, un visiteur est redirigé vers `/signin?redirect=...`, puis renvoyé vers la page demandée après connexion ; un utilisateur connecté sans le bon rôle voit la page « Accès refusé » (403).
- `Router.js` lit l'URL, charge la page correspondante dans `<main id="main-page">` et affiche une page 404 si la route est inconnue.
- Le script de la page est ajouté après le chargement du HTML, et l'ancien est retiré à chaque navigation.
- Le header est chargé selon le rôle de l'utilisateur, enregistré dans `localStorage` sous les clés `userRole` (`visitor`, `client`, `employee`, `admin`) et `userEmail`. Le prénom et le rôle s'affichent dans les éléments `data-user-name` et `data-user-role`.
- Les liens internes (qui commencent par `/`) sont interceptés pour naviguer sans recharger la page.
- Un lien portant l'attribut `data-logout` ferme la session avant de naviguer : c'est le lien « Déconnexion » des headers connectés.
- `window.navigateTo(url)` permet à un script de page de naviguer (ex. après la connexion).
- `store.js` (objet global `VG`) et `ui.js` (objet global `VGUI`) sont chargés une seule fois dans `index.html`, avant le routeur : les scripts de page s'en servent pour lire et enregistrer les données.

### Ajouter une page

1. Créer le fichier HTML dans `frontend/pages/`.
2. Si la page a besoin d'interactions, créer son script dans `frontend/scripts/`.
3. Déclarer la route dans `frontend/router/allRoutes.js` (le script et la liste des rôles sont facultatifs) :

```js
new Route("/ma-page", "Titre de la page", "/frontend/pages/public/ma-page.html", "/frontend/scripts/ma-page.js", ["client"]),
```

4. Ajouter un lien `<a href="/ma-page">` : l'écouteur global gère la navigation.

> Ne pas écrire de `<script>` directement dans le HTML d'une page : il est injecté avec `innerHTML` et ne serait pas exécuté. Le script doit être déclaré dans la route.

> Le script d'une page est rechargé à chaque visite : l'encapsuler dans une fonction exécutée immédiatement, `(() => { ... })();`, pour éviter les erreurs de variables déjà déclarées.

## Déploiement

Le site n'est pas encore déployé. Il fonctionne en local avec le serveur intégré de PHP (voir « Installation et lancement en local »). La mise en ligne est prévue une fois le back-end terminé.

## Gestion de projet et Git

- **Branches** : `main` (production), `develop` (intégration), `feature/*` (une branche par fonctionnalité)
- **Commits** : convention [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `refactor`, `style`, `docs`, `chore`)

Exemple : `feat(auth): add sign-in and sign-up pages`

## Auteur

**Romain Roussel** : Développeur Web et Web Mobile, Studi, 2026
