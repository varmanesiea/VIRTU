# Reference des Commandes

Guide complet de toutes les commandes necessaires pour le TP.

---

## Table des Matieres

1. [Git et GitLab](#1-git-et-gitlab)
2. [Docker](#2-docker)
3. [Kubernetes (kubectl)](#3-kubernetes-kubectl)
4. [Ansible](#4-ansible)
5. [K3s](#5-k3s)
6. [SSH et Reseau](#6-ssh-et-reseau)
7. [Debug et Diagnostic](#7-debug-et-diagnostic)

---

## 1. Git et GitLab

### Initialisation du Projet

```bash
# Initialiser un depot Git
git init

# Ajouter le remote GitLab
git remote add origin https://gitlab.com/USERNAME/voting-app.git

# Verifier les remotes
git remote -v
```

### Operations Courantes

```bash
# Voir l'etat des fichiers
git status

# Ajouter tous les fichiers
git add .

# Ajouter un fichier specifique
git add chemin/vers/fichier

# Committer avec message
git commit -m "Description du changement"

# Pousser vers GitLab
git push -u origin main

# Recuperer les changements
git pull origin main
```

### Tags et Versions

```bash
# Creer un tag
git tag -a v1.0.0 -m "Version 1.0.0"

# Pousser les tags
git push origin --tags

# Lister les tags
git tag -l
```

### Branches

```bash
# Creer et basculer sur une branche
git checkout -b feature/nouvelle-fonction

# Revenir sur main
git checkout main

# Fusionner une branche
git merge feature/nouvelle-fonction
```

---

## 2. Docker

### Images

```bash
# Construire une image
docker build -t nom-image:tag .

# Construire avec un Dockerfile specifique
docker build -f Dockerfile.prod -t nom-image:tag .

# Lister les images
docker images

# Supprimer une image
docker rmi nom-image:tag

# Taguer une image
docker tag nom-image:tag registry.gitlab.com/user/projet/image:tag

# Pousser vers un registry
docker push registry.gitlab.com/user/projet/image:tag

# Tirer une image
docker pull registry.gitlab.com/user/projet/image:tag
```

### Containers

```bash
# Lancer un container
docker run -d --name mon-container -p 8080:80 nom-image

# Lister les containers actifs
docker ps

# Lister tous les containers
docker ps -a

# Arreter un container
docker stop mon-container

# Supprimer un container
docker rm mon-container

# Voir les logs
docker logs mon-container

# Logs en temps reel
docker logs -f mon-container

# Entrer dans un container
docker exec -it mon-container /bin/sh
```

### Docker Compose

```bash
# Demarrer les services
docker compose -f docker-compose.local.yml up -d

# Voir les logs de tous les services
docker compose -f docker-compose.local.yml logs -f

# Logs d'un service specifique
docker compose -f docker-compose.local.yml logs -f backend

# Arreter les services
docker compose -f docker-compose.local.yml down

# Arreter et supprimer les volumes
docker compose -f docker-compose.local.yml down -v

# Reconstruire les images
docker compose -f docker-compose.local.yml build

# Reconstruire et relancer
docker compose -f docker-compose.local.yml up -d --build
```

### Nettoyage

```bash
# Supprimer les containers arretes
docker container prune

# Supprimer les images non utilisees
docker image prune

# Supprimer les volumes non utilises
docker volume prune

# Nettoyage complet
docker system prune -a
```

### Authentification Registry

```bash
# Se connecter au GitLab Registry
docker login registry.gitlab.com

# Se deconnecter
docker logout registry.gitlab.com
```

---

## 3. Kubernetes (kubectl)

### Informations du Cluster

```bash
# Voir les noeuds
kubectl get nodes

# Informations detaillees sur un noeud
kubectl describe node nom-du-noeud

# Version de kubectl et du cluster
kubectl version

# Configuration actuelle
kubectl config view

# Contexte actuel
kubectl config current-context
```

### Namespaces

```bash
# Lister les namespaces
kubectl get namespaces

# Creer un namespace
kubectl create namespace voting-app

# Supprimer un namespace
kubectl delete namespace voting-app

# Definir le namespace par defaut
kubectl config set-context --current --namespace=voting-app
```

### Pods

```bash
# Lister les pods (namespace courant)
kubectl get pods

# Lister les pods d'un namespace
kubectl get pods -n voting-app

# Lister tous les pods
kubectl get pods --all-namespaces

# Details d'un pod
kubectl describe pod nom-du-pod -n voting-app

# Logs d'un pod
kubectl logs nom-du-pod -n voting-app

# Logs en temps reel
kubectl logs -f nom-du-pod -n voting-app

# Logs du container precedent (si crash)
kubectl logs --previous nom-du-pod -n voting-app

# Entrer dans un pod
kubectl exec -it nom-du-pod -n voting-app -- /bin/sh

# Supprimer un pod
kubectl delete pod nom-du-pod -n voting-app
```

### Deployments

```bash
# Lister les deployments
kubectl get deployments -n voting-app

# Details d'un deployment
kubectl describe deployment backend -n voting-app

# Scaling manuel
kubectl scale deployment backend --replicas=3 -n voting-app

# Redemarrer un deployment
kubectl rollout restart deployment backend -n voting-app

# Statut du rollout
kubectl rollout status deployment backend -n voting-app

# Historique des rollouts
kubectl rollout history deployment backend -n voting-app

# Rollback
kubectl rollout undo deployment backend -n voting-app

# Supprimer un deployment
kubectl delete deployment backend -n voting-app
```

### Services

```bash
# Lister les services
kubectl get services -n voting-app

# Alias: svc
kubectl get svc -n voting-app

# Details d'un service
kubectl describe service frontend -n voting-app

# Supprimer un service
kubectl delete service frontend -n voting-app
```

### Secrets

```bash
# Creer un secret docker-registry
kubectl create secret docker-registry gitlab-registry-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=VOTRE_USERNAME \
  --docker-password=VOTRE_TOKEN \
  --docker-email=VOTRE_EMAIL \
  -n voting-app

# Lister les secrets
kubectl get secrets -n voting-app

# Voir un secret (encode en base64)
kubectl get secret gitlab-registry-secret -n voting-app -o yaml

# Decoder un secret
kubectl get secret gitlab-registry-secret -n voting-app \
  -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d

# Supprimer un secret
kubectl delete secret gitlab-registry-secret -n voting-app
```

### ConfigMaps

```bash
# Creer depuis un fichier
kubectl create configmap config-name --from-file=fichier.conf -n voting-app

# Creer depuis des valeurs
kubectl create configmap config-name \
  --from-literal=key1=value1 \
  --from-literal=key2=value2 \
  -n voting-app

# Lister les configmaps
kubectl get configmaps -n voting-app

# Voir le contenu
kubectl describe configmap config-name -n voting-app
```

### Application de Manifestes

```bash
# Appliquer un manifeste
kubectl apply -f fichier.yaml

# Appliquer tous les fichiers d'un dossier
kubectl apply -f k8s/

# Appliquer de maniere recursive
kubectl apply -R -f k8s/

# Supprimer via manifeste
kubectl delete -f fichier.yaml

# Supprimer tous les fichiers d'un dossier
kubectl delete -f k8s/
```

### Commandes de Vue Generale

```bash
# Tout voir dans un namespace
kubectl get all -n voting-app

# Vue large avec plus d'infos
kubectl get all -n voting-app -o wide

# Export YAML d'une ressource
kubectl get deployment backend -n voting-app -o yaml

# Export JSON
kubectl get deployment backend -n voting-app -o json
```

### PersistentVolumes

```bash
# Lister les PV
kubectl get pv

# Lister les PVC
kubectl get pvc -n voting-app

# Details d'un PVC
kubectl describe pvc postgres-pvc -n voting-app
```

---

## 4. Ansible

### Verification

```bash
# Verifier la syntaxe du playbook
ansible-playbook deploy.yml --syntax-check

# Lister les hotes de l'inventaire
ansible-inventory -i hosts.ini --list

# Tester la connexion aux hotes
ansible all -i hosts.ini -m ping
```

### Execution

```bash
# Executer le playbook
ansible-playbook -i hosts.ini deploy.yml

# Mode verbose (plus de details)
ansible-playbook -i hosts.ini deploy.yml -v

# Mode tres verbose
ansible-playbook -i hosts.ini deploy.yml -vvv

# Dry run (simulation sans execution)
ansible-playbook -i hosts.ini deploy.yml --check

# Limiter a un hote specifique
ansible-playbook -i hosts.ini deploy.yml --limit vm-master

# Demander le mot de passe SSH
ansible-playbook -i hosts.ini deploy.yml --ask-pass

# Demander le mot de passe sudo
ansible-playbook -i hosts.ini deploy.yml --ask-become-pass
```

### Commandes Ad-hoc

```bash
# Executer une commande sur tous les hotes
ansible all -i hosts.ini -m shell -a "hostname"

# Copier un fichier
ansible all -i hosts.ini -m copy -a "src=fichier.txt dest=/tmp/"

# Installer un paquet
ansible all -i hosts.ini -m apt -a "name=htop state=present" --become
```

---

## 5. K3s

### Installation Master

```bash
# Installer K3s en mode server (master)
curl -sfL https://get.k3s.io | sh -

# Avec options specifiques
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" sh -

# Recuperer le token pour les workers
sudo cat /var/lib/rancher/k3s/server/node-token

# Recuperer le kubeconfig
sudo cat /etc/rancher/k3s/k3s.yaml
```

### Installation Worker

```bash
# Installer K3s en mode agent (worker)
curl -sfL https://get.k3s.io | K3S_URL=https://IP_DU_MASTER:6443 \
  K3S_TOKEN=TOKEN_DU_MASTER sh -
```

### Gestion K3s

```bash
# Statut du service
sudo systemctl status k3s

# Redemarrer K3s
sudo systemctl restart k3s

# Logs K3s
sudo journalctl -u k3s -f

# Desinstaller K3s server
/usr/local/bin/k3s-uninstall.sh

# Desinstaller K3s agent
/usr/local/bin/k3s-agent-uninstall.sh
```

### Configuration kubectl

```bash
# Utiliser kubectl avec K3s
sudo k3s kubectl get nodes

# OU exporter le kubeconfig
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# OU copier le kubeconfig
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

---

## 6. SSH et Reseau

### Connexion SSH

```bash
# Se connecter a une VM
ssh utilisateur@adresse_ip

# Avec cle specifique
ssh -i ~/.ssh/ma_cle utilisateur@adresse_ip

# Copier un fichier vers la VM
scp fichier.txt utilisateur@ip:/chemin/destination/

# Copier un dossier
scp -r dossier/ utilisateur@ip:/chemin/destination/

# Copier depuis la VM
scp utilisateur@ip:/chemin/fichier.txt ./
```

### Cles SSH

```bash
# Generer une paire de cles
ssh-keygen -t ed25519 -C "email@example.com"

# Copier la cle publique vers une VM
ssh-copy-id utilisateur@adresse_ip

# Voir sa cle publique
cat ~/.ssh/id_ed25519.pub
```

### Tests Reseau

```bash
# Ping
ping adresse_ip

# Tester un port
nc -zv adresse_ip port

# Curl
curl http://adresse_ip:port
curl -v http://adresse_ip:port

# Traceroute
traceroute adresse_ip

# DNS lookup
nslookup hostname
dig hostname
```

### Ports et Connexions

```bash
# Ports en ecoute
netstat -tlnp
ss -tlnp

# Voir les connexions etablies
netstat -an | grep ESTABLISHED

# Firewall (Ubuntu)
sudo ufw status
sudo ufw allow 6443
sudo ufw allow 30080
```

---

## 7. Debug et Diagnostic

### Logs Systeme

```bash
# Logs systeme
sudo journalctl -xe

# Logs d'un service specifique
sudo journalctl -u k3s -f

# Derniers logs
sudo journalctl -n 100
```

### Ressources Systeme

```bash
# Utilisation CPU/Memoire
top
htop

# Espace disque
df -h

# Memoire
free -h

# Processes
ps aux | grep process_name
```

### Debug Kubernetes

```bash
# Evenements du cluster
kubectl get events -n voting-app

# Evenements tries par date
kubectl get events -n voting-app --sort-by='.lastTimestamp'

# Describe detaille d'un pod qui ne demarre pas
kubectl describe pod nom-du-pod -n voting-app

# Verifier les endpoints d'un service
kubectl get endpoints -n voting-app

# Test DNS interne
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup backend.voting-app.svc.cluster.local

# Test de connectivite depuis un pod
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -qO- http://backend:5000/health
```

### Debug Docker

```bash
# Inspecter un container
docker inspect container_name

# Stats en temps reel
docker stats

# Historique d'une image
docker history image_name

# Examiner les layers
docker inspect --format='{{.RootFS.Layers}}' image_name
```

### Erreurs Courantes

```bash
# ImagePullBackOff - Verifier le secret
kubectl get secrets -n voting-app

# CrashLoopBackOff - Voir les logs
kubectl logs nom-du-pod -n voting-app --previous

# Pending - Verifier les ressources
kubectl describe pod nom-du-pod -n voting-app | grep -A5 Events

# Connection refused - Verifier le service
kubectl get svc,ep -n voting-app
```

---

## Commandes Rapides - Cheatsheet

```bash
# Docker
docker compose -f docker-compose.local.yml up -d   # Demarrer local
docker compose -f docker-compose.local.yml down    # Arreter local

# K8s - Voir tout
kubectl get all -n voting-app

# K8s - Appliquer les manifestes
kubectl apply -f k8s/

# K8s - Creer le secret Registry
kubectl create secret docker-registry gitlab-registry-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=USER --docker-password=TOKEN \
  --docker-email=EMAIL -n voting-app

# K8s - Redemarrer les deployments
kubectl rollout restart deployment -n voting-app

# Ansible - Deployer
ansible-playbook -i ansible/hosts.ini ansible/deploy.yml

# Git - Commit et push
git add . && git commit -m "Update" && git push

# Debug - Logs d'un pod
kubectl logs -f $(kubectl get pods -n voting-app -l app=backend -o jsonpath='{.items[0].metadata.name}') -n voting-app
```

---

Document de reference pour le TP INF4052
