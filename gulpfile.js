const gulp = require('gulp');

const bump = require('gulp-bump');
const concat = require('gulp-concat');
const del = require('del');
const merge = require('merge2');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const runSequence = require('run-sequence');

const ts = require('gulp-typescript');
const tsLint = require('gulp-tslint');
const dts = require('dts-bundle');

const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');

const rollup = require('rollup');
const rollupTypescript = require('rollup-plugin-typescript');
const sourceMaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const fs = require('fs');
const typescript = require('typescript');
const rollupStream = require('rollup-stream');
const packageJson = JSON.parse(fs.readFileSync('./package.json'));
const source = require('vinyl-source-stream');
const vinyBuffer = require('vinyl-buffer');

gulp.task('default', ["dist"]);

/**
 * Converts Typescript w/ ES6 modules to ES5 w/ commonjs modules using the
 * Typescript compiler.  This builds both the main source and the test sources.
 */
gulp.task('build', [], function () {
  const tsProject = ts.createProject('tsconfig.json');

  // We need this here because we need to create the d.ts, but we
  // can't put this in the tsconfig because the other steps bomb out.
  tsProject.options.declaration = true;

  var tsResult = gulp.src(['src/**/*.ts', "typings/index.d.ts"])
    .pipe(tsProject());

  return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done.
    tsResult.dts.pipe(gulp.dest('build')),
    tsResult.js.pipe(gulp.dest('build'))
  ]);
});


/**
 * Test the code using the ES5 output from the build command.
 */
gulp.task('test', ["build"], function () {
  return gulp.src("build/test*/**/*.js")
    .pipe(mocha({reporter: 'progress'}));
});


/**
 * Runs the tests and produces a coverage report.
 */
gulp.task('coverage', ["build"], function () {
  return gulp.src("build/**/*.js")
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src("build/test/**/*.js")
        .pipe(mocha({reporter: 'progress'}))
        .pipe(istanbul.writeReports()) // Creating the reports after tests run
        .on('finish', function () {
          process.chdir(__dirname);
        });
    });
});


/**
 * Checks the code for stylistic and design errors as defined in the
 * tslint.config file.
 */
gulp.task('lint', function () {
  return gulp.src('src/main/ts/**/*.ts')
    .pipe(tsLint({formatter: 'prose'}))
    .pipe(tsLint.report());
});

gulp.task('dist-ts', ["build"], function () {
  // TODO we could write a plugin to make this more gulpy
  var options = {
    name: 'convergence-client',
    main: 'build/main/ts/ConvergenceDomain.d.ts'
  };
  dts.bundle(options);

  return gulp.src('build/main/ts/convergence-client.d.ts')
    .pipe(replace('convergence-client/ConvergenceDomain', 'convergence-client'))
    .pipe(gulp.dest("dist"))
    .on('finish', function () {
      del('build/main/ts/convergence-client.d.ts');
    });
});

gulp.task('dist-umd', ["dist-ts", "lint", "test"], function () {
  return rollupStream({
      entry: 'src/main/ts/ConvergenceDomain.ts',
      rollup: rollup,
      format: 'umd',
      moduleName: 'ConvergenceDomain',
      sourceMap: true,
      external: [
        'rxjs/Rx',
        'rxjs/Observable'
      ],
      globals: {
        'rxjs/Rx': 'Rx',
        'rxjs/Observable': 'Rx'
      },
      plugins: [
        rollupTypescript({typescript: typescript})
      ]
    })
    .pipe(source("convergence-client.umd.js"))
    .pipe(vinyBuffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task('dist-amd', ["dist-ts", "lint", "test"], function () {
  return gulp.src('src/main/ts/ConvergenceDomain.ts', {read: false})
    .pipe(gulpRollup({
      rollup: rollup,
      format: 'amd',
      moduleName: 'ConvergenceDomain',
      sourceMap: true,
      exports: 'named',
      plugins: [
        rollupTypescript()
      ]
    }))
    .pipe(rename("convergence-client.amd.js"))
    .pipe(sourceMaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task('dist-es6', ["lint", "test"], function () {
  return gulp.src('src/main/ts/ConvergenceDomain.ts', {read: false})
    .pipe(gulpRollup({
      rollup: rollup,
      format: 'es6',
      moduleName: 'ConvergenceDomain',
      sourceMap: true,
      plugins: [
        rollupTypescript()
      ]
    }))
    .pipe(rename("convergence-client.es2015.js"))
    .pipe(sourceMaps.write("."))
    .pipe(gulp.dest("dist"));
});

function minify(src) {
  return src.pipe(sourceMaps.init())
    .pipe(uglify({
      mangleProperties: {
        regex: /(^_.*|.*Operation.*|.*transform.*|serverOp|clientOp)/
      }
    }))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest("dist"));
}

gulp.task('dist-umd-min', ['dist-umd'], function() {
  return minify(gulp.src("dist/convergence-client.umd.js"));
});

gulp.task('dist-amd-min', ['dist-amd'], function() {
  return minify(gulp.src("dist/convergence-client.amd.js"));
});

// gulp.task('dist', ["dist-umd-min", "dist-amd-min", "dist-es6", "copyPackage"], function(cb) {
gulp.task('dist', ["dist-umd-min", "copyPackage"], function(cb) {
  if (packageJson.version.endsWith('SNAPSHOT')) {
    return gulp.src('dist/package.json')
      .pipe(bump({version: packageJson.version + '.' + new Date().getTime()}))
      .pipe(gulp.dest('dist/'));
  }
});

gulp.task('copyPackage', function(){
    return gulp.src('./package.json')
        .pipe((gulp.dest('dist')));
});

/**
 * Removes all build artifacts.
 */
gulp.task('clean', function () {
  return del(['dist', "build"]);
});
