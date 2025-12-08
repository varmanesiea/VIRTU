# Template Complet du Rapport - TP Final INF4052

Ce document est un template que vous pouvez copier et completer directement.

---

# Page de Garde

```
[Logo de l'ecole]

INSTITUT / UNIVERSITE [NOM]
Departement Informatique

Module INF4052 - Virtualisation et Cloud Computing
Annee Academique 2024-2025

===============================================

TP FINAL

DEPLOIEMENT AUTOMATISE D'UNE APPLICATION 3-TIERS
SUR CLUSTER KUBERNETES

===============================================

Realise par :
- [NOM Prenom] - Numero etudiant : [XXXXXX]
- [NOM Prenom] - Numero etudiant : [XXXXXX]

Encadrant :
[M./Mme NOM DU PROFESSEUR]

Date de soumission : [DATE]
```

---

# Table des Matieres

1. Introduction
2. Architecture du Projet
   2.1 Vue d'ensemble
   2.2 Choix technologiques
3. Developpement des Applications
   3.1 Frontend
   3.2 Backend
   3.3 Base de donnees
4. Conteneurisation avec Docker
   4.1 Strategie de build
   4.2 Dockerfiles
   4.3 Tests locaux
5. Pipeline CI/CD GitLab
   5.1 Structure du pipeline
   5.2 Configuration
   5.3 Container Registry
6. Configuration du Cluster Kubernetes
   6.1 Installation de K3s
   6.2 Architecture du cluster
   6.3 Manifestes Kubernetes
7. Deploiement avec Ansible
   7.1 Inventaire
   7.2 Playbook
   7.3 Execution
8. Tests et Validation
9. Problemes Rencontres et Solutions
10. Conclusion
11. Annexes

---

# 1. Introduction

## 1.1 Contexte

[A COMPLETER]

Le cloud computing et la conteneurisation sont devenus des elements essentiels 
de l'infrastructure informatique moderne. Ce TP s'inscrit dans le cadre du 
module INF4052 de Virtualisation et Cloud Computing, visant a mettre en 
pratique les concepts theoriques etudies en cours.

## 1.2 Objectifs du TP

Les objectifs de ce travail pratique sont :

- Developper une application 3-tiers complete
- Maitriser la conteneurisation avec Docker
- Configurer un pipeline CI/CD avec GitLab
- Deployer un cluster Kubernetes avec K3s
- Automatiser le deploiement avec Ansible
- Documenter les problemes rencontres et leurs solutions

## 1.3 Presentation de l'equipe

| Nom Prenom | Responsabilites |
|------------|-----------------|
| [NOM]      | [Ex: Frontend, Docker, Documentation] |
| [NOM]      | [Ex: Backend, Kubernetes, Ansible] |

## 1.4 Organisation du rapport

Ce rapport est structure en 10 sections principales, suivant la progression 
logique du projet : du developpement jusqu'au deploiement automatise.

---

# 2. Architecture du Projet

## 2.1 Vue d'ensemble

Notre application de vote est composee de trois couches distinctes :

```
+-----------------------------------------+
|               UTILISATEUR               |
+-----------------------------------------+
                    |
                    v
+-----------------------------------------+
|              FRONTEND                   |
|        (Nginx + HTML/CSS/JS)            |
|            Port: 30080                  |
+-----------------------------------------+
                    |
                    v
+-----------------------------------------+
|               BACKEND                   |
|         (Node.js / Express)             |
|             Port: 5000                  |
+-----------------------------------------+
                    |
                    v
+-----------------------------------------+
|              DATABASE                   |
|            (PostgreSQL)                 |
|             Port: 5432                  |
+-----------------------------------------+
```

**Figure 2.1** : Architecture 3-tiers de l'application

## 2.2 Choix technologiques

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| Frontend | Nginx | 1.25 | Serveur web leger et performant |
| Backend | Node.js | 18 LTS | Support natif JSON, grande communaute |
| Base de donnees | PostgreSQL | 15 | Fiabilite, conformite ACID |
| Conteneurisation | Docker | 24+ | Standard de l'industrie |
| Orchestration | K3s | latest | Kubernetes leger, ideal pour les labs |
| CI/CD | GitLab CI | - | Integration native avec le registry |
| Automatisation | Ansible | 2.15+ | Playbooks idempotents |

## 2.3 Flux de donnees

[A COMPLETER avec un schema du flux de donnees]

