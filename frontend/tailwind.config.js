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
    borderWidth: {
      "1": "1px"
    },
    colors: {
      // 'blue': '#1fb6ff',
      // 'purple': '#7e5bef',
      // 'pink': '#ff49db',
      // 'orange': '#ff7849',
      // 'green': '#13ce66',
      // 'yellow': '#ffc82c',
      // 'gray-dark': '#273444',
      // 'gray': '#8492a6',
      // 'gray-light': '#d3dce6',
      // color palette
      "grey-dark": "#222",
      "white": "#fff",
      "yellow":" yellow",
      "red-orange": "#ed573f",
      "blue": "#07538f",
      "dark-blue": "#255792",
      "dark-green": "#083f31",
      "black": "#000",

      "secondary-light": "#89d5cc",
      "secondary-main": "#228b7e",
      "secondary-dark": "#167b6f",

      "alert-color": "#d85c47",
      "alt-orange": "#9d4d3f",
      "infobar-color": "#f8e8b0",
      "highest-lowest-color": "#f8f9fa",
      "why-box-color": "#d8ebe5",
      "report-alert": "#ff9800",
      "standard-info": "#f8f9fa",
      "standard-warning": "#fff8eb",
      "toggle-color": "#e1e9e7",

      "bg-color": "#e2e2e2",
      "footer-color": "#edf3f0",
      "explore-bg-color": "#f1f4f8",
      "listbox-color": "#f1f3f4",
      "how-to-color": "#bdc1c6",
      "team-border-color": "#9aa0a6",
      "grey-grid-color": "#f9f9f9",
      "border-color": "#3e3e3e",
      "navlink-color": "#202124",

      "bar-chart-dark": "#0b5420",
      "bar-chart-light": "#91c684",

      "join-effort-bg1": "#a5cdc0",
      "join-effort-bg2": "#edb2a6",
      "join-effort-bg3": "#275141",

      "alt-green": "#0b5240",
      "alt-black": "#383838",
      "alt-dark": "#5f6368",
      "alt-grey": "#bdbdbd",
      "alt-red": "#d32f2f",

      // colors from VEGA map (yellowgreen)
      "map-min": "#134b3a",
      "map-lightest": "#f2e62f",
      "map-lighter": "#b9ce3a",
      "map-light": "#7db640",
      "map-mid": "#3e9b42",
      "map-dark": "#027e47",
      "map-darker": "#185e49",
      "map-darkest": "#134b3a",

      // colors from VEGA map (Black women - plasma)
      "map-women-min": "#120161",
      "map-women-lightest": "#febc2b",
      "map-women-lighter": "#f48849",
      "map-women-light": "#db5b68",
      "map-women-mid": "#b93389",
      "map-women-dark": "#8b0aa5",
      "map-women-darker": "#5402a3",
      "map-women-darkest": "#320161",

      // colors from VEGA map (Medicare Beneficiaries from PHRMA data - viridis)
      "map-medicare-lightest": "#f0e525",
      "map-medicare-even-lighter": "#9fda3a",
      "map-medicare-lighter": "#4bc16c",
      "map-medicare-light": "#1fa187",
      "map-medicare-mid": "#267f8e",
      "map-medicare-dark": "#365c8d",
      "map-medicare-darkest": "#46327f",
      "map-medicare-min": "#090121",

      // roughly spaced out 7 colors from VEGA map (unknown - greenblue)
      "unknown-map-min": "#eceecc",
      "unknown-map-least": "#d3eece",
      "unknown-map-lesser": "#b8e3be",
      "unknown-map-less": "#92d4be",
      "unknown-map-mid": "#60bccb",
      "unknown-map-more": "#47a8cb",
      "unknown-map-even-more": "#2384b9",
      "unknown-map-most": "#0b61a2",

      // timeseries map colors (from brand guidelines)
      "time-cyan-blue": "#79b4b7",
      "time-pastel-green": "#547d6b",
      "time-purple": "#816d98",
      "time-pink": "#ff85b3",
      "time-dark-red": "#8c0000",
      "time-yellow": "#fcb431",
    },
    lineHeight: {
      "lhSuperLoose": "2.45",
      "lhLoose": "1.6",
      "lhSomeMoreSpace": "1.3",
      "lhSomeSpace": "1.15",
      "lhNormal": "1",
      "lhTight": "0.95",
      "lhModalHeading": "1.25",
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

