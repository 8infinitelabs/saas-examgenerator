import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import eslint from 'vite-plugin-eslint';
import { checker } from 'vite-plugin-checker';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [
    react(), 
    viteTsconfigPaths(),
    eslint(),
    checker({
      typescript: true
    })
  ],
});
