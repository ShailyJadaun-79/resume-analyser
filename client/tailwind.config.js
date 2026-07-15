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
        primary: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c7d7ff',
          300: '#a3bcff',
          400: '#7a97ff',
          500: '#4f6bff',
          600: '#3b4feb',
          700: '#2f3dd4',
          800: '#2732ac',
          900: '#232d8a',
          950: '#151954',
        },
        dark: {
          50: '#f6f6f7',
          100: '#ebeeef',
          200: '#d3dae0',
          300: '#adc0cd',
          400: '#7f9eb3',
          500: '#5e7f97',
          600: '#4b677d',
          700: '#3e5466',
          800: '#344757',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 15px rgba(79, 107, 255, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
