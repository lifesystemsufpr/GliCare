import { listGlucose } from '@/features/glucose/services/glucose-service';
import { listInsulin } from '@/features/insulin/services/insulin-service';
import type { DashboardSources } from './dashboard-model';

export async function loadDashboard(signal?: AbortSignal): Promise<DashboardSources> {
  const [glucose, insulin] = await Promise.all([listGlucose(signal), listInsulin(signal)]);
  return { glucose, insulin };
}
