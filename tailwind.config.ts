import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-deep": "#02012b",
        "panel-1": "#25253f",
        "panel-2": "#2c2a42",
        "primary-start": "#3834BC",
        "primary-end": "#4558D9",
        "action-blue": "#4657D9",
      },
      fontFamily: {
        poppins: ["Poppins", "Inter", "sans-serif"],
      },
      borderRadius: {
        "xl-2": "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
