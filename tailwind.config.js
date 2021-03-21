module.exports = {
  purge: [
    './src/**/*.vue',
  ],
  darkMode: false, // or 'media' or 'class'
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
