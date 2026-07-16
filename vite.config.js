import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 5173,
    // Ne jamais basculer silencieusement sur un autre port : si 5173 est pris,
    // échouer avec un message clair (le script predev tue les instances zombies avant).
    strictPort: true,
    // Précompiler l'app dès le démarrage pour éviter les 30-60 s de première page à froid.
    warmup: {
      clientFiles: ['./src/main.jsx'],
    },
  },
})
