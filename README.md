# TP Final INF4052 - Application 3-Tiers sur Kubernetes

Application de vote deployee sur un cluster Kubernetes avec CI/CD GitLab.

## Structure du Projet

```
├── frontend/           # Interface web (Nginx)
├── backend/            # API REST (Node.js/Express)
├── k8s/                # Manifestes Kubernetes
├── ansible/            # Playbook de deploiement
├── .gitlab-ci.yml      # Pipeline CI/CD
└── docker-compose.local.yml  # Tests locaux
```

## 1. Test Local (Docker Compose)

```bash
# Demarrer l'application
docker compose -f docker-compose.local.yml up -d --build

# Verifier
docker compose -f docker-compose.local.yml ps

# Ouvrir http://localhost:8080

# Arreter
docker compose -f docker-compose.local.yml down
```

## 2. Pipeline GitLab CI/CD

Le fichier `.gitlab-ci.yml` contient le pipeline avec 2 stages :
- **build** : Construction des images Docker
- **push** : Push vers GitLab Container Registry

### Configuration GitLab

1. Creer un projet sur GitLab
2. Pousser le code :
```bash
git remote add gitlab https://gitlab.com/VOTRE_USERNAME/voting-app.git
git push gitlab main
```
3. Le pipeline se declenche automatiquement
4. Verifier dans GitLab > CI/CD > Pipelines

## 3. Cluster Kubernetes (K3s)

### Installation Master (VM1)
```bash
curl -sfL https://get.k3s.io | sh -
sudo cat /var/lib/rancher/k3s/server/node-token  # Token pour worker
```

### Installation Worker (VM2)
```bash
curl -sfL https://get.k3s.io | K3S_URL=https://<IP_MASTER>:6443 K3S_TOKEN=<TOKEN> sh -
```

### Verification
```bash
sudo kubectl get nodes
```

## 4. Deploiement sur Kubernetes

### Creer le namespace et le secret
```bash
kubectl create namespace voting-app

kubectl create secret docker-registry gitlab-registry-secret \
  --docker-server=registry.gitlab.com \
  --docker-username=VOTRE_USERNAME \
  --docker-password=VOTRE_TOKEN \
  -n voting-app
```

### Deployer les manifestes
```bash
kubectl apply -f k8s/ -n voting-app
```

### Verification
```bash
kubectl get all -n voting-app
```

### Acces a l'application
```
http://<IP_VM_MASTER>:30080
```

## 5. Deploiement avec Ansible

### Configurer l'inventaire
Editer `ansible/hosts.ini` avec les IPs de vos VMs.

### Executer le playbook
```bash
cd ansible
ansible-playbook -i hosts.ini deploy.yml
```

## Ports

| Service    | Port Interne | Port Externe |
|------------|--------------|--------------|
| Frontend   | 80           | 30080        |
| Backend    | 5000         | -            |
| PostgreSQL | 5432         | -            |

## Commandes Utiles

```bash
# Logs d'un pod
kubectl logs -f <pod-name> -n voting-app

# Redemarrer un deployment
kubectl rollout restart deployment frontend -n voting-app

# Supprimer tout
kubectl delete -f k8s/ -n voting-app
```
