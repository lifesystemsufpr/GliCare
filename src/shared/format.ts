// Formatação para exibição em português do Brasil (vírgula decimal, data sem
// segundos). Só para mostrar valores na tela: a leitura dos campos digitados
// continua nos contratos de cada feature.

export type GlucoseStatus = 'BAIXA' | 'NORMAL' | 'ALTA';

export const glucoseStatusLabels: Record<GlucoseStatus, string> = {
  BAIXA: 'Baixa',
  NORMAL: 'Normal',
  ALTA: 'Alta',
};

export function formatNumber(value: number, maxDecimals = 1): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: maxDecimals });
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function greetingFor(date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
