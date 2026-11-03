import test from 'node:test';
import assert from 'node:assert/strict';
import { NotificationCoordinator, notificationPlan, NOTIFICATION_PREFIX } from '../src/features/reminders/services/notification-coordinator.ts';

const now = Date.parse('2026-11-03T12:00:00Z');
const reminder = (id, minutes = 10, status = 'ATIVO') => ({ id, titulo: 'Dado sintético privado',
  dataHora: new Date(now + minutes * 60000).toISOString(), status });
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };
function fixture(overrides = {}) {
  const state = { stored: 'A', reminders: [reminder('one')], scheduled: new Set(), calls: [], allowed: true, fail: false };
  const ports = {
    supported: true, now: () => now,
    permission: async (request) => { state.calls.push(['permission', request]); return state.allowed; },
    readEnabledOwner: async () => state.stored,
    writeEnabledOwner: async (owner) => { state.stored = owner; },
    list: async () => { if (state.fail) throw new Error('synthetic network error'); return state.reminders; },
    scheduled: async () => [...state.scheduled],
    cancel: async (id) => { state.scheduled.delete(id); state.calls.push(['cancel', id]); },
    dismiss: async () => { state.calls.push(['dismiss']); },
    schedule: async (item) => { state.scheduled.add(item.identifier); state.calls.push(['schedule', item]); return item.identifier; },
    ...overrides,
  };
  const controller = new NotificationCoordinator(ports);
  return { state, controller, ports, async start(owner = 'A') { controller.setOwner(owner); await controller.refresh(); } };
}

