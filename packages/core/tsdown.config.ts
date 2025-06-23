import NodeExternals from 'rollup-plugin-node-externals';
import { defineConfig } from 'tsdown';
import Macros from 'unplugin-macros/rolldown';

export default defineConfig({
	entry: [
		'./src/*.ts',
		'!./src/**/*.test.ts', // Exclude test files
	],
	outDir: 'dist',
	format: ['esm', 'cjs'],
	clean: true,
	sourcemap: false,
	minify: 'dce-only',
	treeshake: true,
	unbundle: true, // Use unbundle mode for library
	dts: {
		tsgo: true,
		resolve: ['type-fest'],
	},
	publint: true,
	unused: true,
	exports: true,
	plugins: [
		Macros({
			include: ['src/pricing-fetcher.ts'],
		}),
	],
	define: {
		'import.meta.vitest': 'undefined',
	},
});