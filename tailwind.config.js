export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nebula: {
          primary: {
            DEFAULT: "#6f42c1",
            light: "#a463f2",
          },
          accent: "#d3bbff",
          bg: "#161021",
          surface: {
            1: "#1c142b",
            2: "#241a36",
          },
          text: {
            primary: "#eadef7",
            secondary: "rgba(234, 222, 247, 0.6)",
          },
          success: "#2ecc71",
          warning: "#f1c40f",
          error: "#e74c3c",
          divider: "rgba(211, 187, 255, 0.15)",
        },
      },
      backgroundImage: {
        "gradient-nebula": "linear-gradient(135deg, #6f42c1 0%, #a463f2 100%)",
      },
      boxShadow: {
        luminous: "0 8px 32px 0 rgba(211, 187, 255, 0.06)",
      },
    },
  },
  plugins: [],
};
