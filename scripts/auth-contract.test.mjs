import test from 'node:test';
import assert from 'node:assert/strict';
import { birthDateToApi, formatBirthDateInput, registrationToApi } from '../src/features/auth/services/auth-contract.ts';

const form = {
  name: ' Pessoa Teste ', email: ' TESTE@EXAMPLE.COM ', password: ' abc12345 ',
  confirmPassword: ' abc12345 ',
};

test('nascimento pode ser digitado no teclado numérico e colado com separadores', () => {
  assert.equal(formatBirthDateInput('12041995'), '12/04/1995');
  assert.equal(formatBirthDateInput('12/04/1995'), '12/04/1995');
  assert.equal(formatBirthDateInput('1204'), '12/04');
});

test('cadastro em duas etapas envia só nome, e-mail e senha, sem alterar a senha', () => {
  const dto = registrationToApi(form);
  assert.deepEqual(dto, {
    nome: 'Pessoa Teste', email: 'teste@example.com', senha: ' abc12345 ', confirmarSenha: ' abc12345 ',
  });
  for (const field of ['dataNascimento', 'tipoDiabetes', 'alturaCm', 'pesoKg', 'contatoEmergencia', 'password']) {
    assert.equal(field in dto, false);
  }
});

test('datas inválidas, futuras e formato incorreto são rejeitados', () => {
  for (const value of ['30/02/2020', '29/02/2023', '01/01/1899', '01/01/2999', '1995-04-12']) {
    assert.throws(() => birthDateToApi(value));
  }
  assert.equal(birthDateToApi('29/02/2024'), '2024-02-29');
});

test('não envia cadastro incompleto ou senhas divergentes', () => {
  assert.throws(() => registrationToApi({ ...form, name: ' ' }), /nome/);
  assert.throws(() => registrationToApi({ ...form, email: '' }));
  assert.throws(() => registrationToApi({ ...form, confirmPassword: 'diferente' }));
  assert.throws(() => registrationToApi({ ...form, password: 'abcdefgh', confirmPassword: 'abcdefgh' }));
  assert.throws(() => registrationToApi({ ...form, email: 'invalido' }));
});
