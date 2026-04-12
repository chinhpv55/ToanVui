import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        success: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        error: {
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
      },
      fontSize: {
        "question": ["1.25rem", { lineHeight: "1.75rem" }],
        "question-lg": ["1.5rem", { lineHeight: "2rem" }],
      },
      minWidth: {
        "touch": "44px",
      },
      minHeight: {
        "touch": "44px",
      },
    },
  },
  plugins: [],
};
export default config;
