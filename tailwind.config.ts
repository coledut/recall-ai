import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',
        'dark-teal': '#0f766e',
        'accent-green': '#059669',
        'light-mint': '#d1fae5',
      },
    },
  },
  plugins: [],
};

export default config;
