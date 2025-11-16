import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [
        tsconfigPaths(),
        dts({ insertTypesEntry: true })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'PlanaraCore',
            fileName: (format) => `index.${format}.js`,
            formats: ['es', 'cjs', 'umd']
        },
        rollupOptions: {
            external: ['ogl'],
            output: {
                globals: {
                    ogl: 'OGL'
                }
            }
        }
    }
});