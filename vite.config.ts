import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        dyadComponentTagger(), 
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
          manifest: {
            name: 'Vigil',
            short_name: 'Vigil',
            description: 'A conspiracy-themed social network where users can share and discuss theories.',
            theme_color: '#0a0a0a',
            background_color: '#eff6ff',
            icons: [
              {
                src: 'logo.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: 'logo.png',
                sizes: '512x512',
                type: 'image/png',
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});