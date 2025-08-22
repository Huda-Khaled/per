 /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f9f9f9",
          100: "#f0f0f0",
          200: "#d9d9d9",
          300: "#bfbfbf",
          400: "#8c8c8c",
          500: "#333333", // اللون الأساسي المطلوب
          600: "#2d2d2d",
          700: "#262626",
          800: "#1f1f1f",
          900: "#1a1a1a",
        },
        // إضافة اللون المخصص customBlack
        customBlack: "#333333",
        customGray: {
          light: "#666666",
          medium: "#555555",
          dark: "#222222",
          darker: "#111111",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["cairo", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};