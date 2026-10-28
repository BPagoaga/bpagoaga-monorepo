import { defineConfig } from 'vite-plus';

// Read by `vp lint` and `vp test`: the package ships TypeScript sources, bundled by each consumer.
export default defineConfig({
  lint: {
    plugins: ['typescript', 'oxc'],
    rules: {
      eqeqeq: 'error',
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
