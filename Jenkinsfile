node {
  deleteDir()
  withCredentials([[$class: 'StringBinding', credentialsId: 'NpmAuthToken', variable: 'NPM_TOKEN'],
  [$class: 'StringBinding', credentialsId: 'ConvNpmAuthToken', variable: 'C_NPM_TOKEN']]) {

    stage 'Checkout'
    checkout scm

    gitlabCommitStatus {
      stage 'Setup Registry'
      sh '''
        npm config set registry https://nexus.convergencelabs.tech/repository/npm/
        npm config set //nexus.convergencelabs.tech/repository/npm/:_authToken=$NPM_TOKEN
        npm config set //nexus.convergencelabs.tech/repository/convergence-npm/:_authToken=$C_NPM_TOKEN
      '''

      stage 'NPM Install'
      sh '''
        npm install
        npm run typings
      '''

      stage 'Compile'
      sh '''
        npm run dist
      '''

      stage 'Publish'
      sh '''
        npm publish dist
      '''
    }
  }
  deleteDir()
}
