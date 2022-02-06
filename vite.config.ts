import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  const tailwind = command === 'serve' ? 'tailwind-sketch.css' : 'tailwind.css';
  return {
    server: {
      host: true,
    },
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
  };
});
