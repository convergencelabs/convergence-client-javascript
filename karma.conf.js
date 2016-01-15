module.exports = function(config) {
  config.set({
    basePath: '',
    files: [
      'build/**/*.js',
      'src/test/**/*.js'
    ],
    frameworks: ['mocha', 'chai'],
    autoWatch: false,
    singleRun: true,
    browsers: ['PhantomJS'],
    plugins: ['karma-chai', 'karma-mocha', 'karma-phantomjs-launcher'],
    exclude: [],
    reporters: ['progress'],
    port: 9876,
    runnerPort: 9100,
    colors: true,
    logLevel: config.LOG_DEBUG,
    captureTimeout: 60000
  });
};