import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { configDefaults } from 'vitest/config'
import { sentryVitePlugin } from "@sentry/vite-plugin";


export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory; local builds are `production`.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const env = loadEnv(mode, process.cwd(), '')
	// we only want the source maps created from npm build to upload to Sentry when Netlify builds from the `main` branch
	// this avoids pushing sourcemaps for local development / deploy previews, and also bypasses dealing with passing
	// secrets into docker images for dev / prod builds
	const sentryAuthToken = env.BRANCH === 'main' ? env.SENTRY_AUTH_TOKEN : ""

	return {
		build: {
			outDir: 'build',
			sourcemap: true
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
				org: env.SENTRY_ORG,
				project: env.SENTRY_PROJECT,
				// Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
				// and need `project:releases` and `org:read` scopes
				authToken: sentryAuthToken,
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
	}
})




