# Scripts Utilitaires pour le TP

Ce dossier contient des scripts shell pour faciliter la réalisation du TP.

## Scripts disponibles

### 1. setup-vms.sh
Script pour configurer automatiquement les VMs avec K3s.

### 2. test-local.sh
Script pour tester l'application en local avec Docker Compose.

### 3. deploy.sh
Script wrapper pour lancer le déploiement Ansible.

### 4. update-image-tags.sh
Script pour mettre à jour les tags d'images dans les manifestes K8s.

## Utilisation

```bash
# Rendre les scripts exécutables
chmod +x scripts/*.sh

# Exécuter un script
./scripts/test-local.sh
```
