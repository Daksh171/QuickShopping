
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        DOCKERHUB_USER = 'dakshvaskar17'
        BACKEND_IMAGE = 'dakshvaskar17/quickbasket-backend'
        FRONTEND_IMAGE = 'dakshvaskar17/quickbasket-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }


stage('Diagnose Backend Files') {
    steps {
        sh '''
            echo "Workspace: $WORKSPACE"
            echo "Backend directory:"
            ls -la "$WORKSPACE/backend"

            echo "Lockfile in Jenkins workspace:"
            test -f "$WORKSPACE/backend/package-lock.json"

            echo "Lockfile inside Node container:"
            docker run --rm \
                -v "$WORKSPACE/backend:/app" \
                -w /app \
                node:20-alpine \
                sh -c 'pwd && ls -la && test -f package-lock.json'
        '''
    }
}


        stage('Build Backend') {
            steps {
                sh 'docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} -t ${BACKEND_IMAGE}:latest ./backend'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} -t ${FRONTEND_IMAGE}:latest ./frontend'
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_TOKEN'
                )]) {
                    sh '''
                        set +x
                        echo "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
        success {
            echo 'QuickBasket images built and pushed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the stage logs.'
        }
    }
}
