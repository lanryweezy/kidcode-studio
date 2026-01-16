/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.tsx",
    "./*.ts"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151e2e',
          950: '#020617',
        }
      },
      fontFamily: {
        hand: ['"Patrick Hand"', 'cursive'],
      },
      animation: {
        'pop-in': 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'bounce-sm': 'bounceSmall 0.2s infinite',
      }
    },
  },
  plugins: [],
}