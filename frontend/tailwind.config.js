/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    // ScoreCard — recommendation colors (text, bar, border)
    'text-green-400', 'text-red-400', 'text-yellow-400',
    'bg-green-400',   'bg-red-400',   'bg-yellow-400',
    'border-green-400', 'border-red-400', 'border-yellow-400',

    // ScoreCard — Tag component variants
    'border-green-800', 'border-red-800', 'border-yellow-800',
    'bg-green-950/40',  'bg-red-950/40',  'bg-yellow-950/40',

    // ScoreCard — factor weight bars
    'bg-green-500', 'bg-red-500',

    // NewsList — left border sentiment colors
    'border-l-green-500', 'border-l-red-500', 'border-l-gray-700',

    // NewsList — sentiment text colors
    'text-green-500', 'text-red-500',

    // ExplanationPanel — outlook cell background
    'bg-gray-800/80',

    // Misc hover/opacity variants used conditionally
    'hover:bg-gray-800/60',
    'bg-gray-800/40', 'bg-gray-800/60',
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
