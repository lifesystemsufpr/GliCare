import axios from 'axios';
import { remindersChanged } from './reminder-events';
import { api } from '@/shared/api';
import { reminderToApi, reminderToPatch, type Reminder, type ReminderForm } from './reminder-contract';

function confirmed(data: Reminder): Reminder {
  if (!data?.id || typeof data.titulo !== 'string' || !Number.isFinite(new Date(data.dataHora).getTime()) ||
      !['ATIVO', 'INATIVO'].includes(data.status)) throw new Error('A API não confirmou o lembrete. Atualize a lista antes de tentar novamente.');
  return data;
}
async function mutation<T>(action: () => Promise<T>): Promise<T> {
  try {
    const result = await action();
    remindersChanged();
    return result;
  }
  catch (error) {
    if (axios.isAxiosError(error) && !error.response) throw new Error('Não foi possível confirmar a operação. Atualize a lista antes de reenviar.');
    throw error;
  }
}
export async function listReminders(signal?: AbortSignal): Promise<Reminder[]> {
  const { data } = await api.get<Reminder[]>('/reminders', { signal });
  if (!Array.isArray(data)) throw new Error('A API retornou uma lista de lembretes inválida.');
  return data.map(confirmed);
}
export async function createReminder(form: ReminderForm): Promise<Reminder> {
  const payload = reminderToApi(form);
  return mutation(async () => confirmed((await api.post<Reminder>('/reminders', payload)).data));
}
export async function updateReminder(initial: Reminder, form: ReminderForm): Promise<Reminder> {
  const payload = reminderToPatch(form, initial);
  return mutation(async () => confirmed((await api.patch<Reminder>(`/reminders/${encodeURIComponent(initial.id)}`, payload)).data));
}
export async function setReminderActive(id: string, active: boolean): Promise<Reminder> {
  return mutation(async () => confirmed((await api.patch<Reminder>(`/reminders/${encodeURIComponent(id)}/status`,
    { status: active ? 'ATIVO' : 'INATIVO' })).data));
}
export async function deleteReminder(id: string): Promise<void> {
  await mutation(async () => { await api.delete(`/reminders/${encodeURIComponent(id)}`); });
}
