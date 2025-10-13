import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLibraryMode = mode === 'library';

  if (isLibraryMode) {
    // Library build configuration
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': resolve(__dirname, './src'),
        },
      },
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.tsx'),
          name: 'NanoVNASWRAnalyser',
          fileName: 'nanovna-swr-analyser',
          formats: ['es', 'umd'],
        },
        rollupOptions: {
          // Make sure to externalize deps that shouldn't be bundled
          external: ['react', 'react-dom'],
          output: {
            // Provide global variables to use in the UMD build
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
    };
  }

  // Development/standard build configuration
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          standalone: resolve(__dirname, 'standalone.html'),
        },
      },
    },
  };
});