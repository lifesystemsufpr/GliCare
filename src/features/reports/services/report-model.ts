import { formatNumber, glucoseStatusLabels, type GlucoseStatus } from '../../../shared/format';
import { periodDays, type DashboardSummary, type Period } from '../../dashboard/services/dashboard-model';
import { momentLabels, type ApiMoment } from '../../glucose/services/glucose-contract';
import { siteLabels, type ApiSite } from '../../insulin/services/insulin-contract';

// Resposta de GET /reports/records: glicemias e insulinas juntas, da mais
// recente para a mais antiga.
export type ApiRecord = {
  type: 'GLYCEMIA' | 'INSULIN';
  id: string;
  dateTime: string;
  glycemia: { valor: number; momento: ApiMoment; status: GlucoseStatus; observacao: string | null } | null;
  insulin: { tipo: string; doseUi: number; localAplicacao: ApiSite | null; observacao: string | null } | null;
};
export type ReportRow = {
  id: string; kind: 'Glicemia' | 'Insulina'; occurredAt: string; value: string; detail: string; notes: string;
};
export type ReportSummary = {
  measurements: number; applications: number; mean: number | null; min: number | null; max: number | null;
};
export type Report = { period: Period; generatedAt: string; summary: ReportSummary; rows: ReportRow[] };

function invalid(): never {
  throw new Error('A API retornou um histórico inválido.');
}

function toRow(record: ApiRecord): ReportRow {
  if (!record || typeof record.id !== 'string' || !Number.isFinite(new Date(record.dateTime).getTime())) invalid();
  if (record.type === 'GLYCEMIA' && record.glycemia) {
    const g = record.glycemia;
    if (!Number.isFinite(g.valor) || g.valor <= 0 || !glucoseStatusLabels[g.status]) invalid();
    return {
      id: 'glucose:' + record.id, kind: 'Glicemia', occurredAt: record.dateTime,
      value: `${formatNumber(g.valor)} mg/dL`,
      detail: `${momentLabels[g.momento] ?? g.momento} · ${glucoseStatusLabels[g.status]}`,
      notes: g.observacao ?? '',
    };
  }
  if (record.type === 'INSULIN' && record.insulin) {
    const i = record.insulin;
    if (!Number.isFinite(i.doseUi) || i.doseUi <= 0) invalid();
    return {
      id: 'insulin:' + record.id, kind: 'Insulina', occurredAt: record.dateTime,
      value: `${formatNumber(i.doseUi)} UI`,
      detail: `${i.tipo} · ${i.localAplicacao ? siteLabels[i.localAplicacao] ?? i.localAplicacao : 'Local não informado'}`,
      notes: i.observacao ?? '',
    };
  }
  return invalid();
}

// A lista vem da API na ordem certa; o resumo vem do Dashboard da API para o
// mesmo período. O app não recalcula nenhum dos dois.
export function buildReport(records: ApiRecord[], dashboard: DashboardSummary, period: Period, now = new Date()): Report {
  periodDays(period, now);
  if (!Array.isArray(records)) invalid();
  return {
    period: { ...period },
    generatedAt: now.toISOString(),
    summary: {
      measurements: dashboard.measurements, applications: dashboard.applications, mean: dashboard.mean,
      min: dashboard.min?.value ?? null, max: dashboard.max?.value ?? null,
    },
    rows: records.map(toRow),
  };
}
