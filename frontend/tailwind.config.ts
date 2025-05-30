import type { Config } from 'tailwindcss'
import {
  ThemeStandardScreenSizes,
  ThemeZIndexValues,
  het,
} from './src/styles/DesignTokens'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: true,
  theme: {
    screens: ThemeStandardScreenSizes,
    maxHeight: ThemeStandardScreenSizes,
    maxWidth: ThemeStandardScreenSizes,
    borderRadius: {
      xs: '2px',
      sm: '4px',
      md: '8px',
      lg: '16px',
      xl: '30px',
      '2xl': '40px',
      '3xl': '64px',
    },
    boxShadow: {
      raised:
        'rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px',
      'raised-tighter':
        'rgba(0, 0, 0, 0.1) 0px 3px 3px -2px, rgba(0, 0, 0, 0.08) 0px 6px 7px 0px, rgba(0, 0, 0, 0.06) 0px 2px 9px 1px',
    },
    colors: het,
    lineHeight: {
      loose: '1.6',
      'some-more-space': '1.3',
      'some-space': '1.15',
      normal: '1',
      tight: '0.95',
      'modal-heading': '1.25',
      'list-box-title': '47px',
    },
    fontFamily: {
      // Nested quotations are required for font names with spaces
      sansTitle: ["'DM Sans Variable'", 'sans-serif'],
      sansText: ['"Inter Variable"', 'sans-serif'],
      roboto: ['Roboto', 'sans-serif'],
      robotoCondensed: ["'Roboto Condensed'", 'sans-serif'],
      serif: ['Taviraj', 'serif'],
    },
    fontSize: {
      'tiny-tag': '0.625rem',
      smallest: '0.75rem',
      small: '0.875rem',
      text: '1rem',
      title: '1.125rem',
      'explore-button': '1.2rem',
      'nav-bar-header': '1.25rem',
      'fluid-mad-lib': 'clamp(1rem, 2.5vw, 1.5rem)',
      'smallest-header': '1.5rem',
      'small-header': '1.75rem',
      header: '2rem',
      'big-header': '3rem',
      'bigger-header': '3.125rem',
      'hero-header': '4.5rem',
    },
    // TODO: improve this hack that convinces TS that Tailwind can use z index numbers (not only strings)
    zIndex: ThemeZIndexValues as Record<string, unknown> as Record<
      string,
      string
    >,
    extend: {
      maxHeight: {
        aimToGo: '255px',
        articleLogo: '700px',
      },
      maxWidth: {
        aimToGo: '255px',
        menu: '320px',
        onThisPageMenuDesktop: '200px',
        articleLogo: '700px',
        teamHeadshot: '181px',
        teamLogo: '250px',
        exploreDataPage: '1500px',
        exploreDataTwoColumnPage: '2500px',
        newsText: '800px',
        equityLogo: '400px',
        helperBox: '1200px',
      },
      minHeight: {
        multimapMobile: '125px',
        multimapDesktop: '175px',
        'preload-article': '750px',
      },
      height: {
        littleHetLogo: '30px',
        joinEffortLogo: '720px',
      },
      width: {
        littleHetLogo: '30px',
        joinEffortLogo: '600px',
        '90p': '90%',
        '98p': '98%',
        onThisPageMenuDesktop: '192px',
      },
      padding: {
        '1p': '1%',
        '15p': '15%',
      },
      // for use w/spacing utilities: 'm', 'p', 'gap', etc.
      spacing: {
        cardGutter: '8px',
        footer: '10rem',
      },
      strokeWidth: {
        '2.5': '2.5',
        '5.5': '5.5',
      },
    },
  },
  plugins: [],
} satisfies Config
