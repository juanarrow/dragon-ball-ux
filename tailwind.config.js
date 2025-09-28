/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html,css}",
    "./src/index.html",
    "./src/index.ts",
    "./src/index.css"
  ],
  darkMode: 'class',
  safelist: [
    // Clases que se generan dinámicamente
    'slide-up',
    'fade-in',
    'opacity-0',
    'opacity-100',
    'transform',
    'translate-y-2',
    'translate-y-0',
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'text-red-300',
    'text-blue-300',
    'text-green-300',
    'text-purple-300',
    'border-red-500',
    'border-blue-500',
    'border-green-500',
    'border-purple-500',
    'from-red-600',
    'to-pink-700',
    'from-blue-600',
    'to-purple-700',
    'max-h-64',
    'overflow-y-auto',
    'active',
    // Patrones para clases dinámicas
    {
      pattern: /bg-(red|blue|green|purple|gray|emerald|indigo)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /text-(red|blue|green|purple|gray|emerald|indigo)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /border-(red|blue|green|purple|gray|emerald|indigo)-(50|100|200|300|400|500|600|700|800|900)/,
    }
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
