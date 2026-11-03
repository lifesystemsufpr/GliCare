const listeners = new Set<() => void>();
export function subscribeReminderChanges(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function remindersChanged() { listeners.forEach((listener) => listener()); }
