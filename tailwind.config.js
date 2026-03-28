/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AITune Design System - 暗色赛博朋克风格
        bg: {
          primary: '#0a0a0f',
          secondary: '#141420',
          card: '#1a1a2e',
          hover: '#1f1f35',
        },
        accent: {
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          pink: '#f43f5e',
          green: '#10b981',
        },
        border: {
          DEFAULT: '#2a2a3e',
          light: '#3a3a5e',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#8888aa',
          muted: '#555577',
        },
        ai: {
          suno: '#6d28d9',
          udio: '#0e7490',
          musicgen: '#047857',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-purple': 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
