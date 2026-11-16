import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AxiosError } from 'axios';

registerHooks({
  resolve(specifier, context, nextResolve) {
    const base = specifier.startsWith('@/') ? new URL('../src/' + specifier.slice(2), import.meta.url)
      : specifier.startsWith('.') && context.parentURL?.includes('/src/') ? new URL(specifier, context.parentURL) : null;
    if (base) for (const suffix of ['.ts', '/index.ts']) {
      const url = new URL(base.href + suffix);
      if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
process.env.EXPO_PUBLIC_API_URL = 'https://api.example.test/api';
const { toDashboardSummary, presetPeriod, periodDays, periodInput, displayDay } = await import('../src/features/dashboard/services/dashboard-model.ts');
const { api } = await import('../src/shared/api/api.ts');
const { loadDashboard } = await import('../src/features/dashboard/services/dashboard-service.ts');
const now = new Date(2026, 10, 3, 12);
const period = { start: '2026-11-01', end: '2026-11-03' };
const band = (quantidade, percentual) => ({ quantidade, percentual });
const empty = () => ({
  mediaGlicemia: null, maiorValor: null, menorValor: null, glicemiaAoLongoDoDia: [], insulinaTotalDiaria: [],
  distribuicaoLeituras: { total: 0, muitoBaixa: band(0, null), baixa: band(0, null), noAlvo: band(0, null), alta: band(0, null), muitoAlta: band(0, null) },
  mediaPorMomento: [],
});
const full = () => ({
  mediaGlicemia: 128.5,
  maiorValor: { valor: 260, dataHora: '2026-11-02T15:00:00.000Z', momento: 'APOS_ALMOCO' },
  menorValor: { valor: 50, dataHora: '2026-11-01T11:00:00.000Z', momento: 'JEJUM' },
  glicemiaAoLongoDoDia: [
    { valor: 50, dataHora: '2026-11-01T11:00:00.000Z', momento: 'JEJUM' },
    { valor: 260, dataHora: '2026-11-02T15:00:00.000Z', momento: 'APOS_ALMOCO' },
  ],
  insulinaTotalDiaria: [{ data: '2026-11-01', totalUi: 14.5, quantidade: 2 }, { data: '2026-11-03', totalUi: 8, quantidade: 1 }],
  distribuicaoLeituras: { total: 4, muitoBaixa: band(1, 25), baixa: band(0, 0), noAlvo: band(2, 50), alta: band(0, 0), muitoAlta: band(1, 25) },
  mediaPorMomento: [{ momento: 'JEJUM', media: 75, quantidade: 2 }, { momento: 'APOS_ALMOCO', media: 182, quantidade: 2 }],
});

test('presets usam dias de calendário inclusivos', () => {
  for (const days of [7, 30, 90]) {
    const range = presetPeriod(days, now);
    assert.equal(range.end, '2026-11-03'); assert.equal(periodDays(range, now).length, days);
  }
  assert.equal(presetPeriod(7, now).start, '2026-10-28');
});
test('data do formulário é convertida sem parsing UTC de dia civil', () => {
  assert.equal(periodInput('01/11/2026'), '2026-11-01');
  assert.equal(displayDay('2026-11-01'), new Date(2026, 10, 1).toLocaleDateString('pt-BR'));
  assert.throws(() => periodInput('2026-11-01'));
});
test('períodos invertidos, futuros e datas inexistentes são rejeitados', () => {
  for (const range of [{ start: '2026-11-03', end: '2026-11-01' }, { start: '2026-11-01', end: '2026-11-04' },
    { start: '2026-02-30', end: '2026-03-01' }, { start: 'invalid', end: period.end }]) {
    assert.throws(() => periodDays(range, now));
  }
});
test('até 366 dias são permitidos, incluindo ano bissexto', () => {
  assert.equal(periodDays({ start: '2024-01-01', end: '2024-12-31' }, now).length, 366);
  assert.throws(() => periodDays({ start: '2024-01-01', end: '2025-01-01' }, now), /366/);
});
test('um único dia é um período válido', () => {
  assert.equal(periodDays({ start: '2026-11-03', end: '2026-11-03' }, now).length, 1);
});
test('período sem dados mantém média, extremos e percentuais ausentes, sem inventar zeros', () => {
  const result = toDashboardSummary(empty());
  assert.equal(result.measurements, 0); assert.equal(result.applications, 0); assert.equal(result.insulinTotal, 0);
  assert.equal(result.mean, null); assert.equal(result.min, null); assert.equal(result.max, null);
  assert.ok(result.bands.every((item) => item.count === 0 && item.percentage === null));
  assert.deepEqual(result.byMoment, []); assert.deepEqual(result.insulinDaily, []);
});
test('indicadores vêm da API sem recálculo no aparelho', () => {
  const result = toDashboardSummary(full());
  assert.equal(result.measurements, 4); assert.equal(result.mean, 128.5);
  assert.deepEqual(result.min, { value: 50, at: '2026-11-01T11:00:00.000Z', moment: 'Jejum' });
  assert.equal(result.max.value, 260);
});
test('cinco faixas na ordem do consenso, com a faixa abaixo de 54 separada', () => {
  const result = toDashboardSummary(full());
  assert.deepEqual(result.bands.map((item) => item.key), ['muitoBaixa', 'baixa', 'noAlvo', 'alta', 'muitoAlta']);
  assert.match(result.bands[0].label, /abaixo de 54/);
  assert.deepEqual(result.bands.map((item) => item.count), [1, 0, 2, 0, 1]);
  assert.equal(result.bands[2].percentage, 50);
});
test('média por momento usa os rótulos do app', () => {
  const result = toDashboardSummary(full());
  assert.deepEqual(result.byMoment, [{ moment: 'Jejum', mean: 75, count: 2 }, { moment: 'Após o almoço', mean: 182, count: 2 }]);
});
test('aplicações e total de insulina somam os dias informados pela API', () => {
  const result = toDashboardSummary(full());
  assert.equal(result.applications, 3); assert.equal(result.insulinTotal, 22.5);
  assert.deepEqual(result.insulinDaily.map((day) => [day.date, day.totalUi, day.count]), [['2026-11-01', 14.5, 2], ['2026-11-03', 8, 1]]);
  assert.equal(result.insulinDaily[0].label, displayDay('2026-11-01'));
});
test('gráfico usa as medições da API na ordem recebida, sem agregar', () => {
  const result = toDashboardSummary(full());
  assert.deepEqual(result.readings.map((point) => [point.value, point.moment]), [[50, 'Jejum'], [260, 'Após o almoço']]);
  assert.deepEqual(toDashboardSummary(empty()).readings, []);
  assert.throws(() => toDashboardSummary({ ...full(), glicemiaAoLongoDoDia: [{ valor: 100, dataHora: 'x', momento: 'JEJUM' }] }));
});
test('resposta não é alterada', () => {
  const data = full(); const before = structuredClone(data); toDashboardSummary(data); assert.deepEqual(data, before);
});
test('respostas incompatíveis não geram indicadores falsos', () => {
  for (const broken of [
    null, { ...full(), distribuicaoLeituras: undefined }, { ...full(), insulinaTotalDiaria: {} },
    { ...full(), mediaGlicemia: NaN }, { ...full(), maiorValor: { valor: 100, dataHora: 'x', momento: 'JEJUM' } },
    { ...full(), insulinaTotalDiaria: [{ data: '2026-11-01', totalUi: 10 }] },
    { ...full(), distribuicaoLeituras: { ...full().distribuicaoLeituras, alta: undefined } },
  ]) assert.throws(() => toDashboardSummary(broken));
});

const calls = [];
let response = full();
let failure;
api.defaults.headers.common.Authorization = 'Bearer synthetic-token';
api.defaults.adapter = async (config) => {
  calls.push(config);
  if (failure) throw failure;
  return { config, status: 200, statusText: 'OK', headers: {}, data: response };
};
test('um GET autenticado de /dashboard com o período em dias civis', async () => {
  const range = { start: '2026-11-01', end: '2026-11-03' };
  const result = await loadDashboard(range);
  assert.equal(result.measurements, 4);
  const config = calls.at(-1);
  assert.equal(config.url, '/dashboard'); assert.equal(config.method, 'get');
  assert.deepEqual(config.params, { startDate: '2026-11-01', endDate: '2026-11-03' });
  assert.equal(config.headers.Authorization, 'Bearer synthetic-token'); assert.equal(config.data, undefined);
});
test('período inválido e cancelamento não disparam HTTP', async () => {
  const before = calls.length;
  await assert.rejects(loadDashboard({ start: '2026-11-03', end: '2026-11-01' }));
  const controller = new AbortController(); controller.abort();
  await assert.rejects(loadDashboard({ start: '2026-11-01', end: '2026-11-03' }, controller.signal));
  assert.equal(calls.length, before);
});
test('falha HTTP não vira indicador vazio', async () => {
  failure = new AxiosError('network'); await assert.rejects(loadDashboard({ start: '2026-11-01', end: '2026-11-03' })); failure = undefined;
});
test('resposta incompatível rejeita o carregamento', async () => {
  response = { records: [] }; await assert.rejects(loadDashboard({ start: '2026-11-01', end: '2026-11-03' })); response = full();
});
