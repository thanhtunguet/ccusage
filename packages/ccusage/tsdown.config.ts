import { defineConfig } from 'tsdown';
import Macros from 'unplugin-macros/rolldown';

export default defineConfig({
	entry: './src/index.ts',
	outDir: 'dist',
	format: 'esm',
	clean: true,
	sourcemap: false,
	dts: false, 
	minify: 'dce-only',
	treeshake: true,
	noExternal: ['@ccusage/core'],
	plugins: [
		Macros({
			include: ['src/index.ts'],
		}),
	],
	define: {
		'import.meta.vitest': 'undefined',
	},
});
