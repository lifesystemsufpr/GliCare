import { api } from '@/shared/api';
import { periodDays, toDashboardSummary, type DashboardApiResponse, type DashboardSummary, type Period } from './dashboard-model';

// GET /dashboard com o período em dias civis (AAAA-MM-DD, inclusivos).
export async function loadDashboard(period: Period, signal?: AbortSignal): Promise<DashboardSummary> {
  periodDays(period);
  const { data } = await api.get<DashboardApiResponse>('/dashboard', {
    params: { startDate: period.start, endDate: period.end }, signal,
  });
  return toDashboardSummary(data);
}
