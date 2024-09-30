import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgrPlugin from 'vite-plugin-svgr'
import { configDefaults } from 'vitest/config'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      sourcemap: true,
    },
    server: {
      open: true,
      port: 3000,
    },
    plugins: [
      react({
        include: '**/*.tsx',
      }),
      viteTsconfigPaths(),
      svgrPlugin(),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    test: {
      exclude: [...configDefaults.exclude, 'playwright-tests/*'],
      globals: true,
      environment: 'jsdom', // allows Vitest access to DOM stuff like window and render
      setupFiles: './src/setupTests.ts',
      coverage: {
        reporter: ['text', 'html'],
      },
    },
  }
})
