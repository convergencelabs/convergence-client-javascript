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
import shell from "gulp-shell";
import filter from 'gulp-filter-each';
import trim from "trim";
import insert from "gulp-insert";

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
    input: "src/main/ts/index.ts",
    rollup: rollup,
    format: format,
    exports: "named",
    name: "Convergence",
    sourcemap: true,
    external: [
      "rxjs",
      "rxjs/operators"
    ],
    globals: {
      "rxjs": "rxjs",
      "rxjs/operators": "rxjs.operators"
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
    .pipe(source(`${distInternalDir}/umd/convergence.js`))
    .pipe(buffer())
    .pipe(sourceMaps.init({loadMaps: true}))
    .pipe(sourceMaps.write("."))
    .pipe(dest("./"));
};

const distUmdBundle = () =>
  src(["node_modules/rxjs/bundles/rxjs.umd.js", `${distInternalDir}/umd/convergence.js`])
    .pipe(concat("convergence-all.js"))
    .pipe(dest(`${distInternalDir}/umd`));

const distUmdMin = () => {
  return minify(
    `${distInternalDir}/umd/convergence.js`,
    `${distInternalDir}/umd`);
};

const distUmdBundleMin = () => {
  const files = ["node_modules/rxjs/bundles/rxjs.umd.min.js", `${distInternalDir}/umd/convergence.min.js`];
  return src(files)
    .pipe(concat("convergence-all.min.js"))
    .pipe(dest(`${distInternalDir}/umd`));
};

const lint = () =>
  src(["src/**/*.ts"])
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

const docs =
  shell.task([
    'typedoc --options typedoc.config.json src/main/ts',
  ]);

const tsDeclarations = () => {
  const exportFilter = "export {};";
  const tsProject = ts.createProject("tsconfig.json", {
    declaration: true,
    typescript: typescript
  });

  return src("src/main/ts/**/*.ts")
    .pipe(tsProject())
    .dts
    .pipe(filter(content => trim(content) !== exportFilter))
    .pipe(dest("dist-internal/typings"));
};

const declarationsNamedExport = () =>
  src("./dist-internal/typings/index.d.ts")
    .pipe(insert.append("\nexport as namespace Convergence;"))
    .pipe(dest("./dist-internal/typings"));

const typings = series(tsDeclarations, declarationsNamedExport);

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
const copyTypes = () => src([`${distInternalDir}/typings/**/*`]).pipe(dest(`${distDir}/typings`));

const distNpmJs = series(copyNpmJs, distCopyMin, copyTypes);

const test = () =>
  src("src/test*/**/*Spec.ts")
    .pipe(mocha({
      reporter: "progress",
      require: ['ts-node/register']
    }));

const clean = () => del([distInternalDir, distDir, "coverage", ".nyc_output"]);
const dist = series(distInternal, distNpmJs, docs);

export {
  typings,
  test,
  lint,
  clean,
  distInternal,
  dist,
  docs,
}
