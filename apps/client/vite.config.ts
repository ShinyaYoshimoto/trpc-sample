import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // GitHub Codespaces のポート転送ドメインからのアクセスを許可
    allowedHosts: ['.app.github.dev'],
    proxy: {
      '/trpc': {
        target: 'http://localhost:4000',
      },
    },
  },
})
