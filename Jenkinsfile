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
  }
}
