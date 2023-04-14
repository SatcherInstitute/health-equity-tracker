/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { configDefaults } from 'vitest/config'
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/

export default defineConfig(({ command, mode }) => {

	const env = loadEnv(mode, process.cwd(), '')

	return {
		build: {
			outDir: 'build',
			sourcemap: true, // Source map generation for Sentry
		},
		server: {
			open: true,
			port: 3000
		},
		plugins: [
			react({
				include: "**/*.tsx",
			}),
			viteTsconfigPaths(),
			svgrPlugin(),
			// Put the Sentry vite plugin after all other plugins
			sentryVitePlugin({
				org: "morehouse-school-of-medicine",
				project: "health-equity-tracker",

				// Specify the directory containing build artifacts
				include: "./dist",

				// Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
				// and needs the `project:releases` and `org:read` scopes
				authToken: env.SENTRY_AUTH_TOKEN,

				// Optionally uncomment the line below to override automatic release name detection
				// release: env.RELEASE,
			}),
		],
		test: {
			exclude: [
				...configDefaults.exclude,
				'playwright-tests/*'
			],
			globals: true,
			environment: 'jsdom',
			setupFiles: './src/setupTests.ts',
			deps: {
				inline: ['vitest-canvas-mock'],
			},
			coverage: {
				reporter: ['text', 'html'],
			},
		},
	}
});
