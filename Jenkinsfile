pipeline {
    agent any
    tools {
        nodejs 'node-18.18.2'
    }
    environment {
        SCANNER_HOME = tool 'sonarqube-6.1.0'
    }
    stages {
        stage('Initialize') {
            steps {
                sh 'echo "PATH = ${PATH}"'
            }
        }
        stage('Install pnpm') {
            steps {
                sh 'npm install -g pnpm'
            }
        }
        stage('Install packages') {
            steps {
                sh 'pnpm install'
            }
        }
        stage('Build') {
            steps {
                sh 'pnpm pack'
            }
        }
        stage('Testing') {
            steps {
                sh 'pnpm test:coverage'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '${SCANNER_HOME}/bin/sonar-scanner -Dsonar.projectKey=remark-svelte-auto-import -Dsonar.language=ts -Dsonar.sources=src -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info'
                }
            }
        }
    }
}

