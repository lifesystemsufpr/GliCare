import type { GlucoseRecord } from '../../glucose/services/glucose-contract';
import type { InsulinRecord } from '../../insulin/services/insulin-contract';
import { dayKey } from '../../home/services/home-model';

export type Period = { start: string; end: string };
export type DailyGlucose = { date: string; label: string; count: number; mean: number | null };
export type DashboardSources = { glucose: GlucoseRecord[]; insulin: InsulinRecord[] };
export type DashboardSummary = {
  measurements: number; applications: number; mean: number | null; min: number | null; max: number | null;
  distribution: { status: 'BAIXA' | 'NORMAL' | 'ALTA'; count: number; percentage: number | null }[];
  daily: DailyGlucose[];
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
function recordDate(value: string): Date {
  if (typeof value !== 'string' || !Number.isFinite(new Date(value).getTime())) throw new Error('A API retornou uma data inválida.');
  return new Date(value);
}
export function buildDashboard(sources: DashboardSources, period: Period, now = new Date()): DashboardSummary {
  const days = periodDays(period, now);
  const inPeriod = (value: string) => {
    const date = recordDate(value);
    const key = dayKey(date);
    return date <= now && key >= period.start && key <= period.end;
  };
  const glucose = sources.glucose.filter((record) => {
    if (!Number.isFinite(record.valor) || record.valor <= 0 || !['BAIXA', 'NORMAL', 'ALTA'].includes(record.status)) {
      throw new Error('A API retornou uma medição inválida.');
    }
    return inPeriod(record.dataHora);
  });
  const insulin = sources.insulin.filter((record) => {
    if (!Number.isFinite(record.doseUi) || record.doseUi <= 0) throw new Error('A API retornou uma aplicação inválida.');
    return inPeriod(record.dataHora);
  });
  const values = glucose.map((record) => record.valor);
  const sum = values.reduce((total, value) => total + value, 0);
  const dailyGroups = new Map<string, { sum: number; count: number }>();
  for (const record of glucose) {
    const key = dayKey(new Date(record.dataHora));
    const group = dailyGroups.get(key) ?? { sum: 0, count: 0 };
    group.sum += record.valor;
    group.count++;
    dailyGroups.set(key, group);
  }
  const statuses = ['BAIXA', 'NORMAL', 'ALTA'] as const;
  return {
    measurements: glucose.length, applications: insulin.length,
    mean: values.length ? sum / values.length : null,
    min: values.length ? values.reduce((a, b) => Math.min(a, b)) : null,
    max: values.length ? values.reduce((a, b) => Math.max(a, b)) : null,
    distribution: statuses.map((status) => {
      const count = glucose.filter((record) => record.status === status).length;
      return { status, count, percentage: glucose.length ? count / glucose.length * 100 : null };
    }),
    daily: days.map((date) => {
      const key = dayKey(date);
      const group = dailyGroups.get(key);
      return { date: key, label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), count: group?.count ?? 0,
        mean: group ? group.sum / group.count : null };
    }),
  };
}
