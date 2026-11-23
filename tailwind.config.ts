import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        clinical: {
          blue: '#1e40af',
          navy: '#0f172a',
          slate: '#334155',
          light: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        },
        sjd: {
          red: '#E30613',
          redHover: '#CC0511',
          redLight: '#FEF2F2',
          blue: '#009FE3',
          darkblue: '#0077B6',
          dark: '#111827',
          gray: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
