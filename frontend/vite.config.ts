import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const isDeployPreview = process.env.VITE_DEPLOY_CONTEXT === 'deploy_preview'

  return {
    build: {
      outDir: 'build',
      sourcemap: !isDeployPreview, // Disable sourcemaps for deploy previews
      minify: !isDeployPreview,

      rollupOptions: isDeployPreview
        ? {
            output: {
              manualChunks: undefined, // Disable code splitting for deploy previews
            },
          }
        : {},
    },
    cache: true,
    server: isDeployPreview
      ? {} // Keep minimal config for deploy previews
      : {
          open: true,
          port: 3000,
        },
    plugins: [
      react({
        include: '**/*.tsx',
      }),

      // Only use essential plugins for deploy previews
      ...(isDeployPreview
        ? []
        : [
            viteTsconfigPaths(), // Keep only for non-preview environments
            svgrPlugin(), // Keep only for non-preview environments
            visualizer({
              open: !process.env.CI,
              gzipSize: true,
              brotliSize: true,
            }),
          ]),
    ],
    test: {
      exclude: [...configDefaults.exclude, 'playwright-tests/*'],
      globals: true,
      environment: 'jsdom', // allows Vitest access to DOM stuff like window and render
      setupFiles: './src/setupTests.ts',
      coverage: {
        reporter: ['text', 'html'],
      },
      // Optionally, disable tests during deploy preview for faster builds
      ...(isDeployPreview ? { run: false } : {}),
    },
    // Conditional settings based on the VITE_DEPLOY_CONTEXT
    ...(isDeployPreview
      ? {
          logLevel: 'warn', // Reduce logging for deploy preview builds
        }
      : {}),
  }
})
