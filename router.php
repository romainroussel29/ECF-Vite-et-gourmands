<?php
// Routeur du serveur de développement PHP.
// Lancement depuis la racine du projet : php -S localhost:3000 router.php

$root = __DIR__;
$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// 1. Fichier existant (ex. /frontend/styles/base.css) : servi tel quel par PHP
if ($path !== '/' && is_file($root . $path)) {
    return false;
}

// 2. Chemin relatif résolu depuis la racine (ex. /router/Router.js -> /frontend/router/Router.js)
$frontendFile = $root . '/frontend' . $path;
if ($path !== '/' && is_file($frontendFile)) {
    $types = [
        'js'   => 'text/javascript',
        'css'  => 'text/css',
        'html' => 'text/html; charset=UTF-8',
        'svg'  => 'image/svg+xml',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'webp' => 'image/webp',
    ];
    $ext = strtolower(pathinfo($frontendFile, PATHINFO_EXTENSION));
    header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
    readfile($frontendFile);
    return true;
}

// 3. Fichier introuvable (avec extension) : vrai 404
if (preg_match('/\.[a-z0-9]+$/i', $path)) {
    http_response_code(404);
    echo 'Fichier introuvable';
    return true;
}

// 4. Route de l'application (/menus, /contact...) : le routeur JavaScript prend le relais
header('Content-Type: text/html; charset=UTF-8');
readfile($root . '/frontend/index.html');
return true;
