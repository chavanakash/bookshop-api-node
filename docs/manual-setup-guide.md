# Manual Setup Guide

Everything [`scripts/bootstrap-linux.sh`](../scripts/bootstrap-linux.sh) does automatically, broken into individual
commands so you can run each one yourself and see what it actually does. Targets a fresh
Ubuntu/Debian machine with `sudo` access.

If you just want the app running with no learning detour, run the script instead. Use this
when you want to understand each piece.

---

## 1. Docker

Docker builds and runs the container images for the backend, frontend, SonarQube, and (via
`kind`) the Kubernetes cluster itself.

```bash
# Base packages Docker's installer needs
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker's apt repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker itself
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start it now and on every boot
sudo systemctl enable --now docker

# Let your user run docker without sudo
sudo usermod -aG docker "$USER"
```

**Log out and back in** (or run `newgrp docker`) so the group change takes effect. Verify:

```bash
docker version
docker run hello-world
```

---

## 2. kubectl

The CLI for talking to any Kubernetes cluster.

```bash
KUBECTL_VERSION="$(curl -Ls https://dl.k8s.io/release/stable.txt)"
curl -fsSL -o kubectl "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/kubectl

kubectl version --client
```

---

## 3. kind — a local Kubernetes cluster

`kind` ("Kubernetes IN Docker") runs a real Kubernetes cluster entirely inside Docker
containers — no cloud account, no separate VM needed.

```bash
curl -fsSL -o kind "https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64"
chmod +x kind
sudo mv kind /usr/local/bin/kind

# Create the cluster (this also points kubectl at it automatically)
kind create cluster --name bookshop

# Confirm it's up
kubectl get nodes
```

---

## 4. Helm

The package manager for Kubernetes — templates YAML manifests from a chart + a `values.yaml`
instead of hand-editing static files.

```bash
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

helm version
```

Try it against this project's chart:

```bash
helm lint helm/bookshop
helm template bookshop helm/bookshop | less
```

---

## 5. ArgoCD

Watches a git repo and keeps the cluster's actual state in sync with what's declared there
(GitOps). Two parts: the controller (runs in-cluster) and a CLI (runs on your machine).

```bash
# Namespace + the controller itself
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for everything to come up (can take a few minutes on first pull)
kubectl wait --for=condition=ready pod --all -n argocd --timeout=300s

# The CLI
curl -fsSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/argocd
```

Get the auto-generated admin password and log in:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo

kubectl port-forward svc/argocd-server -n argocd 8081:443 &
argocd login localhost:8081 --username admin --password '<paste password>' --insecure
```

Open **https://localhost:8081** in a browser, or keep using the CLI.

Register this project as an ArgoCD `Application` (already defined in
[`argocd/application.yaml`](../argocd/application.yaml)):

```bash
kubectl apply -f argocd/application.yaml
argocd app get bookshop --insecure
argocd app sync bookshop --insecure
```

---

## 6. SonarQube

Static analysis + a quality gate that can block a build on low test coverage or bad code
smells. Runs as a single Docker container.

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
```

Give it ~60 seconds to boot, then check:

```bash
curl http://localhost:9000/api/system/status
```

Open **http://localhost:9000**, log in with `admin` / `admin`, and you'll be forced to set a
new password immediately.

From there (UI steps, no CLI equivalent):
1. **Projects → Create Project → Manually**, key `bookshop-api-node`.
2. Generate a token for local analysis — you'll need it for Jenkins later.
3. **Quality Gates → Create**, add a condition like *Coverage is less than 80* on Overall Code,
   and assign it to the project.

Run a scan by hand to see it work:

```bash
# Install the scanner CLI first — see Trivy section's pattern, or:
#   curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-<version>-linux.zip
sonar-scanner -Dsonar.projectKey=bookshop-api-node -Dsonar.host.url=http://localhost:9000 -Dsonar.login=<your token>
```

---

## 7. Trivy

Scans a Docker image for known vulnerabilities (CVEs) in its OS packages and language
dependencies.

```bash
curl -fsSL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

trivy --version
```

Try it on an image you've built:

```bash
docker build -t bookshop-api-node:local .
trivy image --severity HIGH,CRITICAL bookshop-api-node:local
```

---

## 8. Jenkins

The CI server that ties everything above together — checks out the repo, runs tests, talks to
SonarQube, builds and pushes images, and (via the stages in this project's
[`Jenkinsfile`](../Jenkinsfile)) updates the Helm chart and triggers ArgoCD.

```bash
# Jenkins needs a JVM
sudo apt-get install -y fontconfig openjdk-21-jre

# Add Jenkins' apt repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
  | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
  | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y jenkins

# Let Jenkins run docker builds
sudo usermod -aG docker jenkins

sudo systemctl enable --now jenkins
```

Get the initial admin password and open the setup wizard:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Visit **http://localhost:8080**, paste that password, install the suggested plugins, then
also install: `SonarQube Scanner`, `Docker Pipeline`, `NodeJS` (Manage Jenkins → Plugins →
Available).

From there, connect it to everything else (all UI steps under **Manage Jenkins**):
- **Tools** → add a NodeJS installation named `NodeJS18`, and (if not using the system Helm/
  ArgoCD/Trivy binaries already on `PATH`) confirm Jenkins can see them: `sudo -u jenkins which helm argocd trivy`.
- **Credentials** → add your Docker Hub token (`dockerhub-creds`), a GitHub personal access
  token (`github-token`, needed for the pipeline's Helm-values commit), your SonarQube token
  (`sonarqube-token`), and an ArgoCD API token (`argocd-token`, from `argocd account
  generate-token --account admin`).
- **System** → add a SonarQube server named `SonarQubeServer` pointing at
  `http://localhost:9000`, using the `sonarqube-token` credential.
- Create a **Pipeline** job pointing at this repo with script path `Jenkinsfile`, and a GitHub
  webhook (repo → Settings → Webhooks) pointing back at your Jenkins URL + `/github-webhook/`.

---

## Quick reference: what's running where

| Tool | URL | Default login |
|---|---|---|
| Jenkins | http://localhost:8080 | set during setup wizard |
| SonarQube | http://localhost:9000 | `admin` / `admin` (forced change) |
| ArgoCD | https://localhost:8081 (after port-forward) | `admin` / from `argocd-initial-admin-secret` |
| Backend API | http://localhost:30090/api/book/list | — |
| Frontend (BookNook) | http://localhost:30091 | — |
