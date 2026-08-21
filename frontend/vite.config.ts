import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import { configDefaults } from 'vitest/config'

// biome-ignore lint/correctness/noUnusedFunctionParameters: dont need it
export default defineConfig(({ mode }) => {
  const isDeployPreview = process.env.VITE_DEPLOY_CONTEXT === 'deploy_preview'

  return {
    build: {
      outDir: 'build',
      sourcemap: !isDeployPreview, // Disable sourcemaps for deploy previews
      minify: !isDeployPreview,
    },
    resolve: { tsconfigPaths: true },
    cache: true,
    server: {
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
            svgrPlugin(), // Keep only for non-preview environments
          ]),

      // Upload source maps to Sentry when auth token is available (dev/prod builds)
      ...(process.env.SENTRY_AUTH_TOKEN
        ? [
            sentryVitePlugin({
              org: 'morehouse-school-of-medicine',
              project: 'health-equity-tracker',
              authToken: process.env.SENTRY_AUTH_TOKEN,
              sourcemaps: { filesToDeleteAfterUpload: ['./build/**/*.map'] },
              // Without this the plugin throws and fails the build. Sentry
              // release tracking is a debugging aid and must never be able to
              // block a deploy. Covers release creation and source map upload.
              errorHandler: (err) => {
                console.warn('[sentry] step failed, continuing build:', err)
              },
            }),
          ]
        : []),
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
