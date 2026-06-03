import { resolve } from 'node:path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main',
      rollupOptions: { input: { index: resolve('src/main/index.ts') } }
    }
  },
  preload: {
    build: {
      outDir: 'out/preload',
      rollupOptions: { input: { index: resolve('src/preload/index.ts') } }
    }
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: { '@shared': resolve('src/shared') }
    },
    build: {
      outDir: 'out/renderer',
      rollupOptions: { input: { index: resolve('src/renderer/index.html') } }
    },
    plugins: [react()]
  }
})
