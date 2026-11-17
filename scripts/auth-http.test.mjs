import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AxiosError } from 'axios';

// Resolve os mesmos aliases do tsconfig para executar TS com Node 24, sem runner extra.
registerHooks({
  resolve(specifier, context, nextResolve) {
    const base = specifier.startsWith('@/')
      ? new URL('../src/' + specifier.slice(2), import.meta.url)
      : specifier.startsWith('.') && context.parentURL?.includes('/src/')
        ? new URL(specifier, context.parentURL) : null;
    if (base) {
      for (const suffix of ['.ts', '/index.ts']) {
        const url = new URL(base.href + suffix);
        if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
});

process.env.EXPO_PUBLIC_API_URL = 'https://api.example.test/api';
const { api } = await import('../src/shared/api/api.ts');
const { acceptTermsRequest, loginRequest, currentUserRequest, registerRequest } = await import('../src/features/auth/services/auth-service.ts');
const { errorMessage } = await import('../src/shared/api/errors.ts');
let responseData;
let lastRequest;
api.defaults.adapter = async (config) => {
  lastRequest = config;
  return { config, status: 200, statusText: 'OK', headers: {}, data: responseData };
};

test('login usa caminho e contrato reais da API, preservando a senha', async () => {
  responseData = { accessToken: 'synthetic-token', user: { id: 'test-id', nome: 'Teste', email: 'teste@example.com' } };
  const response = await loginRequest(' TESTE@EXAMPLE.COM ', ' senha123 ');
  assert.equal(api.getUri(lastRequest), 'https://api.example.test/api/auth/login');
  assert.equal(lastRequest.method, 'post');
  assert.deepEqual(JSON.parse(lastRequest.data), { email: 'teste@example.com', senha: ' senha123 ' });
  assert.equal(response.accessToken, 'synthetic-token');
});

test('restauração consulta /users/me com Bearer explícito', async () => {
  responseData = { id: 'test-id', nome: 'Teste' };
  await currentUserRequest('synthetic-token');
  assert.equal(lastRequest.method, 'get');
  assert.equal(api.getUri(lastRequest), 'https://api.example.test/api/users/me');
  assert.equal(lastRequest.headers.Authorization, 'Bearer synthetic-token');
});

test('cadastro envia payload adaptado, sem campos do formulário', async () => {
  responseData = {};
  await registerRequest({ name: 'Teste', email: 'teste@example.com', password: 'senha123',
    confirmPassword: 'senha123', acceptedTerms: true });
  assert.equal(api.getUri(lastRequest), 'https://api.example.test/api/auth/register');
  const dto = JSON.parse(lastRequest.data);
  assert.deepEqual(Object.keys(dto).sort(), ['confirmarSenha', 'email', 'nome', 'senha', 'versaoTermos']);
  assert.equal(dto.senha, 'senha123'); assert.equal('password' in dto, false);
});

test('respostas incompletas de login e sessão não são aceitas', () => {
  responseData = {};
  return Promise.all([
    assert.rejects(loginRequest('e', 's'), /Resposta de autenticação inválida/),
    assert.rejects(currentUserRequest('invalid'), /Resposta de sessão inválida/),
    assert.rejects(acceptTermsRequest(), /Resposta de sessão inválida/),
  ]);
});

test('aceite de termos envia POST /users/me/termos com versaoTermos atual', async () => {
  responseData = { id: 'test-id', nome: 'Teste', email: 'teste@example.com', termosVersaoAceita: '2026-11-16' };
  const updated = await acceptTermsRequest();
  assert.equal(lastRequest.method, 'post');
  assert.equal(api.getUri(lastRequest), 'https://api.example.test/api/users/me/termos');
  assert.deepEqual(JSON.parse(lastRequest.data), { versaoTermos: '2026-11-16' });
  assert.equal(updated.termosVersaoAceita, '2026-11-16');
});

function apiError(status, data) {
  return new AxiosError('Request failed', undefined, undefined, undefined,
    { status, data, statusText: '', headers: {}, config: { headers: {} } });
}

test('erros HTTP distinguem validação, credenciais e indisponibilidade', () => {
  assert.equal(errorMessage(apiError(401, { message: 'E-mail ou senha inválidos' })), 'E-mail ou senha inválidos');
  assert.equal(errorMessage(apiError(400, { details: [{ field: 'alturaCm', messages: ['altura inválida'] }] })),
    'alturaCm: altura inválida');
  assert.match(errorMessage(apiError(500, { message: 'SQL interno' })), /indisponível/);
  assert.match(errorMessage(new AxiosError('network')), /conectar/);
});
