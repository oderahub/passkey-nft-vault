/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bitcoin': '#f7931a',
        'stacks': '#5546ff',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #5546ff, 0 0 10px #5546ff, 0 0 15px #5546ff' },
          '100%': { boxShadow: '0 0 10px #f7931a, 0 0 20px #f7931a, 0 0 30px #f7931a' },
        },
      },
    },
  },
  plugins: [],
}
