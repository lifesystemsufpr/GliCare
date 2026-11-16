import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AxiosError } from 'axios';
import { buildHomeSummary, chartScale, homeNeedsReload } from '../src/features/home/services/home-model.ts';

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
const point = (day = 30, hour = 8, valor = 105) => ({ dataHora: date(day, hour), valor });
// Formato de GET /home/summary.
const empty = () => ({ nome: 'Maria', ultimaGlicemia: null, ultimaInsulina: null, proximoLembrete: null,
  resumoDiario: { glicemiaRegistrada: false, insulinaRegistrada: false }, glicemiaUltimos7Dias: [] });

test('conta sem dados não inventa valores nem conclusões de rotina', () => {
  const summary = buildHomeSummary(empty(), now);
  assert.equal(summary.lastGlucose, null); assert.equal(summary.lastInsulin, null);
  assert.equal(summary.nextReminder, null); assert.equal(summary.glucoseToday, false); assert.equal(summary.insulinToday, false);
  assert.equal(summary.weekly.length, 7); assert.ok(summary.weekly.every((item) => item.value === null));
});
test('últimos registros vêm do resumo da API, sem alterar a resposta', () => {
  const sources = { ...empty(), ultimaGlicemia: glucose('new', 30, 10), ultimaInsulina: insulin('new', 30) };
  const before = structuredClone(sources);
  const result = buildHomeSummary(sources, now);
  assert.equal(result.lastGlucose.id, 'new'); assert.equal(result.lastInsulin.id, 'new');
  assert.deepEqual(sources, before);
});
test('último registro antigo não é confundido com registro de hoje', () => {
  const result = buildHomeSummary({ ...empty(), ultimaGlicemia: glucose('old', 29), ultimaInsulina: insulin('old', 29) }, now);
  assert.equal(result.lastGlucose.id, 'old'); assert.equal(result.glucoseToday, false); assert.equal(result.insulinToday, false);
});
test('resumo diário usa o calendário local e limites de meia-noite', () => {
  const instant = new Date(2026, 9, 30, 0, 5);
  const result = buildHomeSummary({ ...empty(), ultimaGlicemia: glucose('today', 30, 0), ultimaInsulina: insulin('yesterday', 29, 23) }, instant);
  assert.equal(result.glucoseToday, true); assert.equal(result.insulinToday, false);
});
test('registros futuros (API sem o filtro) não viram últimos registros realizados', () => {
  const result = buildHomeSummary({ ...empty(), ultimaGlicemia: glucose('future', 31), ultimaInsulina: insulin('future', 31),
    glicemiaUltimos7Dias: [point(31, 8, 300)] }, now);
  assert.equal(result.lastGlucose, null); assert.equal(result.lastInsulin, null);
  assert.ok(result.weekly.every((item) => item.value === null));
});
test('medição de hoje no gráfico conta no resumo diário mesmo com última glicemia futura', () => {
  const result = buildHomeSummary({ ...empty(), ultimaGlicemia: glucose('future', 30, 18), glicemiaUltimos7Dias: [point(30, 9)] }, now);
  assert.equal(result.lastGlucose, null); assert.equal(result.glucoseToday, true);
});
test('gráfico mostra a última medição do dia, sem calcular média', () => {
  const result = buildHomeSummary({ ...empty(), glicemiaUltimos7Dias: [point(30, 7, 80), point(30, 10, 250)] }, now);
  assert.equal(result.weekly.at(-1).value, 250);
});
test('janela inclui hoje e seis dias anteriores, com lacunas e ordem cronológica', () => {
  const result = buildHomeSummary({ ...empty(), glicemiaUltimos7Dias: [point(23), point(24, 8, 90)] }, now);
  assert.equal(result.weekly[0].date, '2026-10-24'); assert.equal(result.weekly.at(-1).date, '2026-10-30');
  assert.equal(result.weekly[0].value, 90); assert.equal(result.weekly[1].value, null);
});
test('próximo lembrete vem da API e some quando passa ou se estiver inativo', () => {
  assert.equal(buildHomeSummary({ ...empty(), proximoLembrete: reminder('next', 30, 14) }, now).nextReminder.id, 'next');
  assert.equal(buildHomeSummary({ ...empty(), proximoLembrete: reminder('next', 30, 14) }, new Date(2026, 9, 30, 14, 1)).nextReminder, null);
  assert.equal(buildHomeSummary({ ...empty(), proximoLembrete: reminder('off', 30, 14, 'INATIVO') }, now).nextReminder, null);
});
test('reavaliação após meia-noite atualiza resumo e janela semanal', () => {
  const sources = { ...empty(), ultimaGlicemia: glucose('today'), glicemiaUltimos7Dias: [point()] };
  assert.equal(buildHomeSummary(sources, now).glucoseToday, true);
  const tomorrow = buildHomeSummary(sources, new Date(2026, 9, 31, 0, 1));
  assert.equal(tomorrow.glucoseToday, false); assert.equal(tomorrow.weekly.at(-1).value, null);
});
test('resumo fica velho na virada do dia e quando o lembrete passa', () => {
  const sources = { ...empty(), proximoLembrete: reminder('next', 30, 13) };
  assert.equal(homeNeedsReload(sources, now, new Date(2026, 9, 30, 12, 30)), false);
  assert.equal(homeNeedsReload(sources, now, new Date(2026, 9, 30, 13, 1)), true);
  assert.equal(homeNeedsReload(empty(), now, new Date(2026, 9, 31, 0, 1)), true);
});
test('escala comporta valores extremos sem fixar teto em 140', () => {
  const points = [50, 250, 500, null].map((value) => ({ value }));
  assert.deepEqual(chartScale(points), { min: 0, max: 500 });
  assert.deepEqual(chartScale([{ value: 501 }]), { min: 0, max: 550 });
  assert.deepEqual(chartScale([]), { min: 0, max: 100 });
});
test('datas inválidas causam erro em vez de resumo silenciosamente vazio', () => {
  assert.throws(() => buildHomeSummary({ ...empty(), ultimaGlicemia: { ...glucose('invalid'), dataHora: 'invalid' } }, now));
  assert.throws(() => buildHomeSummary({ ...empty(), ultimaInsulina: { ...insulin('invalid'), dataHora: null } }, now));
  assert.throws(() => buildHomeSummary({ ...empty(), glicemiaUltimos7Dias: [{ valor: 100, dataHora: 'invalid' }] }, now));
});
test('valores inválidos da API são rejeitados', () => {
  assert.throws(() => buildHomeSummary({ ...empty(), ultimaGlicemia: { ...glucose('invalid'), valor: NaN } }, now));
  assert.throws(() => buildHomeSummary({ ...empty(), ultimaInsulina: { ...insulin('invalid'), doseUi: 0 } }, now));
  assert.throws(() => buildHomeSummary({ ...empty(), glicemiaUltimos7Dias: [point(30, 8, 0)] }, now));
});
test('classificação é preservada como recebida, sem regra clínica duplicada', () => {
  const result = buildHomeSummary({ ...empty(), ultimaGlicemia: { ...glucose('server-status'), status: 'ALTA' } }, now);
  assert.equal(result.lastGlucose.status, 'ALTA');
});

