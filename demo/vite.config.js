import path from 'path'
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [
    createVuePlugin(),
    Components({
      dirs: [path.join(__dirname, 'src')],
      directoryAsNamespace: true,
    }),
  ]
})
