/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f4',
          100: '#dceee5',
          200: '#b8dccb',
          300: '#8bc4ab',
          400: '#5fa889',
          500: '#3d8b6d',
          600: '#2d7056',
          700: '#255a46',
          800: '#1f4838',
          900: '#1a3b2f',
        },
        earth: {
          50: '#f8f5f1',
          100: '#ede7dc',
          200: '#dccfb8',
          300: '#c7b08f',
          400: '#b3926c',
          500: '#9e7555',
          600: '#8a6249',
          700: '#724f3d',
          800: '#5e4336',
          900: '#4f382e',
        },
        sand: {
          50: '#faf9f7',
          100: '#f5f2ed',
          200: '#ebe5db',
          300: '#dfd4c3',
          400: '#cfbda4',
          500: '#bfa587',
          600: '#a88d6f',
          700: '#8b735c',
          800: '#73604e',
          900: '#5f5042',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
