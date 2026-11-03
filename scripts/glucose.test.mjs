import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AxiosError } from 'axios';
import { glucoseToApi, momentToApi } from '../src/features/glucose/services/glucose-contract.ts';

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
const { createGlucose, listGlucose } = await import('../src/features/glucose/services/glucose-service.ts');
const form = { value: '105,25', moment: 'fasting', measuredAt: new Date('2026-01-01T08:30:00-03:00'), notes: ' Teste sintético ' };
const record = { id: 'synthetic-id', valor: 105.25, momento: 'JEJUM', status: 'NORMAL',
  dataHora: '2026-01-01T11:30:00.000Z', observacao: 'Teste sintético' };
let calls = [];
let data = record;
let failure;
api.defaults.headers.common.Authorization = 'Bearer synthetic-token';
api.defaults.adapter = async (config) => {
  calls.push(config);
  if (failure) throw failure;
  return { config, status: 200, statusText: 'OK', headers: {}, data };
};

test('converte mg/dL, momento e horário com fuso para o contrato real', () => {
  assert.deepEqual(glucoseToApi(form), { valor: 105.25, momento: 'JEJUM',
    dataHora: '2026-01-01T11:30:00.000Z', observacao: 'Teste sintético' });
});
test('os sete momentos possuem mapeamento correto', () => {
  assert.deepEqual(Object.values(momentToApi), ['JEJUM', 'ANTES_CAFE', 'APOS_CAFE', 'ANTES_ALMOCO', 'APOS_ALMOCO', 'ANTES_JANTAR', 'APOS_JANTAR']);
  for (const moment of Object.keys(momentToApi)) assert.equal(glucoseToApi({ ...form, moment }).momento, momentToApi[moment]);
  assert.throws(() => glucoseToApi({ ...form, moment: 'invalid' }));
});
test('limites e precisão são validados sem arredondamento silencioso', () => {
  for (const value of ['', '0', '-1', '1000', '999,999', 'Infinity', '1e2', '105 mg/dL']) {
    assert.throws(() => glucoseToApi({ ...form, value }), value);
  }
  assert.equal(glucoseToApi({ ...form, value: '999,99' }).valor, 999.99);
  assert.equal(glucoseToApi({ ...form, value: '0.01' }).valor, 0.01);
});
test('data inválida ou futura é recusada', () => {
  assert.throws(() => glucoseToApi({ ...form, measuredAt: new Date(NaN) }));
  assert.throws(() => glucoseToApi(form, form.measuredAt.getTime() - 1));
});
test('observação opcional e limite de 255 seguem a API', () => {
  assert.equal('observacao' in glucoseToApi({ ...form, notes: ' ' }), false);
  assert.equal(glucoseToApi({ ...form, notes: 'a'.repeat(255) }).observacao.length, 255);
  assert.throws(() => glucoseToApi({ ...form, notes: 'a'.repeat(256) }));
});
test('POST usa Bearer, campos da API e resposta sem recalcular status', async () => {
  const saved = await createGlucose(form);
  const request = calls.at(-1);
  assert.equal(api.getUri(request), 'https://api.example.test/api/glycemias');
  assert.equal(request.method, 'post');
  assert.equal(request.headers.Authorization, 'Bearer synthetic-token');
  assert.deepEqual(JSON.parse(request.data), glucoseToApi(form));
  assert.equal('usuarioId' in JSON.parse(request.data), false);
  assert.deepEqual(saved, record);
});
test('entrada inválida não dispara requisição', async () => {
  const before = calls.length;
  await assert.rejects(createGlucose({ ...form, value: '0' }));
  assert.equal(calls.length, before);
});
test('histórico faz GET e preserva dados, ordem e lista vazia da API', async () => {
  data = [record, { ...record, id: 'older-id', valor: 60, status: 'BAIXA', observacao: null }];
  const records = await listGlucose();
  assert.deepEqual(records, data);
  assert.equal(calls.at(-1).method, 'get');
  assert.equal(api.getUri(calls.at(-1)), 'https://api.example.test/api/glycemias');
  data = []; assert.deepEqual(await listGlucose(), []);
});
test('GET suporta cancelamento e não aceita envelope incompatível', async () => {
  const controller = new AbortController(); controller.abort();
  const before = calls.length;
  await assert.rejects(listGlucose(controller.signal));
  assert.equal(calls.length, before);
  data = { records: [] }; await assert.rejects(listGlucose(), /histórico inválido/);
});
test('resposta sem confirmação não é tratada como salvamento', async () => {
  data = {}; await assert.rejects(createGlucose(form), /não confirmou/);
});
test('falha de rede alerta sobre confirmação incerta e não faz retry automático', async () => {
  failure = new AxiosError('timeout'); const before = calls.length;
  await assert.rejects(createGlucose(form), /antes de reenviar/);
  assert.equal(calls.length, before + 1); failure = undefined;
});
test('401 e validação HTTP continuam disponíveis ao tratamento compartilhado', async () => {
  failure = new AxiosError('Unauthorized', undefined, undefined, undefined,
    { status: 401, data: {}, headers: {}, config: { headers: {} } });
  await assert.rejects(createGlucose(form), (error) => error.response.status === 401);
  failure = undefined;
});
