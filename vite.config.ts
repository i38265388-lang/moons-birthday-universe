import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset base so the production build works on any static host,
  // including project subpaths like https://<user>.github.io/<repo>/
  base: './',
  plugins: [react()],
});
