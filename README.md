# TP Final - Application de Vote 3-Tiers sur Kubernetes

**Module**: INF4052 - Virtualisation et Conteneurisation  
**Projet**: Deploiement Automatise d'une Application 3-Tiers  
**Stack**: Frontend (Nginx) + Backend (Node.js/Express) + Database (PostgreSQL)

---

## Table des Matieres

1. [Architecture](#architecture)
2. [Prerequis](#prerequis)
3. [Partie 1: Test en Local avec Docker Compose](#partie-1-test-en-local-avec-docker-compose)
4. [Partie 2: Configuration GitLab CI/CD](#partie-2-configuration-gitlab-cicd)
5. [Partie 3: Configuration du Cluster Kubernetes](#partie-3-configuration-du-cluster-kubernetes)
6. [Partie 4: Deploiement avec Ansible](#partie-4-deploiement-avec-ansible)
7. [Scenario de Demonstration](#scenario-de-demonstration)
8. [Troubleshooting](#troubleshooting)

---

## Architecture

```
+-------------------------------------------------------------+
|                    POSTE DE TRAVAIL                          |
|  +--------------+         +--------------+                  |
|  |  Git Push    |-------->|   GitLab     |                  |
|  +--------------+         |   CI/CD      |                  |
|                           +-------+------+                  |
|                                   | Build & Push Images      |
|                                   v                          |
|                           +--------------+                  |
|                           |   GitLab     |                  |
|                           |   Registry   |                  |
|                           +-------+------+                  |
+-------------------------------+--+---------------------------+
                                    |
                    +---------------+----------------+
                    |                                 |
            +-------v--------+              +--------v--------+
            |   VM-MASTER    |--------------+   VM-WORKER     |
            |  (Control      |   K8s Join   |   (Node)        |
            |   Plane)       |              |                 |
            +----------------+              +-----------------+
                    |                                 |
                    +---------+-------------------+---+
                              |
                    +---------v----------+
                    |   Application      |
                    |  +--------------+  |
                    |  |  Frontend    |  | NodePort 30080
                    |  |  (Nginx)     |  |
                    |  +------+-------+  |
                    |         |          |
                    |  +------v-------+  |
                    |  |  Backend     |  | ClusterIP
                    |  |  (Node.js)   |  |
                    |  +------+-------+  |
                    |         |          |
                    |  +------v-------+  |
                    |  |  PostgreSQL  |  | ClusterIP + PVC
                    |  +--------------+  |
                    +--------------------+
```

---

## Prerequis

### Sur votre machine hote
- Docker & Docker Compose installes
- Git installe
- Ansible installe (`pip install ansible` ou `brew install ansible`)
- Compte GitLab (ecole ou gitlab.com)

### VMs (VirtualBox/VMware)
- 2 VMs Ubuntu 20.04/22.04 ou Debian 11/12
- VM-Master: 2 CPU, 2GB RAM minimum
- VM-Worker: 2 CPU, 2GB RAM minimum
- Reseau Bridge ou Host-Only (les VMs doivent se voir et etre accessibles depuis l'hote)

---

## Partie 1: Test en Local avec Docker Compose

### 1.1 Cloner le projet
```bash
git clone <votre-repo-gitlab>
cd VIRTU-PROJET
```

### 1.2 Lancer la stack en local
```bash
# Construire et demarrer tous les services
docker-compose -f docker-compose.local.yml up --build -d

# Verifier que les conteneurs tournent
docker-compose -f docker-compose.local.yml ps

# Voir les logs
docker-compose -f docker-compose.local.yml logs -f
```

### 1.3 Tester l'application
Ouvrez votre navigateur : **http://localhost:8080**

Vous devriez voir l'interface de vote.

### 1.4 Arreter la stack
```bash
docker-compose -f docker-compose.local.yml down -v
```

---

## Partie 2: Configuration GitLab CI/CD

### 2.1 Creer le projet sur GitLab
1. Connectez-vous a GitLab (ecole ou gitlab.com)
2. Creez un nouveau projet : `voting-app`
3. Ajoutez le remote GitLab a votre projet local

```bash
git remote add origin https://gitlab.com/VOTRE_USERNAME/voting-app.git
```

### 2.2 Activer le Container Registry
1. Allez dans **Settings -> General -> Visibility**
2. Activez **Container Registry**

### 2.3 Configurer les variables CI/CD (si necessaire)
Allez dans **Settings -> CI/CD -> Variables** et ajoutez:
- `CI_REGISTRY_USER`: Votre username GitLab (deja disponible par defaut)
- `CI_REGISTRY_PASSWORD`: Votre token d'acces (deja disponible par defaut)

### 2.4 Mettre a jour les chemins d'images
Editez les fichiers suivants pour remplacer `YOUR_GITLAB_USERNAME` par votre username:
- `k8s/backend-deployment.yaml`
- `k8s/frontend-deployment.yaml`
- `ansible/deploy.yml`

```bash
# Exemple avec sed
sed -i 's/YOUR_GITLAB_USERNAME/votre-username/g' k8s/*.yaml ansible/deploy.yml
```

### 2.5 Push et declencher le pipeline
```bash
git add .
git commit -m "Initial commit - Application de vote"
git push -u origin main
```

Allez dans **CI/CD -> Pipelines** pour voir le pipeline s'executer.

### 2.6 Verifier les images dans le Registry
Allez dans **Packages & Registries -> Container Registry**

Vous devriez voir:
- `frontend:latest` et `frontend:<commit-sha>`
- `backend:latest` et `backend:<commit-sha>`

---

## Partie 3: Configuration du Cluster Kubernetes

### 3.1 Installer K3s sur les VMs

#### Sur VM-Master
```bash
# Se connecter a la VM
ssh ubuntu@<IP_VM_MASTER>

# Installer K3s (mode serveur)
curl -sfL https://get.k3s.io | sh -

# Verifier l'installation
sudo kubectl get nodes

# Recuperer le token pour joindre le worker
sudo cat /var/lib/rancher/k3s/server/node-token
# Copier le token affiche
```

#### Sur VM-Worker
```bash
# Se connecter a la VM
ssh ubuntu@<IP_VM_WORKER>

# Installer K3s (mode agent)
curl -sfL https://get.k3s.io | K3S_URL=https://<IP_VM_MASTER>:6443 \
  K3S_TOKEN=<TOKEN_COPIE> sh -
```

#### Verifier le cluster
Retournez sur VM-Master:
```bash
sudo kubectl get nodes
# Vous devriez voir Master et Worker en status "Ready"
```

### 3.2 Configurer l'acces kubectl depuis votre machine hote (optionnel)
```bash
# Sur VM-Master, copier le fichier kubeconfig
sudo cat /etc/rancher/k3s/k3s.yaml

# Sur votre machine hote
mkdir -p ~/.kube
# Coller le contenu et remplacer 127.0.0.1 par l'IP de VM-Master
nano ~/.kube/config-k3s

# Tester
export KUBECONFIG=~/.kube/config-k3s
kubectl get nodes
```

### 3.3 Creer le secret pour GitLab Registry

Sur VM-Master:
```bash
kubectl create secret docker-registry gitlab-registry-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=<VOTRE_USERNAME> \
  --docker-password=<VOTRE_TOKEN> \
  --docker-email=<VOTRE_EMAIL>
```

Pour obtenir un token GitLab:
1. GitLab -> Settings -> Access Tokens
2. Creez un token avec scope `read_registry`

---

## Partie 4: Deploiement avec Ansible

### 4.1 Configurer SSH sans mot de passe

```bash
# Generer une cle SSH si vous n'en avez pas
ssh-keygen -t rsa -b 4096

# Copier la cle sur les VMs
ssh-copy-id ubuntu@<IP_VM_MASTER>
ssh-copy-id ubuntu@<IP_VM_WORKER>

# Tester la connexion
ssh ubuntu@<IP_VM_MASTER> "echo 'Connexion OK'"
```

### 4.2 Mettre a jour l'inventaire Ansible

Editez `ansible/hosts.ini`:
```ini
[k8s_master]
vm-master ansible_host=192.168.1.100 ansible_user=ubuntu

[k8s_workers]
vm-worker ansible_host=192.168.1.101 ansible_user=ubuntu
```
Remplacez les IPs par celles de vos VMs.

### 4.3 Tester la connexion Ansible

```bash
cd ansible
ansible -i hosts.ini k8s_master -m ping
```

Vous devriez voir: `"ping": "pong"`

### 4.4 Lancer le deploiement

```bash
# Depuis le dossier ansible/
ansible-playbook -i hosts.ini deploy.yml

# Avec un tag d'image specifique
ansible-playbook -i hosts.ini deploy.yml -e "image_tag=abc123"
```

### 4.5 Verifier le deploiement

```bash
# Se connecter a VM-Master
ssh ubuntu@<IP_VM_MASTER>

# Verifier les pods
sudo kubectl get pods

# Verifier les services
sudo kubectl get services

# Voir les logs d'un pod
sudo kubectl logs -f <nom-du-pod>
```

### 4.6 Acceder a l'application

Ouvrez votre navigateur:
```
http://<IP_VM_MASTER>:30080
ou
http://<IP_VM_WORKER>:30080
```

---

## Scenario de Demonstration

### Etape 1: Modifier le Frontend
```bash
# Modifier une couleur ou un texte dans frontend/style.css
nano frontend/style.css

# Par exemple, changer la couleur du titre:
# color: #667eea;  ->  color: #ff6b6b;
```

### Etape 2: Commit et Push
```bash
git add frontend/style.css
git commit -m "Changement de couleur du titre en rouge"
git push origin main
```

### Etape 3: Observer le Pipeline GitLab
1. Allez sur GitLab -> CI/CD -> Pipelines
2. Observez les stages Build et Push passer au vert
3. Verifiez que les nouvelles images apparaissent dans le Registry

### Etape 4: Deployer avec Ansible
```bash
cd ansible
ansible-playbook -i hosts.ini deploy.yml
```

### Etape 5: Verifier la Modification
Rechargez la page web (`Ctrl+F5` pour vider le cache):
```
http://<IP_VM>:30080
```

Le titre devrait maintenant etre rouge !

---

## Troubleshooting

### Probleme: Pipeline GitLab echoue

**Erreur**: `Cannot connect to the Docker daemon`
- **Solution**: Assurez-vous d'utiliser un runner GitLab avec Docker active
- Utilisez `gitlab-runner` avec le tag `docker`

**Erreur**: `unauthorized: authentication required`
- **Solution**: Verifiez que les variables `CI_REGISTRY_USER` et `CI_REGISTRY_PASSWORD` sont definies

### Probleme: Ansible ne se connecte pas aux VMs

**Erreur**: `Permission denied (publickey,password)`
- **Solution**: Assurez-vous d'avoir copie votre cle SSH avec `ssh-copy-id`

**Erreur**: `Host unreachable`
- **Solution**: Verifiez que les IPs dans `hosts.ini` sont correctes
- Testez avec `ping <IP_VM>`

### Probleme: Les pods ne demarrent pas

**Erreur**: `ImagePullBackOff`
- **Solution**: Verifiez que le secret GitLab Registry est cree :
  ```bash
  kubectl get secret gitlab-registry-secret
  ```
- Recreez-le si necessaire (voir section 3.3)

**Erreur**: `CrashLoopBackOff` sur le Backend
- **Solution**: Verifiez que PostgreSQL est pret avant le Backend
- Consultez les logs:
  ```bash
  kubectl logs <backend-pod-name>
  ```

### Probleme: L'application web ne charge pas

**Verifications**:
1. Les pods sont-ils en etat `Running` ?
   ```bash
   kubectl get pods
   ```

2. Le service Frontend est-il expose ?
   ```bash
   kubectl get service frontend
   ```

3. Le NodePort est-il accessible ?
   ```bash
   curl http://<IP_VM>:30080
   ```

4. Verifiez les logs du Frontend:
   ```bash
   kubectl logs <frontend-pod-name>
   ```

### Probleme: Le Backend ne peut pas se connecter a PostgreSQL

**Solution**: Verifiez que le service PostgreSQL existe:
```bash
kubectl get service postgres
```

Verifiez les variables d'environnement du Backend:
```bash
kubectl describe pod <backend-pod-name>
```

---

## Commandes Utiles

### Docker Compose
```bash
# Demarrer
docker-compose -f docker-compose.local.yml up -d

# Arreter
docker-compose -f docker-compose.local.yml down

# Voir les logs
docker-compose -f docker-compose.local.yml logs -f backend
```

### Kubernetes
```bash
# Voir tous les pods
kubectl get pods -o wide

# Voir tous les services
kubectl get services

# Decrire un pod
kubectl describe pod <pod-name>

# Voir les logs d'un pod
kubectl logs -f <pod-name>

# Se connecter a un pod
kubectl exec -it <pod-name> -- /bin/sh

# Supprimer tout
kubectl delete -f k8s/
```

### Ansible
```bash
# Tester la connexion
ansible -i hosts.ini all -m ping

# Executer en mode verbose
ansible-playbook -i hosts.ini deploy.yml -vvv

# Executer avec des variables
ansible-playbook -i hosts.ini deploy.yml -e "image_tag=v1.2.3"
```

---

## Checklist pour le Rapport

- [ ] Schema d'architecture avec flux reseau
- [ ] Justification des choix techniques (images Docker, taggage)
- [ ] Explication de la strategie Multi-stage build
- [ ] Configuration reseau des VMs pour Kubernetes
- [ ] Logique du playbook Ansible (idempotence)
- [ ] Problemes rencontres et solutions appliquees
- [ ] Usage transparent de l'IA generative
- [ ] Screenshots : Pipeline GitLab, Registry, `kubectl get nodes`, Application web

---

## Ressources

- [Documentation K3s](https://docs.k3s.io/)
- [Documentation Kubernetes](https://kubernetes.io/docs/)
- [Documentation Ansible](https://docs.ansible.com/)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)

---

## Auteurs

- **Groupe**: [Noms des membres]
- **TD**: [Votre TD]
- **Date**: Decembre 2025

---

**Bon courage !**
