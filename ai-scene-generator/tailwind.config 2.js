/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'main-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)',
        'button-gradient': 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
      },
      boxShadow: {
        'glow': '0 8px 40px rgba(37, 99, 235, 0.5)',
        'glass': '0 10px 30px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
}
