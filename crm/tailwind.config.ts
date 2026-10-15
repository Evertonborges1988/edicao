import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#be185d", dark: "#9d174d", soft: "#fdf2f8" } },
    },
  },
  plugins: [],
} satisfies Config;
