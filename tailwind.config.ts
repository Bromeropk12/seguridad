import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vulnerable: {
          bg: "#0f0f0f",
          accent: "#ff3333",
          text: "#f0f0f0",
          border: "#ff3333",
        },
        seguro: {
          bg: "#0f1a0f",
          accent: "#00ff88",
          text: "#f0fff0",
          border: "#00ff88",
        },
      },
    },
  },
  plugins: [],
};

export default config;