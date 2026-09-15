import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './data/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          500: '#1d4ed8',
          600: '#1e40af',
          700: '#1e3a8a',
        },
        slate: {
          950: '#0f172a',
        },
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 23, 42, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
