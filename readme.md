<p align="center">
  <img src="frontend/images/logo.svg" alt="Logo Vite & Gourmands" width="110">
</p>

# 🍽️ Vite & Gourmands

Site web du traiteur **Vite & Gourmands** (Bordeaux), réalisé pour la société **FastDev**. On peut y consulter les menus, commander en ligne et accéder à un espace client, employé ou administrateur.

Projet réalisé dans le cadre de l'ECF du **Titre Professionnel Développeur Web et Web Mobile** (Studi).

> **Où en est le projet ?**
> Je suis en formation et je n'ai étudié que le **front-end** pour le moment. Le site est fait en HTML, CSS et JavaScript, sans framework.
> Il n'y a pas encore de back-end : les données (menus, commandes, avis, comptes) sont enregistrées dans le navigateur avec le `localStorage`.

## 🔗 Liens utiles

| Ressource | Lien |
|---|---|
| Dépôt GitHub | [ECF-Vite-et-gourmands](https://github.com/romainroussel29/ECF-Vite-et-gourmands) |
| Kanban (gestion de projet) | [GitHub Projects](https://github.com/users/romainroussel29/projects/1/views/1) |
| Charte graphique et maquettes | [Figma](https://www.figma.com/design/s2llQKCWL1qJg8LJRm3mGO/Vite---Gourmand?node-id=70-10873&t=9nvsaZ584ek3FK5x-1) |
| Site en ligne | Pas encore déployé (à lancer en local) |
| Documentation technique | À venir, avec le back-end |
| Manuel d'utilisation | À venir, après le déploiement |

## ✨ Fonctionnalités

### Visiteur
- Page d'accueil avec présentation, avis clients et contact
- Liste des menus avec recherche, filtres (thème, régime, prix, nombre de personnes) et tri, sans recharger la page
- Page de détail de chaque menu : photos, prix, plats au choix, allergènes, conditions
- Formulaire de contact avec vérification des champs
- Inscription, connexion et mot de passe oublié
- Mentions légales et CGV

### Client
- Commande en 3 étapes avec calcul du prix en direct (remise de 10 % et frais de livraison hors Bordeaux)
- Historique des commandes avec leur statut
- Modification ou annulation d'une commande en attente
- Suivi de la commande et dépôt d'un avis une fois terminée
- Modification de ses informations personnelles

### Employé
- Recherche des commandes par client ou par statut
- Changement de statut, contact du client, modification de la commande, suivi du matériel prêté
- Validation ou refus des avis
- Gestion des menus, des plats et des horaires

### Administrateur
- Toutes les fonctionnalités de l'employé
- Création, désactivation et réactivation des comptes employés
- Statistiques des commandes et du chiffre d'affaires par menu

## 🛠️ Technologies utilisées

- **HTML5**
- **CSS3** : variables CSS, Flexbox, Grid, responsive
- **JavaScript** (vanilla) : routeur fait maison pour naviguer sans recharger la page
- **localStorage** : pour stocker les données en attendant le back-end
- **PHP** : seulement pour lancer le serveur en local
- **Outils** : Git, GitHub, Visual Studio Code, Figma

Le back-end et la base de données seront ajoutés plus tard dans la formation.

## 🚀 Lancer le projet en local

**Prérequis** : [Git](https://git-scm.com/) et [PHP](https://www.php.net/) 8.0 ou plus.

1. Cloner le dépôt :

```bash
git clone https://github.com/romainroussel29/ECF-Vite-et-gourmands.git
cd ECF-Vite-et-gourmands
```

2. Lancer le serveur depuis la racine du projet :

```bash
php -S localhost:3000 router.php
```

3. Ouvrir [http://localhost:3000/](http://localhost:3000/) dans le navigateur.

Pour arrêter le serveur : `Ctrl + C` dans le terminal.

> **Attention :** il faut bien ouvrir `http://localhost:3000/` et pas `/frontend/index.html`, sinon les liens entre les pages ne fonctionnent pas.
>
> Certains antivirus (Norton par exemple) peuvent supprimer `router.php` par erreur. Si c'est le cas, ajoutez le dossier du projet aux exclusions puis récupérez le fichier avec `git checkout router.php`.

## 🔐 Comptes de test

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | jose@vite-et-gourmands.fr | Admin2026! |
| Employé | julie@vite-et-gourmands.fr | Employe2026! |
| Client | camille.martin@example.com | Gourmand2026! |

Ces comptes, ainsi que des menus, commandes et avis d'exemple, sont créés automatiquement au premier chargement du site.
Pour tout remettre à zéro : taper `localStorage.clear()` dans la console du navigateur, puis recharger la page.

## 📁 Organisation des fichiers

```
.
├── router.php          # Serveur PHP local : renvoie toujours vers index.html
├── vercel.json         # Configuration pour le futur déploiement
└── frontend/
    ├── index.html      # Page principale (header, contenu, footer)
    ├── components/     # Les différents headers selon le rôle
    ├── pages/          # Le contenu HTML de chaque page
    ├── router/         # Le routeur JavaScript
    ├── scripts/        # Un fichier JavaScript par page
    ├── styles/         # Les fichiers CSS
    └── images/         # Logo et photos
```

## 🧭 Comment marche la navigation ?

Le site est une **application monopage** (SPA) : il n'y a qu'un seul fichier `index.html`, et le contenu change sans recharger la page.

- Toutes les pages sont déclarées dans `frontend/router/allRoutes.js` (adresse, titre, fichier HTML, script et rôles autorisés).
- Quand on clique sur un lien, `Router.js` charge le bon fichier HTML et son script.
- Si une page est réservée et que l'on n'est pas connecté, on est redirigé vers la connexion. Si l'on n'a pas le bon rôle, une page « Accès refusé » s'affiche.

Exemple pour ajouter une page :

```js
new Route("/ma-page", "Titre de la page", "/frontend/pages/public/ma-page.html", "/frontend/scripts/ma-page.js", ["client"]),
```

## 🌿 Git

- `main` : la version stable
- `develop` : la version en cours de développement
- `feature/...` : une branche par fonctionnalité

Les messages de commit suivent la convention [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `docs`, `style`...).
Exemple : `feat(auth): add sign-in and sign-up pages`

## 👤 Auteur

**Romain Roussel** : développeur web en formation chez Studi (2026)
