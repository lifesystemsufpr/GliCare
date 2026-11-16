// Cores do app. As telas usam estes nomes em vez de hexadecimais (manual da
// Sprint 1). Há uma paleta clara e uma escura com as mesmas chaves; a tela
// pega a ativa com useThemeColors() ou makeStyles() (ThemeProvider).
export const lightColors = {
  primary: '#0072C6',
  secondary: '#DCEFFE',
  onSecondary: '#005A9E',

  background: '#FFFFFF',
  surface: '#FFFFFF',

  text: '#111827',
  textSecondary: '#6B7280',

  border: '#9CA3AF',

  error: '#DC2626',

  // `white` é cor de fundo (cartões, barra de abas). Texto e ícone sobre cor
  // forte (botão azul, vermelho, verde) usam `onPrimary`.
  white: '#FFFFFF',
  onPrimary: '#FFFFFF',

  // Neutros
  black: '#000000',
  overlay: '#00000066',
  screen: '#FAFAFA',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  ink: '#111111',
  inkSoft: '#222222',
  neutralSoft: '#F1F1F1',
  neutralSoftAlt: '#F0F0F0',
  watermark: '#F1F3F5',
  avatarBackground: '#E8EAF0',

  // Azuis
  blue50: '#EFF6FF',
  blue300: '#93C5FD',
  blueTintLight: '#F5FAFE',
  blueTint: '#EAF5FC',
  blueTintAlt: '#EAF4FC',
  blueBorderSoft: '#D8EAF7',
  blueBorder: '#CFE6F7',
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',

  // Estados
  success: '#15803D',
  successSoft: '#EAF7ED',
  warning: '#B45309',
  warningSoft: '#FFF7ED',
  danger: '#B91C1C',
  dangerSoft: '#FEF2F2',
  dangerBorder: '#FECACA',
};

export type ThemeColors = { [K in keyof typeof lightColors]: string };

// Tema escuro. Os cinzas são invertidos (os claros viram fundo escuro, os
// escuros viram texto claro) e os azuis ficam mais claros. O botão principal
// é azul claro com texto escuro: com azul médio e texto branco não dá para
// ter contraste 4,5:1 no botão e no texto azul ao mesmo tempo.
export const darkColors: ThemeColors = {
  primary: '#5AAEF0',
  secondary: '#16324A',
  onSecondary: '#A8D4F7',

  background: '#121417',
  surface: '#1B1F24',

  text: '#E8EAED',
  textSecondary: '#A9B0BA',

  border: '#6B7480',

  error: '#F87171',

  white: '#1B1F24',
  onPrimary: '#0B1B2B',

  black: '#000000',
  overlay: '#000000AA',
  screen: '#121417',
  gray50: '#1F242A',
  gray100: '#252B32',
  gray200: '#323A43',
  gray300: '#424B56',
  gray400: '#6B7480',
  gray500: '#A9B0BA',
  gray600: '#C3C9D1',
  gray700: '#D7DCE2',
  slate200: '#323A43',
  slate300: '#424B56',
  ink: '#F1F3F5',
  inkSoft: '#E5E7EB',
  neutralSoft: '#262B31',
  neutralSoftAlt: '#262B31',
  watermark: '#1F242A',
  avatarBackground: '#2A3340',

  blue50: '#16283A',
  blue300: '#4A85B8',
  blueTintLight: '#14222F',
  blueTint: '#172A3B',
  blueTintAlt: '#172A3B',
  blueBorderSoft: '#22405A',
  blueBorder: '#2A4D6B',
  indigo50: '#1D2140',
  indigo100: '#262B52',

  success: '#4ADE80',
  successSoft: '#13291C',
  warning: '#FBBF24',
  warningSoft: '#2E2210',
  danger: '#F87171',
  dangerSoft: '#2E1515',
  dangerBorder: '#5C2626',
};

export type ThemeMode = 'light' | 'dark';

export function paletteFor(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

export function parseThemeMode(value: string | null | undefined): ThemeMode {
  return value === 'dark' ? 'dark' : 'light';
}

// Cria os estilos de uma tela uma vez por paleta, para não refazer o
// StyleSheet a cada render.
export function stylesPerPalette<T>(factory: (c: ThemeColors) => T): (c: ThemeColors) => T {
  const cache = new Map<ThemeColors, T>();
  return (c) => {
    let styles = cache.get(c);
    if (!styles) {
      styles = factory(c);
      cache.set(c, styles);
    }
    return styles;
  };
}

// Paleta clara fixa. Só para código fora de tela (sem hook); telas usam o
// tema ativo.
export const colors: ThemeColors = lightColors;
