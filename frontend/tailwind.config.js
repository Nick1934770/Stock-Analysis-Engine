/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    'text-green-400', 'text-red-400', 'text-yellow-400',
    'bg-green-400', 'bg-red-400', 'bg-yellow-400',
    'border-green-400', 'border-red-400', 'border-yellow-400',
    'bg-green-500/10', 'bg-red-500/10', 'bg-yellow-500/10',
    'bg-green-900/30', 'bg-red-900/30', 'bg-yellow-900/30',
    'border-green-700/50', 'border-red-700/50',
    'bg-gray-700/60', 'border-gray-600/50',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2a3441',
          850: '#1a2332',
        },
      },
    },
  },
  plugins: [],
}
