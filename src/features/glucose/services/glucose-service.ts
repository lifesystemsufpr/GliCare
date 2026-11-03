import { api } from '@/shared/api';
import axios from 'axios';
import { glucoseToApi, type GlucoseForm, type GlucoseRecord } from './glucose-contract';

export async function createGlucose(form: GlucoseForm): Promise<GlucoseRecord> {
  const payload = glucoseToApi(form);
  try {
    const { data } = await api.post<GlucoseRecord>('/glycemias', payload);
    if (!data?.id) throw new Error('A API não confirmou o registro. Consulte o histórico antes de tentar novamente.');
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error('Não foi possível confirmar o salvamento. Atualize o histórico antes de reenviar para evitar duplicação.');
    }
    throw error;
  }
}

export async function listGlucose(signal?: AbortSignal): Promise<GlucoseRecord[]> {
  const { data } = await api.get<GlucoseRecord[]>('/glycemias', { signal });
  if (!Array.isArray(data)) throw new Error('A API retornou um histórico inválido.');
  return data;
}
