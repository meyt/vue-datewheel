import commonjs from 'rollup-plugin-commonjs'
import bundleSize from 'rollup-plugin-filesize'
import resolve from 'rollup-plugin-node-resolve'
import vue from 'rollup-plugin-vue'
import css from 'rollup-plugin-css-only'
import { terser } from "rollup-plugin-terser"
import scss from 'rollup-plugin-scss'
import pkg from './package.json'

const external = Object.keys(pkg.peerDependencies)
const isProduction = !process.env.ROLLUP_WATCH
const globals = { vue: 'Vue' }

const plugins = [
  resolve(),
  bundleSize(),
  commonjs(),
  scss({
    outputStyle: 'compressed',
  }),
  css(),
]

export default [
  // ESM build to be used with webpack/rollup.
  {
    external,
    plugins: [
      ...plugins,
      vue({
        template: {
          isProduction,
          compilerOptions: { preserveWhitespace: false }
        },
        css: false,
        compileTemplate: true
      })
    ],
    input: 'src/index.js',
    output: {
      format: 'esm',
      file: 'dist/vue-datewheel.js',
      globals
    }
  },
  // SSR build.
  {
    external,
    plugins: [
      ...plugins,
      vue({
        template: {
          isProduction,
          compilerOptions: { preserveWhitespace: false, optimizeSSR: true }
        },
        css: false,
        compileTemplate: true
      })
    ],
    input: 'src/index.js',
    output: [
      {
        format: 'cjs',
        file: 'dist/vue-datewheel.cjs.js',
        globals
      },
      {
        format: 'cjs',
        file: 'dist/vue-datewheel.cjs.min.js',
        globals,
        plugins: [terser()]
      }
    ]
  },
  // Browser build.
  {
    external,
    plugins: [
      ...plugins,
      vue({
        template: {
          isProduction,
          compilerOptions: { preserveWhitespace: false }
        }
      })
    ],
    input: 'src/index.js',
    output: [
      {
        format: 'iife',
        file: 'dist/vue-datewheel.iife.js',
        name: 'vueDatewheel',
        globals
      },
      {
        format: 'iife',
        file: 'dist/vue-datewheel.iife.min.js',
        name: 'vueDatewheel',
        globals,
        plugins: [terser()]
      }
    ]
  }
]
