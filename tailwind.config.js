/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        // Pastita Brand Colors (Marsala + Gold)
        marsala: {
          DEFAULT: '#722F37',
          50: '#F9F2F3',
          100: '#F0E0E2',
          200: '#E1C1C5',
          300: '#D2A2A8',
          400: '#C3838B',
          500: '#B4646E',
          600: '#8A3D46',
          700: '#722F37',
          800: '#4A1E23',
          900: '#2D1215',
          950: '#1A0B0D',
        },
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FCF9EE',
          100: '#F8F0D4',
          200: '#F1E1A9',
          300: '#EAD27E',
          400: '#E3C353',
          500: '#D4AF37',
          600: '#B8942A',
          700: '#8C7120',
          800: '#604E16',
          900: '#342B0C',
          950: '#1E1907',
        },
        // Semantic colors
        cream: {
          DEFAULT: '#FDFBF7',
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#F5EFE6',
          300: '#EDE3D5',
        },
        // Status colors
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
        },
        error: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(114, 47, 55, 0.1)',
        'hard': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-gold': 'inset 0 -3px 0 0 #D4AF37',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
