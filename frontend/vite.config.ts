import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { configDefaults } from 'vitest/config'

export default defineConfig(({ }) => {

	return {
		build: {
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




