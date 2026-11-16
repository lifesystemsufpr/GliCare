import { dayKey } from '../../home/services/home-model';
import { momentLabels, type ApiMoment } from '../../glucose/services/glucose-contract';

export type Period = { start: string; end: string };

// Resposta de GET /dashboard. Os cálculos são da API; o app só valida o
// formato e prepara para exibir.
type ApiExtreme = { valor: number; dataHora: string; momento: ApiMoment };
type ApiBand = { quantidade: number; percentual: number | null };
export type DashboardApiResponse = {
  mediaGlicemia: number | null;
  maiorValor: ApiExtreme | null;
  menorValor: ApiExtreme | null;
  glicemiaAoLongoDoDia: { valor: number; dataHora: string; momento: ApiMoment }[];
  insulinaTotalDiaria: { data: string; totalUi: number; quantidade: number }[];
  distribuicaoLeituras: {
    total: number; muitoBaixa: ApiBand; baixa: ApiBand; noAlvo: ApiBand; alta: ApiBand; muitoAlta: ApiBand;
  };
  mediaPorMomento: { momento: ApiMoment; media: number; quantidade: number }[];
};
export type Extreme = { value: number; at: string; moment: string };
export type Band = { key: string; label: string; count: number; percentage: number | null };
export type DashboardSummary = {
  measurements: number; applications: number; insulinTotal: number;
  mean: number | null; min: Extreme | null; max: Extreme | null;
  bands: Band[];
  byMoment: { moment: string; mean: number; count: number }[];
  insulinDaily: { date: string; label: string; totalUi: number; count: number }[];
};

function parseDay(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error('Informe datas válidas.');
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (date.getFullYear() !== Number(y) || date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d)) {
    throw new Error('Informe datas existentes no calendário.');
  }
  return date;
}
export function periodDays(period: Period, now = new Date()): Date[] {
  const start = parseDay(period.start);
  const end = parseDay(period.end);
  if (start > end) throw new Error('A data inicial deve ser anterior ou igual à final.');
  if (period.end > dayKey(now)) throw new Error('O período não pode terminar no futuro.');
  const days: Date[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    if (days.length === 366) throw new Error('Selecione um período de no máximo 366 dias.');
    days.push(new Date(cursor));
  }
  return days;
}
export function presetPeriod(days: 7 | 30 | 90, now = new Date()): Period {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);
  return { start: dayKey(start), end: dayKey(now) };
}
export function periodInput(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) throw new Error('Informe o período no formato dd/mm/aaaa.');
  return `${match[3]}-${match[2]}-${match[1]}`;
}
export function displayDay(value: string): string {
  return parseDay(value).toLocaleDateString('pt-BR');
}
const bandLabels = [
  ['muitoBaixa', 'Muito baixa (abaixo de 54)'],
  ['baixa', 'Baixa (54 a 69)'],
  ['noAlvo', 'No alvo (70 a 180)'],
  ['alta', 'Alta (181 a 250)'],
  ['muitoAlta', 'Muito alta (acima de 250)'],
] as const;

function invalid(): never {
  throw new Error('A API retornou indicadores inválidos.');
}
function count(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) invalid();
  return value;
}
function amount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) invalid();
  return value;
}
function extreme(value: ApiExtreme | null): Extreme | null {
  if (value == null) return null;
  if (typeof value !== 'object' || !Number.isFinite(new Date(value.dataHora).getTime())) invalid();
  return { value: amount(value.valor), at: value.dataHora, moment: momentLabels[value.momento] ?? value.momento };
}

export function toDashboardSummary(data: DashboardApiResponse): DashboardSummary {
  if (!data || typeof data !== 'object' || !data.distribuicaoLeituras || !Array.isArray(data.insulinaTotalDiaria)
    || !Array.isArray(data.mediaPorMomento)) invalid();
  const bands = bandLabels.map(([key, label]): Band => {
    const band = data.distribuicaoLeituras[key];
    if (!band) invalid();
    return { key, label, count: count(band.quantidade), percentage: band.percentual == null ? null : amount(band.percentual) };
  });
  const insulinDaily = data.insulinaTotalDiaria.map((day) => {
    if (typeof day.data !== 'string') invalid();
    return { date: day.data, label: displayDay(day.data), totalUi: amount(day.totalUi), count: count(day.quantidade) };
  });
  return {
    measurements: count(data.distribuicaoLeituras.total),
    applications: insulinDaily.reduce((total, day) => total + day.count, 0),
    insulinTotal: insulinDaily.reduce((total, day) => total + day.totalUi, 0),
    mean: data.mediaGlicemia == null ? null : amount(data.mediaGlicemia),
    min: extreme(data.menorValor), max: extreme(data.maiorValor), bands,
    byMoment: data.mediaPorMomento.map((item) => ({
      moment: momentLabels[item.momento] ?? item.momento, mean: amount(item.media), count: count(item.quantidade),
    })),
    insulinDaily,
  };
}
