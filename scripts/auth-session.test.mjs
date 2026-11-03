import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthSession } from '../src/features/auth/services/auth-session.ts';

const user = { id: 'synthetic-user', nome: 'Teste', email: 'teste@example.com', perfil: null };
const tick = () => new Promise((resolve) => setImmediate(resolve));
function setup(saved = null, overrides = {}) {
  let stored = saved;
  let bearer = null;
  const storage = {
    read: async () => stored,
    write: async (value) => { stored = value; },
    clear: async () => { stored = null; },
  };
  const session = new AuthSession({
    storage, login: async () => ({ accessToken: 'valid-token' }),
    currentUser: async () => user,
    isUnauthorized: (error) => error?.status === 401,
    message: () => 'Erro de conexão',
    setToken: (value) => { bearer = value; },
    ...overrides,
  });
  return { session, storage, stored: () => stored, bearer: () => bearer };
}

test('inicialização sem token termina no estado desautenticado', async () => {
  const f = setup(); await f.session.restore();
  assert.deepEqual(f.session.getSnapshot(), { user: null, loading: false, error: null });
});

test('login só libera usuário depois de validar /users/me e salvar token', async () => {
  let validated = false;
  const f = setup(null, { currentUser: async (token) => { assert.equal(token, 'valid-token'); validated = true; return user; } });
  await f.session.signIn('teste@example.com', 'senha123');
  assert.equal(validated, true);
  assert.equal(f.session.getSnapshot().user.id, user.id);
  assert.equal(f.stored(), 'valid-token'); assert.equal(f.bearer(), 'valid-token');
});

test('reabertura valida token salvo na API', async () => {
  const f = setup('saved-token'); await f.session.restore();
  assert.equal(f.session.getSnapshot().user.id, user.id);
  assert.equal(f.bearer(), 'saved-token');
});

test('token inválido ou expirado é removido durante restauração', async () => {
  const f = setup('expired', { currentUser: async () => { throw { status: 401 }; } });
  await f.session.restore();
  assert.equal(f.stored(), null); assert.equal(f.bearer(), null);
  assert.equal(f.session.getSnapshot().user, null);
  assert.equal(f.session.getSnapshot().loading, false);
});

test('falha de rede bloqueia telas privadas sem apagar o token salvo', async () => {
  let offline = true;
  const f = setup('saved', { currentUser: async () => { if (offline) throw new Error(); return user; } });
  await f.session.restore();
  assert.equal(f.stored(), 'saved'); assert.equal(f.bearer(), null);
  assert.equal(f.session.getSnapshot().user, null);
  assert.equal(f.session.getSnapshot().error, 'Erro de conexão');
  offline = false; await f.session.restore();
  assert.equal(f.session.getSnapshot().user.id, user.id);
});

test('logout limpa usuário, Bearer e token persistido', async () => {
  const f = setup(); await f.session.signIn('e', 's'); await f.session.signOut();
  assert.equal(f.stored(), null); assert.equal(f.bearer(), null);
  assert.deepEqual(f.session.getSnapshot(), { user: null, loading: false, error: null });
});

test('401 de requisição antiga não encerra a sessão atual', async () => {
  const f = setup(); await f.session.signIn('e', 's');
  f.session.invalidate('old-token'); await tick();
  assert.equal(f.session.getSnapshot().user.id, user.id);
  f.session.invalidate('valid-token'); await tick();
  assert.equal(f.session.getSnapshot().user, null); assert.equal(f.stored(), null);
});

test('resposta atrasada de restauração não restaura usuário após logout', async () => {
  let resolveUser;
  const f = setup('saved', { currentUser: () => new Promise((resolve) => { resolveUser = resolve; }) });
  const restore = f.session.restore(); await tick();
  await f.session.signOut(); resolveUser(user); await restore;
  assert.equal(f.session.getSnapshot().user, null); assert.equal(f.bearer(), null);
});

test('logout durante escrita de login termina com token removido', async () => {
  const f = setup(); let finishWrite;
  const originalWrite = f.storage.write;
  f.storage.write = async (value) => {
    await new Promise((resolve) => { finishWrite = resolve; }); await originalWrite(value);
  };
  const login = f.session.signIn('e', 's'); await tick();
  const logout = f.session.signOut(); finishWrite();
  await Promise.all([login, logout]);
  assert.equal(f.stored(), null); assert.equal(f.session.getSnapshot().user, null);
});

test('falha ao persistir login não libera telas privadas', async () => {
  const f = setup(); f.storage.write = async () => { throw new Error('storage'); };
  await assert.rejects(f.session.signIn('e', 's'));
  assert.equal(f.session.getSnapshot().user, null); assert.equal(f.bearer(), null);
});

test('falha ao apagar token exige nova limpeza antes de restaurar', async () => {
  const f = setup('saved'); await f.session.restore();
  const originalClear = f.storage.clear;
  f.storage.clear = async () => { throw new Error('storage'); };
  await assert.rejects(f.session.signOut());
  assert.equal(f.session.getSnapshot().user, null);
  assert.match(f.session.getSnapshot().error, /limpeza da sessão/);
  f.storage.clear = originalClear; await f.session.restore();
  assert.equal(f.stored(), null); assert.equal(f.session.getSnapshot().user, null);
});
