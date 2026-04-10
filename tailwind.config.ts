import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class', // 🔥 다크 모드 스위치를 작동하게 만드는 핵심 마법 주문!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config