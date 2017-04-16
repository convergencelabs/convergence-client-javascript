const gulp = require("gulp");
const bump = require("gulp-bump");
const concat = require("gulp-concat");
const del = require("del");
const merge = require("merge2");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const ts = require("gulp-typescript");
const tsLint = require("gulp-tslint");
const istanbul = require("gulp-istanbul");
const mocha = require("gulp-mocha");
const rollup = require("rollup");
const rollupTypescript = require("rollup-plugin-typescript");
const sourceMaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const fs = require("fs");
const typescript = require("typescript");
const rollupStream = require("rollup-stream");
const source = require("vinyl-source-stream");
const vinyBuffer = require("vinyl-buffer");
const mkdirp = require("mkdirp");
const header = require('gulp-header');

const packageJson = JSON.parse(fs.readFileSync("./package.json"));
const npmPackageJson = JSON.parse(fs.readFileSync("./npmjs/package.json"));

const distInternal = "./dist-internal";
const dist = "./dist";

gulp.task("default", ["dist"]);

gulp.task("dist", ["dist-internal", "dist-npmjs", "validate-api"], function (cb) {

});

gulp.task("dist-internal",
  ["dist-typings", "dist-cjs-min", "dist-umd-min", "dist-umd-bundle", "dist-umd-bundle-min", "copy-package"],
  function () {
    if (packageJson.version.endsWith("SNAPSHOT")) {
      return gulp.src(`${distInternal}/package.json`)
        .pipe(bump({version: packageJson.version + "." + new Date().getTime()}))
        .pipe(gulp.dest(distInternal));
    }
  });

gulp.task("dist-typings", function () {
  return gulp.src("./api/**/*")
    .pipe(gulp.dest(`${distInternal}/typings`));
});

gulp.task("dist-cjs-min", ["dist-cjs"], function () {
  return minify(`${distInternal}/convergence.js`, `${distInternal}`);
});

gulp.task("dist-cjs", ["lint", "test"], function () {
  const config = generateRollUpConfig("cjs");

  // The sourcemaps below are mapping back to the typescript files.
  return rollupStream(config)
    .pipe(source(`${distInternal}/convergence.js`))
    .pipe(vinyBuffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("."))
    .pipe(gulp.dest("./"));
});

gulp.task("dist-umd", ["lint", "test"], function () {
  const config = generateRollUpConfig("umd");
  return rollupStream(config)
    .pipe(source(`${distInternal}/browser/convergence.js`))
    .pipe(vinyBuffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("."))
    .pipe(gulp.dest("./"));
});

gulp.task("dist-umd-bundle", ["dist-umd"], function () {
  return gulp.src(["node_modules/rxjs/bundles/Rx.js", "./dist/browser/convergence.js"])
    .pipe(concat("convergence-all.js"))
    .pipe(gulp.dest(`${distInternal}/browser`));
});

gulp.task("dist-umd-min", ["dist-umd"], function () {
  return minify(
    `${distInternal}/browser/convergence.js`,
    `${distInternal}/browser`);
});

gulp.task("dist-umd-bundle-min", ["dist-umd-min"], function () {
  const files = ["node_modules/rxjs/bundles/Rx.min.js", `${distInternal}/browser/convergence.min.js`];
  return gulp.src(files)
    .pipe(concat("convergence-all.min.js"))
    .pipe(gulp.dest(`${distInternal}/browser`));
});

gulp.task("lint", function () {
  return gulp.src(["src/**/*.ts", "api/**/*.ts"])
    .pipe(tsLint({formatter: "prose"}))
    .pipe(tsLint.report());
});

gulp.task("copy-package", function () {
  return gulp.src("./package.json")
    .pipe(gulp.dest(distInternal));
});

gulp.task("dist-npmjs", ["dist-internal", "copy-npmjs"], function (cb) {
  return merge([
    gulp.src([`${distInternal}/**/*.min.js`])
      .pipe(rename(function (path) {
        if (path.basename.endsWith(".min")) {
          path.basename = path.basename.substring(0, path.basename.length - 4);
        }
      }))
      .pipe(gulp.dest(`${dist}`)),
    gulp.src([`${distInternal}/typings/**/*`]).pipe(gulp.dest(`${dist}/typings`))
  ]);
});

gulp.task("copy-npmjs", function (cb) {
  return gulp.src(["./npmjs/**/*"]).pipe(gulp.dest(dist));
});

gulp.task("test", ["test-build"], function () {
  return gulp.src("build/test*/**/*.js")
    .pipe(mocha({reporter: "progress"}));
});

gulp.task("test-build", [], function () {
  const tsProject = ts.createProject("tsconfig.json");

  // We need this here because we need to create the d.ts, but we
  // can"t put this in the tsconfig because the other steps bomb out.
  tsProject.options.declaration = true;

  const tsResult = gulp.src(["src/**/*.ts"])
    .pipe(tsProject());

  return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done.
    tsResult.dts.pipe(gulp.dest("build")),
    tsResult.js.pipe(gulp.dest("build"))
  ]);
});

gulp.task("coverage", ["test-build"], function () {
  return gulp.src("build/**/*.js")
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on("finish", function () {
      gulp.src("build/test*/**/*.js")
        .pipe(mocha({reporter: "progress"}))
        .pipe(istanbul.writeReports()) // Creating the reports after tests run
        .on("finish", function () {
          process.chdir(__dirname);
        });
    });
});

gulp.task("clean", function () {
  return del(["dist-internal", "dist", "build", "coverage"]);
});

function minify(src, dest) {
  const headerTxt = fs.readFileSync("./copyright-header.txt");
  return gulp.src(src)
    .pipe(sourceMaps.init())
    .pipe(uglify({
      mangleProperties: {
        regex: /(^_.*|.*Operation.*|.*transform.*|serverOp|clientOp)/
      }
    }))
    .pipe(header(headerTxt, {package: npmPackageJson}))
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(sourceMaps.write("."))
    .pipe(gulp.dest(dest));
}

gulp.task("validate-api", function () {
  const tsProject = ts.createProject("tsconfig.json");

  return gulp.src(["api/**/*.d.ts"])
    .pipe(tsProject());
});

function generateRollUpConfig(format) {
  return {
    entry: "src/main/ts/index.ts",
    rollup: rollup,
    format: format,
    exports: "named",
    moduleName: "Convergence",
    sourceMap: true,
    external: [
      "rxjs/Rx",
      "rxjs/Observable",
      "rxjs/Subject",
      "rxjs/BehaviorSubject"
    ],
    globals: {
      "rxjs/Rx": "Rx",
      "rxjs/Observable": "Rx",
      "rxjs/Subject": "Rx",
      "rxjs/BehaviorSubject": "Rx"
    },
    plugins: [
      rollupTypescript({typescript: typescript})
    ]
  };
}
