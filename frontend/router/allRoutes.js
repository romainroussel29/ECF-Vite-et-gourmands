import Route from './Route.js';

// Rôles autorisés pour les pages réservées
const CLIENT = ['client'];
const STAFF = ['employee', 'admin'];
const ADMIN = ['admin'];

const page = (path) => `/frontend/pages/${path}`;
const script = (name) => `/frontend/scripts/${name}.js`;

export const allRoutes = [
    // --- Pages publiques ---
    new Route('/', 'Accueil', page('public/home.html'), script('home')),
    new Route('/home', 'Accueil', page('public/home.html'), script('home')),
    new Route('/menus', 'Nos menus', page('public/menus.html'), script('menus')),
    new Route('/menu-*', 'Détail du menu', page('public/menu-detail.html'), script('menu-detail')),
    new Route('/contact', 'Contact', page('public/contact.html'), script('contact')),

    // --- Authentification ---
    new Route('/signin', 'Connexion', page('auth/signin.html'), script('signin')),
    new Route('/signup', 'Inscription', page('auth/signup.html'), script('signup')),
    new Route('/forgot-password', 'Mot de passe oublié', page('auth/forgot-password.html'), script('forgot-password')),
    new Route('/reset-password', 'Nouveau mot de passe', page('auth/reset-password.html'), script('reset-password')),

    // --- Espace client ---
    new Route('/account', 'Mes commandes', page('account/account.html'), script('account-orders'), CLIENT),
    new Route('/account-info', 'Mes informations', page('account/account-info.html'), script('account-info'), CLIENT),
    new Route('/account-order', 'Ma commande', page('account/account-order.html'), script('account-order'), CLIENT),
    new Route('/account-order-edit', 'Modifier ma commande', page('account/account-order-edit.html'), script('account-order-edit'), CLIENT),
    new Route('/commande', 'Passer une commande', page('account/order.html'), script('order'), CLIENT),

    // --- Espace équipe (Employé et Administrateur) ---
    new Route('/staff-orders', 'Commandes', page('staff/staff-orders.html'), script('staff-orders'), STAFF),
    new Route('/staff-order', 'Détail de la commande', page('staff/staff-order.html'), script('staff-order'), STAFF),
    new Route('/staff-reviews', 'Modération des avis', page('staff/staff-reviews.html'), script('staff-reviews'), STAFF),
    new Route('/staff-catalogue', 'Catalogue et horaires', page('staff/staff-catalogue.html'), script('staff-catalogue'), STAFF),
    new Route('/staff-menu-edit', 'Gestion du catalogue', page('staff/staff-menu-edit.html'), script('staff-menu-edit'), STAFF),

    // --- Administration (Administrateur uniquement) ---
    new Route('/admin-accounts', 'Comptes employés', page('staff/admin-accounts.html'), script('admin-accounts'), ADMIN),
    new Route('/admin-stats', 'Statistiques', page('staff/admin-stats.html'), script('admin-stats'), ADMIN),

    // --- Pages légales ---
    new Route('/cgv', 'Conditions générales de vente', page('public/cgv.html')),
    new Route('/mentions', 'Mentions légales', page('public/mentions.html')),

    // --- Système ---
    new Route('/404', 'Page introuvable', page('public/404.html')),
];

export const websiteName = 'Vite et gourmands';
