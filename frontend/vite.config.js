import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode (e.g., development or production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: env.VITE_PORT || 5173, // Default to port 5173 if VITE_PORT is not defined
      host: env.VITE_HOST || 'localhost', // Default to localhost if VITE_HOST is not defined
      proxy: {
        '/api': {
          target: env.VITE_API_URL || `http://${env.VITE_API_HOST}:${env.VITE_API_PORT}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'), // Alias for the src directory
      },
    },
    build: {
      outDir: 'build', // Output directory for the build
    },
  };
});