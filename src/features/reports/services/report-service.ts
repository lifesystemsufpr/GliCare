import { listGlucose } from '@/features/glucose/services/glucose-service';
import { listInsulin } from '@/features/insulin/services/insulin-service';
import { buildReport, type Report } from './report-model';
import { periodDays, type Period } from '@/features/dashboard/services/dashboard-model';

export async function loadReport(period: Period, signal?: AbortSignal): Promise<Report> {
  periodDays(period);
  const [glucose, insulin] = await Promise.all([listGlucose(signal), listInsulin(signal)]);
  return buildReport({ glucose, insulin }, period);
}
