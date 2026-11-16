import { api } from '@/shared/api';
import { loadDashboard } from '@/features/dashboard/services/dashboard-service';
import { periodDays, type Period } from '@/features/dashboard/services/dashboard-model';
import { buildReport, type ApiRecord, type Report } from './report-model';

// Histórico em GET /reports/records e resumo em GET /dashboard, no mesmo
// período e em paralelo.
export async function loadReport(period: Period, signal?: AbortSignal): Promise<Report> {
  periodDays(period);
  const [records, dashboard] = await Promise.all([
    api.get<ApiRecord[]>('/reports/records', { params: { startDate: period.start, endDate: period.end }, signal })
      .then((response) => response.data),
    loadDashboard(period, signal),
  ]);
  return buildReport(records, dashboard, period);
}
