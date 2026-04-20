// PostCSS is required by Tailwind CSS to process styles
// This config tells PostCSS which plugins to use

export default {
  plugins: {
    tailwindcss: {},   // processes Tailwind directives (@tailwind, @apply, etc.)
    autoprefixer: {},  // adds vendor prefixes for cross-browser compatibility
  },
};