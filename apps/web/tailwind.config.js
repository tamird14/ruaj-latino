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
          50: '#fef2f4',
          100: '#fde6ea',
          200: '#fbd0d9',
          300: '#f7aabb',
          400: '#f17a95',
          500: '#e94560',
          600: '#d62c50',
          700: '#b41d40',
          800: '#961b3b',
          900: '#801b38',
          950: '#470a1a',
        },
        dark: {
          50: '#f6f6f8',
          100: '#ededf1',
          200: '#d7d7e0',
          300: '#b4b4c5',
          400: '#8b8ba4',
          500: '#6d6d8a',
          600: '#585872',
          700: '#48485d',
          800: '#3e3e4f',
          900: '#1a1a2e',
          950: '#0f0f1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
