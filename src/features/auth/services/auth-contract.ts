export type AuthUser = { id: string; nome: string; email: string };
export type CurrentUser = AuthUser & {
  perfil?: {
    dataNascimento: string | null;
    tipoDiabetes: 'TIPO_1' | 'TIPO_2' | 'OUTRO' | null;
    alturaCm: number | null;
    pesoKg: number | null;
    contatoEmergencia: { nome: string; relacao: string; telefone: string } | null;
  } | null;
};

export type RegistrationForm = {
  name: string; email: string; password: string; confirmPassword: string;
  birthDate: string; height: string; weight: string;
  diabetesType: 'type1' | 'type2' | 'other' | null;
  emergencyName: string; emergencyRelation: string; emergencyPhone: string;
};

export function formatBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function birthDateToApi(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) throw new Error('Informe a data de nascimento no formato dd/mm/aaaa.');
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day) || Number(year) < 1900 || date > new Date()) {
    throw new Error('Informe uma data de nascimento válida e não futura.');
  }
  return `${year}-${month}-${day}`;
}

function decimal(value: string, label: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Informe ${label} com até duas casas decimais.`);
  }
  return Number(normalized);
}

export function registrationToApi(form: RegistrationForm) {
  if (!form.name.trim() || !form.email.trim() || !form.emergencyName.trim() ||
      !form.emergencyRelation.trim() || !form.emergencyPhone.trim()) {
    throw new Error('Preencha os dados pessoais e o contato de emergência.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    throw new Error('Informe um e-mail válido.');
  }
  if (form.password.length < 8 || form.password.length > 72 ||
      !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    throw new Error('A senha deve ter de 8 a 72 caracteres, com letras e números.');
  }
  if (form.password !== form.confirmPassword) throw new Error('As senhas não coincidem.');
  if (!form.diabetesType) throw new Error('Selecione o tipo de diabetes.');
  const alturaCm = Math.round(decimal(form.height, 'a altura em metros') * 10000) / 100;
  const pesoKg = decimal(form.weight, 'o peso em quilos');
  if (alturaCm < 30 || alturaCm > 272) throw new Error('Informe a altura entre 0,30 e 2,72 metros.');
  if (pesoKg < 1 || pesoKg > 500) throw new Error('Informe o peso entre 1 e 500 kg.');
  const diabetes = { type1: 'TIPO_1', type2: 'TIPO_2', other: 'OUTRO' } as const;
  return {
    nome: form.name.trim(), email: form.email.trim().toLowerCase(),
    senha: form.password, confirmarSenha: form.confirmPassword,
    dataNascimento: birthDateToApi(form.birthDate),
    tipoDiabetes: diabetes[form.diabetesType], alturaCm, pesoKg,
    contatoEmergencia: { nome: form.emergencyName.trim(), relacao: form.emergencyRelation.trim(),
      telefone: form.emergencyPhone.trim() },
  };
}
