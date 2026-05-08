export function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

/**
 * HET Design Tokens
 * * This object maps TypeScript keys to CSS variables defined in your @theme.
 * Use these for D3 fills, SVG attributes, or any logic where raw color strings are needed.
 */
export const hetColors = {
  // General UI
  howToColor: 'var(--color-how-to-color)',
  borderColor: 'var(--color-border-color)',
  secondaryDark: 'var(--color-secondary-dark)',
  secondaryLight: 'var(--color-secondary-light)',
  standardWarning: 'var(--color-standard-warning)',
  standardInfo: 'var(--color-standard-info)',
  toggleColor: 'var(--color-toggle-color)',

  // Bar Chart
  barChartDark: 'var(--color-bar-chart-dark)',
  barChartLight: 'var(--color-bar-chart-light)',

  // Map Schemes: Standard
  mapDarkZero: 'var(--color-map-dark-zero)',
  mapDark: 'var(--color-map-dark)',
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

  // Yellows / Oranges
  timeYellow: 'var(--color-time-yellow)',
  alertColor: 'var(--color-alert-color)',
  redOrange: 'var(--color-red-orange)',
  reportAlert: 'var(--color-report-alert)',

  // Greens
  altGreen: 'var(--color-alt-green)',
  darkGreen: 'var(--color-dark-green)',
  hoverAltGreen: 'var(--color-hover-alt-green)',
  secondaryMain: 'var(--color-secondary-main)',
  methodologyGreen: 'var(--color-methodology-green)',
  footerColor: 'var(--color-footer-color)',
  groupGreen: 'var(--color-group-green)',
  groupYellowGreen: 'var(--color-group-yellow-green)',

  // Greys / Blacks
  altBlack: 'var(--color-alt-black)',
  altDark: 'var(--color-alt-dark)',
  altGray: 'var(--color-alt-gray)',
  bgColor: 'var(--color-bg-color)',
  black: 'var(--color-black)',
  dividerGray: 'var(--color-divider-gray)',
  grayGridColorDarker: 'var(--color-gray-grid-color-darker)',
  hexShareIconGray: 'var(--color-hex-share-icon-gray)',
  navlinkColor: 'var(--color-navlink-color)',
  timberwolf: 'var(--color-timberwolf)',

  // Whites
  white: 'var(--color-white)',
  whiteSmoke80: 'var(--color-white-smoke80)',
  tableZebra: 'var(--color-table-zebra)',

  // Blues
  darkBlue: 'var(--color-dark-blue)',
  timeCyanBlue: 'var(--color-time-cyan-blue)',

  // Misc
  exploreBgColor: 'var(--color-explore-bg-color)',
  infobarColor: 'var(--color-infobar-color)',
  tinyTagGray: 'var(--color-tiny-tag-gray)',
  transparent: 'var(--color-transparent)',

  // Time Series
  timeDarkRed: 'var(--color-time-dark-red)',
  timePastelGreen: 'var(--color-time-pastel-green)',
  timePink: 'var(--color-time-pink)',
  timePurple: 'var(--color-time-purple)',
} as const

// Optional: Export a type for use in component props
export type HetColor = (typeof hetColors)[keyof typeof hetColors]
