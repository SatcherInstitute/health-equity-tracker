/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      // sm: '480px',
      // md: '768px',
      // lg: '976px',
      // xl: '1440px',
      xs: '0px',
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1920px',
      titleXs: '0px',
      titleSm: '800px',
      titleMd: '900px',
      titleLg: '1500px',
      titleXl: '1850px',
    },
    colors: {
      'blue': '#1fb6ff',
      'purple': '#7e5bef',
      'pink': '#ff49db',
      'orange': '#ff7849',
      'green': '#13ce66',
      'yellow': '#ffc82c',
      'gray-dark': '#273444',
      'gray': '#8492a6',
      'gray-light': '#d3dce6',
    },
    fontFamily: {
      sansTitle: ['DM Sans', 'sans-serif'],
      sansText: ['Inter', 'sans-serif'],
      serif: ['Taviraj', 'serif'],
    },
    fontSize: {
      // sm: '0.8rem',
      // base: '1rem',
      // xl: '1.25rem',
      // '2xl': '1.563rem',
      // '3xl': '1.953rem',
      // '4xl': '2.441rem',
      // '5xl': '3.052rem',
      smallest: '0.75rem',
      small: '0.875rem',
      text: '1rem',
      title: '1.125rem',
      exploreButton: '1.2rem',
      smallestHeader: '1.5rem',
      smallerHeader: '1.625rem',
      smallHeader: '1.75rem',
      header: '2rem',
      bigHeader: '3rem',
      biggerHeader: '3.125rem',
      biggestHeader: '4rem',
      }
      // extend: {
      //   spacing: {
      //     '128': '32rem',
      //     '144': '36rem',
      //   },
      //   borderRadius: {
      //     '4xl': '2rem',
      //   }
      // }
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}

