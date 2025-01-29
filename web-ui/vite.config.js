import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

// import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  root: './',
  plugins: [react() /* , visualizer({ open: true }) */],
  server: {
    port: process.env.WEB_UI_PORT,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../public/web-ui-dist',
  },
});
