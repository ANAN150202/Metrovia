/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind where to look for class names
  // This prevents unused CSS from being included in production build
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // all JS/JSX files inside src/
  ],

  // Enable dark mode via a CSS class on <html> or <body>
  // Usage: add class="dark" to <html> to activate dark mode
  darkMode: "class",

  theme: {
    extend: {
      // ─── Brand Colors ───────────────────────────────────────────
      // Primary accent: indigo/purple tones (Stripe + Linear inspired)
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // main accent
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },

        // Purple tones for gradients
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed", // deep purple accent
          700: "#6d28d9",
        },

        // Dark mode surface colors (Linear-inspired)
        dark: {
          bg:      "#0F0F0F", // page background
          card:    "#1A1A1A", // card background
          panel:   "#171717", // sidebar/panel
          border:  "#2A2A2A", // subtle borders
          hover:   "#242424", // hover states
          muted:   "#3A3A3A", // muted elements
        },

        // Light mode surface colors (Stripe-inspired)
        light: {
          bg:      "#FFFFFF",
          card:    "#F9FAFB",
          panel:   "#F3F4F6",
          border:  "#E5E7EB",
          hover:   "#F0F0F0",
          muted:   "#9CA3AF",
        },
      },

      // ─── Typography ─────────────────────────────────────────────
      fontFamily: {
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
        display: ["Syne", "DM Sans", "sans-serif"], // for headings
        mono: ["JetBrains Mono", "monospace"],
      },

      // ─── Border Radius ───────────────────────────────────────────
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      // ─── Box Shadows ─────────────────────────────────────────────
      // Premium depth — soft, not harsh
      boxShadow: {
        "glow-sm":  "0 0 15px rgba(99, 102, 241, 0.15)",
        "glow-md":  "0 0 30px rgba(99, 102, 241, 0.20)",
        "glow-lg":  "0 0 60px rgba(99, 102, 241, 0.25)",
        "card-light": "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        "card-dark":  "0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.12)",
      },

      // ─── Background Image Utilities ──────────────────────────────
      backgroundImage: {
        // Main hero gradient (used on login/signup)
        "gradient-hero": "linear-gradient(135deg, #0F0F0F 0%, #1a1040 50%, #0F0F0F 100%)",
        // Subtle card gradient
        "gradient-card": "linear-gradient(145deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)",
        // Accent gradient for buttons/highlights
        "gradient-brand": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        // Soft noise texture overlay (applied via pseudo-element in CSS)
        "gradient-dark-fade": "linear-gradient(180deg, #171717 0%, #0F0F0F 100%)",
      },

      // ─── Animations ──────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.2)" },
          "50%":       { boxShadow: "0 0 40px rgba(99,102,241,0.4)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in":    "fade-in 0.4s ease forwards",
        "slide-in":   "slide-in 0.3s ease forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        shimmer:      "shimmer 2s linear infinite",
      },

      // ─── Transitions ─────────────────────────────────────────────
      transitionDuration: {
        250: "250ms",
        350: "350ms",
      },
    },
  },

  plugins: [],
};