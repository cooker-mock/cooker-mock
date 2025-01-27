import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() /* , visualizer({ open: true }) */],
  server: {
    proxy: {
      '/': {
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
