import { api } from '@/shared/api';
import type { HomeSources } from './home-model';

// Uma consulta só: GET /home/summary continua liberada enquanto o perfil
// estiver incompleto (as listas de glicemia, insulina e lembretes, não).
export async function loadHomeSources(signal?: AbortSignal): Promise<HomeSources> {
  const { data } = await api.get<HomeSources>('/home/summary', { signal });
  if (!data || typeof data !== 'object' || !Array.isArray(data.glicemiaUltimos7Dias) || typeof data.resumoDiario !== 'object' ||
      !('ultimaGlicemia' in data) || !('ultimaInsulina' in data) || !('proximoLembrete' in data)) {
    throw new Error('A API retornou um resumo da Home inválido.');
  }
  return data;
}
