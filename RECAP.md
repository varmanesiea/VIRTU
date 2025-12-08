# Recapitulatif du Projet - TP Final INF4052

## Projet Complet Genere

Tous les fichiers necessaires pour realiser le TP ont ete crees avec succes.

---

## Structure du Projet

```
VIRTU PROJET/
|-- README.md                          # Guide principal avec instructions completes
|-- .gitignore                         # Fichiers a ignorer par Git
|-- .gitlab-ci.yml                     # Pipeline CI/CD GitLab
|-- docker-compose.local.yml           # Tests en local
|
|-- frontend/                          # Application Frontend
|   |-- Dockerfile                     # Dockerfile multi-stage optimise
|   |-- nginx.conf                     # Configuration Nginx
|   |-- index.html                     # Interface de vote
|   |-- style.css                      # Design moderne avec degrades
|   +-- app.js                         # Logique JavaScript
|
|-- backend/                           # API Backend
|   |-- Dockerfile                     # Dockerfile multi-stage optimise
|   |-- package.json                   # Dependances Node.js
|   |-- server.js                      # API Express avec PostgreSQL
|   |-- .env.example                   # Template des variables d'environnement
|   +-- .dockerignore                  # Exclusions pour Docker
|
|-- k8s/                               # Manifestes Kubernetes
|   |-- postgres-deployment.yaml       # Deployment PostgreSQL + PVC
|   |-- postgres-service.yaml          # Service ClusterIP
|   |-- backend-deployment.yaml        # Deployment Backend (2 replicas)
|   |-- backend-service.yaml           # Service ClusterIP
|   |-- frontend-deployment.yaml       # Deployment Frontend (2 replicas)
|   +-- frontend-service.yaml          # Service NodePort 30080
|
|-- ansible/                           # Automatisation du deploiement
|   |-- hosts.ini                      # Inventaire des VMs
|   |-- deploy.yml                     # Playbook de deploiement
|   +-- ansible.cfg                    # Configuration Ansible
|
|-- scripts/                           # Scripts utilitaires
|   |-- README.md                      # Documentation des scripts
|   |-- test-local.sh                  # Tester en local avec Docker Compose
|   |-- deploy.sh                      # Wrapper pour Ansible
|   |-- setup-vms.sh                   # Installation automatique de K3s
|   +-- update-image-tags.sh           # Mise a jour des tags d'images
|
+-- docs/                              # Documentation complete
    |-- GUIDE_RAPPORT.md               # Guide de redaction du rapport PDF
    |-- COMMANDES.md                   # Reference de toutes les commandes
    +-- TEMPLATE_RAPPORT.md            # Template complet du rapport
```

---

## Demarrage Rapide

### 1. Tester en Local (10 minutes)

```bash
# Aller dans le dossier du projet
cd "VIRTU PROJET"

# Rendre les scripts executables
chmod +x scripts/*.sh

# Lancer l'application en local
./scripts/test-local.sh

# Ouvrir dans le navigateur
open http://localhost:8080
```

### 2. Configurer GitLab (15 minutes)

```bash
# 1. Creer un projet sur GitLab (ecole ou gitlab.com)

# 2. Mettre a jour les chemins d'images
# Editer k8s/backend-deployment.yaml et k8s/frontend-deployment.yaml
# Remplacer YOUR_GITLAB_USERNAME par votre username

# 3. Initialiser Git
git init
git remote add origin https://gitlab.com/VOTRE_USERNAME/voting-app.git

# 4. Commit et push
git add .
git commit -m "Initial commit - Application de vote"
git push -u origin main

# 5. Verifier le pipeline
# GitLab -> CI/CD -> Pipelines
```

### 3. Configurer les VMs (30 minutes)

```bash
# Option A: Script automatique (recommande)
./scripts/setup-vms.sh 192.168.1.100 192.168.1.101 ubuntu

# Option B: Manuel
# Voir README.md section "Partie 3"
```

### 4. Deployer avec Ansible (5 minutes)

