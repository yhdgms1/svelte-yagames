import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/actions/index.ts', 'src/utilities/index.ts', 'src/reset.css'],
  format: ['esm'],
  external: ['svelte'],
  target: ['esnext'],
  platform: 'browser',

  splitting: true,
  bundle: false,

  clean: true,

  esbuildPlugins: [
  ],

  loader: {
    '.svelte': 'file'
  },

  // dts: true,
})