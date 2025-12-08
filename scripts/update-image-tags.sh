#!/bin/bash

# Script pour mettre à jour les tags d'images dans les manifestes K8s
# Usage: ./update-image-tags.sh <new_tag>

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <new_tag>"
    echo "Example: $0 abc123"
    exit 1
fi

NEW_TAG=$1
K8S_DIR="$(dirname "$0")/../k8s"

echo "=========================================="
echo "Mise a jour des tags d'images"
echo "=========================================="
echo "Nouveau tag: $NEW_TAG"
echo ""

# Backend
echo "Mise a jour backend-deployment.yaml..."
sed -i.bak "s|:latest|:${NEW_TAG}|g" "$K8S_DIR/backend-deployment.yaml"
sed -i.bak "s|:[a-zA-Z0-9]*$|:${NEW_TAG}|g" "$K8S_DIR/backend-deployment.yaml"

# Frontend
echo "Mise a jour frontend-deployment.yaml..."
sed -i.bak "s|:latest|:${NEW_TAG}|g" "$K8S_DIR/frontend-deployment.yaml"
sed -i.bak "s|:[a-zA-Z0-9]*$|:${NEW_TAG}|g" "$K8S_DIR/frontend-deployment.yaml"

# Supprimer les fichiers de backup
rm -f "$K8S_DIR"/*.bak

echo ""
echo "=========================================="
echo "Tags mis a jour avec succes !"
echo "=========================================="
echo ""
echo "Fichiers modifies:"
echo "   - k8s/backend-deployment.yaml"
echo "   - k8s/frontend-deployment.yaml"
echo ""
echo "N'oubliez pas de commit ces changements:"
echo "   git add k8s/"
echo "   git commit -m 'Update image tags to $NEW_TAG'"
echo "=========================================="