```bash
# 1. Mettre a jour ansible/hosts.ini avec les IPs de vos VMs

# 2. Creer le secret GitLab sur K8s
ssh ubuntu@<IP_VM_MASTER>
kubectl create secret docker-registry gitlab-registry-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=<USERNAME> \
  --docker-password=<TOKEN> \
  --docker-email=<EMAIL>

# 3. Deployer
./scripts/deploy.sh

# 4. Acceder a l'application
open http://192.168.1.100:30080
```

---

## Points Importants

### Modifications a Faire OBLIGATOIREMENT

1. **Inventaire Ansible** (`ansible/hosts.ini`):
   ```ini
   [k8s_master]
   vm-master ansible_host=192.168.1.100  <- Votre IP Master
   
   [k8s_workers]
   vm-worker ansible_host=192.168.1.101  <- Votre IP Worker
   ```

2. **Manifestes Kubernetes** (`k8s/*-deployment.yaml`):
   ```yaml
   image: registry.gitlab.com/YOUR_GITLAB_USERNAME/voting-app/backend:latest
                                 ^^^^^^^^^^^^^^^^
                          Remplacer par votre username
   ```

3. **Playbook Ansible** (`ansible/deploy.yml`):
   ```yaml
   vars:
     gitlab_project_path: YOUR_GITLAB_USERNAME/voting-app
                          ^^^^^^^^^^^^^^^^
                   Remplacer par votre username
   ```

### Commande Rapide pour Tout Remplacer

```bash
# Remplacer en une commande (macOS/Linux)
find . -type f \( -name "*.yaml" -o -name "*.yml" \) \
  -exec sed -i '' 's/YOUR_GITLAB_USERNAME/votre-username/g' {} +

# Ou manuellement avec votre editeur
```

---

## Verifications Avant Rendu

### Tests Fonctionnels

- [ ] Docker Compose fonctionne en local
- [ ] Pipeline GitLab passe au vert
- [ ] Images apparaissent dans le Registry
- [ ] Les 2 VMs peuvent se ping
- [ ] `kubectl get nodes` montre Master + Worker
- [ ] Pods en etat `Running`
- [ ] Application accessible sur port 30080
- [ ] Vote enregistre et resultats affiches

### Fichiers a Verifier

- [ ] `.gitlab-ci.yml` sans erreur de syntaxe
- [ ] `ansible/hosts.ini` avec les bonnes IPs
- [ ] Tous les `YOUR_GITLAB_USERNAME` remplaces
- [ ] Secret GitLab cree sur K8s
- [ ] `.gitignore` configure (pas de node_modules/ dans Git)

---

## Competences Acquises

A la fin de ce TP, vous maitriserez:

**Docker**
- Creation de Dockerfiles optimises
- Multi-stage builds
- Docker Compose pour environnements locaux

**CI/CD**
- Pipelines GitLab avec stages
- Strategie de taggage d'images
- Container Registry

**Kubernetes**
- Deployments, Services, ConfigMaps, Secrets
- PersistentVolumeClaims
- Probes (liveness/readiness)
- NodePort vs ClusterIP

**Ansible**
- Playbooks idempotents
- Inventaires
- Variables et templates
- Automatisation de deploiements

**DevOps**
- Chaine complete CI/CD
- Debugging distribue
- Architecture 3-tiers
- Bonnes pratiques de securite

---

## Bon Courage !

Vous avez maintenant **tout ce qu'il faut** pour reussir ce TP :

- Application complete (Frontend + Backend + Database)
- Dockerfiles optimises avec multi-stage builds
- Pipeline GitLab CI/CD fonctionnel
- Manifestes Kubernetes complets
- Playbook Ansible idempotent
- Scripts utilitaires
- Documentation exhaustive

**Il ne reste plus qu'a :**
1. Adapter les quelques valeurs (IPs, username GitLab)
2. Suivre les instructions du README
3. Documenter vos problemes et solutions
4. Rediger un excellent rapport

**Date limite : 14 Decembre 2025, 23h59**  
**Email : milodigitalcreations@gmail.com**

---

**Let's Deploy !**
