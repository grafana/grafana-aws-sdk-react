import resolve from '@rollup/plugin-node-resolve';
import path from 'path';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { externals } from 'rollup-plugin-node-externals';

const packagePath = './package.json';
const pkg = require(packagePath);

export default [
  {
    input: 'src/index.ts',
    plugins: [
      externals({
        deps: true,
        include: ['react', '@grafana/data', '@grafana/ui', 'lodash'],
        packagePath,
      }),
      resolve(),
      esbuild(),
    ],
    output: [
      {
        format: 'cjs',
        sourcemap: true,
        dir: path.dirname(pkg.publishConfig.main),
      },
      {
        format: 'esm',
        sourcemap: true,
        dir: path.dirname(pkg.publishConfig.module),
        preserveModules: true,
      },
    ],
  },
  {
    input: './compiled/index.d.ts',
    plugins: [dts()],
    output: {
      file: pkg.publishConfig.types,
      format: 'es',
    },
    watch: {
      exclude: './compiled/**',
    },
  },
];
