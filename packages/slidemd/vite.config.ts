import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

import path from 'path'
import { defineConfig } from 'vite'

import { slidemd } from './src/lib'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		svelte({
			extensions: ['.svelte', '.md'],
			preprocess: [slidemd(), vitePreprocess()]
		})
	],
	resolve: {
		alias: {
			'@slidemd/slidemd': path.resolve(__dirname, './src/lib')
		}
	}
})
