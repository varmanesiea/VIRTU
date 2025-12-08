#!/bin/bash

# Script de configuration automatique des VMs K3s
# Usage: ./setup-vms.sh <master_ip> <worker_ip> <ssh_user>

set -e

if [ $# -lt 3 ]; then
    echo "Usage: $0 <master_ip> <worker_ip> <ssh_user>"
    echo "Example: $0 192.168.1.100 192.168.1.101 ubuntu"
    exit 1
fi

MASTER_IP=$1
WORKER_IP=$2
SSH_USER=$3

echo "=========================================="
echo "Configuration du cluster K3s"
echo "=========================================="
echo "Master: $MASTER_IP"
echo "Worker: $WORKER_IP"
echo "User: $SSH_USER"
echo "=========================================="

# Installation K3s sur le Master
echo ""
echo "Installation K3s sur VM-Master..."
ssh ${SSH_USER}@${MASTER_IP} "curl -sfL https://get.k3s.io | sh -"

# Attendre que K3s soit pret
echo "Attente du demarrage de K3s..."
sleep 20

# Recuperer le token
echo "Recuperation du token..."
K3S_TOKEN=$(ssh ${SSH_USER}@${MASTER_IP} "sudo cat /var/lib/rancher/k3s/server/node-token")

if [ -z "$K3S_TOKEN" ]; then
    echo "Impossible de recuperer le token K3s"
    exit 1
fi

echo "Token recupere"

# Installation K3s sur le Worker
echo ""
echo "Installation K3s sur VM-Worker..."
ssh ${SSH_USER}@${WORKER_IP} "curl -sfL https://get.k3s.io | K3S_URL=https://${MASTER_IP}:6443 K3S_TOKEN=${K3S_TOKEN} sh -"

# Attendre que le worker rejoigne le cluster
echo "Attente de la jonction du worker..."
sleep 20

# Verifier le cluster
echo ""
echo "Verification du cluster..."
ssh ${SSH_USER}@${MASTER_IP} "sudo kubectl get nodes"

echo ""
echo "=========================================="
echo "Cluster K3s configure avec succes !"
echo "=========================================="
echo ""
echo "Prochaines etapes:"
echo "1. Creer le secret GitLab Registry:"
echo "   ssh ${SSH_USER}@${MASTER_IP}"
echo "   kubectl create secret docker-registry gitlab-registry-secret \\"
echo "     --docker-server=registry.gitlab.com \\"
echo "     --docker-username=<USERNAME> \\"
echo "     --docker-password=<TOKEN> \\"
echo "     --docker-email=<EMAIL>"
echo ""
echo "2. Mettre a jour ansible/hosts.ini avec les IPs"
echo "3. Lancer le deploiement: ./scripts/deploy.sh"
echo "=========================================="
