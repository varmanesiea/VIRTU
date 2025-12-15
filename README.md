# Application de Vote - TP Kubernetes

Projet de deploiement d'une app 3-tiers sur K3s.

## Structure

```
frontend/      -> nginx + html
backend/       -> nodejs express
k8s/           -> fichiers kubernetes
ansible/       -> deploiement auto
```

## Test en local

```bash
docker compose up -d --build
```

Ouvrir http://localhost:8080

Pour arreter:
```bash
docker compose down
```

## GitLab CI

Le fichier .gitlab-ci.yml build et push les images sur le registry gitlab.

## Installation K3s

Sur le master:
```bash
curl -sfL https://get.k3s.io | sh -
sudo cat /var/lib/rancher/k3s/server/node-token
```

Sur le worker:
```bash
curl -sfL https://get.k3s.io | K3S_URL=https://IP_MASTER:6443 K3S_TOKEN=TOKEN sh -
```

## Deploiement Ansible

Modifier les IPs dans ansible/hosts.ini puis:
```bash
ansible-playbook -i ansible/hosts.ini ansible/deploy.yml
```

## Acces

L'app est accessible sur http://IP_MASTER:30080
