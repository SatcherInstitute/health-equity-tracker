import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { configDefaults } from 'vitest/config'
import { sentryVitePlugin } from "@sentry/vite-plugin";


// https://vitejs.dev/config/

export default defineConfig({
	build: {
		sourcemap: true,
		outDir: 'build',
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
		sentryVitePlugin({
			org: "https://healthequitytracker.org",
			project: "health-equity-tracker",

			// Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
			// and need `project:releases` and `org:read` scopes
			authToken: process.env.SENTRY_AUTH_TOKEN,
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
		coverage: {
			reporter: ['text', 'html'],
		},
	},
});