const calls = [];
let fail = false;
let response = { ...empty(), ultimaGlicemia: glucose('g'), ultimaInsulina: insulin('i'), proximoLembrete: reminder('r') };
api.defaults.headers.common.Authorization = 'Bearer synthetic-token';
api.defaults.adapter = async (config) => {
  calls.push(config);
  if (fail) throw new AxiosError('network');
  return { config, status: 200, statusText: 'OK', headers: {}, data: response };
};
test('Home faz um GET autenticado de /home/summary e não envia dados no corpo', async () => {
  const result = await loadHomeSources();
  assert.equal(result.ultimaGlicemia.id, 'g'); assert.equal(result.ultimaInsulina.id, 'i'); assert.equal(result.proximoLembrete.id, 'r');
  const config = calls.at(-1);
  assert.equal(config.url, '/home/summary'); assert.equal(config.method, 'get');
  assert.equal(config.headers.Authorization, 'Bearer synthetic-token'); assert.equal(config.data, undefined);
  assert.ok(!calls.some((item) => ['/glycemias', '/insulin-applications', '/reminders'].includes(item.url)));
});
test('cancelamento impede a consulta', async () => {
  const controller = new AbortController(); controller.abort();
  const before = calls.length; await assert.rejects(loadHomeSources(controller.signal)); assert.equal(calls.length, before);
});
test('falha de rede rejeita a Home, sem inventar resumo vazio', async () => {
  fail = true; await assert.rejects(loadHomeSources()); fail = false;
});
test('resumo vazio é um resultado válido, distinto de falha', async () => {
  response = empty();
  assert.deepEqual(await loadHomeSources(), empty());
});
test('resposta incompatível rejeita a Home', async () => {
  response = { records: [] }; await assert.rejects(loadHomeSources());
  response = []; await assert.rejects(loadHomeSources());
});
