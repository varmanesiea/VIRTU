#!/bin/bash

# Script de déploiement wrapper pour Ansible
# Usage: ./deploy.sh [tag_version]

set -e

echo "=========================================="
echo "Deploiement sur Kubernetes"
echo "=========================================="

# Verifier qu'Ansible est installe
if ! command -v ansible-playbook &> /dev/null; then
    echo "Ansible n'est pas installe"
    echo "Installation: pip install ansible"
    exit 1
fi

echo "Ansible est installe"

# Aller dans le dossier ansible
cd "$(dirname "$0")/../ansible"

# Verifier que l'inventaire existe
if [ ! -f hosts.ini ]; then
    echo "Fichier hosts.ini non trouve"
    exit 1
fi

# Tester la connexion aux VMs
echo "Test de connexion aux VMs..."
if ! ansible -i hosts.ini k8s_master -m ping > /dev/null 2>&1; then
    echo "Impossible de se connecter a VM-Master"
    echo "Verifiez votre configuration SSH et l'inventaire hosts.ini"
    exit 1
fi

echo "Connexion aux VMs reussie"

# Determiner le tag d'image
IMAGE_TAG="${1:-latest}"
echo "Tag d'image: $IMAGE_TAG"

# Lancer le deploiement
echo ""
echo "Lancement du deploiement Ansible..."
echo "=========================================="

ansible-playbook -i hosts.ini deploy.yml -e "image_tag=$IMAGE_TAG"

echo ""
echo "=========================================="
echo "Deploiement termine !"
echo "=========================================="
