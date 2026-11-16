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
const { profileToForm, profileToPatch } = await import('../src/features/profile/services/profile-contract.ts');
const { api } = await import('../src/shared/api/api.ts');
const { deleteAccount, getProfile, updateProfile } = await import('../src/features/profile/services/profile-service.ts');
const profile = { nome: 'Pessoa sintética', dataNascimento: '1995-04-12', idade: 31,
  alturaCm: 170.55, pesoKg: 60.5, tipoDiabetes: 'TIPO_1', perfilCompleto: true };
const empty = { nome: 'Teste', dataNascimento: null, idade: null, alturaCm: null,
  pesoKg: null, tipoDiabetes: null, perfilCompleto: false };
const form = () => profileToForm(profile);
const calls = [];
let data = profile;
let failure;
api.defaults.headers.common.Authorization = 'Bearer synthetic-token';
api.defaults.adapter = async (config) => {
  calls.push(config);
  if (failure) throw failure;
  return { config, status: 200, statusText: 'OK', headers: {}, data };
};

test('consulta converte cm para metros sem perder precisão e formata nascimento', () => {
  assert.equal(form().height, '1,7055'); assert.equal(form().birthDate, '12/04/1995');
  assert.equal(form().weight, '60,5');
});
test('campos nulos permanecem vazios no formulário, sem inventar zeros', () => {
  assert.deepEqual(profileToForm(empty), { birthDate: '', height: '', weight: '', diabetesType: '' });
});
test('perfil inalterado não gera PATCH vazio', () => {
  assert.throws(() => profileToPatch(form(), profile), /Nenhuma alteração/);
});
test('envia somente campos alterados e nunca nome, idade ou identidade', () => {
  assert.deepEqual(profileToPatch({ ...form(), weight: '61,25' }, profile), { pesoKg: 61.25 });
});
test('pode preencher um dado em perfil incompleto sem exigir os demais', () => {
  assert.deepEqual(profileToPatch({ ...profileToForm(empty), weight: '65' }, empty), { pesoKg: 65 });
});
test('altura permite precisão de cm e não arredonda campos inalterados', () => {
  assert.deepEqual(profileToPatch({ ...form(), height: '1,7065' }, profile), { alturaCm: 170.65 });
  assert.throws(() => profileToPatch({ ...form(), height: '1.70550' }, profile));
});
test('datas inválidas ou futuras são rejeitadas', () => {
  for (const birthDate of ['30/02/2020', '01/01/2999', '']) {
    assert.throws(() => profileToPatch({ ...form(), birthDate }, profile));
  }
  assert.deepEqual(profileToPatch({ ...form(), birthDate: '29/02/2000' }, profile), { dataNascimento: '2000-02-29' });
});
test('peso e altura validam limites e números antes da API', () => {
  for (const height of ['170', '0,29', '2,73', 'NaN', '']) assert.throws(() => profileToPatch({ ...form(), height }, profile));
  for (const weight of ['0', '501', '60,555', '1e2', '']) assert.throws(() => profileToPatch({ ...form(), weight }, profile));
});
test('tipo de diabetes mantém o enum do backend', () => {
  for (const diabetesType of ['TIPO_2', 'OUTRO']) {
    assert.deepEqual(profileToPatch({ ...form(), diabetesType }, profile), { tipoDiabetes: diabetesType });
  }
  assert.throws(() => profileToPatch({ ...form(), diabetesType: '' }, profile));
});
test('perfil incompleto pode ser completado de uma vez, sem contato de emergência', () => {
  const patch = profileToPatch({ birthDate: '12/04/1995', height: '1,70', weight: '60', diabetesType: 'TIPO_2' }, empty);
  assert.deepEqual(patch, { dataNascimento: '1995-04-12', alturaCm: 170, pesoKg: 60, tipoDiabetes: 'TIPO_2' });
  assert.equal('contatoEmergencia' in patch, false);
});
test('GET usa /profile, Bearer e preserva campos nulos', async () => {
  data = empty; assert.deepEqual(await getProfile(), empty);
  assert.equal(calls.at(-1).method, 'get');
  assert.equal(api.getUri(calls.at(-1)), 'https://api.example.test/api/profile');
  assert.equal(calls.at(-1).headers.Authorization, 'Bearer synthetic-token');
});
test('PATCH usa contrato parcial e retorna os dados confirmados pelo servidor', async () => {
  data = { ...profile, pesoKg: 62 };
  assert.deepEqual(await updateProfile({ ...form(), weight: '62' }, profile), data);
  const config = calls.at(-1);
  assert.equal(config.method, 'patch');
  assert.equal(api.getUri(config), 'https://api.example.test/api/profile');
  assert.deepEqual(JSON.parse(config.data), { pesoKg: 62 });
});
test('formulário sem mudanças não dispara HTTP', async () => {
  const before = calls.length; await assert.rejects(updateProfile(form(), profile));
  assert.equal(calls.length, before);
});
test('cancelamento e resposta incompleta são tratados', async () => {
  const controller = new AbortController(); controller.abort();
  const before = calls.length; await assert.rejects(getProfile(controller.signal));
  assert.equal(calls.length, before);
  data = {}; await assert.rejects(getProfile(), /perfil inválido/);
  await assert.rejects(updateProfile({ ...form(), weight: '62' }, profile), /perfil inválido/);
});
test('falha de rede e 401/400 não simulam atualização bem-sucedida', async () => {
  failure = new AxiosError('timeout');
  await assert.rejects(updateProfile({ ...form(), weight: '62' }, profile), /campos foram mantidos/);
  for (const status of [400, 401]) {
    failure = new AxiosError('Request failed', undefined, undefined, undefined,
      { status, data: {}, headers: {}, config: { headers: {} } });
    await assert.rejects(updateProfile({ ...form(), weight: '62' }, profile), (error) => error.response.status === status);
  }
  failure = undefined;
});
test('exclusão de conta chama DELETE /users/me autenticado e repassa falha', async () => {
  data = undefined; await deleteAccount();
  const config = calls.at(-1);
  assert.equal(config.method, 'delete');
  assert.equal(api.getUri(config), 'https://api.example.test/api/users/me');
  assert.equal(config.headers.Authorization, 'Bearer synthetic-token');
  failure = new AxiosError('network'); await assert.rejects(deleteAccount()); failure = undefined;
  data = profile;
});
