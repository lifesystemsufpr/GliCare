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
const { buildReport } = await import('../src/features/reports/services/report-model.ts');
const { toDashboardSummary } = await import('../src/features/dashboard/services/dashboard-model.ts');
const { reportHtml, escapeHtml } = await import('../src/features/reports/services/report-html.ts');
const { exportPdf } = await import('../src/features/reports/services/report-export-core.ts');
const { exportReport: printWeb } = await import('../src/features/reports/services/report-export.web.ts');
const { loadReport } = await import('../src/features/reports/services/report-service.ts');
const { api } = await import('../src/shared/api/api.ts');
const now = new Date(2026, 0, 3, 12);
const period = { start: '2026-01-01', end: '2026-01-03' };
const g = (id, day = 1, extra = {}) => ({ type: 'GLYCEMIA', id, dateTime: new Date(2026, 0, day, 8).toISOString(),
  glycemia: { valor: 100, momento: 'JEJUM', status: 'NORMAL', observacao: null, ...extra }, insulin: null });
const i = (id, day = 2, extra = {}) => ({ type: 'INSULIN', id, dateTime: new Date(2026, 0, day, 8).toISOString(),
  glycemia: null, insulin: { tipo: 'NPH', doseUi: 10, localAplicacao: null, observacao: null, ...extra } });
const band = (quantidade, percentual) => ({ quantidade, percentual });
const dashboardApi = (total = 1) => ({
  mediaGlicemia: total ? 100 : null,
  maiorValor: total ? { valor: 100, dataHora: new Date(2026, 0, 1, 8).toISOString(), momento: 'JEJUM' } : null,
  menorValor: total ? { valor: 100, dataHora: new Date(2026, 0, 1, 8).toISOString(), momento: 'JEJUM' } : null,
  glicemiaAoLongoDoDia: [], insulinaTotalDiaria: total ? [{ data: '2026-01-02', totalUi: 10, quantidade: 1 }] : [],
  distribuicaoLeituras: { total, muitoBaixa: band(0, 0), baixa: band(0, 0), noAlvo: band(total, total ? 100 : null), alta: band(0, 0), muitoAlta: band(0, 0) },
  mediaPorMomento: [],
});
const dashboard = (total = 1) => toDashboardSummary(dashboardApi(total));
const records = [i('i'), g('g')];

