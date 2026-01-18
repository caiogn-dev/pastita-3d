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
        // ============================================
        // PASTITA BRAND - Marsala (Primary)
        // ============================================
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
        // ============================================
        // AGRIÃO BRAND - Verde Agrião (Secondary)
        // ============================================
        agriao: {
          DEFAULT: '#4A5D23',
          50: '#F4F7EF',
          100: '#E8EFDE',
          200: '#D1DFBD',
          300: '#B5C896',
          400: '#8FB06B',
          500: '#6B8E23',
          600: '#4A5D23',
          700: '#3D4D1D',
          800: '#2F3B16',
          900: '#1F2710',
          950: '#141A0A',
        },
        // ============================================
        // ACCENT & NEUTRAL
        // ============================================
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
        cream: {
          DEFAULT: '#FDFBF7',
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#F5EFE6',
          300: '#EDE3D5',
          400: '#E5D7C4',
        },
        // ============================================
        // STATUS COLORS
        // ============================================
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
        },
        error: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        info: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
        },
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(114, 47, 55, 0.1)',
        'soft-lg': '0 20px 40px rgba(114, 47, 55, 0.15)',
        'hard': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'inner-gold': 'inset 0 -3px 0 0 #D4AF37',
        'inner-marsala': 'inset 0 -3px 0 0 #722F37',
        'glow-marsala': '0 0 20px rgba(114, 47, 55, 0.4)',
        'glow-agriao': '0 0 20px rgba(74, 93, 35, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
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
