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
        ps: {
          bg: '#012456',
          surface: '#0a2d6c',
          recessed: '#061d47',
          border: '#1d4ed8',
          borderLight: '#38bdf8',
          accent: '#00d4ff',
          muted: '#93c5fd',
          warning: '#facc15',
          danger: '#f87171',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
