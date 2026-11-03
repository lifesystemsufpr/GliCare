import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AxiosError } from 'axios';
import { recoveryEmail, resetPasswordPayload, recoveryTokenFromLink, RECOVERY_MESSAGE } from '../src/features/auth/services/recovery-contract.ts';
registerHooks({ resolve(specifier, context, next) {
  const base = specifier.startsWith('@/') ? new URL('../src/' + specifier.slice(2), import.meta.url)
    : specifier.startsWith('.') && context.parentURL?.includes('/src/') ? new URL(specifier, context.parentURL) : null;
  if (base) for (const suffix of ['.ts', '/index.ts']) {
    const url = new URL(base.href + suffix); if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
  }
  return next(specifier, context);
} });
process.env.EXPO_PUBLIC_API_URL = 'https://api.example.test/api';
const { api } = await import('../src/shared/api/api.ts');
const { requestPasswordRecovery, confirmPasswordReset } = await import('../src/features/auth/services/recovery-service.ts');
const calls = [];
let failure;
api.defaults.adapter = async (config) => {
  calls.push(config); if (failure) throw failure;
  return { config, status: 200, statusText: 'OK', headers: {}, data: { message: 'Resposta genérica' } };
};
test('normaliza e-mail sem aceitar formato inválido ou tamanho fora do DTO', () => {
  assert.equal(recoveryEmail(' TESTE@EXAMPLE.COM '), 'teste@example.com');
  for (const value of ['', 'invalid', 'a'.repeat(101) + '@example.com']) assert.throws(() => recoveryEmail(value));
});
test('payload usa novaSenha, não envia confirmação e preserva espaços da senha', () => {
  assert.deepEqual(resetPasswordPayload(' token ', ' senha123 ', ' senha123 '), { token: 'token', novaSenha: ' senha123 ' });
});
test('token ausente ou longo demais é rejeitado', () => {
  for (const token of ['', ' ', 'x'.repeat(513)]) assert.throws(() => resetPasswordPayload(token, 'senha123', 'senha123'));
});
test('senha precisa cumprir política e confirmação', () => {
  for (const value of ['abc', 'abcdefgh', '12345678', 'x1'.repeat(40)]) assert.throws(() => resetPasswordPayload('token', value, value));
  assert.throws(() => resetPasswordPayload('token', 'senha123', 'outra123'));
});
test('extrai token de fragmentos web e do scheme do aplicativo', () => {
  assert.equal(recoveryTokenFromLink('glicaremobile://reset-password#token=abc_def-123'), 'abc_def-123');
  assert.equal(recoveryTokenFromLink('https://example.com/reset-password#token=abc%2Bdef'), 'abc+def');
});
test('não usa query string nem aceita token duplicado ou acima do limite', () => {
  for (const link of [null, '', 'https://example.com/reset-password?token=secret', '#token=a&token=b', '#token=' + 'x'.repeat(513)]) {
    assert.equal(recoveryTokenFromLink(link), '');
  }
});
test('mensagem de solicitação não afirma que o e-mail existe', () => {
  assert.match(RECOVERY_MESSAGE, /^Se o e-mail estiver cadastrado/);
});
test('forgot-password usa POST com somente e-mail normalizado', async () => {
  await requestPasswordRecovery(' TESTE@EXAMPLE.COM ');
  const config = calls.at(-1); assert.equal(config.method, 'post');
  assert.equal(api.getUri(config), 'https://api.example.test/api/auth/forgot-password');
  assert.deepEqual(JSON.parse(config.data), { email: 'teste@example.com' });
});
test('reset-password envia token no corpo, sem query e sem campo extra', async () => {
  await confirmPasswordReset('token', 'senha123', 'senha123');
  const config = calls.at(-1); assert.equal(config.url, '/auth/reset-password'); assert.equal(config.params, undefined);
  assert.deepEqual(JSON.parse(config.data), { token: 'token', novaSenha: 'senha123' });
});
test('erros locais não fazem chamadas HTTP', async () => {
  const before = calls.length;
  await assert.rejects(requestPasswordRecovery('invalid'));
  await assert.rejects(confirmPasswordReset('', 'senha123', 'senha123'));
  assert.equal(calls.length, before);
});
test('400 de token inválido/expirado e falha de rede não simulam sucesso', async () => {
  failure = new AxiosError('Bad Request', undefined, undefined, undefined, { status: 400, data: {}, headers: {}, config: { headers: {} } });
  await assert.rejects(confirmPasswordReset('token', 'senha123', 'senha123'), (error) => error.response.status === 400);
  failure = new AxiosError('network'); await assert.rejects(requestPasswordRecovery('teste@example.com'));
  failure = undefined;
});
