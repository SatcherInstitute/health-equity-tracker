/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import { configDefaults } from 'vitest/config'

// https://vitejs.dev/config/

export default defineConfig({
	build: {
		outDir: 'build',
	},
	server: {
		open: true,
		port: 3000
	},
	plugins: [
		react(), viteTsconfigPaths(), svgrPlugin(),
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
});
