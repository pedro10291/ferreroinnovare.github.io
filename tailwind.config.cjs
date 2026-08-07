/* Template MVP Ferrer Innovare - Editorial Premium */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinic: {
          bg: "#F8F5F2",             // Fundo Principal
          surface: "#EFE8E2",        // Fundo Secundário
          surfaceHover: "#E8DDD6",   // Hover Fundo Secundário
          card: "#FFFFFF",           // Fundo dos cards
          gold: "#C98B84",           // Rose Gold Principal
          goldDark: "#A56D66",       // Rose Gold Escuro
          textPrimary: "#2C2C2C",    // Texto Principal
          textSecondary: "#6B6B6B",  // Texto Secundário
          border: "#E8DDD6",         // Bordas Editoriais
          success: "#5F8F75",        
          danger: "#C05C5C",         
        }
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      }
    },
  },
  plugins: [],
}
