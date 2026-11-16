import { formatNumber } from '../../../shared/format';
import { buildDashboard, periodDays, type DashboardSources, type DashboardSummary, type Period } from '../../dashboard/services/dashboard-model';
import { dayKey } from '../../home/services/home-model';
import { momentLabels } from '../../glucose/services/glucose-contract';
import { siteLabels } from '../../insulin/services/insulin-contract';

export type ReportRow = {
  id: string; kind: 'Glicemia' | 'Insulina'; occurredAt: string; value: string; detail: string; notes: string;
};
export type Report = { period: Period; generatedAt: string; summary: DashboardSummary; rows: ReportRow[] };

export function buildReport(sources: DashboardSources, period: Period, now = new Date()): Report {
  periodDays(period, now);
  const summary = buildDashboard(sources, period, now);
  const included = (value: string) => {
    const date = new Date(value);
    const key = dayKey(date);
    return date <= now && key >= period.start && key <= period.end;
  };
  const labels = { BAIXA: 'Baixa', NORMAL: 'Normal', ALTA: 'Alta' } as const;
  const rows: ReportRow[] = [
    ...sources.glucose.filter((record) => included(record.dataHora)).map((record): ReportRow => ({
      id: 'glucose:' + record.id, kind: 'Glicemia', occurredAt: record.dataHora,
      value: `${record.valor} mg/dL`, detail: `${momentLabels[record.momento] ?? record.momento} · ${labels[record.status]}`,
      notes: record.observacao ?? '',
    })),
    ...sources.insulin.filter((record) => included(record.dataHora)).map((record): ReportRow => ({
      id: 'insulin:' + record.id, kind: 'Insulina', occurredAt: record.dataHora,
      value: `${formatNumber(record.doseUi)} UI`, detail: `${record.tipo} · ${record.localAplicacao ? siteLabels[record.localAplicacao] ?? record.localAplicacao : 'Local não informado'}`,
      notes: record.observacao ?? '',
    })),
  ];
  rows.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime() || a.id.localeCompare(b.id));
  return { period: { ...period }, generatedAt: now.toISOString(), summary, rows };
}
