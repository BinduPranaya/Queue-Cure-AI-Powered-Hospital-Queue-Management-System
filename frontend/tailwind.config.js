/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinic: {
          teal: "#0F4C45",
          tealDark: "#0A3530",
          tealLight: "#156358",
          mint: "#E8F3F0",
          mintDeep: "#D3E8E2",
          coral: "#FF6B5B",
          coralDark: "#E8503F",
          amber: "#F2A93B",
          ink: "#1A2421",
          paper: "#FCFBF8",
        },
      },
      fontFamily: {
        display: ["'Space Mono'", "monospace"],
        sans: ["'Manrope'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        token: "0 0 0 1px rgba(15,76,69,0.08), 0 12px 32px -8px rgba(15,76,69,0.25)",
        glow: "0 0 40px rgba(242,169,59,0.35)",
      },
      animation: {
        "pulse-slow": "pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flicker-in": "flickerIn 0.5s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
      },
      keyframes: {
        flickerIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "60%": { opacity: "1" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}
