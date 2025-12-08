# TP - Application de Vote sur Kubernetes

## Structure
```
├── frontend/          # Interface web (Nginx)
├── backend/           # API (Node.js)
├── k8s/               # Manifeste Kubernetes
├── ansible/           # Deploiement automatise
├── docker-compose.yml # Test local
└── .gitlab-ci.yml     # Pipeline CI/CD
```

## 1. Test Local
```bash
docker compose up -d --build
# Ouvrir http://localhost:8080
docker compose down
```

## 2. GitLab CI/CD
1. Creer projet sur gitlab.com
2. Pousser le code:
```bash
git remote add gitlab https://gitlab.com/USERNAME/vote.git
git push gitlab main
```

## 3. Creer les VMs (UTM sur Mac)

### Telecharger Ubuntu Server
- https://ubuntu.com/download/server (ARM64 pour Mac M1/M2)

### Creer 2 VMs dans UTM
- VM1 (master): 2 CPU, 2GB RAM
- VM2 (worker): 2 CPU, 2GB RAM
- Reseau: Bridged

### Installer K3s

**Sur VM1 (master):**
```bash
curl -sfL https://get.k3s.io | sh -
sudo cat /var/lib/rancher/k3s/server/node-token
```

**Sur VM2 (worker):**
```bash
curl -sfL https://get.k3s.io | K3S_URL=https://<IP_VM1>:6443 K3S_TOKEN=<TOKEN> sh -
```

## 4. Deployer
```bash
# Sur le master
kubectl apply -f k8s/app.yaml
kubectl get pods -n vote
# Acces: http://<IP_VM1>:30080
```

## 5. Avec Ansible
```bash
# Editer ansible/hosts.ini avec vos IPs
ansible-playbook -i ansible/hosts.ini ansible/deploy.yml
```
