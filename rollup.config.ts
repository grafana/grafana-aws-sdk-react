import resolve from '@rollup/plugin-node-resolve';
import { createRequire } from 'node:module';
import path from 'path';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { nodeExternals } from 'rollup-plugin-node-externals';

const rq = createRequire(import.meta.url);
const pkg = rq('./package.json');

const legacyOutputDefaults = {
  esModule: true,
  interop: 'compat',
};

export default [
  {
    input: 'src/index.ts',
    plugins: [
      nodeExternals({
        deps: true,
        include: ['react', '@emotion/css', '@grafana/data', '@grafana/ui', '@grafana/runtime', 'lodash'],
        packagePath: './package.json',
      }),
      resolve(),
      esbuild({
        target: 'es2018',
        tsconfig: 'tsconfig.build.json',
      }),
    ],
    output: [
      {
        format: 'cjs',
        sourcemap: true,
        dir: path.dirname(pkg.main),
        ...legacyOutputDefaults,
      },
      {
        format: 'esm',
        sourcemap: true,
        dir: path.dirname(pkg.module),
        preserveModules: true,
        preserveModulesRoot: './src',
        ...legacyOutputDefaults,
      },
    ],
  },
  {
    input: './compiled/index.d.ts',
    plugins: [dts()],
    output: {
      file: pkg.types,
      format: 'es',
    },
    watch: {
      exclude: './compiled/**',
    },
  },
];
