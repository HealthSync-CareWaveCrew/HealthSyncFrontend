// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          1: '#E36A6A',
          2: '#FFB2B2',
          3: '#FFF2D0',
          4: '#FFFBF1',
        },
        dark: '#2c2c2c',
        'bg-dark': '#0a0a0a',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'scroll': 'scrollAnim 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        scrollAnim: {
          '0%': { opacity: '1', top: '10px' },
          '100%': { opacity: '0', top: '25px' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}