/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        sans: ["Inter", "sans-serif"]
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(0.5rem) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(2rem, -1.5rem) scale(1.05)" },
          "66%": { transform: "translate(-1.5rem, 1rem) scale(0.97)" }
        }
      },
      animation: {
        "toast-in": "toast-in 0.2s ease-out",
        blob: "blob 16s infinite ease-in-out"
      }
    }
  },
  plugins: []
};
