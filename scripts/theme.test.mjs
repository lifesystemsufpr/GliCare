import test from 'node:test';
import assert from 'node:assert/strict';
import {
  colors, darkColors, lightColors, paletteFor, parseThemeMode, stylesPerPalette,
} from '../src/shared/theme/colors.ts';

test('as duas paletas têm as mesmas chaves', () => {
  assert.deepEqual(Object.keys(darkColors).sort(), Object.keys(lightColors).sort());
});

test('o tema claro continua com as cores de antes', () => {
  assert.equal(colors, lightColors);
  assert.equal(lightColors.primary, '#0072C6');
  assert.equal(lightColors.white, '#FFFFFF');
  assert.equal(lightColors.onPrimary, '#FFFFFF');
});

test('preferência gravada: só "dark" liga o tema escuro', () => {
  assert.equal(parseThemeMode('dark'), 'dark');
  assert.equal(parseThemeMode('light'), 'light');
  assert.equal(parseThemeMode(null), 'light');
  assert.equal(parseThemeMode('qualquer'), 'light');
  assert.equal(paletteFor('dark'), darkColors);
  assert.equal(paletteFor('light'), lightColors);
});

function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

test('tema escuro: texto legível (4,5:1) nos pares principais', () => {
  const d = darkColors;
  for (const [fg, bg] of [
    [d.text, d.screen], [d.text, d.surface], [d.defaultText, d.surface], [d.textSecondary, d.surface],
    [d.primary, d.screen], [d.primary, d.surface], [d.onPrimary, d.primary],
    [d.onSecondary, d.secondary], [d.onPrimary, d.danger], [d.onPrimary, d.success],
    [d.success, d.successSoft], [d.warning, d.warningSoft], [d.danger, d.dangerSoft],
    [d.primary, d.blueTint], [d.gray600, d.surface], [d.gray500, d.surface],
  ]) {
    assert.ok(contrast(fg, bg) >= 4.5, `${fg} sobre ${bg}: ${contrast(fg, bg).toFixed(2)}`);
  }
  assert.ok(contrast(d.border, d.surface) >= 3, 'borda dos campos');
});

test('estilos são criados uma vez por paleta', () => {
  let calls = 0;
  const styles = stylesPerPalette((c) => { calls += 1; return { box: { backgroundColor: c.surface } }; });
  assert.equal(styles(lightColors), styles(lightColors));
  assert.equal(styles(darkColors).box.backgroundColor, darkColors.surface);
  assert.equal(calls, 2);
});
