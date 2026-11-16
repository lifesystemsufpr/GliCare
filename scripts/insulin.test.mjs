import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AxiosError } from 'axios';
import { insulinToApi, insulinTypeLabels, insulinTypeLabel, siteToApi } from '../src/features/insulin/services/insulin-contract.ts';

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
const { createInsulin, listInsulin } = await import('../src/features/insulin/services/insulin-service.ts');
const form = { type: 'ULTRARRAPIDA', dose: '10,25', applicationSite: 'abdomen',
  appliedAt: new Date('2026-01-01T08:30:00-03:00'), notes: ' Teste sintético ' };
const record = { id: 'synthetic-id', tipo: 'ULTRARRAPIDA', doseUi: 10.25,
  localAplicacao: 'ABDOMEN', dataHora: '2026-01-01T11:30:00.000Z', observacao: 'Teste sintético' };
const calls = [];
let data = record;
let failure;
api.defaults.headers.common.Authorization = 'Bearer synthetic-token';
api.defaults.adapter = async (config) => {
  calls.push(config);
  if (failure) throw failure;
  return { config, status: 200, statusText: 'OK', headers: {}, data };
};

test('adapta dose decimal, tipo, local e instante com fuso para a API', () => {
  assert.deepEqual(insulinToApi(form), { tipo: 'ULTRARRAPIDA', doseUi: 10.25, localAplicacao: 'ABDOMEN',
    dataHora: '2026-01-01T11:30:00.000Z', observacao: 'Teste sintético' });
});
test('tipos fechados enviam códigos e exibem rótulos, preservando textos antigos', () => {
  assert.deepEqual(Object.keys(insulinTypeLabels), ['ULTRARRAPIDA', 'RAPIDA', 'INTERMEDIARIA', 'LONGA', 'ULTRALONGA', 'PRE_MISTURADA']);
  for (const type of Object.keys(insulinTypeLabels)) {
    assert.equal(insulinToApi({ ...form, type }).tipo, type);
    assert.equal(insulinTypeLabel(type), insulinTypeLabels[type]);
  }
  assert.equal(insulinTypeLabel('Outro nome'), 'Outro nome');
  assert.equal(insulinTypeLabel('toString'), 'toString');
});
test('os quatro locais são mapeados para o enum do backend', () => {
  assert.deepEqual(Object.values(siteToApi), ['ABDOMEN', 'BRACO', 'COXA', 'GLUTEO']);
  for (const applicationSite of Object.keys(siteToApi)) assert.equal(insulinToApi({ ...form, applicationSite }).localAplicacao, siteToApi[applicationSite]);
});
test('seleções ausentes ou desconhecidas são rejeitadas', () => {
  for (const type of [null, 'invalid', 'toString']) assert.throws(() => insulinToApi({ ...form, type }));
  for (const applicationSite of [null, 'invalid', 'toString']) assert.throws(() => insulinToApi({ ...form, applicationSite }));
});
test('dose respeita precisão e capacidade do DTO sem arredondar', () => {
  for (const dose of ['', '0', '-1', '10000', '10,255', 'Infinity', '1e2', '10 UI']) {
    assert.throws(() => insulinToApi({ ...form, dose }), dose);
  }
  assert.equal(insulinToApi({ ...form, dose: '9999,99' }).doseUi, 9999.99);
  assert.equal(insulinToApi({ ...form, dose: '0.01' }).doseUi, 0.01);
});
test('datas inválidas e futuras não são enviadas', () => {
  assert.throws(() => insulinToApi({ ...form, appliedAt: new Date(NaN) }));
  assert.throws(() => insulinToApi(form, form.appliedAt.getTime() - 1));
});
test('observação opcional e limite de 255 seguem a API', () => {
  assert.equal('observacao' in insulinToApi({ ...form, notes: ' ' }), false);
  assert.equal(insulinToApi({ ...form, notes: 'a'.repeat(255) }).observacao.length, 255);
  assert.throws(() => insulinToApi({ ...form, notes: 'a'.repeat(256) }));
});
test('POST usa endpoint real, Bearer e payload sem campos exclusivos do mobile', async () => {
  assert.deepEqual(await createInsulin(form), record);
  const config = calls.at(-1);
  assert.equal(api.getUri(config), 'https://api.example.test/api/insulin-applications');
  assert.equal(config.method, 'post');
  assert.equal(config.headers.Authorization, 'Bearer synthetic-token');
  const payload = JSON.parse(config.data);
  assert.deepEqual(payload, insulinToApi(form));
  for (const key of ['type', 'appliedAt', 'applicationSite', 'usuarioId']) assert.equal(key in payload, false);
});
test('formulário inválido não faz chamada HTTP', async () => {
  const before = calls.length; await assert.rejects(createInsulin({ ...form, dose: '0' }));
  assert.equal(calls.length, before);
});
test('GET preserva registros antigos com local/observação nulos e tipos livres', async () => {
  data = [record, { ...record, id: 'old-id', tipo: 'Outro nome registrado', localAplicacao: null, observacao: null }];
  assert.deepEqual(await listInsulin(), data);
  assert.equal(calls.at(-1).method, 'get');
  assert.equal(api.getUri(calls.at(-1)), 'https://api.example.test/api/insulin-applications');
  data = []; assert.deepEqual(await listInsulin(), []);
});
test('consulta cancelada não dispara adapter e envelope incompatível é rejeitado', async () => {
  const controller = new AbortController(); controller.abort();
  const before = calls.length; await assert.rejects(listInsulin(controller.signal));
  assert.equal(calls.length, before);
  data = { records: [] }; await assert.rejects(listInsulin(), /histórico inválido/);
});
test('resposta de gravação sem ID não confirma sucesso', async () => {
  data = {}; await assert.rejects(createInsulin(form), /não confirmou/);
});
test('timeout informa confirmação incerta e não faz retry automático', async () => {
  failure = new AxiosError('timeout'); const before = calls.length;
  await assert.rejects(createInsulin(form), /antes de reenviar/);
  assert.equal(calls.length, before + 1); failure = undefined;
});
test('401 e 400 preservam o erro HTTP para tratamento compartilhado', async () => {
  for (const status of [401, 400]) {
    failure = new AxiosError('Request failed', undefined, undefined, undefined,
      { status, data: {}, headers: {}, config: { headers: {} } });
    await assert.rejects(createInsulin(form), (error) => error.response.status === status);
  }
  failure = undefined;
});
