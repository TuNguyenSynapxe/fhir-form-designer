import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Widget build configuration
  if (mode === 'widget') {
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/widget/index.ts'),
          name: 'FhirWidget',
          fileName: (format) => `fhir-widget.${format}.js`
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            exports: 'auto',
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            },
            assetFileNames: 'fhir-widget.css'
          }
        },
        outDir: 'dist-widget',
        emptyOutDir: true,
        cssCodeSplit: false,
        minify: false
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    }
  }

  // Main app build configuration (default)
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  }
})
