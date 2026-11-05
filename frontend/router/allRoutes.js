import Route from './Route.js';

export const allRoutes = [
    // --- Pages principales ---
    new Route('/', 'Accueil', '/frontend/pages/public/home.html'),
    new Route('/home', 'Accueil', '/frontend/pages/public/home.html'),
    new Route('/menus', 'Nos menus', '/frontend/pages/public/menus.html', '/frontend/scripts/menus.js'),

    // --- Détail des menus ---
    new Route('/menu-table-de-saison', 'Table de saison', '/frontend/pages/public/menus-detail/table-de-saison.html', '/frontend/scripts/menu-detail.js'),
    new Route('/menu-jardin-vegetal', 'Jardin végétal', '/frontend/pages/public/menus-detail/jardin-vegetal.html', '/frontend/scripts/menu-detail.js'),
    new Route('/menu-reception-conviviale', 'Réception conviviale', '/frontend/pages/public/menus-detail/reception-conviviale.html', '/frontend/scripts/menu-detail.js'),
    new Route('/menu-festin-de-noel', 'Festin de Noël', '/frontend/pages/public/menus-detail/festin-de-noel.html', '/frontend/scripts/menu-detail.js'),

    new Route('/contact', 'Contact', '/frontend/pages/public/contact.html'),

    // --- Authentification et Compte ---
    new Route('/signin', 'Connexion', '/frontend/pages/auth/signin.html'),
    new Route('/signup', 'Inscription', '/frontend/pages/auth/signup.html'),
    new Route('/account', 'Mon compte', '/frontend/pages/account/account.html'),
    new Route('/commande', 'Ma commande', '/frontend/pages/account/order.html'),

    // --- Pages légales ---
    new Route('/cgv', 'Conditions générales de vente', '/frontend/pages/public/cgv.html'),
    new Route('/mentions', 'Mentions légales', '/frontend/pages/public/mentions.html'),

    // --- Headers dynamiques ---
    new Route('/admin-header', 'Header admin', '/frontend/components/admin-header.html'),
    new Route('/client-header', 'Header client', '/frontend/components/client-header.html'),
    new Route('/employee-header', 'Header employee', '/frontend/components/employee-header.html'),
    new Route('/public-header', 'Header public', '/frontend/components/public-header.html'),

    // --- Système ---
    new Route('/404', 'Page introuvable', '/frontend/pages/public/404.html')
];

export const websiteName = 'Vite et gourmands';