1. L'utilisateur accede a l'interface web (Frontend)
2. L'utilisateur effectue un vote (choix A ou B)
3. Le Frontend envoie une requete POST au Backend
4. Le Backend enregistre le vote dans PostgreSQL
5. Le Frontend recupere les resultats via GET
6. Les resultats sont affiches en temps reel

---

# 3. Developpement des Applications

## 3.1 Frontend

### 3.1.1 Description

Le frontend est une interface web simple permettant aux utilisateurs de :
- Voter pour l'option A ou B
- Voir les resultats en temps reel

### 3.1.2 Capture d'ecran

[INSERER CAPTURE D'ECRAN DE L'APPLICATION]

**Figure 3.1** : Interface utilisateur de l'application de vote

### 3.1.3 Structure des fichiers

```
frontend/
|-- Dockerfile      # Build multi-stage
|-- nginx.conf      # Configuration Nginx
|-- index.html      # Page principale
|-- style.css       # Styles CSS
+-- app.js          # Logique JavaScript
```

### 3.1.4 Points importants du code

**Fetch API pour les votes :**
```javascript
async function vote(choice) {
    const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice })
    });
    // ...
}
```

[A COMPLETER avec explications]

## 3.2 Backend

### 3.2.1 Description

Le backend est une API REST developpee avec Express.js, offrant les 
fonctionnalites suivantes :
- Endpoint de sante pour les probes Kubernetes
- Enregistrement des votes
- Recuperation des resultats

### 3.2.2 Endpoints de l'API

| Methode | Endpoint | Description | Reponse |
|---------|----------|-------------|---------|
| GET | / | Healthcheck | {"status": "Backend running"} |
| GET | /health | Verification | {"status": "healthy"} |
| POST | /vote | Voter | {"success": true} |
| GET | /results | Resultats | {"a": X, "b": Y, "total": Z} |

### 3.2.3 Connexion a la base de donnees

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

[A COMPLETER avec explications]

## 3.3 Base de donnees

### 3.3.1 Schema

```sql
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    choice VARCHAR(1) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3.2 Configuration

- Image : postgres:15-alpine
- Volume persistant : 5Gi
- Port : 5432

---

# 4. Conteneurisation avec Docker

## 4.1 Strategie de build

Nous avons adopte une approche **multi-stage build** pour optimiser :
- La taille des images finales
- La securite (pas d'outils de build en production)
- Les temps de build (meilleure utilisation du cache)

## 4.2 Dockerfile Frontend

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Analyse :**
- [A COMPLETER - expliquer chaque section]

**Taille de l'image resultante :** ~25 MB

## 4.3 Dockerfile Backend

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1
CMD ["node", "server.js"]
```

**Analyse :**
- [A COMPLETER - expliquer chaque section]

**Taille de l'image resultante :** ~150 MB

## 4.4 Tests locaux avec Docker Compose

```yaml
services:
  postgres:
    image: postgres:15-alpine
    # ...
  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
    # ...
  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "8080:80"
```

**Commandes de test :**
```bash
docker compose -f docker-compose.local.yml up -d
docker compose -f docker-compose.local.yml logs -f
```

