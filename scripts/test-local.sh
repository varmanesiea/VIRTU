#!/bin/bash

# Script de test de l'application en local
# Usage: ./test-local.sh

set -e

echo "=========================================="
echo "Test de l'application en local"
echo "=========================================="

# Verifier que Docker est installe
if ! command -v docker &> /dev/null; then
    echo "Docker n'est pas installe"
    exit 1
fi

# Verifier que Docker Compose est installe
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose n'est pas installe"
    exit 1
fi

echo "Docker et Docker Compose sont installes"

# Aller a la racine du projet
cd "$(dirname "$0")/.."

# Arreter les conteneurs existants
echo "Nettoyage des conteneurs existants..."
docker-compose -f docker-compose.local.yml down -v 2>/dev/null || true

# Construire et demarrer
echo "Construction et demarrage des conteneurs..."
docker-compose -f docker-compose.local.yml up --build -d

# Attendre que les services soient prets
echo "Attente du demarrage des services..."
sleep 10

# Verifier que les conteneurs tournent
echo "Statut des conteneurs:"
docker-compose -f docker-compose.local.yml ps

# Tester la connexion
echo ""
echo "Test de connexion..."
echo "Backend: http://localhost:5000/health"
curl -s http://localhost:5000/health | python3 -m json.tool || echo "Backend non accessible"

echo ""
echo "=========================================="
echo "Application demarree avec succes !"
echo "=========================================="
echo "Accedez a l'application:"
echo "   http://localhost:8080"
echo ""
echo "Commandes utiles:"
echo "   docker-compose -f docker-compose.local.yml logs -f"
echo "   docker-compose -f docker-compose.local.yml down"
echo "=========================================="
