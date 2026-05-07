const colorKeys = {
  // greens
  altGreen: '--color-alt-green',
  darkGreen: '--color-dark-green',
  hoverAltGreen: '--color-hover-alt-green',
  secondaryMain: '--color-secondary-main',
  secondaryLight: '--color-secondary-light',
  secondaryDark: '--color-secondary-dark',
  methodologyGreen: '--color-methodology-green',
  footerColor: '--color-footer-color',
  toggleColor: '--color-toggle-color',

  // greys / blacks
  altBlack: '--color-alt-black',
  altDark: '--color-alt-dark',
  altGray: '--color-alt-gray',
  bgColor: '--color-bg-color',
  black: '--color-black',
  borderColor: '--color-border-color',
  dividerGray: '--color-divider-gray',
  grayGridColorDarker: '--color-gray-grid-color-darker',
  hexShareIconGray: '--color-hex-share-icon-gray',
  howToColor: '--color-how-to-color',
  navlinkColor: '--color-navlink-color',
  timberwolf: '--color-timberwolf',

  // whites
  white: '--color-white',
  whiteSmoke80: '--color-white-smoke80',
  tableZebra: '--color-table-zebra',
  standardInfo: '--color-standard-info',
  standardWarning: '--color-standard-warning',
  exploreBgColor: '--color-explore-bg-color',
  infobarColor: '--color-infobar-color',

  // blues
  darkBlue: '--color-dark-blue',
  timeCyanBlue: '--color-time-cyan-blue',

  // oranges / reds
  alertColor: '--color-alert-color',
  redOrange: '--color-red-orange',
  reportAlert: '--color-report-alert',

  // misc
  tinyTagGray: '--color-tiny-tag-gray',
  transparent: '--color-transparent',
  groupGreen: '--color-group-green',
  groupYellowGreen: '--color-group-yellow-green',

  // bar chart
  barChartLight: '--color-bar-chart-light',
  barChartDark: '--color-bar-chart-dark',

  // time series
  timeDarkRed: '--color-time-dark-red',
  timePastelGreen: '--color-time-pastel-green',
  timePink: '--color-time-pink',
  timePurple: '--color-time-purple',
  timeYellow: '--color-time-yellow',

  // map schemes
  mapDark: '--color-map-dark',
  mapDarkZero: '--color-map-dark-zero',
  mapDarker: '--color-map-darker',
  mapDarkest: '--color-map-darkest',
  mapLight: '--color-map-light',
  mapLighter: '--color-map-lighter',
  mapLightest: '--color-map-lightest',
  mapLightZero: '--color-map-light-zero',
  mapMid: '--color-map-mid',
  mapMedicareDark: '--color-map-medicare-dark',
  mapMedicareDarkZero: '--color-map-medicare-dark-zero',
  mapMedicareDarkest: '--color-map-medicare-darkest',
  mapMedicareEvenLighter: '--color-map-medicare-even-lighter',
  mapMedicareLight: '--color-map-medicare-light',
  mapMedicareLighter: '--color-map-medicare-lighter',
  mapMedicareLightest: '--color-map-medicare-lightest',
  mapMedicareLightZero: '--color-map-medicare-light-zero',
  mapMedicareMid: '--color-map-medicare-mid',
  mapMenDark: '--color-map-men-dark',
  mapMenDarker: '--color-map-men-darker',
  mapMenLight: '--color-map-men-light',
  mapMenLighter: '--color-map-men-lighter',
  mapMenLightest: '--color-map-men-lightest',
  mapMenMid: '--color-map-men-mid',
  mapWomenDark: '--color-map-women-dark',
  mapWomenDarkZero: '--color-map-women-dark-zero',
  mapWomenDarker: '--color-map-women-darker',
  mapWomenDarkest: '--color-map-women-darkest',
  mapWomenLight: '--color-map-women-light',
  mapWomenLighter: '--color-map-women-lighter',
  mapWomenLightest: '--color-map-women-lightest',
  mapWomenLightZero: '--color-map-women-light-zero',
  mapWomenMid: '--color-map-women-mid',
  mapYouthDark: '--color-map-youth-dark',
  mapYouthDarkZero: '--color-map-youth-dark-zero',
  mapYouthDarker: '--color-map-youth-darker',
  mapYouthDarkest: '--color-map-youth-darkest',
  mapYouthLight: '--color-map-youth-light',
  mapYouthLighter: '--color-map-youth-lighter',
  mapYouthLightest: '--color-map-youth-lightest',
  mapYouthLightZero: '--color-map-youth-light-zero',
  mapYouthMid: '--color-map-youth-mid',

  // unknown map
  unknownMapLeast: '--color-unknown-map-least',
  unknownMapLess: '--color-unknown-map-less',
  unknownMapLesser: '--color-unknown-map-lesser',
  unknownMapMid: '--color-unknown-map-mid',
  unknownMapMore: '--color-unknown-map-more',
  unknownMapMost: '--color-unknown-map-most',
} as const

type ColorKey = keyof typeof colorKeys

export function hetColor(key: ColorKey): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(colorKeys[key])
    .trim()
}

if (import.meta.env.DEV) {
  console.info('DEV')
  const style = getComputedStyle(document.documentElement)
  for (const [name, variable] of Object.entries(colorKeys)) {
    if (!style.getPropertyValue(variable).trim()) {
      console.error(
        `hetColor: CSS variable ${variable} (${name}) is missing or empty`,
      )
    }
  }
}
