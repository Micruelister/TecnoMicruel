import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on the mode (development, production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose the backend URL to the client-side code
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.BACKEND_URL || 'http://127.0.0.1:5000')
    }
  }
})
