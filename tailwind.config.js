/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F3EB",
        paperRaised: "#FFFFFF",
        ink: "#1F2A44",
        inkSoft: "#4B5468",
        line: "#DAD4C2",
        lineStrong: "#C2BBA4",
        seal: { DEFAULT: "#A8341F", dark: "#7E2616", tint: "#F4E2DC" },
        sage: { DEFAULT: "#52714F", tint: "#E4EBDF" },
        gold: { DEFAULT: "#B07F22", dark: "#6B4E17", tint: "#F3E7CD" },
        blue: { DEFAULT: "#2955A3", dark: "#1E3A63", tint: "#E1E9F7" },
        // New bright brand palette (Landing page v2)
        accent: { DEFAULT: "#FF5A3C", dark: "#E1472B" },
        navy: "#14141F",
        navySoft: "#8A8A99",
        peachTint: "#FDEDE8",
        skyAccent: "#3B6FE0",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Public Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
