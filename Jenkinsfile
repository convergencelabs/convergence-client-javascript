node {
  withCredentials([[$class: 'SecretText', credentialsId: 'NpmAuthToken', variable: 'NPM_TOKEN'],
  [$class: 'SecretText', credentialsId: 'ConvNpmAuthToken', variable: 'C_NPM_TOKEN']]) {

  stage 'Checkout'
  checkout scm

  stage 'Setup Registry'
  sh 'npm config set registry https://nexus.convergencelabs.tech/repository/npm/'
  sh 'npm config set //nexus.convergencelabs.tech/repository/npm/:_authToken=$NPM_TOKEN'
  sh 'npm config set //nexus.convergencelabs.tech/repository/convergence-npm/:_authToken=$C_NPM_TOKEN'

  stage 'NPM Install'
  sh 'npm install'

  stage 'Compile'
  sh 'npm run timestamp'
  sh 'npm run build'
  
  stage 'Publish'
  sh 'npm publish dist'

 }
