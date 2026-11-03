import { api } from '@/shared/api';
import { recoveryEmail, resetPasswordPayload } from './recovery-contract';

export async function requestPasswordRecovery(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email: recoveryEmail(email) });
}
export async function confirmPasswordReset(token: string, password: string, confirmation: string): Promise<void> {
  await api.post('/auth/reset-password', resetPasswordPayload(token, password, confirmation));
}
