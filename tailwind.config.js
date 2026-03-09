/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          1: '#E36A6A',   // primary-1
          2: '#FFB2B2',   // primary-2
          3: '#FFF2D0',   // primary-3
          4: '#FFFBF1',   // primary-4
        },
      },
    },
  },
  plugins: [],
}