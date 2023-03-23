/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        ibm: ["var(--ibm-font)"],
        inter: ["var(--inter-font)"],
        "ibm-mono": ["var(--ibm-mono-font)"],
      },
    },
  },
  plugins: [],
};
