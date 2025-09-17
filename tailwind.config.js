/** @type {import('tailwindcss').Config} */
const safelistClasses = require('./tailwind-safelist.js');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: safelistClasses,
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'tablet': '820px',  // Breakpoint específico para tablets
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        azuloscuro: {
          DEFAULT: '#002C5F',
        },
        azulmedio: {
          DEFAULT: '#0077B6',
        },
        azulturquesa: {
          DEFAULT: '#00B4D8',
        },
        azulrey: {
          DEFAULT: '#0033A0',
        },
        blanco: {
          DEFAULT: '#FFFFFF',
        },
        negrosuave: {
          DEFAULT: 'rgba(0,0,0,0.7)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-azul': 'linear-gradient(135deg, #002C5F 0%, #0077B6 50%, #00B4D8 100%)',
        'gradient-azulrey': 'linear-gradient(135deg, #0033A0 0%, #0077B6 100%)',
      },
      boxShadow: {
        'azul': '0 4px 6px -1px rgba(0,44,95,0.1), 0 2px 4px -1px rgba(0,51,160,0.06)',
        'azulrey': '0 10px 15px -3px rgba(0,51,160,0.1), 0 4px 6px -2px rgba(0,119,182,0.05)',
        'elegant': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'premium': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
} 