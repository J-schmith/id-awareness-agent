import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#0071e3',
          hover: '#0077ed',
          soft: 'rgba(0,113,227,0.08)',
        },
        success: {
          DEFAULT: '#34c759',
          soft: 'rgba(52,199,89,0.1)',
        },
        warning: {
          DEFAULT: '#ff9500',
          soft: 'rgba(255,149,0,0.1)',
        },
        danger: {
          DEFAULT: '#ff3b30',
          soft: 'rgba(255,59,48,0.08)',
        },
        purple: {
          DEFAULT: '#af52de',
          soft: 'rgba(175,82,222,0.08)',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.82)',
          solid: '#ffffff',
          hover: 'rgba(255,255,255,0.95)',
        },
        border: {
          DEFAULT: 'rgba(0,0,0,0.07)',
          strong: 'rgba(0,0,0,0.12)',
        },
        'text-primary': '#1d1d1f',
        'text-secondary': '#6e6e73',
        'text-tertiary': '#aeaeb2',
      },
      borderRadius: {
        '2xl': '18px',
        xl: '12px',
        lg: '8px',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
        md: '0 4px 20px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.04)',
        lg: '0 8px 40px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.04)',
        modal: '0 24px 80px rgba(0,0,0,0.18)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.7)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'agent-pulse': 'pulse 1.8s ease infinite',
      },
    },
  },
  plugins: [],
}

export default config
