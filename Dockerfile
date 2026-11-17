# Image officielle avec PHP déjà installé
FROM php:8.3-cli

# Dossier de travail dans le conteneur
WORKDIR /app

# Copie du projet dans le conteneur
COPY . /app

# Port utilisé par le site
EXPOSE 3000

# Lancement du serveur PHP et le routeur router.php
CMD ["php", "-S", "0.0.0.0:3000", "router.php"]
