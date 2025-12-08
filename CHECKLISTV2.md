# CHECKLISTV2 — Vérification rapide du projet

Ce fichier rassemble les étapes rapides pour démarrer, tester et dépanner le projet localement.

## 1) Démarrage local

Ouvrez un terminal dans le dossier du projet et lancez :

```bash
cd "/Users/varman/Downloads/VIRTU PROJET"
docker compose -f docker-compose.yml up -d --build
```

- Frontend (Nginx) : http://localhost:8080
- Backend (exposé sur hôte) : http://localhost:5001
- PostgreSQL (hôte) : 5432

## 2) Tests rapides (smoke tests)

Tester la santé :

```bash
curl http://localhost:8080/api/health
curl http://localhost:5001/api/health   # accès direct au backend
```

Poster un vote (via frontend proxy ou backend direct) :

```bash
# via frontend (proxy vers backend)
curl -X POST http://localhost:8080/api/vote -H 'Content-Type: application/json' -d '{"option":"Python"}'

# ou direct au backend
curl -X POST http://localhost:5001/api/vote -H 'Content-Type: application/json' -d '{"option":"JavaScript"}'
```

Récupérer les résultats :

```bash
curl http://localhost:8080/api/results
# ou
curl http://localhost:5001/api/results
```

## 3) Logs & dépannage

Voir les logs des services :

```bash
docker compose -f docker-compose.yml logs -f frontend
docker compose -f docker-compose.yml logs -f backend
docker compose -f docker-compose.yml logs -f postgres
```

Si un service ne démarre pas :
- Vérifier qu'aucun processus hôte n'utilise le port (ex: `lsof -iTCP:5000 -sTCP:LISTEN`).
- Le backend est exposé sur le port hôte `5001` (port choisi automatiquement libre). Si vous préférez un autre port, editez `docker-compose.yml`.

Arrêter la stack proprement :

```bash
docker compose -f docker-compose.yml down
```

## 4) GitLab CI/CD

Le pipeline minimal est présent dans `.gitlab-ci.yml` (stages `build` et `push`).
Pour l'activer sur GitLab :
1. Créer un projet sur GitLab.
2. Pousser le dépôt vers GitLab.
3. Définir les variables CI si besoin (ex: `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`).

## 5) Déploiement sur K3s (VMs)

Résumé des étapes (UTM sur Mac) :
- Créer 2 VMs Ubuntu (master/worker) en mode bridged.
- Installer K3s sur le master : `curl -sfL https://get.k3s.io | sh -`
- Récupérer le token : `sudo cat /var/lib/rancher/k3s/server/node-token`
- Joindre le worker : `curl -sfL https://get.k3s.io | K3S_URL=https://<IP_MASTER>:6443 K3S_TOKEN=<TOKEN> sh -`
- Appliquer les manifests : `kubectl apply -f k8s/app.yaml`

## 6) Remarques importantes

- J'ai choisi automatiquement le port hôte `5001` pour exposer le backend afin d'éviter d'interrompre des processus existants sur votre machine.
- Pour plus de sécurité, vous pouvez utiliser uniquement le frontend (http://localhost:8080) ; le frontend propose un proxy vers le backend pour tous les tests locaux.

---

Fichier généré automatiquement par l'assistant — date: 2025-12-08
