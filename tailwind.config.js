/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      sm: '0.8rem'
    },
    extend: {
      height: {
        'fscreen': '210%',
      },
      backdropBlur: {
        'sm': '2px',
      },
      colors: {
        'blurColor': 'rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [],
}

