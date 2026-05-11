import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})