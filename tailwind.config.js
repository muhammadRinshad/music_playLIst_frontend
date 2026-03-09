/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        spotify: "#22c55e",
        "spotify-hover": "#4ade80",
        dark: "#0a0a0b",
        "dark-elevated": "#121214",
        "dark-card": "#18181b",
      },
      animation: {
        "fade-in": "fadeSlideUp 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
