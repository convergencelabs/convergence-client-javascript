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
        sh 'npm publish --registry=https://nexus.dev.convergencelabs.tech/repository/npm-convergence/ dist'
      }
    }
  }
}
