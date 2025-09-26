// postcss.config.js — Tailwind v4+ PostCSS plugin wiring (ESM)
export default {
  plugins: {
    "@tailwindcss/postcss": {}, // ← use the new package name (not "tailwindcss")
    autoprefixer: {},
  },
};