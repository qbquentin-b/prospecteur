import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e68c19",
        "primary-dark": "#cc7a12",
        "background-light": "#f8f7f6",
        "background-dark": "#211a11",
        "surface-light": "#ffffff",
        "surface-dark": "#2c241b",
        "border-light": "#e5e1dc",
        "border-dark": "#443a2e",
        secondary: "#f8f7f6",
        dark: "#211a11",
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        display: ["var(--font-be-vietnam-pro)", "sans-serif"],
        sans: ["var(--font-be-vietnam-pro)", "sans-serif"],
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