test('mantém a ordem da API e evita colisão de IDs entre tipos', () => {
  const result = buildReport([i('same'), g('same')], dashboard(), period, now);
  assert.deepEqual(result.rows.map((row) => row.id), ['insulin:same', 'glucose:same']);
  assert.equal(result.rows[0].value, '10 UI'); assert.equal(result.rows[1].value, '100 mg/dL');
});
test('decimais com vírgula e status com rótulo', () => {
  const result = buildReport([i('i', 2, { doseUi: 4.5 }), g('g', 1, { status: 'ALTA' })], dashboard(), period, now);
  assert.equal(result.rows[0].value, '4,5 UI'); assert.match(result.rows[1].detail, /Jejum · Alta/);
});
test('observações vêm do histórico da API; ausentes não são inventadas', () => {
  const result = buildReport([i('i'), g('g', 1, { observacao: 'Após caminhada' })], dashboard(), period, now);
  assert.equal(result.rows[0].notes, ''); assert.match(result.rows[0].detail, /Local não informado/);
  assert.equal(result.rows[1].notes, 'Após caminhada');
});
test('resumo vem do Dashboard da API', () => {
  const result = buildReport(records, dashboard(), period, now);
  assert.deepEqual(result.summary, { measurements: 1, applications: 1, mean: 100, min: 100, max: 100 });
});
test('período sem registros permanece vazio e exportável', () => {
  const result = buildReport([], dashboard(0), period, now);
  const html = reportHtml(result, 'Pessoa sintética');
  assert.match(html, /Nenhum registro no período selecionado/); assert.match(html, /Sem dados/);
});
test('período inválido e dados incompatíveis são rejeitados', () => {
  assert.throws(() => buildReport(records, dashboard(), { start: period.end, end: period.start }, now));
  assert.throws(() => buildReport([g('g', 1, { valor: NaN })], dashboard(), period, now));
  assert.throws(() => buildReport([{ ...g('g'), glycemia: null }], dashboard(), period, now));
  assert.throws(() => buildReport({ records: [] }, dashboard(), period, now));
});
test('HTML escapa nome, tipo e observações, sem executar conteúdo informado pelo usuário', () => {
  const result = buildReport([g('g', 1, { observacao: '<script>alert(1)</script>&"' }),
    i('i', 2, { tipo: '<img src=x onerror=alert(1)>' })], dashboard(), period, now);
  const html = reportHtml(result, '<Nome & sobrenome>');
  assert.equal(html.includes('<script>'), false); assert.equal(html.includes('<img'), false);
  assert.match(html, /&lt;Nome &amp; sobrenome&gt;/); assert.match(html, /&lt;script&gt;/);
  assert.equal(escapeHtml("'\"&<>"), '&#39;&quot;&amp;&lt;&gt;');
});
test('HTML exporta todos os registros, independentemente do limite da prévia', () => {
  const result = buildReport(Array.from({ length: 60 }, (_, index) => g(String(index), 1, { observacao: 'linha-' + index })), dashboard(), period, now);
  const html = reportHtml(result, 'Teste');
  assert.equal((html.match(/<tr>/g) ?? []).length, 61); assert.match(html, /linha-59/);
});
test('HTML é autocontido, não inclui tokens, IDs internos ou recursos externos', () => {
  const html = reportHtml(buildReport(records, dashboard(), period, now), 'Teste');
  assert.equal(/<script|<link|src="https?:/i.test(html), false);
  assert.equal(html.includes('glucose:g'), false); assert.equal(html.includes('Bearer'), false);
  assert.match(html, /thead\{display:table-header-group\}/);
});
const calls = [];
let failure;
let data = { '/reports/records': records, '/dashboard': dashboardApi() };
api.defaults.headers.common.Authorization = 'Bearer synthetic-token';
api.defaults.adapter = async (config) => {
  calls.push(config); if (failure) throw failure;
  return { config, status: 200, statusText: 'OK', headers: {}, data: data[config.url] };
};
test('consulta /reports/records e /dashboard autenticados, com o mesmo período', async () => {
  const result = await loadReport(period); assert.equal(result.rows.length, 2); assert.equal(result.summary.measurements, 1);
  assert.deepEqual(calls.slice(-2).map((config) => config.url).sort(), ['/dashboard', '/reports/records']);
  for (const config of calls.slice(-2)) {
    assert.equal(config.method, 'get'); assert.equal(config.headers.Authorization, 'Bearer synthetic-token');
    assert.deepEqual(config.params, { startDate: '2026-01-01', endDate: '2026-01-03' });
  }
});
test('período inválido e cancelamento não disparam HTTP', async () => {
  const before = calls.length; await assert.rejects(loadReport({ start: period.end, end: period.start }));
  const controller = new AbortController(); controller.abort(); await assert.rejects(loadReport(period, controller.signal));
  assert.equal(calls.length, before);
});
test('falha HTTP não vira relatório vazio', async () => {
  failure = new AxiosError('network'); await assert.rejects(loadReport(period)); failure = undefined;
});
function ports(overrides = {}) {
  const events = [];
  return { events, io: {
    available: async () => { events.push('available'); return true; },
    generate: async () => { events.push('generate'); return 'file:///cache/report.pdf'; },
    share: async () => { events.push('share'); },
    remove: async () => { events.push('remove'); }, ...overrides,
  } };
}
test('PDF verifica disponibilidade, gera, compartilha e limpa o cache', async () => {
  const p = ports(); await exportPdf('<html/>', p.io);
  assert.deepEqual(p.events, ['available', 'generate', 'share', 'remove']);
});
test('compartilhamento indisponível não gera arquivo', async () => {
  const p = ports({ available: async () => false });
  await assert.rejects(exportPdf('', p.io), /indisponível/); assert.deepEqual(p.events, []);
});
test('erro de geração não tenta compartilhar nem excluir arquivo desconhecido', async () => {
  const p = ports({ generate: async () => { throw new Error('print'); } });
  await assert.rejects(exportPdf('', p.io), /print/); assert.deepEqual(p.events, ['available']);
});
test('erro de compartilhamento também remove arquivo temporário', async () => {
  const p = ports({ share: async () => { throw new Error('share'); } });
  await assert.rejects(exportPdf('', p.io), /share/); assert.deepEqual(p.events, ['available', 'generate', 'remove']);
});
test('cancelamento após geração impede compartilhar e limpa arquivo', async () => {
  const controller = new AbortController();
  const p = ports({ generate: async () => { controller.abort(); return 'file:///cache/report.pdf'; } });
  await assert.rejects(exportPdf('', p.io, controller.signal), /cancelada/);
  assert.deepEqual(p.events, ['available', 'remove']);
});
test('falha de limpeza é informada sem esconder falha anterior de compartilhamento', async () => {
  const p = ports({ remove: async () => { throw new Error('cleanup'); } });
  await assert.rejects(exportPdf('', p.io), /PDF temporário/);
  p.io.share = async () => { throw new Error('original-share'); };
  await assert.rejects(exportPdf('', p.io), /original-share/);
});
test('web informa popup bloqueado', async () => {
  globalThis.window = { open: () => null };
  await assert.rejects(printWeb('<html/>'), /janela de impressão/); delete globalThis.window;
});
test('web imprime o HTML fornecido sem enviar arquivo para serviço externo', async () => {
  const events = [];
  const preview = { opener: {}, document: { open() {}, write(html) { events.push(html); }, close() {} }, focus() {}, print() { events.push('print'); } };
  globalThis.window = { open: () => preview };
  await printWeb('<html>synthetic</html>'); assert.equal(preview.opener, null);
  assert.deepEqual(events, ['<html>synthetic</html>', 'print']); delete globalThis.window;
});
