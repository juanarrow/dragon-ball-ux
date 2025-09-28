import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  base: '/dragon-ball-universe-explorer/', // Cambia esto por el nombre de tu repositorio
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    open: false
  }
})
