import { api } from '@/shared/api';
import { LEGAL_VERSION } from '../../legal/legal-texts';
import type { AuthUser, CurrentUser, RegistrationForm } from './auth-contract';
import { registrationToApi } from './auth-contract';

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
    email: email.trim().toLowerCase(), senha: password,
  });
  if (!data.accessToken || !data.user?.id) throw new Error('Resposta de autenticação inválida.');
  return data;
}

export async function registerRequest(form: RegistrationForm) {
  const { data } = await api.post<AuthUser>('/auth/register', registrationToApi(form));
  return data;
}

export async function currentUserRequest(token: string): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!data.id || !data.nome) throw new Error('Resposta de sessão inválida.');
  return data;
}

export async function acceptTermsRequest(): Promise<CurrentUser> {
  const { data } = await api.post<CurrentUser>('/users/me/termos', {
    versaoTermos: LEGAL_VERSION,
  });
  if (!data?.id || !data?.nome) throw new Error('Resposta de sessão inválida.');
  return data;
}
