import Route from './route.js';

export const allRoutes = [
    new Route('/', 'Accueil', '/pages/home.html'),
    new Route('/404', 'Page introuvable', '/pages/404.html'),
    new Route('/home', 'Accueil', '/pages/home.html'),
    new Route('/admin-header', 'header admin', '/pages/admin-header.html'),
    new Route ('/client-header', 'header client', '/pages/client-header.html'),
    new Route ('/employee-header', 'header employee', '/pages/employee-header.html'),
    new Route ('/visitor-header', 'header visitor', '/pages/visitor-header.html')
];

export const websiteName = 'Vite et gourmands';

