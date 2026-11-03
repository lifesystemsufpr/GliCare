import type { GlucoseRecord } from '../../glucose/services/glucose-contract';
import type { InsulinRecord } from '../../insulin/services/insulin-contract';
import type { Reminder } from '../../reminders/services/reminder-contract';

export type HomeSources = { glucose: GlucoseRecord[]; insulin: InsulinRecord[]; reminders: Reminder[] };
export type WeeklyPoint = { date: string; day: string; value: number | null };
export type HomeSummary = {
  lastGlucose: GlucoseRecord | null; lastInsulin: InsulinRecord | null;
  nextReminder: Reminder | null; glucoseToday: boolean; insulinToday: boolean;
  weekly: WeeklyPoint[];
};
function timestamp(value: string): number {
  if (typeof value !== 'string') throw new Error('A API retornou uma data inválida nos registros da Home.');
  const result = new Date(value).getTime();
  if (!Number.isFinite(result)) throw new Error('A API retornou uma data inválida nos registros da Home.');
  return result;
}
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function chartScale(points: WeeklyPoint[]): { min: number; max: number } {
  const values = points.flatMap((point) => point.value == null ? [] : [point.value]);
  return { min: 0, max: Math.max(100, Math.ceil(Math.max(0, ...values) / 50) * 50) };
}
export function buildHomeSummary(sources: HomeSources, now = new Date()): HomeSummary {
  const instant = now.getTime();
  const today = dayKey(now);
  const glucose = sources.glucose.filter((item) => {
    if (!Number.isFinite(item.valor) || item.valor <= 0 || !['NORMAL', 'ALTA', 'BAIXA'].includes(item.status)) throw new Error('A API retornou uma glicemia inválida.');
    return timestamp(item.dataHora) <= instant;
  }).sort((a, b) => timestamp(b.dataHora) - timestamp(a.dataHora));
  const insulin = sources.insulin.filter((item) => {
    if (!Number.isFinite(item.doseUi) || item.doseUi <= 0) throw new Error('A API retornou uma dose inválida.');
    return timestamp(item.dataHora) <= instant;
  }).sort((a, b) => timestamp(b.dataHora) - timestamp(a.dataHora));
  const nextReminder = sources.reminders.filter((item) =>
    timestamp(item.dataHora) >= instant && item.status === 'ATIVO')
    .sort((a, b) => timestamp(a.dataHora) - timestamp(b.dataHora))[0] ?? null;
  const weekly: WeeklyPoint[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = dayKey(date);
    const last = glucose.find((item) => dayKey(new Date(item.dataHora)) === key);
    weekly.push({ date: key, day: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: last?.valor ?? null });
  }
  return { lastGlucose: glucose[0] ?? null, lastInsulin: insulin[0] ?? null, nextReminder,
    glucoseToday: glucose.some((item) => dayKey(new Date(item.dataHora)) === today),
    insulinToday: insulin.some((item) => dayKey(new Date(item.dataHora)) === today), weekly };
}
