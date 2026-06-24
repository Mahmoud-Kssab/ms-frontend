import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: '#d9dee8',
        surface: '#f7f8fa',
        ink: '#17202e',
        muted: '#687385',
        brand: '#0f766e',
        accent: '#2563eb',
        danger: '#dc2626',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
