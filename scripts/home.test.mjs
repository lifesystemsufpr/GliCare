import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AxiosError } from 'axios';
import { buildHomeSummary, chartScale } from '../src/features/home/services/home-model.ts';

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
const { api } = await import('../src/shared/api/api.ts');
const { loadHomeSources } = await import('../src/features/home/services/home-service.ts');
const now = new Date(2026, 9, 30, 12);
const date = (day = 30, hour = 8) => new Date(2026, 9, day, hour).toISOString();
const glucose = (id, day = 30, hour = 8, valor = 105) => ({ id, valor, momento: 'JEJUM', status: 'NORMAL', dataHora: date(day, hour), observacao: null });
const insulin = (id, day = 30, hour = 8) => ({ id, doseUi: 10, tipo: 'NPH', localAplicacao: null, dataHora: date(day, hour), observacao: null });
const reminder = (id, day = 30, hour = 13, status = 'ATIVO') => ({ id, titulo: 'Lembrete sintético', dataHora: date(day, hour), status });
const empty = () => ({ glucose: [], insulin: [], reminders: [] });

test('conta sem dados não inventa valores nem conclusões de rotina', () => {
  const summary = buildHomeSummary(empty(), now);
  assert.equal(summary.lastGlucose, null); assert.equal(summary.lastInsulin, null);
  assert.equal(summary.nextReminder, null); assert.equal(summary.glucoseToday, false); assert.equal(summary.insulinToday, false);
  assert.equal(summary.weekly.length, 7); assert.ok(summary.weekly.every((point) => point.value === null));
});
test('últimos registros são escolhidos por data, sem depender da ordem recebida', () => {
  const sources = { ...empty(), glucose: [glucose('old', 29), glucose('new', 30, 10), glucose('middle', 30, 8)],
    insulin: [insulin('old', 28), insulin('new', 30)] };
  const before = structuredClone(sources);
  const result = buildHomeSummary(sources, now);
  assert.equal(result.lastGlucose.id, 'new'); assert.equal(result.lastInsulin.id, 'new');
  assert.deepEqual(sources, before);
});
test('último registro antigo não é confundido com registro de hoje', () => {
  const result = buildHomeSummary({ ...empty(), glucose: [glucose('old', 29)], insulin: [insulin('old', 29)] }, now);
  assert.equal(result.lastGlucose.id, 'old'); assert.equal(result.glucoseToday, false); assert.equal(result.insulinToday, false);
});
test('resumo diário usa o calendário local e limites de meia-noite', () => {
  const instant = new Date(2026, 9, 30, 0, 5);
  const result = buildHomeSummary({ ...empty(), glucose: [glucose('today', 30, 0)], insulin: [insulin('yesterday', 29, 23)] }, instant);
  assert.equal(result.glucoseToday, true); assert.equal(result.insulinToday, false);
});
test('medições e aplicações futuras não viram últimos registros realizados', () => {
  const result = buildHomeSummary({ ...empty(), glucose: [glucose('future', 31)], insulin: [insulin('future', 31)] }, now);
  assert.equal(result.lastGlucose, null); assert.equal(result.lastInsulin, null);
});
test('gráfico mostra a última medição do dia, sem calcular média', () => {
  const result = buildHomeSummary({ ...empty(), glucose: [glucose('first', 30, 7, 80), glucose('last', 30, 10, 250)] }, now);
  assert.equal(result.weekly.at(-1).value, 250);
});
test('janela inclui hoje e seis dias anteriores, com lacunas e ordem cronológica', () => {
  const result = buildHomeSummary({ ...empty(), glucose: [glucose('too-old', 23), glucose('start', 24, 8, 90)] }, now);
  assert.equal(result.weekly[0].date, '2026-10-24'); assert.equal(result.weekly.at(-1).date, '2026-10-30');
  assert.equal(result.weekly[0].value, 90); assert.equal(result.weekly[1].value, null);
});
test('próximo lembrete ignora inativos e passados e escolhe o futuro mais próximo', () => {
  const result = buildHomeSummary({ ...empty(), reminders: [reminder('later', 31), reminder('past', 30, 11),
    reminder('inactive', 30, 13, 'INATIVO'), reminder('next', 30, 14)] }, now);
  assert.equal(result.nextReminder.id, 'next');
});
test('sem lembrete ativo futuro retorna ausência explícita', () => {
  const result = buildHomeSummary({ ...empty(), reminders: [reminder('past', 29), reminder('inactive', 31, 8, 'INATIVO')] }, now);
  assert.equal(result.nextReminder, null);
});
test('reavaliação após meia-noite atualiza resumo e janela semanal', () => {
  const sources = { ...empty(), glucose: [glucose('today')] };
  assert.equal(buildHomeSummary(sources, now).glucoseToday, true);
  const tomorrow = buildHomeSummary(sources, new Date(2026, 9, 31, 0, 1));
  assert.equal(tomorrow.glucoseToday, false); assert.equal(tomorrow.weekly.at(-1).value, null);
});
test('reavaliação do relógio remove lembrete que já passou', () => {
  const sources = { ...empty(), reminders: [reminder('first', 30, 13), reminder('second', 30, 14)] };
  assert.equal(buildHomeSummary(sources, now).nextReminder.id, 'first');
  assert.equal(buildHomeSummary(sources, new Date(2026, 9, 30, 13, 1)).nextReminder.id, 'second');
});
test('escala comporta valores extremos sem fixar teto em 140', () => {
  const points = [50, 250, 500, null].map((value) => ({ value }));
  assert.deepEqual(chartScale(points), { min: 0, max: 500 });
  assert.deepEqual(chartScale([{ value: 501 }]), { min: 0, max: 550 });
  assert.deepEqual(chartScale([]), { min: 0, max: 100 });
});
test('datas inválidas causam erro em vez de resumo silenciosamente vazio', () => {
  assert.throws(() => buildHomeSummary({ ...empty(), glucose: [{ ...glucose('invalid'), dataHora: 'invalid' }] }, now));
  assert.throws(() => buildHomeSummary({ ...empty(), insulin: [{ ...insulin('invalid'), dataHora: null }] }, now));
});
test('valores inválidos da API são rejeitados', () => {
  assert.throws(() => buildHomeSummary({ ...empty(), glucose: [{ ...glucose('invalid'), valor: NaN }] }, now));
  assert.throws(() => buildHomeSummary({ ...empty(), insulin: [{ ...insulin('invalid'), doseUi: 0 }] }, now));
});
test('classificação é preservada como recebida, sem regra clínica duplicada', () => {
  const result = buildHomeSummary({ ...empty(), glucose: [{ ...glucose('server-status'), status: 'ALTA' }] }, now);
  assert.equal(result.lastGlucose.status, 'ALTA');
});

