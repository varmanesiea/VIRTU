# Multi-stage build pour optimiser la taille de l'image
# Stage 1: Build avec Node.js (si nécessaire pour des optimisations)
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers statiques
COPY index.html .
COPY style.css .
COPY app.js .

# Stage 2: Production avec nginx léger
FROM nginx:1.25-alpine

# Copier les fichiers statiques depuis le builder
COPY --from=builder /app /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Labels pour la traçabilité
LABEL maintainer="ESIEA-INF4052"
LABEL version="1.0"
LABEL description="Frontend de l'application de vote"

# Nginx démarre automatiquement avec l'image de base
CMD ["nginx", "-g", "daemon off;"]
