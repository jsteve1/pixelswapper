import adapter from 'sveltekit-adapter-chrome-extension';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Chrome extension adapter options
			manifest: 'static/manifest.json',
			fallback: 'index.html',
			enableBackgroundScript: true
		}),
		appDir: 'app',
		paths: {
			base: '',
			relative: false
		},
		prerender: {
			entries: ['/']
		},
		alias: {
			$lib: './src/lib'
		}
	},
	preprocess: vitePreprocess()
};

export default config; 