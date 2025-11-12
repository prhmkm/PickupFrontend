/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "gwm-green-700": "#1e8f40",
        "gwm-green-600": "#2daa54",
        "gwm-green-800": "#167235",
        "gwm-ink": "#0b1f16",
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

