import { listGlucose } from '@/features/glucose/services/glucose-service';
import { listInsulin } from '@/features/insulin/services/insulin-service';
import { listReminders } from '@/features/reminders/services/reminder-service';
import type { HomeSources } from './home-model';

export async function loadHomeSources(signal?: AbortSignal): Promise<HomeSources> {
  const [glucose, insulin, reminders] = await Promise.all([
    listGlucose(signal), listInsulin(signal), listReminders(signal),
  ]);
  return { glucose, insulin, reminders };
}
