pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "smart-attendance-backend"
        FRONTEND_IMAGE = "smart-attendance-frontend"
        BACKEND_CONTAINER = "attendance-backend"
        FRONTEND_CONTAINER = "attendance-frontend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/<your-username>/smart-attendance.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('smart-attendance/backend') {
                    sh '''
                    docker build -t $BACKEND_IMAGE .
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('smart-attendance/frontend') {
                    sh '''
                    docker build -t $FRONTEND_IMAGE .
                    '''
                }
            }
        }

        stage('Stop & Remove Old Containers') {
            steps {
                sh '''
                docker rm -f $BACKEND_CONTAINER || true
                docker rm -f $FRONTEND_CONTAINER || true
                '''
            }
        }

        stage('Run Backend Container') {
            steps {
                sh '''
                docker run -d \
                  --name $BACKEND_CONTAINER \
                  -p 8000:8000 \
                  $BACKEND_IMAGE
                '''
            }
        }

        stage('Run Frontend Container') {
            steps {
                sh '''
                docker run -d \
                  --name $FRONTEND_CONTAINER \
                  -p 80:80 \
                  $FRONTEND_IMAGE
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Smart Attendance application deployed successfully"
        }
        failure {
            echo "❌ Deployment failed"
        }
    }
}
