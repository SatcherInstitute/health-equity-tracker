export const hetColors = {
  // Primary / Secondary (also in MUI palette)
  altGreen: '#0b5240',
  darkGreen: '#083f31',
  barChartLight: '#91c684',
  secondaryMain: '#228b7e',
  secondaryLight: '#89d5cc',
  secondaryDark: '#167b6f',

  // Blues
  darkBlue: '#255792',
  timeCyanBlue: '#79b4b7',

  // Greens
  barChartDark: '#0b5420',
  footerColor: '#edf3f0',
  groupGreen: '#7db640',
  groupYellowGreen: '#b9ce3a',
  hoverAltGreen: 'rgba(11, 82, 64, 0.08)',
  methodologyGreen: '#b5c7c2',
  toggleColor: '#e1e9e7',

  // Greys / Blacks
  altBlack: '#383838',
  altDark: '#5f6368',
  altGray: '#bdbdbd',
  bgColor: '#e2e2e2',
  borderColor: '#3e3e3e',
  dividerGray: '#0000001f',
  grayGridColorDarker: '#dddddd',
  hexShareIconGray: '#757575',
  howToColor: '#bdc1c6',
  navlinkColor: '#202124',
  timberwolf: '#cbd0c8',
  tinyTagGray: 'rgba(220, 229, 226, 0.18)',

  // Oranges / Reds
  alertColor: '#d85c47',
  redOrange: '#ed573f',
  reportAlert: '#ff9800',

  // Whites / Misc
  altWhite: '#fefefe',
  exploreBgColor: '#f1f4f8',
  infobarColor: '#f8e8b0',
  standardInfo: '#f8f9fa',
  standardWarning: '#fff8eb',
  transparent: '#00000000',
  whiteSmoke: 'rgba(240, 241, 239, 0.8)',

  // Time Chart
  timeDarkRed: '#8c0000',
  timePastelGreen: '#547d6b',
  timePink: '#ff85b3',
  timePurple: '#816d98',
  timeYellow: '#fcb431',

  // Map: Standard
  mapDark: '#027e47',
  mapDarkZero: '#35403d',
  mapDarker: '#185e49',
  mapDarkest: '#134b3a',
  mapLight: '#7db640',
  mapLighter: '#b9ce3a',
  mapLightest: '#f2e62f',
  mapLightZero: '#fff9c1',
  mapMid: '#3e9b42',

  // Map: Medicare
  mapMedicareDark: '#365c8d',
  mapMedicareDarkZero: '#090121',
  mapMedicareDarkest: '#46327f',
  mapMedicareEvenLighter: '#9fda3a',
  mapMedicareLight: '#1fa187',
  mapMedicareLighter: '#4bc16c',
  mapMedicareLightest: '#f0e525',
  mapMedicareLightZero: '#fff9c1',
  mapMedicareMid: '#267f8e',

  // Map: Men
  mapMenDark: '#65156e',
  mapMenDarker: '#280b54',
  mapMenLight: '#d44843',
  mapMenLighter: '#f57d15',
  mapMenLightest: '#fbc127',
  mapMenMid: '#9f2a63',

  // Map: Women
  mapWomenDark: '#8b0aa5',
  mapWomenDarkZero: '#120161',
  mapWomenDarker: '#5402a3',
  mapWomenDarkest: '#320161',
  mapWomenLight: '#db5b68',
  mapWomenLighter: '#f48849',
  mapWomenLightest: '#febc2b',
  mapWomenLightZero: '#f3e221',
  mapWomenMid: '#b93389',

  // Map: Youth
  mapYouthDark: '#c34e27',
  mapYouthDarkZero: '#5a2f2a',
  mapYouthDarker: '#a33a2b',
  mapYouthDarkest: '#772f2a',
  mapYouthLight: '#e87b26',
  mapYouthLighter: '#f09726',
  mapYouthLightest: '#f4b02a',
  mapYouthLightZero: '#f7d136',
  mapYouthMid: '#e06226',

  // Map: Unknown
  unknownMapLeast: '#d3eece',
  unknownMapLess: '#92d4be',
  unknownMapLesser: '#b8e3be',
  unknownMapMid: '#60bccb',
  unknownMapMore: '#47a8cb',
  unknownMapMost: '#0b61a2',
} as const

export type HetColorKey = keyof typeof hetColors
