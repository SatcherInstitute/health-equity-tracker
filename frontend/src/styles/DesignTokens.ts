/**
 * HET Design Tokens
 * Maps TypeScript keys to CSS variables defined in your Tailwind v4 @theme.
 */
export const het = {
  // Blues
  darkBlue: 'var(--color-dark-blue)',

  // Greens
  altGreen: 'var(--color-alt-green)',
  barChartDark: 'var(--color-bar-chart-dark)',
  barChartLight: 'var(--color-bar-chart-light)',
  darkGreen: 'var(--color-dark-green)',
  footerColor: 'var(--color-footer-color)',
  groupGreen: 'var(--color-group-green)',
  groupYellowGreen: 'var(--color-group-yellow-green)',
  hoverAltGreen: 'var(--color-hover-alt-green)',
  methodologyGreen: 'var(--color-methodology-green)',
  secondaryDark: 'var(--color-secondary-dark)',
  secondaryLight: 'var(--color-secondary-light)',
  secondaryMain: 'var(--color-secondary-main)',
  toggleColor: 'var(--color-toggle-color)',

  // Greys / Blacks
  altBlack: 'var(--color-alt-black)',
  altDark: 'var(--color-alt-dark)',
  altGray: 'var(--color-alt-gray)',
  bgColor: 'var(--color-bg-color)',
  borderColor: 'var(--color-border-color)',
  dividerGray: 'var(--color-divider-gray)',
  grayGridColorDarker: 'var(--color-gray-grid-color-darker)',
  hexShareIconGray: 'var(--color-hex-share-icon-gray)',
  howToColor: 'var(--color-how-to-color)',
  navlinkColor: 'var(--color-navlink-color)',
  timberwolf: 'var(--color-timberwolf)',
  tinyTagGray: 'var(--color-tiny-tag-gray)',

  // Oranges / Reds
  alertColor: 'var(--color-alert-color)',
  redOrange: 'var(--color-red-orange)',
  reportAlert: 'var(--color-report-alert)',

  // Whites / Misc
  exploreBgColor: 'var(--color-explore-bg-color)',
  infobarColor: 'var(--color-infobar-color)',
  standardInfo: 'var(--color-standard-info)',
  standardWarning: 'var(--color-standard-warning)',
  tableZebra: 'var(--color-table-zebra)',
  transparent: 'var(--color-transparent)',
  whiteSmoke80: 'var(--color-white-smoke80)',
  altWhite: 'var(--color-alt-white)',

  // Time Chart
  timeDarkRed: 'var(--color-time-dark-red)',
  timeCyanBlue: 'var(--color-time-cyan-blue)',
  timePink: 'var(--color-time-pink)',
  timePurple: 'var(--color-time-purple)',
  timeYellow: 'var(--color-time-yellow)',
  timePastelGreen: 'var(--color-time-pastel-green)',

  // Map Schemes: Standard
  mapDark: 'var(--color-map-dark)',
  mapDarkZero: 'var(--color-map-dark-zero)',
  mapDarker: 'var(--color-map-darker)',
  mapDarkest: 'var(--color-map-darkest)',
  mapLight: 'var(--color-map-light)',
  mapLighter: 'var(--color-map-lighter)',
  mapLightest: 'var(--color-map-lightest)',
  mapLightZero: 'var(--color-map-light-zero)',
  mapMid: 'var(--color-map-mid)',

  // Map Schemes: Medicare
  mapMedicareDark: 'var(--color-map-medicare-dark)',
  mapMedicareDarkZero: 'var(--color-map-medicare-dark-zero)',
  mapMedicareDarkest: 'var(--color-map-medicare-darkest)',
  mapMedicareEvenLighter: 'var(--color-map-medicare-even-lighter)',
  mapMedicareLight: 'var(--color-map-medicare-light)',
  mapMedicareLighter: 'var(--color-map-medicare-lighter)',
  mapMedicareLightest: 'var(--color-map-medicare-lightest)',
  mapMedicareLightZero: 'var(--color-map-medicare-light-zero)',
  mapMedicareMid: 'var(--color-map-medicare-mid)',

  // Map Schemes: Men
  mapMenDark: 'var(--color-map-men-dark)',
  mapMenDarker: 'var(--color-map-men-darker)',
  mapMenLight: 'var(--color-map-men-light)',
  mapMenLighter: 'var(--color-map-men-lighter)',
  mapMenLightest: 'var(--color-map-men-lightest)',
  mapMenMid: 'var(--color-map-men-mid)',

  // Map Schemes: Women
  mapWomenDark: 'var(--color-map-women-dark)',
  mapWomenDarkZero: 'var(--color-map-women-dark-zero)',
  mapWomenDarker: 'var(--color-map-women-darker)',
  mapWomenDarkest: 'var(--color-map-women-darkest)',
  mapWomenLight: 'var(--color-map-women-light)',
  mapWomenLighter: 'var(--color-map-women-lighter)',
  mapWomenLightest: 'var(--color-map-women-lightest)',
  mapWomenLightZero: 'var(--color-map-women-light-zero)',
  mapWomenMid: 'var(--color-map-women-mid)',

  // Map Schemes: Youth
  mapYouthDark: 'var(--color-map-youth-dark)',
  mapYouthDarkZero: 'var(--color-map-youth-dark-zero)',
  mapYouthDarker: 'var(--color-map-youth-darker)',
  mapYouthDarkest: 'var(--color-map-youth-darkest)',
  mapYouthLight: 'var(--color-map-youth-light)',
  mapYouthLighter: 'var(--color-map-youth-lighter)',
  mapYouthLightest: 'var(--color-map-youth-lightest)',
  mapYouthLightZero: 'var(--color-map-youth-light-zero)',
  mapYouthMid: 'var(--color-map-youth-mid)',

  // Unknown Map
  unknownMapLeast: 'var(--color-unknown-map-least)',
  unknownMapLess: 'var(--color-unknown-map-less)',
  unknownMapLesser: 'var(--color-unknown-map-lesser)',
  unknownMapMid: 'var(--color-unknown-map-mid)',
  unknownMapMore: 'var(--color-unknown-map-more)',
  unknownMapMost: 'var(--color-unknown-map-most)',
} as const

export type HetColor = (typeof het)[keyof typeof het]

// --- Other Theme Constants ---

export const ThemeStandardScreenSizes = {
  xs: '0px',
  tiny: '350px',
  sm: '600px',
  smplus: '768px',
  md: '960px',
  lg: '1280px',
  lgplus: '1440px',
  xl: '1920px',
  full: '100%',
  eighty: '80vw',
}

export const ThemeZIndexValues = {
  bottom: -999,
  middle: 0,
  almostTop: 3,
  mapTooltip: 98,
  top: 99,
  stickyMadLib: 100,
  multimapModal: 101,
  skipLink: 102,
  multimapModalTooltip: 1300,
}
