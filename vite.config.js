import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : './',
  build: {
    outDir: process.env.VERCEL ? 'dist' : 'docs'
  },
  server: {
    port: 3000,
    open: false
  }
})
