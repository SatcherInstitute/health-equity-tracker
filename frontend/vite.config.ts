import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults } from 'vitest/config'
import { METRIC_CONFIG } from './src/data/config/MetricConfig'

// biome-ignore lint/correctness/noUnusedFunctionParameters: dont need it
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
    server: {
      open: true,
      port: 3000,
    },
    plugins: [
      // After each build, write the topic list derived from METRIC_CONFIG into
      // the build output so the frontend server can serve it via GET /topics.
      {
        name: 'export-topics-json',
        closeBundle() {
          if (mode === 'test') return
          const topics = Object.values(METRIC_CONFIG)
            .flat()
            .map(({ dataTypeId, fullDisplayName }) => ({
              dataTypeId,
              fullDisplayName,
            }))
            .filter(
              ({ dataTypeId }, i, arr) =>
                arr.findIndex((t) => t.dataTypeId === dataTypeId) === i,
            )
          writeFileSync(
            resolve(__dirname, 'build/topics.json'),
            JSON.stringify(topics, null, 2),
          )
        },
      },
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