[INSERER CAPTURE D'ECRAN des containers Docker en execution]

**Figure 4.1** : Containers Docker en execution locale

---

# 5. Pipeline CI/CD GitLab

## 5.1 Structure du pipeline

```
+----------------+     +----------------+
|  Build Stage   |     |  Push Stage    |
+----------------+     +----------------+
|                |     |                |
| build-frontend |---->| push-images    |
| build-backend  |     |                |
|                |     |                |
+----------------+     +----------------+
```

**Figure 5.1** : Stages du pipeline CI/CD

## 5.2 Configuration .gitlab-ci.yml

```yaml
stages:
  - build
  - push

variables:
  DOCKER_DRIVER: overlay2
  FRONTEND_IMAGE: $CI_REGISTRY_IMAGE/frontend
  BACKEND_IMAGE: $CI_REGISTRY_IMAGE/backend

build-frontend:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t $FRONTEND_IMAGE:$CI_COMMIT_SHA ./frontend
    - docker save $FRONTEND_IMAGE:$CI_COMMIT_SHA > frontend.tar
  artifacts:
    paths:
      - frontend.tar
    expire_in: 1 hour
```

[A COMPLETER avec le reste de la configuration]

## 5.3 Captures d'ecran

[INSERER CAPTURE D'ECRAN du pipeline en cours d'execution]

**Figure 5.2** : Pipeline GitLab en execution

[INSERER CAPTURE D'ECRAN du Container Registry]

**Figure 5.3** : Images dans le GitLab Container Registry

---

# 6. Configuration du Cluster Kubernetes

## 6.1 Installation de K3s

### 6.1.1 Architecture du cluster

```
+-------------------+
|    VM Master      |
|   192.168.1.100   |
|   K3s Server      |
+--------+----------+
         |
         v
+--------+----------+
|    VM Worker      |
|   192.168.1.101   |
|   K3s Agent       |
+-------------------+
```

**Figure 6.1** : Architecture du cluster K3s

### 6.1.2 Installation sur le Master

```bash
curl -sfL https://get.k3s.io | sh -
```

### 6.1.3 Installation sur le Worker

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://192.168.1.100:6443 \
  K3S_TOKEN=<TOKEN> sh -
```

### 6.1.4 Verification

```bash
kubectl get nodes
```

**Sortie attendue :**
```
NAME        STATUS   ROLES                  AGE   VERSION
vm-master   Ready    control-plane,master   10m   v1.28.x
vm-worker   Ready    <none>                 5m    v1.28.x
```

[INSERER CAPTURE D'ECRAN de la commande kubectl get nodes]

**Figure 6.2** : Noeuds du cluster K3s

## 6.2 Manifestes Kubernetes

### 6.2.1 Structure

```
k8s/
|-- postgres-deployment.yaml
|-- postgres-service.yaml
|-- backend-deployment.yaml
|-- backend-service.yaml
|-- frontend-deployment.yaml
+-- frontend-service.yaml
```

### 6.2.2 Deployment PostgreSQL

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: voting-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
```

[A COMPLETER avec les autres manifestes]

### 6.2.3 Tableau des ressources

| Ressource | Type | Replicas | Port | Notes |
|-----------|------|----------|------|-------|
| postgres | Deployment | 1 | 5432 | PVC 5Gi |
| postgres | Service | - | 5432 | ClusterIP |
| backend | Deployment | 2 | 5000 | Probes |
| backend | Service | - | 5000 | ClusterIP |
| frontend | Deployment | 2 | 80 | Probes |
| frontend | Service | - | 30080 | NodePort |

---

# 7. Deploiement avec Ansible

## 7.1 Inventaire

```ini
[k8s_master]
vm-master ansible_host=192.168.1.100 ansible_user=ubuntu

[k8s_workers]
vm-worker ansible_host=192.168.1.101 ansible_user=ubuntu

[k8s:children]
k8s_master
k8s_workers

[k8s:vars]
ansible_ssh_private_key_file=~/.ssh/id_rsa
```

## 7.2 Playbook deploy.yml

```yaml
---
- name: Deploy Voting Application to Kubernetes
  hosts: k8s_master
  become: yes
  
  tasks:
    - name: Create namespace
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: Namespace
          metadata:
            name: voting-app

    - name: Apply PostgreSQL manifests
      kubernetes.core.k8s:
        state: present
        src: "{{ item }}"
      loop:
        - k8s/postgres-deployment.yaml
        - k8s/postgres-service.yaml
```

[A COMPLETER]

## 7.3 Execution

```bash
ansible-playbook -i ansible/hosts.ini ansible/deploy.yml
```

**Sortie :**
```
PLAY [Deploy Voting Application to Kubernetes] ********

TASK [Gathering Facts] ********************************
ok: [vm-master]

TASK [Create namespace] *******************************
changed: [vm-master]

PLAY RECAP ********************************************
vm-master : ok=12  changed=6  unreachable=0  failed=0
```

[INSERER CAPTURE D'ECRAN de l'execution Ansible]

**Figure 7.1** : Execution reussie du playbook Ansible

---

# 8. Tests et Validation

## 8.1 Tests Docker Compose (Local)

| Test | Resultat | Capture |
|------|----------|---------|
| Containers demarres | OK | Fig. 8.1 |
| Frontend accessible | OK | Fig. 8.2 |
| Vote enregistre | OK | Fig. 8.3 |
| Resultats affiches | OK | Fig. 8.4 |

[INSERER CAPTURES D'ECRAN correspondantes]

## 8.2 Tests Pipeline GitLab

| Test | Resultat | Capture |
|------|----------|---------|
| Stage build | OK | Fig. 8.5 |
| Stage push | OK | Fig. 8.6 |
| Images dans Registry | OK | Fig. 8.7 |

[INSERER CAPTURES D'ECRAN correspondantes]

## 8.3 Tests Cluster Kubernetes

```bash
kubectl get all -n voting-app
```

**Sortie :**
```
NAME                            READY   STATUS    RESTARTS   AGE
pod/postgres-xxx                1/1     Running   0          5m
pod/backend-xxx                 1/1     Running   0          4m
pod/backend-yyy                 1/1     Running   0          4m
pod/frontend-xxx                1/1     Running   0          3m
pod/frontend-yyy                1/1     Running   0          3m

NAME                 TYPE        CLUSTER-IP      PORT(S)
service/postgres     ClusterIP   10.43.x.x       5432/TCP
service/backend      ClusterIP   10.43.x.x       5000/TCP
service/frontend     NodePort    10.43.x.x       80:30080/TCP
```

[INSERER CAPTURE D'ECRAN]

**Figure 8.8** : Ressources Kubernetes deployees

## 8.4 Test Fonctionnel Final

[INSERER CAPTURE D'ECRAN de l'application accessible via NodePort]

**Figure 8.9** : Application de vote accessible sur http://192.168.1.100:30080

---

# 9. Problemes Rencontres et Solutions

## Probleme #1 : [TITRE]

**Description :**
[Decrire le probleme rencontre]

**Symptomes :**
- [Symptome 1]
- [Symptome 2]

**Analyse :**
[Expliquer l'analyse effectuee pour identifier la cause]

**Solution :**
```bash
[Commandes ou modifications effectuees]
```

**Temps de resolution :** [X heures/minutes]

**Lecons apprises :**
- [Point 1]
- [Point 2]

---

## Probleme #2 : [TITRE]

**Description :**
[A COMPLETER]

**Solution :**
[A COMPLETER]

---

## Probleme #3 : [TITRE]

**Description :**
[A COMPLETER]

**Solution :**
[A COMPLETER]

---

# 10. Conclusion

## 10.1 Resume des realisations

Dans le cadre de ce TP, nous avons reussi a :

- [X] Developper une application 3-tiers complete (Frontend, Backend, Database)
- [X] Conteneuriser les applications avec Docker (multi-stage builds)
- [X] Configurer un pipeline CI/CD GitLab fonctionnel
- [X] Deployer un cluster Kubernetes K3s sur 2 VMs
- [X] Automatiser le deploiement avec Ansible
- [X] Documenter l'ensemble du processus

## 10.2 Competences acquises

A travers ce projet, nous avons developpe des competences en :

- **Docker** : Dockerfiles optimises, multi-stage builds, Docker Compose
- **CI/CD** : Pipelines GitLab, gestion d'artefacts, Container Registry
- **Kubernetes** : Deployments, Services, Secrets, Probes, PVC
- **Ansible** : Playbooks idempotents, inventaires, automatisation
- **DevOps** : Integration des outils, debugging distribue

## 10.3 Difficultes rencontrees

Les principales difficultes rencontrees ont ete :

1. [Difficulte 1]
2. [Difficulte 2]
3. [Difficulte 3]

## 10.4 Ameliorations possibles

Pour aller plus loin, nous pourrions :

- Ajouter un Ingress Controller pour la gestion du trafic
- Implementer le monitoring avec Prometheus/Grafana
- Configurer le scaling automatique (HPA)
- Ajouter des tests automatises dans le pipeline
- Implementer GitOps avec ArgoCD

## 10.5 Conclusion finale

Ce TP nous a permis de mettre en pratique les concepts de virtualisation 
et de cloud computing dans un contexte realiste. L'experience acquise 
est directement applicable dans un environnement professionnel.

---

# 11. Annexes

## Annexe A : Code Source

### A.1 Frontend - index.html
```html
[Coller le code]
```

### A.2 Backend - server.js
```javascript
[Coller le code]
```

### A.3 Pipeline - .gitlab-ci.yml
```yaml
[Coller le code]
```

## Annexe B : Logs d'Execution

### B.1 Logs Pipeline GitLab
```
[Coller les logs]
```

### B.2 Logs Ansible
```
[Coller les logs]
```

## Annexe C : Captures d'Ecran Supplementaires

[Inserer captures supplementaires]

---

# References

1. Documentation Kubernetes : https://kubernetes.io/docs/
2. Documentation Docker : https://docs.docker.com/
3. Documentation GitLab CI : https://docs.gitlab.com/ee/ci/
4. Documentation Ansible : https://docs.ansible.com/
5. Documentation K3s : https://docs.k3s.io/

---

**Fin du Rapport**

*Document genere le [DATE]*
*Module INF4052 - Virtualisation et Cloud Computing*
