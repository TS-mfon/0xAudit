/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#050505",
        panel: "#0B0F0E",
        "panel-border": "#1D2A24",
        strong: "#00FF88",
        moderate: "#FFB800",
        critical: "#FF3A3A",
        info: "#4DA3FF",
        foreground: "#F5FFF9",
        "foreground-muted": "#7C8A83",
        code: "#080A09",
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["var(--font-geist-sans)", "Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
