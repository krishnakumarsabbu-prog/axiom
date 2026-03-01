/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0B0D10',
          panel: '#111418',
          panel2: '#181C21',
        },
        fg: {
          base: '#F4F6F8',
          muted: '#8B92A0',
        },
        border: {
          base: '#1E232B',
          subtle: '#262B34',
        },
        brand: {
          base: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.4)',
        subtle: '0 1px 3px rgba(0, 0, 0, 0.3)',
        glow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
        'glow-strong': '0 0 0 2px rgba(255, 255, 255, 0.2), 0 0 12px rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at top, rgba(255, 255, 255, 0.03), transparent 60%)',
        'gradient-panel': 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
