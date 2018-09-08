nodePod { label ->
  runInNode(label) {
    container('node') {
      npmLogin()

      stage('NPM Install') {
        sh 'npm install'
      }

      stage('Compile') {
        sh 'npm run dist'
      }

      stage('Publish') {
        sh 'npm publish dist-internal'
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
