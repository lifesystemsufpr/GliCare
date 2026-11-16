import type { GlucoseRecord } from '../../glucose/services/glucose-contract';
import type { InsulinRecord } from '../../insulin/services/insulin-contract';
import type { Reminder } from '../../reminders/services/reminder-contract';

// Resposta de GET /home/summary. A rota continua liberada com o perfil
// incompleto, ao contrário das listas de glicemia, insulina e lembretes.
export type HomeGlucosePoint = { dataHora: string; valor: number };
export type HomeSources = {
  nome: string | null;
  ultimaGlicemia: GlucoseRecord | null; ultimaInsulina: InsulinRecord | null;
  proximoLembrete: Reminder | null;
  resumoDiario: { glicemiaRegistrada: boolean; insulinaRegistrada: boolean };
  glicemiaUltimos7Dias: HomeGlucosePoint[];
};
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
function validGlucose(item: GlucoseRecord): GlucoseRecord {
  if (!Number.isFinite(item.valor) || item.valor <= 0 || !['NORMAL', 'ALTA', 'BAIXA'].includes(item.status)) throw new Error('A API retornou uma glicemia inválida.');
  return item;
}
function validInsulin(item: InsulinRecord): InsulinRecord {
  if (!Number.isFinite(item.doseUi) || item.doseUi <= 0) throw new Error('A API retornou uma dose inválida.');
  return item;
}
// O resumo vem pronto da API, mas a tela reavalia a cada minuto sem nova
// consulta: virada do dia, lembrete que passou e registro com data futura.
export function buildHomeSummary(sources: HomeSources, now = new Date()): HomeSummary {
  const instant = now.getTime();
  const today = dayKey(now);
  const happened = <T extends { dataHora: string }>(item: T | null): T | null =>
    item && timestamp(item.dataHora) <= instant ? item : null;
  const lastGlucose = happened(sources.ultimaGlicemia && validGlucose(sources.ultimaGlicemia));
  const lastInsulin = happened(sources.ultimaInsulina && validInsulin(sources.ultimaInsulina));
  const reminder = sources.proximoLembrete;
  const nextReminder = reminder && reminder.status === 'ATIVO' && timestamp(reminder.dataHora) >= instant ? reminder : null;
  const points = sources.glicemiaUltimos7Dias.filter((point) => {
    if (!Number.isFinite(point.valor) || point.valor <= 0) throw new Error('A API retornou uma glicemia inválida.');
    return timestamp(point.dataHora) <= instant;
  }).sort((a, b) => timestamp(b.dataHora) - timestamp(a.dataHora));
  const weekly: WeeklyPoint[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = dayKey(date);
    const last = points.find((item) => dayKey(new Date(item.dataHora)) === key);
    weekly.push({ date: key, day: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: last?.valor ?? null });
  }
  return { lastGlucose, lastInsulin, nextReminder,
    glucoseToday: [lastGlucose, ...points].some((item) => item != null && dayKey(new Date(item.dataHora)) === today),
    insulinToday: lastInsulin != null && dayKey(new Date(lastInsulin.dataHora)) === today, weekly };
}
// Quando o resumo carregado fica velho: mudou o dia, o próximo lembrete
// passou (o seguinte só a API sabe) ou chegou a hora de um registro futuro.
export function homeNeedsReload(sources: HomeSources, loadedAt: Date, now = new Date()): boolean {
  if (dayKey(loadedAt) !== dayKey(now)) return true;
  const instant = now.getTime();
  const loaded = loadedAt.getTime();
  const crossed = (value: string | undefined) => value != null && timestamp(value) > loaded && timestamp(value) <= instant;
  return crossed(sources.proximoLembrete?.dataHora) || crossed(sources.ultimaGlicemia?.dataHora) ||
    crossed(sources.ultimaInsulina?.dataHora);
}
