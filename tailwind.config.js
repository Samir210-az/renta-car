/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        surface: "#1c1917",
        paper: "#141210",
        gold: "#ec7f08",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28,25,23,0.05), 0 4px 16px rgba(28,25,23,0.07)",
        card: "0 2px 8px rgba(28,25,23,0.07), 0 8px 24px rgba(28,25,23,0.1)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
