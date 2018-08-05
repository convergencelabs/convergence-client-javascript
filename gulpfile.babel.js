import {series, src, dest} from "gulp";
import bump from "gulp-bump";
import concat from "gulp-concat";
import del from "del";
import rename from "gulp-rename";
import ts from "gulp-typescript";
import tsLint from "gulp-tslint";
import mocha from "gulp-mocha";
import rollup from "rollup";
import rollupTypescript2 from "rollup-plugin-typescript2";
import sourceMaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import fs from "fs";
import typescript from "typescript";
import rollupStream from "rollup-stream";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import header from 'gulp-header';

const npmPackageJson = JSON.parse(fs.readFileSync("./npmjs/package.json"));

const distInternalDir = "./dist-internal";
const distDir = "./dist";

function minify(source, destination) {
  const headerTxt = fs.readFileSync("./copyright-header.txt");
  return src(source)
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
    .pipe(dest(destination));
}

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
      rollupTypescript2({
        typescript: typescript,
        tsconfigOverride: {
          compilerOptions: {
            module: "ES2015"
          }
        }
      })
    ]
  };
}

const typings = () =>
  src("./api/**/*")
    .pipe(dest(`${distInternalDir}/typings`));

const distCjsMin = () => {
  return minify(`${distInternalDir}/convergence.js`, `${distInternalDir}`);
};

const distCjs = () => {
  const config = generateRollUpConfig("cjs");

  // The sourcemaps below are mapping back to the typescript files.
  return rollupStream(config)
    .pipe(source(`${distInternalDir}/convergence.js`))
    .pipe(buffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("."))
    .pipe(dest("./"));
};

const distUmd = () => {
  const config = generateRollUpConfig("umd");
  return rollupStream(config)
    .pipe(source(`${distInternalDir}/browser/convergence.js`))
    .pipe(buffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("."))
    .pipe(dest("./"));
};

const distUmdBundle = () =>
  src(["node_modules/rxjs/bundles/Rx.js", `${distInternalDir}/browser/convergence.js`])
    .pipe(concat("convergence-all.js"))
    .pipe(dest(`${distInternalDir}/browser`));

const distUmdMin = () => {
  return minify(
    `${distInternalDir}/browser/convergence.js`,
    `${distInternalDir}/browser`);
};

const distUmdBundleMin = () => {
  const files = ["node_modules/rxjs/bundles/Rx.min.js", `${distInternalDir}/browser/convergence.min.js`];
  return src(files)
    .pipe(concat("convergence-all.min.js"))
    .pipe(dest(`${distInternalDir}/browser`));
};

const lint = () =>
  src(["src/**/*.ts", "api/**/*.ts"])
    .pipe(tsLint({formatter: "prose"}))
    .pipe(tsLint.report());

const copyPackage = () => src("./package.json").pipe(dest(distInternalDir));
const bumpPacakgeVersion = (cb) => {
  const packageJson = JSON.parse(fs.readFileSync("./package.json"));
  if (packageJson.version.endsWith("SNAPSHOT")) {
    return src(`${distInternalDir}/package.json`)
      .pipe(bump({version: packageJson.version + "." + new Date().getTime()}))
      .pipe(dest(distInternalDir));
  } else {
    cb();
  }
};

const distInternal = series(
  typings,
  distCjs,
  distCjsMin,
  distUmd,
  distUmdMin,
  distUmdBundle,
  distUmdBundleMin,
  copyPackage,
  bumpPacakgeVersion
);

const copyNpmJs = () => src(["./npmjs/**/*"]).pipe(dest(distDir));
const distCopyMin = () => src([`${distInternalDir}/**/*.min.js`])
  .pipe(rename(path => {
    if (path.basename.endsWith(".min")) {
      path.basename = path.basename.substring(0, path.basename.length - 4);
    }
  }))
  .pipe(dest(`${distDir}`));
const copyTypings = () => src([`${distInternalDir}/typings/**/*`]).pipe(dest(`${distDir}/typings`));

const distNpmJs = series(copyNpmJs, distCopyMin, copyTypings);

const test = () =>
  src("src/test*/**/*Spec.ts")
    .pipe(mocha({
      reporter: "progress",
      require: ['ts-node/register']
    }));

const validateApi = () => {
  const tsProject = ts.createProject("tsconfig.json");
  return src(["api/**/*.d.ts"])
    .pipe(tsProject());
};

const clean = () => del([distInternalDir, distDir, "build", "coverage", ".nyc_output"]);
const dist = series(distInternal, distNpmJs, validateApi);

export {
  typings,
  test,
  lint,
  clean,
  validateApi,
  distInternal,
  dist
}
