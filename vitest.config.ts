import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
            "$main": fileURLToPath(new URL('./src/main', import.meta.url)),
            "$test": fileURLToPath(new URL('./src/test', import.meta.url))
        }
    },
    base: "/",
    test: {
        coverage: {
            reporter: ['text', 'html', 'lcov'],
            provider: 'istanbul',   /* v8 generates an error */
            include: ['src/main'],
            // lines: 80,
            // functions: 80,
            // branches: 80,
        }
    }
});
