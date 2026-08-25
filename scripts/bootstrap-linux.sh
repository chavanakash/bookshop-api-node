#!/usr/bin/env bash
#
# One-shot setup for a fresh Ubuntu/Debian Linux machine: everything needed
# to build, scan, and deploy this project the same way it's set up in the
# CI/CD guide — Docker, a local Kubernetes cluster (kind), Helm, ArgoCD,
# SonarQube, Trivy, and Jenkins.
#
# Assumes: a fresh Ubuntu/Debian box (apt-based) with sudo access. Re-running
# is safe — each section skips work that's already done.
#
# Usage:
#   sudo bash scripts/bootstrap-linux.sh
#
set -euo pipefail

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this as root: sudo bash $0" >&2
  exit 1
fi

REAL_USER="${SUDO_USER:-$USER}"

# ---------------------------------------------------------------------------
log "Updating system packages"
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https software-properties-common

# ---------------------------------------------------------------------------
log "Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  usermod -aG docker "$REAL_USER"
  echo "Added $REAL_USER to the docker group — log out/in (or run 'newgrp docker') for it to take effect."
else
  echo "Docker already installed, skipping."
fi

# ---------------------------------------------------------------------------
log "Installing kubectl"
if ! command -v kubectl >/dev/null 2>&1; then
  KUBECTL_VERSION="$(curl -Ls https://dl.k8s.io/release/stable.txt)"
  curl -fsSL -o /usr/local/bin/kubectl "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
  chmod +x /usr/local/bin/kubectl
else
  echo "kubectl already installed, skipping."
fi

# ---------------------------------------------------------------------------
log "Installing kind and creating a local Kubernetes cluster"
if ! command -v kind >/dev/null 2>&1; then
  curl -fsSL -o /usr/local/bin/kind "https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64"
  chmod +x /usr/local/bin/kind
else
  echo "kind already installed, skipping."
fi

if ! kind get clusters 2>/dev/null | grep -q "^bookshop$"; then
  kind create cluster --name bookshop
else
  echo "kind cluster 'bookshop' already exists, skipping."
fi

# ---------------------------------------------------------------------------
log "Installing Helm"
if ! command -v helm >/dev/null 2>&1; then
  curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
else
  echo "Helm already installed, skipping."
fi

# ---------------------------------------------------------------------------
log "Installing ArgoCD (in-cluster) and its CLI"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

if ! command -v argocd >/dev/null 2>&1; then
  curl -fsSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
  chmod +x /usr/local/bin/argocd
else
  echo "argocd CLI already installed, skipping."
fi

echo "Waiting for ArgoCD pods to be ready (can take a few minutes on first install)..."
kubectl wait --for=condition=ready pod --all -n argocd --timeout=300s || \
  echo "Some ArgoCD pods aren't ready yet — check with: kubectl get pods -n argocd"

# ---------------------------------------------------------------------------
log "Starting SonarQube (Community Edition, in Docker)"
if ! docker ps -a --format '{{.Names}}' | grep -qx sonarqube; then
  docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
else
  echo "SonarQube container already exists, skipping."
fi

# ---------------------------------------------------------------------------
log "Installing Trivy"
if ! command -v trivy >/dev/null 2>&1; then
  curl -fsSL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
else
  echo "Trivy already installed, skipping."
fi

# ---------------------------------------------------------------------------
log "Installing Jenkins"
if [ ! -f /etc/init.d/jenkins ] && [ ! -f /lib/systemd/system/jenkins.service ]; then
  apt-get install -y fontconfig openjdk-21-jre
  curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
    -o /usr/share/keyrings/jenkins-keyring.asc
  echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
    | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
  apt-get update -y
  apt-get install -y jenkins
  usermod -aG docker jenkins
  systemctl enable --now jenkins
else
  echo "Jenkins already installed, skipping."
fi

# ---------------------------------------------------------------------------
log "Copying kubeconfig to $REAL_USER so kubectl/helm/argocd work without sudo"
REAL_HOME="$(getent passwd "$REAL_USER" | cut -d: -f6)"
mkdir -p "$REAL_HOME/.kube"
cp "$HOME/.kube/config" "$REAL_HOME/.kube/config"
chown -R "$REAL_USER:$REAL_USER" "$REAL_HOME/.kube"

# ---------------------------------------------------------------------------
log "Done. Access details:"
cat <<'EOF'

Docker:    docker version
kubectl:   kubectl get nodes            (cluster: kind-bookshop)
Helm:      helm version
Trivy:     trivy --version

Jenkins:    http://localhost:8080
  Initial admin password:
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword

SonarQube:  http://localhost:9000
  Default login: admin / admin (you'll be forced to change it on first login)

ArgoCD:
  kubectl port-forward svc/argocd-server -n argocd 8081:443
  Then open: https://localhost:8081  (username: admin)
  Password:
    kubectl -n argocd get secret argocd-initial-admin-secret \
      -o jsonpath="{.data.password}" | base64 -d; echo

Next steps:
  1. Log out and back in (or run 'newgrp docker') so your user's new docker
     group membership takes effect.
  2. Follow the CI/CD setup guide to connect Jenkins to SonarQube, Docker
     Hub, GitHub, and ArgoCD (plugins, credentials, webhook, Application).
EOF
