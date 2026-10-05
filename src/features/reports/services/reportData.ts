import {
  HealthRecord,
  recordDay,
  recordTime,
  recordTitle,
  recordUnit,
  displayDay,
} from "@/shared/data/demoRecords";
export type ReportFilters = {
  query: string;
  kind: "all" | HealthRecord["kind"];
  start: string;
  end: string;
};
export function parseDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  )
    return null;
  return `${year}-${month}-${day}`;
}
export function filterRecords(records: HealthRecord[], filters: ReportFilters) {
  const start = filters.start ? parseDate(filters.start) : null;
  const end = filters.end ? parseDate(filters.end) : null;
  return records
    .filter(
      (r) =>
        (filters.kind === "all" || r.kind === filters.kind) &&
        (!start || recordDay(r) >= start) &&
        (!end || recordDay(r) <= end) &&
        recordTitle(r)
          .toLocaleLowerCase("pt-BR")
          .includes(filters.query.trim().toLocaleLowerCase("pt-BR")),
    )
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}
function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ] ?? char,
  );
}
export function buildReportHtml(
  records: HealthRecord[],
  filters: ReportFilters,
) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>GliCare · Relatório demonstrativo</title><style>
  body{font-family:Arial,sans-serif;color:#111827;padding:24px}h1{color:#0072C6}p{font-size:12px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:10px;text-align:left;border-bottom:1px solid #ddd}thead{display:table-header-group}tr{break-inside:avoid}
  </style></head><body><h1>GliCare · Relatórios</h1><p>Dados demonstrativos. Não representam medições da sua conta.</p>
  <p>Período: ${escapeHtml(filters.start || "Sem início")} até ${escapeHtml(filters.end || "Sem fim")} · Tipo: ${escapeHtml(filters.kind === "all" ? "Todos" : filters.kind === "glucose" ? "Glicemia" : "Insulina")} · Busca: ${escapeHtml(filters.query || "Todas")} · ${records.length} registros</p>
  <table><thead><tr><th>Data</th><th>Hora</th><th>Registro</th><th>Valor</th></tr></thead><tbody>${records.map((r) => `<tr><td>${displayDay(recordDay(r))}</td><td>${recordTime(r)}</td><td>${escapeHtml(recordTitle(r))}</td><td>${r.value} ${recordUnit(r)}</td></tr>`).join("")}</tbody></table></body></html>`;
}
