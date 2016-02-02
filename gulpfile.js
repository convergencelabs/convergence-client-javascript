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

var sourcemaps = require('gulp-sourcemaps');
var rollup = require('gulp-rollup');
var rollupTypescript = require('rollup-plugin-typescript');

const plumberConf = {};

gulp.task('build', function () {
  return gulp.src('src/main/ts/ConvergenceDomain.ts', {read: false})
    .pipe(rollup({
      format: 'iife',
      moduleName: 'ConvergenceDomain',
      sourceMap: true,
      plugins: [
        rollupTypescript()
      ]
    }))
    .pipe(rename("convergence-client.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build"));
});

gulp.task('tslint', function () {
  return gulp.src('src/main/ts/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report('prose'));
});

gulp.task('istanbul', function (cb) {
  return gulp.src("build/**/*.js")
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

gulp.task('dist', ["build"], function () {
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
gulp.task('default', ["build"]);
gulp.task('test', ["istanbul"]);
