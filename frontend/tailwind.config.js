/** @type {import('tailwindcss').Config} */

// Semantic colors resolve to CSS variables (RGB triplets) defined in globals.css,
// so every token switches between dark (default) and light automatically.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#6366f1", dark: "#4f46e5" },
        bg: token("--bg"),
        surface: { DEFAULT: token("--surface"), 2: token("--surface-2") },
        border: { DEFAULT: token("--border"), strong: token("--border-strong") },
        fg: {
          DEFAULT: token("--fg"),
          muted: token("--fg-muted"),
          subtle: token("--fg-subtle"),
        },
        primary: {
          DEFAULT: token("--primary"),
          solid: token("--primary-solid"),
          fg: token("--primary-fg"),
        },
        success: token("--success"),
        warning: token("--warning"),
        danger: token("--danger"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};
