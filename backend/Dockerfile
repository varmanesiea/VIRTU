# Multi-stage build pour optimiser l'image
# Stage 1: Dependencies
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copier uniquement package.json et package-lock.json pour cache layer
COPY package*.json ./

# Installer les dépendances de production uniquement
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copier les dépendances depuis le stage précédent
COPY --from=dependencies /app/node_modules ./node_modules

# Copier le code source
COPY --chown=nodejs:nodejs . .

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 5000

# Labels
LABEL maintainer="ESIEA-INF4052"
LABEL version="1.0"
LABEL description="Backend API de l'application de vote"

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Commande de démarrage
CMD ["node", "server.js"]
