import axios from 'axios';
import { api } from '@/shared/api';
import { insulinToApi, type InsulinForm, type InsulinRecord } from './insulin-contract';

export async function createInsulin(form: InsulinForm): Promise<InsulinRecord> {
  const payload = insulinToApi(form);
  try {
    const { data } = await api.post<InsulinRecord>('/insulin-applications', payload);
    if (!data?.id) throw new Error('A API não confirmou o registro. Consulte o histórico antes de tentar novamente.');
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error('Não foi possível confirmar o salvamento. Atualize o histórico antes de reenviar para evitar duplicação.');
    }
    throw error;
  }
}

export async function listInsulin(signal?: AbortSignal): Promise<InsulinRecord[]> {
  const { data } = await api.get<InsulinRecord[]>('/insulin-applications', { signal });
  if (!Array.isArray(data)) throw new Error('A API retornou um histórico inválido.');
  return data;
}
