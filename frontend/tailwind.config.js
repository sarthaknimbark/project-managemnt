/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d9f0ff",
          500: "#2d8cff",
          700: "#1768d1"
        }
      },
      boxShadow: {
        card: "0 6px 20px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
