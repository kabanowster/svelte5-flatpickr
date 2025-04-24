import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/index.js', format: 'cjs' },
    { file: 'dist/index.mjs', format: 'es' }
  ],
  plugins: [
    svelte({
      compilerOptions: {
        generate: 'dom' // For client-side rendering
      }
    }),
    resolve(),
    commonjs()
  ],
  external: ['svelte', 'svelte/internal', 'flatpickr', 'date-fns']
};