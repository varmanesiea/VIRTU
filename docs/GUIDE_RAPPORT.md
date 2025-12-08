# Guide de Redaction du Rapport PDF

Ce document vous guide pour rediger un rapport de qualite professionnelle.

---

## Structure Recommandee

### Page de Garde (1 page)

```
INSTITUT [NOM DE L'ECOLE]
Module INF4052 - Virtualisation et Cloud Computing

-----------------------------------------------

TP Final : Deploiement Automatise d'une 
Application 3-Tiers sur Cluster Kubernetes

-----------------------------------------------

Realise par :
- NOM Prenom (Numero Etudiant)
- NOM Prenom (Numero Etudiant)

Sous la supervision de :
M./Mme [Nom du Professeur]

Date de soumission : [Date]
Annee academique : 2024-2025
```

---

### Table des Matieres (1 page)

```
1. Introduction ...................................... 3
2. Architecture du Projet ............................ 4
3. Developpement des Applications .................... 6
4. Conteneurisation .................................. 10
5. Pipeline CI/CD .................................... 14
6. Configuration du Cluster Kubernetes ............... 18
7. Deploiement avec Ansible .......................... 22
8. Tests et Validation ............................... 26
9. Problemes Rencontres et Solutions ................. 28
10. Conclusion ....................................... 30
11. Annexes .......................................... 31
```

---

## Contenu Detaille par Section

### 1. Introduction (1-2 pages)

**Objectif :** Presenter le contexte du projet

**A inclure :**
- Contexte general (importance du DevOps/Kubernetes)
- Objectifs specifiques du TP
- Perimetre du travail realise
- Organisation de l'equipe

**Exemple de paragraphe :**
> Ce projet s'inscrit dans le cadre du module INF4052 de Virtualisation 
> et Cloud Computing. L'objectif est de mettre en pratique les concepts 
> etudies en cours en deployant une application 3-tiers complete sur un 
> cluster Kubernetes. Nous avons choisi de developper une application de 
> vote en temps reel utilisant une architecture moderne...

---

### 2. Architecture du Projet (2 pages)

**Objectif :** Presenter l'architecture technique

**A inclure :**
- Schema d'architecture global
- Description des 3 tiers
- Justification des choix technologiques
- Flux de donnees

**Schema a inclure :**
```
+-------------------+
|     UTILISATEUR   |
+--------+----------+
         |
         v
+--------+----------+     
|      FRONTEND     |     Port: 30080
|    (Nginx + HTML) |
+--------+----------+
         |
         v
+--------+----------+
|      BACKEND      |     Port: 5000
|   (Node.js/Express)|
+--------+----------+
         |
         v
+--------+----------+
|     DATABASE      |     Port: 5432
|    (PostgreSQL)   |
+-------------------+
```

**Tableau des technologies :**

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| Frontend  | Nginx       | 1.25    | Performant, leger |
| Backend   | Node.js     | 18 LTS  | Rapide, JSON natif |
| Database  | PostgreSQL  | 15      | ACID, robuste |
| Container | Docker      | 24+     | Standard industrie |
| Orchestration | K3s     | latest  | K8s leger |
| CI/CD     | GitLab CI   | -       | Integre, gratuit |
| Deploy    | Ansible     | 2.15+   | Idempotent |

---

### 3. Developpement des Applications (3-4 pages)

**Objectif :** Documenter le code developpe

**Pour le Frontend :**
- Capture d'ecran de l'interface
- Explication du HTML/CSS/JavaScript
- Points importants du code

**Pour le Backend :**
- Endpoints de l'API
- Connexion a la base de donnees
- Gestion des erreurs

**Tableau des endpoints :**

| Methode | Endpoint | Description | Corps/Reponse |
|---------|----------|-------------|---------------|
| GET     | /        | Healthcheck | {status: "Backend running"} |
| GET     | /health  | Verification | {status: "healthy"} |
| POST    | /vote    | Enregistrer vote | {choice: "A"} |
| GET     | /results | Obtenir resultats | {a: 10, b: 5, total: 15} |

---

### 4. Conteneurisation (3 pages)

**Objectif :** Expliquer la strategie Docker

**Points a couvrir :**

1. **Dockerfiles Multi-stage**
   - Avantages (taille, securite)
   - Explication des stages

2. **Optimisations**
   - Ordre des instructions (cache)
   - Images de base Alpine
   - Utilisateur non-root

3. **Docker Compose pour tests locaux**
   - Configuration des services
   - Volumes et reseaux
   - Health checks

**Metriques a mentionner :**
```
Frontend: ~25 MB (au lieu de 500+ MB sans multi-stage)
Backend:  ~150 MB (au lieu de 1 GB+ sans optimisation)
```

---

### 5. Pipeline CI/CD (3 pages)

**Objectif :** Documenter le pipeline GitLab

**Structure du pipeline :**
```
[Build Frontend] ----+
                     +----> [Push Images] ----> [Registry]
[Build Backend]  ----+
```

**Points a couvrir :**
1. Stages et jobs
2. Variables d'environnement
3. Strategy de taggage
4. Captures d'ecran du pipeline

**Captures a inclure :**
- Pipeline en cours d'execution
- Pipeline termine (vert)
- Container Registry avec les images

---

### 6. Configuration du Cluster Kubernetes (3-4 pages)

**Objectif :** Documenter le cluster K3s

**6.1 Installation de K3s**
- Configuration du Master
- Configuration du Worker
- Verification du cluster

**6.2 Manifestes Kubernetes**

