import {series, src, dest} from "gulp";
import bump from "gulp-bump";
import concat from "gulp-concat";
import del from "del";
import rename from "gulp-rename";
import ts from "gulp-typescript";
import tsLint from "gulp-tslint";
import mocha from "gulp-mocha";
import sourceMaps from "gulp-sourcemaps";
import uglify from 'gulp-uglify-es';
import fs from "fs";
import typescript from "typescript";
import header from 'gulp-header';
import shell from "gulp-shell";
import filter from 'gulp-filter-each';
import trim from "trim";
import insert from "gulp-insert";


const distInternalDir = "./dist-internal";
const distDir = "./dist";

function minify(source, destination) {
  const distInternalPackage = JSON.parse(fs.readFileSync("./dist-internal/package.json"));
  const headerTxt = fs.readFileSync("./copyright-header.txt");
  return src(source)
    .pipe(sourceMaps.init())
    .pipe(uglify({
      mangle: {
        properties: {
          regex: /(^_.*|.*transform.*|serverOp|clientOp)/
        }
      }
    }))
    .pipe(header(headerTxt, {package: distInternalPackage}))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(sourceMaps.write("."))
    .pipe(dest(destination));
}

const distUmdBundle = () =>
  src([
    "node_modules/rxjs/bundles/rxjs.umd.js",
    "node_modules/long/dist/long.js",
    "node_modules/protobufjs/dist/light/protobuf.js",
    `${distInternalDir}/umd/convergence.js`])
    .pipe(concat("convergence-all.js"))
    .pipe(dest(`${distInternalDir}/umd`));

const minifyUmd = () => {
  return minify(
    `${distInternalDir}/bundles/convergence.umd.js`,
    `${distInternalDir}/bundles`);
};

const minifyAmd = () => {
  return minify(
    `${distInternalDir}/bundles/convergence.amd.js`,
    `${distInternalDir}/bundles`);
};

const minifyGlobal = () => {
  return minify(
    `${distInternalDir}/bundles/convergence.global.js`,
    `${distInternalDir}/bundles`);
};

const minifyCommonJs = () => {
  return minify(
    `${distInternalDir}/convergence.js`,
    `${distInternalDir}/`);
};

const minifyEsModule = () => {
  return minify(
    `${distInternalDir}/convergence.mjs`,
    `${distInternalDir}/`);
};

const distUmdBundleMin = () => {
  const files = [
    "node_modules/rxjs/bundles/rxjs.umd.min.js",
    "node_modules/long/dist/long.js",
    "node_modules/protobufjs/dist/light/protobuf.min.js",
    `${distInternalDir}/umd/convergence.min.js`
  ];
  return src(files)
    .pipe(concat("convergence-all.min.js"))
    .pipe(dest(`${distInternalDir}/umd`));
};

const lint = () =>
  src(["src/**/*.ts"])
    .pipe(tsLint({formatter: "prose"}))
    .pipe(tsLint.report());

const copyPackage = () => src("./package.json").pipe(dest(distInternalDir));
const bumpPackageVersion = (cb) => {
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

const compile =
  shell.task([
    'rollup -c',
  ]);

const tsDeclarations = () => {
  const exportFilter = "export {};";
  const tsProject = ts.createProject("tsconfig.json", {
    declaration: true,
    typescript: typescript
  });

  return src(["src/main/ts/**/*.ts", "!src/main/ts/model/rt/richtext/**/*"])
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
  copyPackage,
  bumpPackageVersion,
  typings,
  compile,
  minifyUmd,
  minifyAmd,
  minifyGlobal,
  minifyCommonJs,
  minifyEsModule
);

const copyNpmJs = () => src(["./npmjs/**/*"]).pipe(dest(distDir));
const bumpNpmJs = () => {
  const distInternalPackage = JSON.parse(fs.readFileSync("./dist-internal/package.json"));
  return src(["./dist/package.json"])
    .pipe(bump({version: distInternalPackage.version}))
    .pipe(dest(distDir));
}

const distCopyMin = () => src([`${distInternalDir}/**/*.min.js`, `${distInternalDir}/**/*.min.mjs`])
  .pipe(rename(path => {
    if (path.basename.endsWith(".min")) {
      path.basename = path.basename.substring(0, path.basename.length - 4);
    }
  }))
  .pipe(dest(`${distDir}`));
const copyTypes = () => src([`${distInternalDir}/typings/**/*`]).pipe(dest(`${distDir}/typings`));

const distNpmJs = series(copyNpmJs, bumpNpmJs, distCopyMin, copyTypes);

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
