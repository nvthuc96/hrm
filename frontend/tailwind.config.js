/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  corePlugins: {
    // Disable Tailwind's CSS reset so it doesn't clash with Angular Material styles.
    preflight: false,
  },
  plugins: [],
};