test('seleciona somente eventos futuros e ativos, ordenados pelo instante', () => {
  const plan = notificationPlan([reminder('late', 20), reminder('off', 5, 'INATIVO'), reminder('past', -1),
    reminder('now', 0), reminder('early', 1), { ...reminder('bad'), dataHora: 'invalid' }], now);
  assert.deepEqual(plan.map((item) => item.at), [now + 60000, now + 1200000]);
});
test('limita aos 60 próximos sem duplicar um mesmo lembrete', () => {
  const records = Array.from({ length: 70 }, (_, i) => reminder(String(i), i + 1));
  const plan = notificationPlan([...records, records[0]], now);
  assert.equal(plan.length, 60);
  assert.equal(new Set(plan.map((item) => item.identifier)).size, 60);
  assert.equal(plan.at(-1).at, now + 60 * 60000);
});
test('planejamento não inclui título ou dados do paciente e não altera os registros', () => {
  const records = [reminder('a/b'), reminder('a', 5)];
  const before = JSON.stringify(records);
  assert.ok(notificationPlan(records, now)[1].identifier.includes('a%2Fb'));
  assert.equal(JSON.stringify(records), before);
  assert.ok(!JSON.stringify(notificationPlan(records, now)).includes('privado'));
});
test('reabertura sincroniza preferência sem solicitar permissão', async () => {
  const f = fixture(); await f.start();
  assert.equal(f.state.scheduled.size, 1);
  assert.equal(f.controller.getSnapshot().enabled, true);
  assert.ok(f.state.calls.filter(([name]) => name === 'permission').every(([, request]) => !request));
});
test('sincronizações repetidas não duplicam os alertas', async () => {
  const f = fixture(); await f.start(); await f.controller.refresh();
  assert.equal(f.state.calls.filter(([name]) => name === 'schedule').length, 1);
});
test('editar horário remove o antigo; editar título preserva o agendamento genérico', async () => {
  const f = fixture(); await f.start(); const original = [...f.state.scheduled][0];
  f.state.reminders[0].titulo = 'Novo título'; await f.controller.refresh();
  assert.ok(f.state.scheduled.has(original));
  f.state.reminders = [reminder('one', 30)]; await f.controller.refresh();
  assert.equal(f.state.scheduled.size, 1); assert.ok(!f.state.scheduled.has(original));
});
test('desativar ou excluir na API cancela os eventos locais correspondentes', async () => {
  const f = fixture(); await f.start();
  f.state.reminders = [reminder('one', 10, 'INATIVO')]; await f.controller.refresh();
  assert.equal(f.state.scheduled.size, 0);
  f.state.reminders = [reminder('two')]; await f.controller.refresh();
  f.state.reminders = []; await f.controller.refresh(); assert.equal(f.state.scheduled.size, 0);
});
test('não modifica notificações pertencentes a outros recursos', async () => {
  const f = fixture(); f.state.scheduled.add('other-feature'); await f.start();
  await f.controller.disable(); assert.deepEqual([...f.state.scheduled], ['other-feature']);
});
test('logout aguarda cancelamentos e descarta alertas já apresentados', async () => {
  const f = fixture(); await f.start(); await f.controller.clearSession();
  assert.equal(f.state.scheduled.size, 0); assert.equal(f.controller.getSnapshot().enabled, false);
  assert.ok(f.state.calls.some(([name]) => name === 'dismiss'));
});
test('inicialização sem sessão também limpa notificações antigas', async () => {
  const f = fixture(); f.state.scheduled.add(NOTIFICATION_PREFIX + 'old');
  f.controller.setOwner(null); await f.controller.clearSession(); assert.equal(f.state.scheduled.size, 0);
});
test('outra conta não herda a ativação e os alertas da conta anterior', async () => {
  const f = fixture(); await f.start(); f.controller.setOwner('B'); await f.controller.refresh();
  assert.equal(f.state.scheduled.size, 0); assert.equal(f.controller.getSnapshot().enabled, false);
});
test('ativação explícita solicita permissão e persiste apenas a conta atual', async () => {
  const f = fixture(); f.state.stored = null; await f.start(); await f.controller.enable();
  assert.equal(f.state.stored, 'A'); assert.equal(f.state.scheduled.size, 1);
  assert.ok(f.state.calls.some(([name, request]) => name === 'permission' && request));
});
test('permissão negada não persiste ativação e informa o usuário', async () => {
  const f = fixture(); f.state.stored = null; f.state.allowed = false; await f.start(); await f.controller.enable();
  assert.equal(f.state.stored, null); assert.equal(f.state.scheduled.size, 0);
  assert.match(f.controller.getSnapshot().message, /não concedida/);
});
test('revogação da permissão cancela agendamentos antigos', async () => {
  const f = fixture(); await f.start(); f.state.allowed = false; await f.controller.refresh();
  assert.equal(f.state.scheduled.size, 0); assert.match(f.controller.getSnapshot().message, /bloqueada/);
});
test('desativação local mantém os lembretes e permite ativar novamente', async () => {
  const f = fixture(); await f.start(); await f.controller.disable();
  assert.equal(f.state.reminders.length, 1); assert.equal(f.state.stored, null); assert.equal(f.state.scheduled.size, 0);
  await f.controller.enable(); assert.equal(f.state.scheduled.size, 1);
});
test('falha na API fica visível e pode ser recuperada sem perder alertas já confirmados', async () => {
  const f = fixture(); await f.start(); f.state.fail = true;
  await assert.rejects(f.controller.refresh()); assert.match(f.controller.getSnapshot().message, /Não foi possível/);
  assert.equal(f.state.scheduled.size, 1); f.state.fail = false; await f.controller.refresh();
  assert.match(f.controller.getSnapshot().message, /1 alerta/);
});
test('resposta atrasada da API não recria alertas após logout', async () => {
  const pending = deferred(); let hold = false;
  const f = fixture({ list: () => hold ? pending.promise : Promise.resolve([reminder('one')]) });
  await f.start(); hold = true; const refresh = f.controller.refresh();
  await new Promise(setImmediate); const logout = f.controller.clearSession();
  pending.resolve([reminder('stale')]); await Promise.all([refresh, logout]); assert.equal(f.state.scheduled.size, 0);
});
test('agendamento nativo em andamento é cancelado se a sessão mudar', async () => {
  const pending = deferred(); let hold = false; let f;
  f = fixture({ schedule: async (item) => {
    if (hold) await pending.promise;
    f.state.scheduled.add(item.identifier); return item.identifier;
  } });
  await f.start(); hold = true; f.state.reminders = [reminder('second')];
  const refresh = f.controller.refresh(); await new Promise(setImmediate);
  const logout = f.controller.clearSession(); pending.resolve(); await Promise.all([refresh, logout]);
  assert.equal(f.state.scheduled.size, 0);
});
test('falha nativa no cancelamento é exposta no logout e permite repetir a limpeza', async () => {
  let fail = false; const f = fixture({ cancel: async (id) => {
    if (fail) throw new Error('synthetic device error'); f.state.scheduled.delete(id);
  } });
  await f.start(); fail = true; await assert.rejects(f.controller.clearSession());
  assert.match(f.controller.getSnapshot().message, /Não foi possível/);
  fail = false; await f.controller.clearSession(); assert.equal(f.state.scheduled.size, 0);
});
test('plataforma sem suporte não acessa módulos nativos nem solicita permissão', async () => {
  const f = fixture({ supported: false, permission: async () => { throw new Error('must not run'); } });
  await f.start(); await f.controller.enable(); await f.controller.clearSession();
  assert.equal(f.state.calls.length, 0); assert.match(f.controller.getSnapshot().message, /Android\/iOS/);
});
