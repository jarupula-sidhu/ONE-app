/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#060709',
          900: '#0c0d12',
          850: '#11131a',
          800: '#161923',
          700: '#212636',
          600: '#32394e',
        },
        brand: {
          50: '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        accent: {
          cyan: '#38bdf8',
          amber: '#fbbf24',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
