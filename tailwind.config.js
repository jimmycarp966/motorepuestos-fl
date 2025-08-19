/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  safelist: [
    // Colores dinámicos usados en strings - Tema oscuro
    // Text colors
    { pattern: /text-(red|green|blue|purple|yellow|orange|cyan|gray|white|zinc|slate)-(100|200|300|400|500|600|700|800|900)/ },
    // Background colors
    { pattern: /bg-(red|green|blue|purple|yellow|orange|cyan|gray|black|zinc|slate)-(50|100|200|300|400|500|600|700|800|900)/ },
    // Border colors
    { pattern: /border-(red|green|blue|purple|yellow|orange|cyan|gray|zinc|slate)-(100|200|300|400|500|600|700|800|900)/ },
  ],
  // Tema oscuro por defecto
  darkMode: 'class',
  theme: {
    extend: {
      // ===== BREAKPOINTS PERSONALIZADOS =====
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Breakpoints específicos para dispositivos
        'mobile': '320px',
        'mobile-lg': '425px',
        'tablet': '768px',
        'tablet-lg': '1024px',
        'laptop': '1366px',
        'laptop-lg': '1440px',
        'desktop': '1920px',
        // Breakpoints para altura
        'h-sm': {'raw': '(max-height: 600px)'},
        'h-md': {'raw': '(max-height: 768px)'},
        'h-lg': {'raw': '(max-height: 900px)'},
        // Breakpoints para orientación
        'portrait': {'raw': '(orientation: portrait)'},
        'landscape': {'raw': '(orientation: landscape)'},
        // Breakpoints para densidad de píxeles
        'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
        // Breakpoints para preferencias del usuario
        'motion-reduce': {'raw': '(prefers-reduced-motion: reduce)'},
        'high-contrast': {'raw': '(prefers-contrast: high)'},
      },

      // ===== ESPACIADO PERSONALIZADO =====
      spacing: {
        '70': '280px', // Ancho del sidebar
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        // Espaciado responsive
        'responsive-1': 'clamp(0.25rem, 1vw, 0.5rem)',
        'responsive-2': 'clamp(0.5rem, 1.5vw, 1rem)',
        'responsive-3': 'clamp(0.75rem, 2vw, 1.5rem)',
        'responsive-4': 'clamp(1rem, 2.5vw, 2rem)',
        'responsive-6': 'clamp(1.5rem, 3vw, 3rem)',
        'responsive-8': 'clamp(2rem, 4vw, 4rem)',
        'responsive-12': 'clamp(3rem, 6vw, 6rem)',
        'responsive-16': 'clamp(4rem, 8vw, 8rem)',
      },

      // ===== NUEVA PALETA DE COLORES TEMA OSCURO =====
      colors: {
        // Paleta base tema oscuro
        dark: {
          // Fondos
          'bg-primary': '#000000',      // Negro puro
          'bg-secondary': '#121212',    // Gris muy oscuro para tarjetas
          'bg-tertiary': '#1E1E1E',     // Gris muy oscuro alternativo
          
          // Textos
          'text-primary': '#FFFFFF',    // Blanco para títulos
          'text-secondary': '#B0B0B0',  // Gris claro para textos secundarios
          
          // Acentos
          'accent-blue': '#2979FF',     // Azul eléctrico
          'accent-violet': '#7C4DFF',   // Violeta elegante
          
          // Estados
          'success': '#4CAF50',         // Verde confirmación
          'warning': '#FF9800',         // Naranja advertencia
          'error': '#F44336',           // Rojo error
          
          // Bordes y separadores
          'border': '#2C2C2C',          // Gris medio
          'border-light': '#404040',    // Gris medio más claro
        },

        // Colores principales reconfigurados para tema oscuro
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2979FF', // Azul eléctrico principal
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
          950: '#082f49',
        },
        
        secondary: {
          50: '#f3e5f5',
          100: '#e1bee7',
          200: '#ce93d8',
          300: '#ba68c8',
          400: '#ab47bc',
          500: '#7C4DFF', // Violeta elegante
          600: '#8e24aa',
          700: '#7b1fa2',
          800: '#6a1b9a',
          900: '#4a148c',
          950: '#2e1065',
        },

        // Colores de estado para tema oscuro
        success: {
          50: '#e8f5e8',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4CAF50', // Verde confirmación
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
          950: '#0d4d14',
        },
        
        warning: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#FF9800', // Naranja advertencia
          600: '#fb8c00',
          700: '#f57c00',
          800: '#ef6c00',
          900: '#e65100',
          950: '#bf360c',
        },
        
        danger: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#F44336', // Rojo error
          600: '#e53935',
          700: '#d32f2f',
          800: '#c62828',
          900: '#b71c1c',
          950: '#8e0000',
        },

        // Grises para tema oscuro
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          850: '#2C2C2C', // Gris medio para bordes
          900: '#212121',
          925: '#1E1E1E', // Gris muy oscuro alternativo
          950: '#121212', // Gris muy oscuro para tarjetas
        },

        // Colores específicos para motorepuestos - Tema oscuro
        moto: {
          // Azules mecánicos oscuros
          blue: '#2979FF',
          lightBlue: '#42a5f5',
          darkBlue: '#1565c0',
          navy: '#0d47a1',
          
          // Violetas elegantes
          violet: '#7C4DFF',
          lightViolet: '#9575cd',
          darkViolet: '#512da8',
          
          // Fondos oscuros
          bgPrimary: '#000000',
          bgSecondary: '#121212',
          bgTertiary: '#1E1E1E',
          
          // Textos
          textPrimary: '#FFFFFF',
          textSecondary: '#B0B0B0',
          
          // Bordes
          border: '#2C2C2C',
          borderLight: '#404040',
          
          // Estados oscuros
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2979FF',
        }
      },

      // ===== TIPOGRAFÍA RESPONSIVE =====
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Tamaños responsive personalizados
        'responsive-xs': ['clamp(0.75rem, 1vw, 0.875rem)', { lineHeight: '1.25rem' }],
        'responsive-sm': ['clamp(0.875rem, 1.25vw, 1rem)', { lineHeight: '1.5rem' }],
        'responsive-base': ['clamp(1rem, 1.5vw, 1.125rem)', { lineHeight: '1.75rem' }],
        'responsive-lg': ['clamp(1.125rem, 2vw, 1.25rem)', { lineHeight: '1.75rem' }],
        'responsive-xl': ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '2rem' }],
        'responsive-2xl': ['clamp(1.5rem, 3vw, 1.875rem)', { lineHeight: '2.25rem' }],
        'responsive-3xl': ['clamp(1.875rem, 4vw, 2.25rem)', { lineHeight: '2.5rem' }],
        'responsive-4xl': ['clamp(2.25rem, 5vw, 3rem)', { lineHeight: '1' }],
        'responsive-5xl': ['clamp(3rem, 6vw, 3.75rem)', { lineHeight: '1' }],
      },

      // ===== BORDES Y RADIOS =====
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
        'moto': '12px',
        'moto-lg': '16px',
        'moto-xl': '20px',
      },

      // ===== SOMBRAS TEMA OSCURO =====
      boxShadow: {
        // Sombras oscuras
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        
        // Sombras de acento
        'glow-blue': '0 0 20px rgba(41, 121, 255, 0.3)',
        'glow-blue-lg': '0 0 40px rgba(41, 121, 255, 0.4)',
        'glow-violet': '0 0 20px rgba(124, 77, 255, 0.3)',
        'glow-violet-lg': '0 0 40px rgba(124, 77, 255, 0.4)',
        
        // Sombras suaves para elementos
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 2px 10px -2px rgba(0, 0, 0, 0.3)',
        
        // Sombras internas
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
        'inner-medium': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.4)',
      },

      // ===== ANIMACIONES PERSONALIZADAS =====
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(41, 121, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(41, 121, 255, 0.6)' },
        },
      },

      // ===== TRANSICIONES PERSONALIZADAS =====
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
      },

      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'ease-in-quart': 'cubic-bezier(0.5, 0, 0.75, 0)',
      },

      // ===== GRADIENTES TEMA OSCURO =====
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        
        // Gradientes principales tema oscuro
        'gradient-primary': 'linear-gradient(135deg, #2979FF 0%, #1565c0 50%, #0d47a1 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #7C4DFF 0%, #512da8 50%, #311b92 100%)',
        'gradient-success': 'linear-gradient(135deg, #4CAF50 0%, #388e3c 50%, #2e7d32 100%)',
        'gradient-warning': 'linear-gradient(135deg, #FF9800 0%, #f57c00 50%, #ef6c00 100%)',
        'gradient-error': 'linear-gradient(135deg, #F44336 0%, #d32f2f 50%, #c62828 100%)',
        
        // Gradientes de fondo tema oscuro
        'gradient-dark': 'linear-gradient(135deg, #000000 0%, #121212 50%, #1E1E1E 100%)',
        'gradient-dark-subtle': 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
        'gradient-glass-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        
        // Gradientes específicos motorepuestos
        'gradient-moto': 'linear-gradient(135deg, #2979FF 0%, #7C4DFF 100%)',
        'gradient-moto-dark': 'linear-gradient(135deg, #1565c0 0%, #512da8 100%)',
        'gradient-moto-hero': 'linear-gradient(135deg, #2979FF 0%, #42a5f5 50%, #7C4DFF 100%)',
        'gradient-moto-card': 'linear-gradient(145deg, #121212 0%, #1E1E1E 100%)',
        'gradient-moto-border': 'linear-gradient(90deg, #2C2C2C 0%, #404040 100%)',
      },

      // ===== FILTROS PERSONALIZADOS =====
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
      },

      // ===== Z-INDEX PERSONALIZADO =====
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // ===== ASPECT RATIO PERSONALIZADO =====
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
        '16/9': '16 / 9',
        '21/9': '21 / 9',
      },

      // ===== GRID TEMPLATE COLUMNS RESPONSIVE =====
      gridTemplateColumns: {
        'auto-fit-200': 'repeat(auto-fit, minmax(200px, 1fr))',
        'auto-fit-250': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fit-350': 'repeat(auto-fit, minmax(350px, 1fr))',
        'auto-fit-400': 'repeat(auto-fit, minmax(400px, 1fr))',
        'auto-fill-200': 'repeat(auto-fill, minmax(200px, 1fr))',
        'auto-fill-250': 'repeat(auto-fill, minmax(250px, 1fr))',
        'auto-fill-300': 'repeat(auto-fill, minmax(300px, 1fr))',
      },

      // ===== MIN HEIGHT RESPONSIVE =====
      minHeight: {
        'screen-75': '75vh',
        'screen-50': '50vh',
        'screen-25': '25vh',
        'responsive-screen': 'clamp(400px, 50vh, 600px)',
      },

      // ===== MAX WIDTH RESPONSIVE =====
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        'responsive-sm': 'clamp(300px, 90vw, 640px)',
        'responsive-md': 'clamp(640px, 90vw, 768px)',
        'responsive-lg': 'clamp(768px, 90vw, 1024px)',
        'responsive-xl': 'clamp(1024px, 90vw, 1280px)',
        'responsive-2xl': 'clamp(1280px, 90vw, 1536px)',
      },

      // ===== FONT FAMILY PERSONALIZADA =====
      fontFamily: {
        'sans': [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        'mono': [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },

      // ===== OPACITY PERSONALIZADA =====
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },

      // ===== SCALE PERSONALIZADO =====
      scale: {
        '102': '1.02',
        '103': '1.03',
        '104': '1.04',
        '105': '1.05',
        '106': '1.06',
        '107': '1.07',
        '108': '1.08',
        '109': '1.09',
        '110': '1.1',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Plugin para utilidades tema oscuro
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Utilidades de texto responsive tema oscuro
        '.text-responsive-dark': {
          fontSize: 'clamp(0.875rem, 1vw, 1rem)',
          lineHeight: '1.5',
          color: '#FFFFFF',
        },
        '.text-responsive-lg-dark': {
          fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
          lineHeight: '1.6',
          color: '#FFFFFF',
        },
        '.text-responsive-xl-dark': {
          fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
          lineHeight: '1.5',
          color: '#FFFFFF',
        },
        '.text-responsive-2xl-dark': {
          fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
          lineHeight: '1.4',
          color: '#FFFFFF',
        },
        '.text-secondary-dark': {
          color: '#B0B0B0',
        },
        
        // Utilidades de fondo tema oscuro
        '.bg-dark-primary': {
          backgroundColor: '#000000',
        },
        '.bg-dark-secondary': {
          backgroundColor: '#121212',
        },
        '.bg-dark-tertiary': {
          backgroundColor: '#1E1E1E',
        },
        
        // Utilidades de bordes tema oscuro
        '.border-dark': {
          borderColor: '#2C2C2C',
        },
        '.border-dark-light': {
          borderColor: '#404040',
        },
        
        // Utilidades de padding y margin responsive
        '.p-responsive-dark': {
          padding: 'clamp(0.5rem, 2vw, 1rem)',
        },
        '.p-responsive-lg-dark': {
          padding: 'clamp(1rem, 3vw, 1.5rem)',
        },
        '.p-responsive-xl-dark': {
          padding: 'clamp(1.5rem, 4vw, 2rem)',
        },
        '.m-responsive-dark': {
          margin: 'clamp(0.5rem, 2vw, 1rem)',
        },
        '.m-responsive-lg-dark': {
          margin: 'clamp(1rem, 3vw, 1.5rem)',
        },
        '.m-responsive-xl-dark': {
          margin: 'clamp(1.5rem, 4vw, 2rem)',
        },
        
        // Utilidades de gap responsive
        '.gap-responsive-dark': {
          gap: 'clamp(0.5rem, 2vw, 1rem)',
        },
        '.gap-responsive-lg-dark': {
          gap: 'clamp(1rem, 3vw, 1.5rem)',
        },
        '.gap-responsive-xl-dark': {
          gap: 'clamp(1.5rem, 4vw, 2rem)',
        },
        
        // Utilidades de border radius responsive
        '.rounded-responsive-dark': {
          borderRadius: 'clamp(0.25rem, 1vw, 0.5rem)',
        },
        '.rounded-responsive-lg-dark': {
          borderRadius: 'clamp(0.5rem, 1.5vw, 1rem)',
        },
        '.rounded-responsive-xl-dark': {
          borderRadius: 'clamp(1rem, 2vw, 1.5rem)',
        },
        
        // Utilidades de sombras tema oscuro
        '.shadow-responsive-dark': {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        },
        '.shadow-responsive-lg-dark': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        },
        '.shadow-responsive-xl-dark': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        },
        
        // Utilidades de backdrop blur responsive
        '.backdrop-blur-responsive-dark': {
          backdropFilter: 'blur(clamp(4px, 1vw, 8px))',
        },
        '.backdrop-blur-responsive-lg-dark': {
          backdropFilter: 'blur(clamp(8px, 2vw, 16px))',
        },
        '.backdrop-blur-responsive-xl-dark': {
          backdropFilter: 'blur(clamp(16px, 3vw, 24px))',
        },
        
        // Utilidades específicas de motorepuestos
        '.moto-card-dark': {
          backgroundColor: '#121212',
          borderColor: '#2C2C2C',
          borderWidth: '1px',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        },
        '.moto-input-dark': {
          backgroundColor: '#121212',
          borderColor: '#2C2C2C',
          color: '#FFFFFF',
        },
        '.moto-input-dark:focus': {
          borderColor: '#2979FF',
          boxShadow: '0 0 0 3px rgba(41, 121, 255, 0.1)',
        },
        '.moto-button-primary': {
          backgroundColor: '#2979FF',
          color: '#FFFFFF',
          borderColor: '#2979FF',
        },
        '.moto-button-primary:hover': {
          backgroundColor: '#1e6bff',
          boxShadow: '0 0 20px rgba(41, 121, 255, 0.3)',
        },
        '.moto-text-gradient': {
          background: 'linear-gradient(135deg, #2979FF 0%, #7C4DFF 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}