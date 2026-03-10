/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: '#FFFBF1',
          gold: '#FFF2D0',
          pink: '#FFB2B2',
          coral: '#E36A6A',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #E36A6A 0%, #FFB2B2 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FFFBF1 0%, #FFF2D0 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1, scale: 1 },
          '50%': { opacity: 0.8, scale: 1.05 },
        }
      }
    },
  },
  plugins: [],
}