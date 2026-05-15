/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f0f14',
          raised: '#16161f',
          card: '#1c1c28',
          border: '#2a2a3a',
        },
        accent: {
          DEFAULT: '#a855f7',
          muted: '#7c3aed',
          glow: '#c084fc',
        },
        hot: '#f43f5e',
        urgent: '#ef4444',
      },
      fontFamily: {
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
