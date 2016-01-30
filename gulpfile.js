var gulp = require('gulp');
var mkdirp = require('mkdirp');
var path = require('path');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
const tslint = require('gulp-tslint');
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');
const plumber = require('gulp-plumber');
var insert = require('gulp-insert');
var del = require('del');
var Server = require('karma').Server;
var insert = require('gulp-insert');

var version = "1.0.0-M1-SNAPSHOT";

var outputFileBase = "convergence-client";
var outputFileJs = outputFileBase + ".js";
var outputFileDts = outputFileBase + ".d";

var tsProject = ts.createProject('tsconfig.json');

const plumberConf = {};

gulp.task('ts-compile', function () {
  var tsResult = gulp.src(['src/main/ts/**/*.ts', 'typings/**.ts'])
    .pipe(ts(tsProject));
  tsResult.js
    .pipe(insert.append('if (module !== undefined) module.exports = convergence;'))
    .pipe(gulp.dest('.'));

  return tsResult.dts.pipe(gulp.dest('.'));
});

gulp.task('tslint', function () {
  return gulp.src('src/main/ts/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report('prose'));
});

gulp.task('istanbul', function (cb) {
  gulp.src("build/**/*.js")
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src("src/test/**/*.js")
        .pipe(plumber(plumberConf))
        .pipe(mocha())
        .pipe(istanbul.writeReports()) // Creating the reports after tests run
        .on('finish', function () {
          process.chdir(__dirname);
          cb();
        });
    });
});

gulp.task('dist', ["ts-compile"], function () {
  mkdirp.sync("dist");
  return gulp.src('build/*.js')
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function (cb) {
  del([
    'dist/',
    "build"
  ], cb);
});

// The default task (called when you run `gulp`)
gulp.task('default', ["ts-compile"]);
gulp.task('test2', ["istanbul"]);

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});
