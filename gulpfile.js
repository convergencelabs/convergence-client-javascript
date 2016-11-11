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

// fixme I think the external and gloabs might not be needed anymore.
const baseRollupConfig = {
  entry: 'src/main/ts/ConvergenceDomain.ts',
  rollup: rollup,
  format: 'umd',
  moduleName: 'ConvergenceDomain',
  sourceMap: true,
  external: [
    'rxjs/Rx',
    'rxjs/Observable',
    'rxjs/Subject',
    'rxjs/BehaviorSubject'
  ],
  globals: {
    'rxjs/Rx': 'Rx',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/BehaviorSubject': 'Rx'
  },
  plugins: [
    rollupTypescript({typescript: typescript})
  ]
};

gulp.task('dist-umd', ["dist-ts", "lint", "test"], function () {
  const config = Object.assign({}, baseRollupConfig);
  config.format = 'umd';
  config.exports = "default";

  return rollupStream(config)
    .pipe(source("dist/umd/convergence.js"))
    .pipe(vinyBuffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("."))
    .pipe(gulp.dest("./"));
});

gulp.task('dist-cjs', ["dist-ts", "lint", "test"], function () {
  const config = Object.assign({}, baseRollupConfig);
  config.format = 'cjs';
  config.exports = "named";

  return rollupStream(config)
    .pipe(source("dist/cjs/convergence.js"))
    .pipe(vinyBuffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("."))
    .pipe(gulp.dest("./"));
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
    }));
}

gulp.task('dist-umd-min', ['dist-umd'], function () {
  return minify(gulp.src("dist/umd/convergence.js")).pipe(gulp.dest("dist/umd"));
});

gulp.task('dist-cjs-min', ['dist-cjs'], function () {
  return minify(gulp.src("dist/cjs/convergence.js")).pipe(gulp.dest("dist/cjs"));
});

gulp.task('dist', ["dist-cjs-min", "dist-umd-min", "copyPackage"], function (cb) {
  if (packageJson.version.endsWith('SNAPSHOT')) {
    return gulp.src('dist/package.json')
      .pipe(bump({version: packageJson.version + '.' + new Date().getTime()}))
      .pipe(gulp.dest('dist/'));
  }
});

gulp.task('copyPackage', function () {
  return gulp.src('./package.json')
    .pipe((gulp.dest('dist')));
});

/**
 * Removes all build artifacts.
 */
gulp.task('clean', function () {
  return del(['dist', "build", "coverage"]);
});
