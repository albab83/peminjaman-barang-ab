import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./public/index.html',
	  ],
  plugins: [
    tailwindcss(),
    sveltekit(),
	
  ],
});