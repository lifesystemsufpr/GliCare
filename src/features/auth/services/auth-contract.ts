import { LEGAL_VERSION } from '../../legal/legal-texts';

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  termosVersaoAceita?: string | null;
};
export type CurrentUser = AuthUser & {
  // false enquanto faltar algum dado de saúde. Ausente em versões antigas da API.
  perfilCompleto?: boolean;
  perfil?: {
    dataNascimento: string | null;
    tipoDiabetes: 'TIPO_1' | 'TIPO_2' | 'OUTRO' | null;
    alturaCm: number | null;
    pesoKg: number | null;
  } | null;
};

export function precisaAceitarTermos(
  termosVersaoAceita: string | null | undefined,
  versaoAtual: string = LEGAL_VERSION,
): boolean {
  if (termosVersaoAceita === undefined) return false;
  return termosVersaoAceita !== versaoAtual;
}

// Cadastro em duas etapas: a conta nasce só com nome, e-mail e senha. Os dados
// de saúde são completados depois, no Perfil.
export type RegistrationForm = {
  name: string; email: string; password: string; confirmPassword: string; acceptedTerms: boolean;
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

export function registrationToApi(form: RegistrationForm) {
  if (!form.acceptedTerms) throw new Error('Aceite os Termos de Uso e a Política de Privacidade para criar a conta.');
  if (!form.name.trim() || !form.email.trim()) {
    throw new Error('Preencha seu nome e seu e-mail.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    throw new Error('Informe um e-mail válido.');
  }
  if (form.password.length < 8 || form.password.length > 72 ||
      !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    throw new Error('A senha deve ter de 8 a 72 caracteres, com letras e números.');
  }
  if (form.password !== form.confirmPassword) throw new Error('As senhas não coincidem.');
  return {
    nome: form.name.trim(), email: form.email.trim().toLowerCase(),
    senha: form.password, confirmarSenha: form.confirmPassword, versaoTermos: LEGAL_VERSION,
  };
}
