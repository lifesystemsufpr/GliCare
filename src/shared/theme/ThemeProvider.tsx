import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { paletteFor, parseThemeMode, stylesPerPalette, ThemeColors, ThemeMode } from './colors';
import { themeStorage } from './theme-storage';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: paletteFor('light'),
  setMode: () => undefined,
});

// Tema escolhido no Perfil. Começa claro e, ao abrir o app, restaura a
// preferência gravada no aparelho.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    let active = true;
    themeStorage.read()
      .then((saved) => { if (active) setModeState(parseThemeMode(saved)); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void themeStorage.write(next).catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ mode, colors: paletteFor(mode), setMode }), [mode, setMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}

// Uso numa tela:
//   const useStyles = makeStyles((c) => StyleSheet.create({ box: { backgroundColor: c.surface } }));
//   function Tela() { const styles = useStyles(); ... }
export function makeStyles<T>(factory: (c: ThemeColors) => T): () => T {
  const forPalette = stylesPerPalette(factory);
  return function useStyles() {
    return forPalette(useThemeColors());
  };
}
