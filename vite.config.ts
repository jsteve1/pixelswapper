import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		target: 'esnext',
		outDir: 'build',
		rollupOptions: {
			input: {
				popup: 'static/popup.html'
			},
			output: {
				dir: 'build',
				format: 'es',
				entryFileNames: '[name].js',
				chunkFileNames: '[name]-[hash].js',
				assetFileNames: '[name][extname]'
			}
		},
		sourcemap: true
	},
	server: {
		fs: {
			strict: false
		}
	}
}); 