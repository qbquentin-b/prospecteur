import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // Indigo-600 as per PRD
        "primary-dark": "#4338ca", // Indigo-700
        "background-light": "#f8fafc", // Slate-50
        "background-dark": "#0f172a", // Slate-900
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b", // Slate-800
        "border-light": "#e2e8f0", // Slate-200
        "border-dark": "#334155", // Slate-700
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "sans-serif"],
        display: ["var(--font-be-vietnam-pro)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
export default config;