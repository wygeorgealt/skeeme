export const ALLO_FONT_ASSETS = {
  'Allo-Regular': require('@/assets/fonts/Allo-Regular.otf'),
  'Allo-Medium': require('@/assets/fonts/Allo-Medium.otf'),
  'Allo-Bold': require('@/assets/fonts/Allo-Bold.otf'),
  'Allo-Black': require('@/assets/fonts/Allo-Black.otf'),
  // Metro needs a literal asset require to bundle the webfont locally.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Allo: require('allo-font/fonts/webfonts/AlloVariable.woff2'),
};
