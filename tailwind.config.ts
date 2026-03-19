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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0061ff",
          foreground: "#ffffff",
          50: "#e0f0ff",
          100: "#b3d9ff",
          200: "#80bcff",
          300: "#4da0ff",
          400: "#2689ff",
          500: "#0061ff",
          600: "#0053db",
          700: "#0044b8",
          800: "#003694",
          900: "#002870",
          950: "#001a4d",
        },
        brand_orange: {
          DEFAULT: "#f28b06",
          foreground: "#ffffff",
        },
        sidebar: "var(--sidebar)",
        card: "var(--card)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
