/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D3436',
        secondary: '#636E72',
        accent: '#00B894',
        'accent-alt': '#0984e3',
        background: '#F5F6FA',
        'background-alt': '#EDF2F7'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#2D3436',
            h1: {
              color: '#2D3436',
            },
            h2: {
              color: '#2D3436',
            },
            h3: {
              color: '#2D3436',
            },
            h4: {
              color: '#2D3436',
            },
            strong: {
              color: '#00B894',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
