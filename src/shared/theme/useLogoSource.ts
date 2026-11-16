import type { ImageSourcePropType } from 'react-native';

import { useTheme } from './ThemeProvider';

const logo: ImageSourcePropType = require('../../../assets/images/logo.png');
// Mesmo logo com o desenho branco preenchido. No original o desenho é um
// recorte transparente, que no tema escuro ficaria escuro.
const logoDark: ImageSourcePropType = require('../../../assets/images/logo-dark.png');

export function useLogoSource(): ImageSourcePropType {
  return useTheme().mode === 'dark' ? logoDark : logo;
}
