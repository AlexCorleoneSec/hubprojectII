import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#06060a',
          1: '#0a0a12',
          2: '#10101c',
          3: '#181826',
          4: '#1e1e30',
        },
        border: {
          DEFAULT: '#1e1e30',
          subtle: '#14141f',
          hover: '#2a2a42',
        },
        accent: {
          DEFAULT: '#7c5cfc',
          hover: '#6a4ce8',
          subtle: 'rgba(124, 92, 252, 0.12)',
          glow: 'rgba(124, 92, 252, 0.25)',
        },
        text: {
          primary: '#e8e8f0',
          secondary: '#8888a4',
          muted: '#55556a',
        },
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #7c5cfc 0%, #a855f7 50%, #6366f1 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(124, 92, 252, 0.06) 0%, rgba(124, 92, 252, 0) 100%)',
        'gradient-glow': 'radial-gradient(ellipse at top, rgba(124, 92, 252, 0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        glass: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 24px rgba(0, 0, 0, 0.4)',
        'glass-hover': '0 0 0 1px rgba(124, 92, 252, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px rgba(124, 92, 252, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 92, 252, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(124, 92, 252, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
