pipeline {
    agent any

    environment {
        BACKEND_IMAGE      = "smart-attendance-backend"
        FRONTEND_IMAGE     = "smart-attendance-frontend"

        BACKEND_CONTAINER  = "attendance-backend"
        FRONTEND_CONTAINER = "attendance-frontend"
        DB_CONTAINER       = "attendance-db"

        DOCKER_NETWORK     = "attendance-net"

        POSTGRES_DB        = "attendance"
        POSTGRES_USER      = "attendance_user"
        POSTGRES_PASSWORD  = "strongpassword"

        DATABASE_URL = "postgresql://attendance_user:strongpassword@attendance-db:5432/attendance"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Rajesh-210/smart-attendance.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                    docker build -t $BACKEND_IMAGE .
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh '''
                    docker build -t $FRONTEND_IMAGE .
                    '''
                }
            }
        }

        stage('Create Docker Network') {
            steps {
                sh '''
                docker network inspect $DOCKER_NETWORK >/dev/null 2>&1 || \
                docker network create $DOCKER_NETWORK
                '''
            }
        }

        stage('Stop & Remove Old Containers') {
            steps {
                sh '''
                docker rm -f $BACKEND_CONTAINER || true
                docker rm -f $FRONTEND_CONTAINER || true
                docker rm -f $DB_CONTAINER || true
                '''
            }
        }

        stage('Run Database Container') {
            steps {
                sh '''
                docker run -d \
                  --name $DB_CONTAINER \
                  --network $DOCKER_NETWORK \
                  -e POSTGRES_DB=$POSTGRES_DB \
                  -e POSTGRES_USER=$POSTGRES_USER \
                  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
                  postgres:15
                '''
            }
        }

        stage('Wait for Database') {
            steps {
                sh '''
                echo "⏳ Waiting for PostgreSQL to initialize..."
                sleep 15
                '''
            }
        }

        stage('Run Backend Container') {
            steps {
                sh '''
                docker run -d \
                  --name $BACKEND_CONTAINER \
                  --network $DOCKER_NETWORK \
                  -p 8000:8000 \
                  -e DATABASE_URL=$DATABASE_URL \
                  $BACKEND_IMAGE
                '''
            }
        }

        stage('Run Frontend Container') {
            steps {
                sh '''
                docker run -d \
                  --name $FRONTEND_CONTAINER \
                  --network $DOCKER_NETWORK \
                  -p 80:80 \
                  $FRONTEND_IMAGE
                '''
            }
        }

        stage('Verify Containers') {
            steps {
                sh '''
                echo "📦 Running containers:"
                docker ps
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Smart Attendance deployed successfully"
            echo "🌐 Frontend : http://<EC2-IP>"
            echo "📘 Backend  : http://<EC2-IP>:8000/docs"
        }
        failure {
            echo "❌ Deployment failed"
        }
    }
}
