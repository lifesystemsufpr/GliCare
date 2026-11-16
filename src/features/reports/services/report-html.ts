import { formatDateTime } from '../../../shared/format';
import { displayDay } from '../../dashboard/services/dashboard-model';
import type { Report } from './report-model';

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
export function reportHtml(report: Report, name: string): string {
  const text = escapeHtml;
  const measure = (value: number | null) => value == null ? 'Sem dados' : value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mg/dL';
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const rows = report.rows.map((row) => `<tr><td>${text(formatDateTime(row.occurredAt))}</td><td>${text(row.kind)}<br><strong>${text(row.value)}</strong></td><td>${text(row.detail)}</td><td>${text(row.notes || '—')}</td></tr>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>GliCare - Relatório</title>
<style>
@page{size:A4;margin:16mm 12mm}*{box-sizing:border-box}body{font:10pt/1.45 Arial,sans-serif;color:#16354a;margin:0}h1{font-size:22pt;color:#15659a;margin:0 0 10px}h2{font-size:13pt;margin-top:22px}p{margin:6px 0}.meta{color:#4b6271}.metrics{border:1px solid #ccdce6;border-radius:6px;padding:12px;margin:14px 0}table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:9pt}th,td{border:1px solid #d4e0e8;padding:7px;vertical-align:top;overflow-wrap:anywhere;word-wrap:break-word}th{background:#edf5fa;text-align:left}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}td{white-space:pre-wrap}th:nth-child(1){width:21%}th:nth-child(2){width:18%}th:nth-child(3){width:28%}th:nth-child(4){width:33%}.footer{margin-top:18px;font-size:8pt;color:#546a79}h2{break-after:avoid}
</style></head><body><h1>GliCare | Relatório de registros</h1>
<p><strong>${text(name)}</strong></p><p>Período: ${text(displayDay(report.period.start))} a ${text(displayDay(report.period.end))}</p>
<p class="meta">Dados consultados em ${text(new Date(report.generatedAt).toLocaleString('pt-BR'))} | Fuso: ${text(zone)}</p>
<div class="metrics"><strong>Resumo do período</strong><br>Medições: ${report.summary.measurements} | Aplicações: ${report.summary.applications}<br>Média: ${text(measure(report.summary.mean))} | Mínimo: ${text(measure(report.summary.min))} | Máximo: ${text(measure(report.summary.max))}</div>
<h2>Glicemias e aplicações de insulina</h2>
${report.rows.length ? `<table><thead><tr><th>Data e hora</th><th>Registro</th><th>Detalhes</th><th>Observações</th></tr></thead><tbody>${rows}</tbody></table>` : '<p>Nenhum registro no período selecionado.</p>'}
<p class="footer">Dados registrados pelo usuário. Classificação de glicemia recebida da API. Resumo descritivo; não contém recomendações de tratamento. Os horários seguem o fuso informado acima.</p>
</body></html>`;
}
