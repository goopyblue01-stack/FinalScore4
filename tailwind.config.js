/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 🔥 이제 스위치가 완벽하게 작동합니다!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}