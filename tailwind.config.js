const isDev = process.env.NODE_ENV ==='development';
module.exports = {
  content: [
    './index.html',
    './src/App.{pug,vue,ts,tsx}',
    './src/**/*.{vue,js,jsx,ts,tsx,pug}',
  ],
  theme: {
    maxHeight: {
      'half': '50vh',
    },
    extend: {
      border: {
        1: '1px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
