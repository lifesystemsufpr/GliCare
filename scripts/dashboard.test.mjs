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
const { buildDashboard, presetPeriod, periodDays, periodInput, displayDay } = await import('../src/features/dashboard/services/dashboard-model.ts');
const { api } = await import('../src/shared/api/api.ts');
const { loadDashboard } = await import('../src/features/dashboard/services/dashboard-service.ts');
const now = new Date(2026, 10, 3, 12);
const period = { start: '2026-11-01', end: '2026-11-03' };
const date = (day, hour = 8, minute = 0) => new Date(2026, 10, day, hour, minute).toISOString();
const glucose = (id, day, valor = 100, status = 'NORMAL', hour = 8, minute = 0) =>
  ({ id, valor, status, momento: 'JEJUM', dataHora: date(day, hour, minute), observacao: null });
const insulin = (id, day) => ({ id, doseUi: 10, tipo: 'NPH', dataHora: date(day), localAplicacao: null, observacao: null });
const empty = () => ({ glucose: [], insulin: [] });

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
test('vazio mantém média, mínimo, máximo e percentuais ausentes', () => {
  const result = buildDashboard(empty(), period, now);
  assert.equal(result.measurements, 0); assert.equal(result.applications, 0);
  assert.equal(result.mean, null); assert.equal(result.min, null); assert.equal(result.max, null);
  assert.ok(result.distribution.every((item) => item.count === 0 && item.percentage === null));
});
test('média global usa todas as medições, não média não ponderada dos dias', () => {
  const result = buildDashboard({ ...empty(), glucose: [glucose('a', 1, 50), glucose('b', 1, 150), glucose('c', 2, 150)] }, period, now);
  assert.equal(result.mean, 350 / 3); assert.equal(result.min, 50); assert.equal(result.max, 150);
  assert.equal(result.measurements, 3);
});
test('distribuição usa status da API e percentual por contagem, sem recálculo clínico', () => {
  const result = buildDashboard({ ...empty(), glucose: [glucose('a', 1, 100, 'ALTA'), glucose('b', 2, 100, 'BAIXA'), glucose('c', 3, 100)] }, period, now);
  for (const item of result.distribution) { assert.equal(item.count, 1); assert.ok(Math.abs(item.percentage - 100 / 3) < 1e-10); }
});
test('aplicações são contadas sem somar doses de tipos diferentes', () => {
  const result = buildDashboard({ ...empty(), insulin: [insulin('a', 1), { ...insulin('b', 2), tipo: 'Rápida' }, insulin('old', -1)] }, period, now);
  assert.equal(result.applications, 2); assert.equal(result.mean, null);
});
test('extremos incluem início à meia-noite e fim às 23:59 locais', () => {
  const range = { start: '2026-11-01', end: '2026-11-02' };
  const result = buildDashboard({ ...empty(), glucose: [glucose('start', 1, 90, 'NORMAL', 0),
    glucose('end', 2, 110, 'NORMAL', 23, 59), glucose('after', 3), glucose('before', 0)] }, range, now);
  assert.equal(result.measurements, 2); assert.equal(result.mean, 100);
});
test('registros futuros são excluídos mesmo quando o dia final é hoje', () => {
  const result = buildDashboard({ ...empty(), glucose: [glucose('future', 3, 200, 'ALTA', 13)],
    insulin: [{ ...insulin('future', 3), dataHora: date(3, 14) }] }, period, now);
  assert.equal(result.measurements, 0); assert.equal(result.applications, 0);
});
test('gráfico calcula a média diária e não apenas o último registro', () => {
  const result = buildDashboard({ ...empty(), glucose: [glucose('a', 1, 80), glucose('b', 1, 120, 'NORMAL', 10)] }, period, now);
  assert.equal(result.daily[0].mean, 100); assert.equal(result.daily[0].count, 2);
});
test('dias sem registros permanecem lacunas em ordem cronológica', () => {
  const result = buildDashboard({ ...empty(), glucose: [glucose('a', 3)] }, period, now);
  assert.deepEqual(result.daily.map((point) => point.date), ['2026-11-01', '2026-11-02', '2026-11-03']);
  assert.deepEqual(result.daily.map((point) => point.mean), [null, null, 100]);
});
test('filtragem não modifica as fontes nem depende da ordem delas', () => {
  const sources = { ...empty(), glucose: [glucose('last', 3, 200), glucose('first', 1, 100)] };
  const before = structuredClone(sources); const result = buildDashboard(sources, period, now);
  assert.equal(result.mean, 150); assert.deepEqual(sources, before);
});
test('respostas com números, datas ou status inválidos não geram indicadores falsos', () => {
  for (const invalid of [{ ...glucose('a', 1), valor: NaN }, { ...glucose('a', 1), dataHora: null }, { ...glucose('a', 1), status: 'OTHER' }]) {
    assert.throws(() => buildDashboard({ ...empty(), glucose: [invalid] }, period, now));
  }
  assert.throws(() => buildDashboard({ ...empty(), insulin: [{ ...insulin('a', 1), doseUi: 0 }] }, period, now));
});

const calls = [];
let responses = { '/glycemias': [glucose('g', 1)], '/insulin-applications': [insulin('i', 1)] };
let failPath;
api.defaults.headers.common.Authorization = 'Bearer synthetic-token';
api.defaults.adapter = async (config) => {
  calls.push(config);
  if (config.url === failPath) throw new AxiosError('network');
  return { config, status: 200, statusText: 'OK', headers: {}, data: responses[config.url] };
};
test('reutiliza dois GETs autenticados sem enviar IDs ou filtros no fuso do servidor', async () => {
  const result = await loadDashboard();
  assert.equal(result.glucose[0].id, 'g'); assert.equal(result.insulin[0].id, 'i');
  for (const config of calls.slice(-2)) {
    assert.equal(config.method, 'get'); assert.equal(config.headers.Authorization, 'Bearer synthetic-token');
    assert.equal(config.params, undefined); assert.equal(config.data, undefined);
  }
});
test('cancelamento impede consultas', async () => {
  const controller = new AbortController(); controller.abort(); const before = calls.length;
  await assert.rejects(loadDashboard(controller.signal)); assert.equal(calls.length, before);
});
test('falha de uma fonte não é transformada em conjunto vazio', async () => {
  failPath = '/glycemias'; await assert.rejects(loadDashboard()); failPath = undefined;
});
test('fontes vazias são aceitas sem criar medições', async () => {
  responses = { '/glycemias': [], '/insulin-applications': [] };
  assert.deepEqual(await loadDashboard(), empty());
});
test('resposta incompatível rejeita carregamento', async () => {
  responses['/glycemias'] = { records: [] }; await assert.rejects(loadDashboard());
});
