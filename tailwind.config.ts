import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cinnabar: {
          50: "#fef4f3",
          100: "#fde8e6",
          200: "#fbd4d0",
          300: "#f7b3ad",
          400: "#f0867c",
          500: "#e55c4f",
          600: "#d23f31",
          700: "#af3429",
          800: "#912f26",
          900: "#782d26",
        },
      },
    },
  },
  plugins: [],
};
export default config;
