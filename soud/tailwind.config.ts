import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eefbf3',
          100: '#d6f5e0',
          200: '#b0e9c6',
          300: '#7ed7a4',
          400: '#47bd7d',
          500: '#22a05e',
          600: '#158049',
          700: '#11663d',
          800: '#105133',
          900: '#0e432c'
        }
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
