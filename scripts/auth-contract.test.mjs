import test from 'node:test';
import assert from 'node:assert/strict';
import { birthDateToApi, formatBirthDateInput, registrationToApi } from '../src/features/auth/services/auth-contract.ts';

const form = {
  name: ' Pessoa Teste ', email: ' TESTE@EXAMPLE.COM ', password: ' abc12345 ',
  confirmPassword: ' abc12345 ', birthDate: '12/04/1995', height: '1,70', weight: '68,30',
  diabetesType: 'type1', emergencyName: ' Contato ', emergencyRelation: ' Familiar ',
  emergencyPhone: '(41) 99999-9999',
};

test('nascimento pode ser digitado no teclado numérico e colado com separadores', () => {
  assert.equal(formatBirthDateInput('12041995'), '12/04/1995');
  assert.equal(formatBirthDateInput('12/04/1995'), '12/04/1995');
  assert.equal(formatBirthDateInput('1204'), '12/04');
});

test('cadastro converte contrato, unidades e decimais sem alterar senha', () => {
  const dto = registrationToApi(form);
  assert.deepEqual(dto, {
    nome: 'Pessoa Teste', email: 'teste@example.com', senha: ' abc12345 ',
    confirmarSenha: ' abc12345 ', dataNascimento: '1995-04-12',
    tipoDiabetes: 'TIPO_1', alturaCm: 170, pesoKg: 68.3,
    contatoEmergencia: { nome: 'Contato', relacao: 'Familiar', telefone: '(41) 99999-9999' },
  });
  assert.equal('password' in dto, false);
  assert.equal('height' in dto, false);
});

test('todos os tipos de diabetes têm mapeamento explícito', () => {
  for (const [mobile, api] of [['type1', 'TIPO_1'], ['type2', 'TIPO_2'], ['other', 'OUTRO']]) {
    assert.equal(registrationToApi({ ...form, diabetesType: mobile }).tipoDiabetes, api);
  }
  assert.throws(() => registrationToApi({ ...form, diabetesType: null }), /tipo de diabetes/);
});

test('datas inválidas, futuras e formato incorreto são rejeitados', () => {
  for (const value of ['30/02/2020', '29/02/2023', '01/01/1899', '01/01/2999', '1995-04-12']) {
    assert.throws(() => birthDateToApi(value));
  }
  assert.equal(birthDateToApi('29/02/2024'), '2024-02-29');
});

test('não envia cadastro incompleto ou senhas divergentes', () => {
  assert.throws(() => registrationToApi({ ...form, emergencyName: ' ' }));
  assert.throws(() => registrationToApi({ ...form, confirmPassword: 'diferente' }));
  assert.throws(() => registrationToApi({ ...form, password: 'abcdefgh' }));
  assert.throws(() => registrationToApi({ ...form, email: 'invalido' }));
});

test('unidades e números inválidos são rejeitados antes da chamada HTTP', () => {
  for (const height of ['170', 'Infinity', '1,234', '0,29', '2,73', '']) {
    assert.throws(() => registrationToApi({ ...form, height }));
  }
  for (const weight of ['0', '501', 'NaN', '-1', '68kg', '1e2']) {
    assert.throws(() => registrationToApi({ ...form, weight }));
  }
});
