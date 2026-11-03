import { api } from '@/shared/api';
import axios from 'axios';
import { profileToPatch, type Profile, type ProfileForm } from './profile-contract';

function confirmedProfile(data: Profile): Profile {
  if (!data || typeof data.nome !== 'string' || !Object.hasOwn(data, 'tipoDiabetes')) {
    throw new Error('A API retornou um perfil inválido. Atualize o perfil antes de continuar.');
  }
  return data;
}
export async function getProfile(signal?: AbortSignal): Promise<Profile> {
  const { data } = await api.get<Profile>('/profile', { signal });
  return confirmedProfile(data);
}
export async function updateProfile(form: ProfileForm, initial: Profile): Promise<Profile> {
  const payload = profileToPatch(form, initial);
  try {
    const { data } = await api.patch<Profile>('/profile', payload);
    return confirmedProfile(data);
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error('Não foi possível confirmar a atualização. Seus campos foram mantidos; consulte o perfil novamente antes de reenviar.');
    }
    throw error;
  }
}
