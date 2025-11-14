import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';
// PWA removido

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
  return {
      build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
          onwarn(warning, warn) {
            // Suprimir avisos que não são erros críticos
            if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
            warn(warning);
          },
        },
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Proxy de desenvolvimento para contornar CORS em hosts externos específicos
          '/proxy/w3': {
            target: 'https://www.w3schools.com',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/proxy\/w3/, ''),
          },
        }
      },
      plugins: [
        !isProduction && dyadComponentTagger(), 
        react(),
        // PWA removido
        viteStaticCopy({
          targets: [
            {
              src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
              dest: ''
            }
          ],
          structured: true,
          silent: false
        })
      ].filter(Boolean),
      define: {
        // Removido: Chaves API não devem ser expostas no frontend
        // Use o serviço SecureApiService para chamadas seguras
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
