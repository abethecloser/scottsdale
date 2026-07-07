/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E0C', char: '#131714',
        emerald: { DEFAULT: '#0E3A2C', light: '#1C7A5A', deep: '#082319', glow: '#23A579' },
        gold: '#C9A24A', goldlt: '#E2C26C',
        paper: '#F5F2EA', paper2: '#ECE7D9', inkt: '#16170F',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '3rem' },
    },
  },
  plugins: [],
};
