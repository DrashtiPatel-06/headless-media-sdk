import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const pkg = (name: string) => fileURLToPath(new URL(`../../packages/${name}/src/index.ts`, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // SDK packages are consumed from source so the web app is the only npm workspace
    alias: {
      '@owl-media/media-core': pkg('media-core'),
      '@owl-media/media-react': pkg('media-react'),
      '@owl-media/media-ui-react': pkg('media-ui-react'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