Pour chaque composant :
- Deployment (replicas, ressources, probes)
- Service (type, ports)
- ConfigMap/Secret si applicable

**Tableau des ressources K8s :**

| Ressource | Nom | Type | Details |
|-----------|-----|------|---------|
| Deployment | postgres | 1 replica | PVC 5Gi |
| Service | postgres | ClusterIP | 5432 |
| Deployment | backend | 2 replicas | Env vars |
| Service | backend | ClusterIP | 5000 |
| Deployment | frontend | 2 replicas | Nginx |
| Service | frontend | NodePort | 30080 |

**Commandes de verification :**
```bash
kubectl get nodes
kubectl get pods
kubectl get services
kubectl describe pod <pod-name>
```

---

### 7. Deploiement avec Ansible (2-3 pages)

**Objectif :** Expliquer l'automatisation

**Points a couvrir :**
1. Structure de l'inventaire
2. Taches du playbook
3. Idempotence
4. Logs d'execution

**Exemple de sortie Ansible :**
```
PLAY [Deploy Application to Kubernetes] **************************

TASK [Gathering Facts] *******************************************
ok: [vm-master]

TASK [Create Kubernetes namespace] *******************************
ok: [vm-master]

TASK [Apply PostgreSQL manifests] ********************************
changed: [vm-master]
...

PLAY RECAP *******************************************************
vm-master : ok=12  changed=6  unreachable=0  failed=0
```

---

### 8. Tests et Validation (2 pages)

**Objectif :** Prouver que tout fonctionne

**Tests a documenter :**

1. **Test Local (Docker Compose)**
   - Capture d'ecran de l'app en local
   - Logs des containers

2. **Test Pipeline GitLab**
   - Capture du pipeline vert
   - Images dans le Registry

3. **Test Cluster K8s**
   - `kubectl get all -n voting-app`
   - Capture de l'app via NodePort

4. **Test Fonctionnel**
   - Voter pour A
   - Voter pour B
   - Verifier les resultats

---

### 9. Problemes Rencontres et Solutions (2-3 pages)

**SECTION TRES IMPORTANTE - Les professeurs lisent attentivement cette partie !**

**Format recommande pour chaque probleme :**

```
Probleme #1 : ImagePullBackOff sur le pod backend

Description :
- Le pod backend restait en etat ImagePullBackOff
- Message d'erreur: "unauthorized: authentication required"

Analyse :
- Le secret GitLab Registry n'etait pas configure
- Kubernetes ne pouvait pas s'authentifier pour pull l'image

Solution :
1. Creation du secret docker-registry :
   kubectl create secret docker-registry gitlab-registry-secret ...
   
2. Ajout du secret dans le Deployment :
   imagePullSecrets:
     - name: gitlab-registry-secret

Temps de resolution : 45 minutes

Lecons apprises :
- Toujours verifier les secrets avant le deploiement
- Utiliser `kubectl describe pod` pour diagnostiquer
```

**Problemes courants a documenter :**
- Erreurs de syntaxe YAML
- Problemes de networking entre VMs
- Timeouts de probes
- Permissions insuffisantes
- Variables d'environnement manquantes

---

### 10. Conclusion (1 page)

**A inclure :**
- Resume des realisations
- Competences acquises
- Difficultes principales
- Ameliorations possibles
- Perspectives (scaling, monitoring, securite...)

---

### 11. Annexes

**Annexe A : Code source complet**
- Tous les fichiers importants

**Annexe B : Logs d'execution**
- Pipeline GitLab
- Ansible
- Kubernetes

**Annexe C : Captures d'ecran supplementaires**

---

## Conseils de Redaction

### Format

- Police : Arial ou Times New Roman, 11-12pt
- Interligne : 1.5
- Marges : 2.5 cm
- Pagination : En bas de page

### Style

- Eviter le "je" - utiliser "nous"
- Phrases courtes et claires
- Paragraphes structures
- Transitions entre sections

### Mise en Page

- Titres numerotes hierarchiquement
- Figures numerotees avec legendes
- Code avec coloration syntaxique
- Tableaux avec bordures

### A Eviter

- Copier-coller de code sans explication
- Captures d'ecran floues
- Texte trop dense sans aeration
- Fautes d'orthographe (utiliser un correcteur)

---

## Checklist Finale

### Contenu

- [ ] Toutes les sections presentes
- [ ] Schemas et figures clairs
- [ ] Code pertinent explique
- [ ] Captures d'ecran de qualite
- [ ] Problemes documentes avec solutions

### Forme

- [ ] Page de garde complete
- [ ] Table des matieres
- [ ] Numerotation des pages
- [ ] Format PDF
- [ ] Nom du fichier correct

### Qualite

- [ ] Orthographe verifiee
- [ ] Coherence du style
- [ ] Figures lisibles
- [ ] Code bien formate

---

## Exemple de Capture d'Ecran Bien Documentee

```
Figure 3.1 : Interface de l'application de vote

[Capture d'ecran ici]

Cette figure presente l'interface utilisateur de l'application de vote.
L'utilisateur peut choisir entre l'option A ou l'option B en cliquant
sur le bouton correspondant. Les resultats sont affiches en temps reel
dans les barres de progression en bas de l'ecran.
```

---

## Ressources Utiles

- Kubernetes Documentation : https://kubernetes.io/docs/
- GitLab CI Documentation : https://docs.gitlab.com/ee/ci/
- Ansible Documentation : https://docs.ansible.com/
- Docker Documentation : https://docs.docker.com/

---

Bon courage pour la redaction !
