import type { Config } from 'tailwindcss'
import { het, ThemeZIndexValues } from './src/styles/DesignTokens'

export const standardSizes = {
  xs: '0px',
  tiny: '350px',
  sm: '600px',
  smMd: '768px',
  md: '960px',
  lg: '1280px',
  xl: '1920px',
}

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: true,
  theme: {
    screens: standardSizes,
    maxHeight: standardSizes,
    maxWidth: standardSizes,
    borderRadius: {
      'sm': '4px',
      'md': '8px',
      'lg': '16px',
      'xl': '30px',
      '2xl': '40px',
      '3xl': '64px',
    },
    boxShadow: {
      'raised':
        'rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px',
      'raised-tighter':
        'rgba(0, 0, 0, 0.1) 0px 3px 3px -2px, rgba(0, 0, 0, 0.08) 0px 6px 7px 0px, rgba(0, 0, 0, 0.06) 0px 2px 9px 1px',
    },
    colors: het,
    lineHeight: {
      lhSuperLoose: '2.45',
      lhLoose: '1.6',
      lhSomeMoreSpace: '1.3',
      lhSomeSpace: '1.15',
      lhNormal: '1',
      lhTight: '0.95',
      lhModalHeading: '1.25',
      lhListBoxTitle: '47px',
    },
    fontFamily: {
      sansTitle: ['DM Sans', 'sans-serif'],
      sansText: ['Inter', 'sans-serif'],
      serif: ['Taviraj', 'serif'],
      math: ['KaTeX_Math', 'mono'],
    },
    fontSize: {
      smallest: '0.75rem',
      small: '0.875rem',
      text: '1rem',
      title: '1.125rem',
      exploreButton: '1.2rem',
      navBarHeader: '1.25rem',
      smallestHeader: '1.5rem',
      smallerHeader: '1.625rem',
      smallHeader: '1.75rem',
      header: '2rem',
      bigHeader: '3rem',
      biggerHeader: '3.125rem',
      biggestHeader: '4rem',
    },
    // TODO: improve this hack that convinces TS that Tailwind can use z index numbers (not only strings)
    zIndex: ThemeZIndexValues as Record<string, unknown> as Record<string, string>,
    extend: {
      maxHeight: {
        aimToGo: '255px',
        articleLogo: '700px',
      },
      maxWidth: {
        aimToGo: '255px',
        menu: '320px',
        articleLogo: '700px',
        teamHeadshot: '181px',
        teamLogo: '250px',
        newsPage: '1440px',
        newsText: '800px',
        equityLogo: '400px',
        helperBox: '1200px',
      },
      minHeight: {
        'preload-article': '750px',
      },
      height: {
        littleHetLogo: '30px',
        joinEffortLogo: '720px',
      },
      width: {
        'littleHetLogo': '30px',
        'joinEffortLogo': '600px',
        '90p': '90%',
        '98p': '98%',
      },
      padding: {
        '1p': '1%',
        '15p': '15%',
      },
      // for use w/spacing utilities: 'm', 'p', 'gap', etc.
      spacing: {
        cardGutter: '8px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
} satisfies Config
