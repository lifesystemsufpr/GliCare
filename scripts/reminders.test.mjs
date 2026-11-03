import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AxiosError } from 'axios';
import { reminderToApi, reminderToForm, reminderToPatch, reminderDateTime, formatTimeInput } from '../src/features/reminders/services/reminder-contract.ts';

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
const { listReminders, createReminder, updateReminder, setReminderActive, deleteReminder } =
  await import('../src/features/reminders/services/reminder-service.ts');
const form = { title: ' Lembrete sintético ', date: '30/10/2026', time: '08:30' };
const record = { id: 'synthetic-id', titulo: 'Lembrete sintético',
  dataHora: new Date(2026, 9, 30, 8, 30, 45).toISOString(), status: 'ATIVO' };
const calls = [];
let data = record;
let failure;
api.defaults.headers.common.Authorization = 'Bearer synthetic-token';
api.defaults.adapter = async (config) => {
  calls.push(config);
  if (failure) throw failure;
  return { config, status: 200, statusText: 'OK', headers: {}, data };
};

test('converte data e hora locais para um instante ISO sem inventar recorrência', () => {
  assert.deepEqual(reminderToApi(form), { titulo: 'Lembrete sintético', dataHora: new Date(2026, 9, 30, 8, 30).toISOString() });
});
test('horários fora do relógio e datas inexistentes são rejeitados', () => {
  for (const time of ['24:00', '12:60', '8:30', '', 'aa:bb']) assert.throws(() => reminderDateTime(form.date, time));
  for (const date of ['31/04/2026', '29/02/2025', '2026-10-30', '', '00/10/2026']) assert.throws(() => reminderDateTime(date, form.time));
  assert.equal(reminderDateTime('29/02/2024', '00:00'), new Date(2024, 1, 29).toISOString());
});
test('máscara de horário funciona com teclado numérico e texto colado', () => {
  assert.equal(formatTimeInput('0830'), '08:30'); assert.equal(formatTimeInput('08:30'), '08:30');
  assert.equal(formatTimeInput('08'), '08');
});
test('título respeita limite de 150 e não aceita vazio', () => {
  assert.throws(() => reminderToApi({ ...form, title: ' ' }));
  assert.throws(() => reminderToApi({ ...form, title: 'a'.repeat(151) }));
  assert.equal(reminderToApi({ ...form, title: 'a'.repeat(150) }).titulo.length, 150);
});
test('leitura de ISO retorna data e hora locais, sem perder o dia', () => {
  const instant = new Date(2026, 9, 31, 0, 5);
  assert.deepEqual(reminderToForm({ ...record, dataHora: instant.toISOString() }),
    { title: record.titulo, date: '31/10/2026', time: '00:05' });
});
test('edição só de título preserva segundos do registro original', () => {
  assert.deepEqual(reminderToPatch({ ...reminderToForm(record), title: 'Novo título' }, record), { titulo: 'Novo título' });
});
test('edição de data/hora envia apenas dataHora e não altera status', () => {
  assert.deepEqual(reminderToPatch({ ...reminderToForm(record), date: '31/10/2026', time: '09:45' }, record),
    { dataHora: new Date(2026, 9, 31, 9, 45).toISOString() });
});
test('edição sem mudanças não gera PATCH vazio', () => {
  assert.throws(() => reminderToPatch(reminderToForm(record), record), /Nenhuma alteração/);
});
test('GET usa Bearer, mantém ordem e aceita lista vazia', async () => {
  data = [record, { ...record, id: 'second-id', status: 'INATIVO' }];
  assert.deepEqual(await listReminders(), data);
  const config = calls.at(-1);
  assert.equal(api.getUri(config), 'https://api.example.test/api/reminders');
  assert.equal(config.method, 'get'); assert.equal(config.headers.Authorization, 'Bearer synthetic-token');
  data = []; assert.deepEqual(await listReminders(), []);
});
test('POST usa somente titulo/dataHora, sem IDs ou status do cliente', async () => {
  data = record; assert.deepEqual(await createReminder(form), record);
  const config = calls.at(-1);
  assert.equal(config.method, 'post'); assert.equal(api.getUri(config), 'https://api.example.test/api/reminders');
  assert.deepEqual(JSON.parse(config.data), reminderToApi(form));
});
test('PATCH de edição e PATCH de status são operações distintas', async () => {
  data = { ...record, titulo: 'Novo' };
  await updateReminder(record, { ...reminderToForm(record), title: 'Novo' });
  assert.equal(calls.at(-1).url, '/reminders/synthetic-id');
  assert.deepEqual(JSON.parse(calls.at(-1).data), { titulo: 'Novo' });
  for (const active of [true, false]) {
    data = { ...record, status: active ? 'ATIVO' : 'INATIVO' };
    await setReminderActive(record.id, active);
    assert.equal(calls.at(-1).url, '/reminders/synthetic-id/status');
    assert.equal(calls.at(-1).method, 'patch');
    assert.deepEqual(JSON.parse(calls.at(-1).data), { status: data.status });
  }
});
test('DELETE utiliza o ID do registro e não envia corpo', async () => {
  data = undefined; await deleteReminder(record.id);
  assert.equal(calls.at(-1).method, 'delete'); assert.equal(calls.at(-1).url, '/reminders/synthetic-id');
  assert.equal(calls.at(-1).data, undefined);
});
test('formulário inválido e edição vazia não disparam HTTP', async () => {
  const before = calls.length;
  await assert.rejects(createReminder({ ...form, title: '' }));
  await assert.rejects(updateReminder(record, reminderToForm(record)));
  assert.equal(calls.length, before);
});
test('cancelamento impede a consulta e respostas inválidas são rejeitadas', async () => {
  const controller = new AbortController(); controller.abort();
  const before = calls.length; await assert.rejects(listReminders(controller.signal));
  assert.equal(calls.length, before);
  data = {}; await assert.rejects(listReminders(), /lista de lembretes inválida/);
  data = [record, { ...record, status: 'INVALID' }]; await assert.rejects(listReminders(), /não confirmou/);
  data = {}; await assert.rejects(createReminder(form), /não confirmou/);
});
test('falha de rede nas mutações exige conferência e não gera retry', async () => {
  failure = new AxiosError('timeout');
  const actions = [() => createReminder(form), () => updateReminder(record, { ...reminderToForm(record), title: 'Novo' }),
    () => setReminderActive(record.id, false), () => deleteReminder(record.id)];
  for (const action of actions) {
    const before = calls.length; await assert.rejects(action(), /antes de reenviar/); assert.equal(calls.length, before + 1);
  }
  failure = undefined;
});
test('erros 400, 401 e 404 permanecem disponíveis ao tratamento compartilhado', async () => {
  for (const status of [400, 401, 404]) {
    failure = new AxiosError('Request failed', undefined, undefined, undefined,
      { status, data: {}, headers: {}, config: { headers: {} } });
    await assert.rejects(deleteReminder(record.id), (error) => error.response.status === status);
  }
  failure = undefined;
});
