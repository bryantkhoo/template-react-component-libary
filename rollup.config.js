import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import generatePackageJson from "rollup-plugin-generate-package-json";
import css from "rollup-plugin-import-css";
import { getFolders } from "./scripts/buildUtils";

const packageJson = require("./package.json");

const plugins = [
  css(),
  peerDepsExternal(),
  resolve(),
  replace({
    __IS_DEV__: process.env.NODE_ENV === "development",
  }),
  commonjs(),
  typescript({
    tsconfig: "./tsconfig.json",
    useTsconfigDeclarationDir: true,
  }),
  terser(),
];
const subfolderPlugins = (folderName) => [
  ...plugins,
  generatePackageJson({
    baseContents: {
      name: `${packageJson.name}/${folderName}`,
      private: true,
      main: "../cjs/index.js",
      module: "./index.js",
      types: "./index.d.ts",
    },
  }),
];
const folderBuilds = getFolders("./src").map((folder) => {
  return {
    input: `src/${folder}/index.ts`,
    output: {
      file: `dist/${folder}/index.js`,
      sourcemap: true,
      exports: "named",
      format: "esm",
    },
    plugins: subfolderPlugins(folder),
    external: ["react", "react-dom"],
  };
});

export default [
  {
    input: ["src/index.ts"],
    output: [
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins,
    external: ["react", "react-dom"],
  },
  ...folderBuilds,
  {
    input: ["src/index.ts"],
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins,
    external: ["react", "react-dom"],
  },
];
