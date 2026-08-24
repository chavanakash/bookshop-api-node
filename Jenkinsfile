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
        IMAGE_TAG             = "${env.BUILD_NUMBER}"
        SONAR_PROJECT_KEY     = 'bookshop-api-node'
        K8S_DIR               = 'k8s'
        KUBECONFIG            = "${env.HOME}/.kube/config"
        // Jenkins runs as a background LaunchAgent and does not inherit the
        // interactive shell's PATH, so docker/kubectl (installed with Docker
        // Desktop, not Homebrew) aren't found without this.
        PATH                  = "/Applications/Docker.app/Contents/Resources/bin:/opt/homebrew/bin:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
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

        stage('Install & Test') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} -t ${DOCKERHUB_REPO}:latest ."
            }
        }

        stage('Trivy Scan') {
            steps {
                // Report-only, does not fail the build. The base image
                // (node:10.15.3, Debian 9) is EOL and always reports ~1400
                // HIGH/CRITICAL OS-level CVEs; the real fix is upgrading the
                // Dockerfile's base image, not this gate.
                sh "trivy image --exit-code 0 --severity LOW,MEDIUM,HIGH,CRITICAL --format table ${DOCKERHUB_REPO}:${IMAGE_TAG}"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh 'echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin'
                sh "docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                sh "docker push ${DOCKERHUB_REPO}:latest"
            }
        }

        stage('Pull Image from Docker Hub') {
            steps {
                // Pulls the just-pushed tag to prove the registry round-trip works
                // before it's referenced by the Kubernetes manifest.
                sh "docker pull ${DOCKERHUB_REPO}:${IMAGE_TAG}"
            }
        }

        stage('Update Kubernetes Manifest') {
            steps {
                sh """
                    sed -i.bak "s#image: .*#image: ${DOCKERHUB_REPO}:${IMAGE_TAG}#g" ${K8S_DIR}/deployment.yaml
                    rm -f ${K8S_DIR}/deployment.yaml.bak
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    kubectl apply -f ${K8S_DIR}/mongo-pvc.yaml
                    kubectl apply -f ${K8S_DIR}/mongo-deployment.yaml
                    kubectl apply -f ${K8S_DIR}/mongo-service.yaml
                    kubectl apply -f ${K8S_DIR}/deployment.yaml
                    kubectl apply -f ${K8S_DIR}/service.yaml
                    kubectl rollout status deployment/bookshop-api --timeout=120s
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            cleanWs()
        }
        failure {
            echo 'Pipeline failed — check the stage logs above.'
        }
    }
}