const calls = [];
let failPath;
let responses = { '/glycemias': [glucose('g')], '/insulin-applications': [insulin('i')], '/reminders': [reminder('r')] };
api.defaults.headers.common.Authorization = 'Bearer synthetic-token';
api.defaults.adapter = async (config) => {
  calls.push(config);
  if (config.url === failPath) throw new AxiosError('network');
  return { config, status: 200, statusText: 'OK', headers: {}, data: responses[config.url] };
};
test('Home reutiliza os três GETs autenticados e não envia dados de usuário no corpo', async () => {
  const result = await loadHomeSources();
  assert.equal(result.glucose[0].id, 'g'); assert.equal(result.insulin[0].id, 'i'); assert.equal(result.reminders[0].id, 'r');
  assert.deepEqual(calls.slice(-3).map((config) => config.url).sort(), ['/glycemias', '/insulin-applications', '/reminders'].sort());
  for (const config of calls.slice(-3)) { assert.equal(config.method, 'get'); assert.equal(config.headers.Authorization, 'Bearer synthetic-token'); assert.equal(config.data, undefined); }
});
test('cancelamento impede as três consultas', async () => {
  const controller = new AbortController(); controller.abort();
  const before = calls.length; await assert.rejects(loadHomeSources(controller.signal)); assert.equal(calls.length, before);
});
test('falha de uma fonte rejeita o conjunto, sem inventar lista vazia', async () => {
  failPath = '/insulin-applications'; await assert.rejects(loadHomeSources()); failPath = undefined;
});
test('três fontes vazias são um resultado válido, distinto de falha', async () => {
  responses = { '/glycemias': [], '/insulin-applications': [], '/reminders': [] };
  assert.deepEqual(await loadHomeSources(), empty());
});
test('resposta incompatível de uma fonte também rejeita a Home', async () => {
  responses['/glycemias'] = { records: [] }; await assert.rejects(loadHomeSources());
});
