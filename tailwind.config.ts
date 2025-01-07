import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: "576px",
        md: "840px", // tablet
        lg: "1080px", // laptop
        xl: "1280px", // desktop
        "2xl": "1920px", // hr
      },
      colors: {
        primary: "#485F95",
        secondary: "#1D3A5F",
        danger: "#991B1B",
        dark: "#1B2232",
        white: "#FFF",
        gray1: "#747D92",
        gray2: "#BCC1D9",
        gray3: "#E1E3EB",
        gray4: "#EFF4FF",
        gray5: "#F8F8FA",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontSize: {
        "2xs": ["9px", "11px"],
        xs: ["11px", "13px"],
        sm: ["12px", "15px"],
        tiny: ["14px", "20px"],
        base: ["16px", "23px"],
        lg: ["18px", "22px"],
        xl: ["20px", "24px"],
        "2xl": ["24px", "29px"],
        "3xl": ["28px", "34px"],
        "4xl": ["34px", "41px"],
        "5xl": ["36px", "44px"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
    fontFamily: {
      sans: ["Montserrat", "ui-sans-serif", "system-ui"],
      serif: ["Montserrat", "ui-serif", "Georgia"],
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function ({ addComponents }: any) {
      addComponents({
        ".container": {
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "8px",
          paddingRight: "8px",
          "@screen sm": {
            maxWidth: "550px",
            paddingLeft: "0",
            paddingRight: "0",
          },
          "@screen md": {
            maxWidth: "720px",
          },
          "@screen lg": {
            maxWidth: "980px",
          },
          "@screen xl": {
            maxWidth: "1110px",
          },
        },
        ".container-full": {
          width: "100%",
          paddingLeft: "8px",
          paddingRight: "8px",
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "912px",
          "@screen lg": {
            maxWidth: "1168px",
          },
          "@screen xl": {
            maxWidth: "1230px",
          },
        },
      });
    },
  ],
} satisfies Config;
