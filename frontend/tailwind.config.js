/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "sound-wave1": {
          "0%, 100%": {
            height: "0.5rem",
          },
          "50%": {
            height: "1rem",
          },
        },
        "sound-wave2": {
          "0%, 100%": {
            height: "1rem",
          },
          "50%": {
            height: "1.5rem",
          },
        },
        "sound-wave3": {
          "0%, 100%": {
            height: "0.75rem",
          },
          "25%": {
            height: "0.5rem",
          },
          "75%": {
            height: "1.25rem",
          },
        },
        "pulse-slow": {
          "0%, 100%": {
            opacity: 1,
          },
          "50%": {
            opacity: 0.8,
          },
        },
        "shimmer": {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0)",
            opacity: 0,
          },
          "100%": {
            transform: "scale(1)",
            opacity: 1,
          },
        },
        "scale-in-out": {
          "0%": {
            transform: "scale(0)",
            opacity: 0,
          },
          "50%": {
            transform: "scale(1.2)",
            opacity: 1,
          },
          "100%": {
            transform: "scale(1)",
            opacity: 1,
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "sound-wave1": "sound-wave1 1.2s infinite ease-in-out",
        "sound-wave2": "sound-wave2 0.9s infinite ease-in-out",
        "sound-wave3": "sound-wave3 1.5s infinite ease-in-out",
        "pulse-slow": "pulse-slow 3s infinite ease-in-out",
        "shimmer": "shimmer 2s infinite",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-in-out": "scale-in-out 0.3s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },
      boxShadow: {
        "glow": "0 0 10px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.1)",
        "glow-sm": "0 0 5px rgba(139, 92, 246, 0.2)",
        "glow-lg": "0 0 15px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2)",
      },
      dropShadow: {
        "glow": "0 0 8px rgba(139, 92, 246, 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};