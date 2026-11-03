import axios from 'axios';

type ApiError = { message?: string; details?: { field: string; messages: string[] }[] };

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    if (!error.response) return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
    if (error.response.status >= 500) return 'O serviço está indisponível. Tente novamente mais tarde.';
    const data = error.response.data;
    const details = Array.isArray(data?.details)
      ? data.details.map((item) => `${item.field}: ${item.messages.join(', ')}`).join('\n')
      : '';
    return details || data?.message || 'Não foi possível concluir a solicitação.';
  }
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.';
}
