import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Proxy vers l'API Spring Boot (développement ET aperçu du build).
  // En production, nginx fait le même relais : voir deploy/nginx/autoprime.conf
  //
  // La cible se règle avec VITE_API_PROXY (ex. .env) quand le port 8080 est
  // déjà pris sur la machine de dev (autre projet lancé en parallèle).
  const env = loadEnv(mode, process.cwd(), '')
  const cibleApi = env.VITE_API_PROXY?.trim() || 'http://localhost:8080'

  const proxyApi = {
    '/api': {
      target: cibleApi,
      changeOrigin: true,
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: proxyApi,
      hmr: { overlay: false },
    },
    preview: {
      port: 4173,
      proxy: proxyApi,
    },
  }
})
