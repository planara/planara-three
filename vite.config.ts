// vite.config.ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({ insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'PlanaraThree',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: (id) => {
        return /^three($|\/)/.test(id);
      },
    },
  },
});
