/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f7',
          100: '#d4dee9',
          200: '#a9bdd3',
          300: '#7e9cbd',
          400: '#537ba7',
          500: '#2f5a87',
          600: '#1e3a5f',
          700: '#162b47',
          800: '#0f1d30',
          900: '#0a1421',
          950: '#050a11',
        },
        forest: {
          50: '#eef6f1',
          100: '#d5e8dc',
          200: '#abd1b9',
          300: '#81ba96',
          400: '#57a373',
          500: '#3d7a55',
          600: '#2d5a3f',
          700: '#224530',
          800: '#172f21',
          900: '#0f1f16',
        },
        gold: {
          50: '#fbf6e9',
          100: '#f5e9c8',
          200: '#ebd391',
          300: '#e0bd5a',
          400: '#d4a017',
          500: '#c4920f',
          600: '#a0780c',
          700: '#7c5c09',
          800: '#584107',
          900: '#342604',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      fontFamily: {
        display: ['Mulish', 'system-ui', 'sans-serif'],
        sans: ['Mulish', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(15, 29, 48, 0.06), 0 4px 12px rgba(15, 29, 48, 0.04)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
