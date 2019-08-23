import {series, src, dest} from "gulp";
import bump from "gulp-bump";
import del from "del";
import rename from "gulp-rename";
import replace from "gulp-replace";
import ts from "gulp-typescript";
import tsLint from "gulp-tslint";
import mocha from "gulp-mocha";
import sourceMaps from "gulp-sourcemaps";
import uglify from 'gulp-uglify-es';
import rmLines from "gulp-rm-lines";
import fs from "fs";
import typescript from "typescript";
import header from 'gulp-header';
import shell from "gulp-shell";
import filter from 'gulp-filter-each';
import trim from "trim";
import insert from "gulp-insert";
import merge from "merge2";
import webpack from "webpack-stream";


const distInternalDir = "./dist-internal";
const distDir = "./dist";

function minify() {
  return src([`${distInternalDir}/*.js`, `!${distInternalDir}/*.min.js`])
    .pipe(sourceMaps.init())
    .pipe(uglify({
      mangle: {
        properties: {
          regex: /^_/
        }
      }
    }))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(sourceMaps.write("."))
    .pipe(dest(distInternalDir));
}

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

const docs = shell.task(['typedoc --options typedoc.config.json src/main/ts']);

const webpackBundle = () => {
  return merge(
    src('src/main/ts/index.ts')
      .pipe(webpack(require('./webpack/webpack.amd.config')))
      .pipe(dest(`${distInternalDir}`)),
    src('src/main/ts/index.ts')
      .pipe(webpack(require('./webpack/webpack.global.config')))
      .pipe(dest(`${distInternalDir}`))
  )
};

const rollupBundle = shell.task(['rollup -c']);

const injectVersion = () => {
  const packageJson = JSON.parse(fs.readFileSync("./dist-internal/package.json"));
  return src([`${distInternalDir}/**/*.js`])
    .pipe(replace('CONVERGENCE_CLIENT_VERSION', "" + packageJson.version))
    .pipe(dest(distInternalDir));
}

const compile = series(rollupBundle, webpackBundle, injectVersion);

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
  minify
);

const copyNpmJs = () => src(["./npmjs/**/*"]).pipe(dest(distDir));
const updateNpmJs = () => {
  const distInternalPackage = JSON.parse(fs.readFileSync("./dist-internal/package.json"));
  return src(["./dist/package.json"])
    .pipe(bump({version: distInternalPackage.version}))
    .pipe(dest(distDir));
};

const distCopyMin = () => {
  const headerTxt = fs.readFileSync("./copyright-header.txt");
  const distInternalPackage = JSON.parse(fs.readFileSync("./dist-internal/package.json"));
  return src([`${distInternalDir}/**/*.min.js`])
    .pipe(rmLines({
      'filters': [
        /\/\/# sourceMappingURL=.*/
      ]
    }))
    .pipe(header(headerTxt, {package: distInternalPackage}))
    .pipe(rename(path => {
      if (path.basename.endsWith(".min")) {
        path.basename = path.basename.substring(0, path.basename.length - 4);
      }
    }))
    .pipe(dest(`${distDir}`));
};

const copyTypes = () => src([`${distInternalDir}/typings/**/*`]).pipe(dest(`${distDir}/typings`));

const distNpmJs = series(copyNpmJs, updateNpmJs);

const test = () => {
  // Required because ts-node doesn't deal with ES6 module imports:
  // https://github.com/TypeStrong/ts-node/issues/617
  // process.env.TS_NODE_COMPILER_OPTIONS='{ \"module\": \"commonjs\" }';
  return src("src/test*/**/*Spec.ts")
    .pipe(mocha({
      reporter: "progress",
      require: ['ts-node/register']
    }));
};

const clean = () => del([distInternalDir, distDir, "coverage", ".nyc_output"]);
const dist = series(distInternal, distNpmJs, distCopyMin, copyTypes, docs);

export {
  typings,
  compile,
  test,
  lint,
  clean,
  distInternal,
  dist,
  docs,
}
