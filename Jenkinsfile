pipeline {
    agent any

    tools {
        nodejs 'NodeJS18'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    triggers {
        // Fired by the GitHub webhook on every push (see setup guide).
        githubPush()
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_REPO        = 'dockerizzz/bookshop-api-node' // TODO: replace with your Docker Hub repo
        FRONTEND_REPO         = 'dockerizzz/bookshop-frontend' // TODO: replace with your Docker Hub repo
        IMAGE_TAG             = "${env.BUILD_NUMBER}"
        SONAR_PROJECT_KEY     = 'bookshop-api-node'
        // Jenkins runs as a background LaunchAgent and does not inherit the
        // interactive shell's PATH, so docker (installed with Docker Desktop,
        // not Homebrew) isn't found without this.
        PATH                  = "/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // The Update Helm Values stage pushes a commit back to this
                    // repo, which would otherwise re-trigger this same pipeline
                    // via the webhook forever. Bail out early on its own commits.
                    def msg = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    if (msg.contains('[skip ci]')) {
                        currentBuild.result = 'NOT_BUILT'
                        error('Skipping: this commit was an automated Helm values bump')
                    }
                }
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // Must run after Install & Test: sonar-project.properties
                // points sonar.javascript.lcov.reportPaths at coverage/lcov.info,
                // which only exists once `npm test` has generated it.
                withSonarQubeEnv('SonarQubeServer') {
                    sh "${tool 'SonarQubeScanner'}/bin/sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT_KEY}"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                // Fails the build if the SonarQube quality gate (>=80% coverage,
                // see setup guide) does not pass. Requires the SonarQube webhook
                // back to Jenkins to be configured, otherwise this will time out.
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} -t ${DOCKERHUB_REPO}:latest ."
                sh "docker build -t ${FRONTEND_REPO}:${IMAGE_TAG} -t ${FRONTEND_REPO}:latest ./frontend"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh 'echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin'
                sh "docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                sh "docker push ${DOCKERHUB_REPO}:latest"
                sh "docker push ${FRONTEND_REPO}:${IMAGE_TAG}"
                sh "docker push ${FRONTEND_REPO}:latest"
            }
        }

        stage('Pull Images from Docker Hub') {
            steps {
                // Pulls the just-pushed tags to prove the registry round-trip works
                // before they're referenced by the Kubernetes manifests.
                sh "docker pull ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                sh "docker pull ${FRONTEND_REPO}:${IMAGE_TAG}"
            }
        }

        stage('Helm Lint') {
            steps {
                // Validates the chart before ArgoCD ever sees it.
                sh 'helm lint helm/bookshop'
            }
        }

        stage('Update Helm Values') {
            steps {
                // GitOps: Jenkins' job ends at "desired state lives in git."
                // It does not touch the cluster directly — ArgoCD, watching
                // this repo, is the only thing that applies anything.
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    sh """
                        sed -i.bak "s#tag: .*#tag: ${IMAGE_TAG}#" helm/bookshop/values.yaml
                        rm -f helm/bookshop/values.yaml.bak
                        git config user.email 'jenkins@local'
                        git config user.name 'Jenkins'
                        git add helm/bookshop/values.yaml
                        git commit -m "Bump image tags to ${IMAGE_TAG} [skip ci]" || echo "no changes to commit"
                        git push https://${GITHUB_TOKEN}@github.com/chavanakash/bookshop-api-node.git HEAD:master
                    """
                }
            }
        }

        stage('Trigger ArgoCD Sync') {
            steps {
                // The Application already has automated sync enabled, so it
                // would pick this up on its own polling interval anyway —
                // this just forces it immediately instead of waiting.
                withCredentials([string(credentialsId: 'argocd-token', variable: 'ARGOCD_AUTH_TOKEN')]) {
                    sh """
                        argocd app sync bookshop --server localhost:443 --insecure --auth-token \$ARGOCD_AUTH_TOKEN
                        argocd app wait bookshop --server localhost:443 --insecure --auth-token \$ARGOCD_AUTH_TOKEN --timeout 180
                    """
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            cleanWs()
        }
        success {
            echo "BookNook is live at: http://localhost:30091"
        }
        failure {
            echo 'Pipeline failed — check the stage logs above.'
        }
    }
}
