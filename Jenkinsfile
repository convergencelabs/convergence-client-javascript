nodePod { label ->
  runInNode(label) {
    container('node') {
      npmLogin()

      stage('NPM Install') {
        sh 'npm install'
      }

      stage('Test') {
        sh 'npm run test'
      }

      stage('Build') {
        sh 'npm run dist'
      }

      stage('Publish') {
        sh 'npm --registry=https://nexus.dev.convergencelabs.tech/repository/npm-convergence publish dist'
      }
    }

    def containerName = "convergence-js-apidocs";

    stage('Docker Build') {
      container('docker') {
        dockerBuild(containerName)
      }
    }

    stage('Docker Push') {
      container('docker') {
        dockerPush(containerName, ["latest", env.GIT_COMMIT])
      }
    }
  }
}
