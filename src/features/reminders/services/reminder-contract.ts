export type Reminder = { id: string; titulo: string; dataHora: string; status: 'ATIVO' | 'INATIVO' };
export type ReminderForm = { title: string; date: string; time: string };

export function formatTimeInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}
export function localDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).padStart(4, '0')}`;
}
export function reminderToForm(reminder: Reminder): ReminderForm {
  const date = new Date(reminder.dataHora);
  return { title: reminder.titulo, date: localDate(date),
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` };
}
export function reminderDateTime(date: string, time: string): string {
  const dayMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date.trim());
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!dayMatch || !timeMatch) throw new Error('Informe data válida (dd/mm/aaaa) e horário válido (HH:mm).');
  const [, day, month, year] = dayMatch;
  const [, hour, minute] = timeMatch;
  const result = new Date(0);
  result.setFullYear(Number(year), Number(month) - 1, Number(day));
  result.setHours(Number(hour), Number(minute), 0, 0);
  if (result.getFullYear() !== Number(year) || result.getMonth() !== Number(month) - 1 ||
      result.getDate() !== Number(day) || result.getHours() !== Number(hour) || result.getMinutes() !== Number(minute)) {
    throw new Error('Informe uma data e hora existentes no seu fuso horário.');
  }
  return result.toISOString();
}
export function reminderToApi(form: ReminderForm) {
  const titulo = form.title.trim();
  if (!titulo || titulo.length > 150) throw new Error('Informe um título de 1 a 150 caracteres.');
  return { titulo, dataHora: reminderDateTime(form.date, form.time) };
}
export function reminderToPatch(form: ReminderForm, initial: Reminder) {
  const payload = reminderToApi(form);
  const previous = reminderToForm(initial);
  const patch: Partial<typeof payload> = {};
  if (payload.titulo !== initial.titulo) patch.titulo = payload.titulo;
  // Preserva segundos e o instante original quando só o título foi alterado.
  if (form.date.trim() !== previous.date || form.time.trim() !== previous.time) patch.dataHora = payload.dataHora;
  if (!Object.keys(patch).length) throw new Error('Nenhuma alteração para salvar.');
  return patch;
}
