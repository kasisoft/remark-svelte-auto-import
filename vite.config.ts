import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
            "$main": fileURLToPath(new URL('./src/main', import.meta.url)),
            "$test": fileURLToPath(new URL('./src/test', import.meta.url))
        }
    },
    base: "/"
});
