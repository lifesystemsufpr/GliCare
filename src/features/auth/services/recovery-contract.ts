export const RECOVERY_MESSAGE = 'Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha.';
export function recoveryEmail(email: string): string {
  const value = email.trim().toLowerCase();
  if (value.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('Informe um e-mail válido.');
  return value;
}
export function resetPasswordPayload(token: string, password: string, confirmation: string) {
  const value = token.trim();
  if (!value || value.length > 512) throw new Error('Informe o código recebido por e-mail.');
  if (password.length < 8 || password.length > 72 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('A nova senha deve ter de 8 a 72 caracteres, com letras e números.');
  }
  if (password !== confirmation) throw new Error('As senhas não coincidem.');
  return { token: value, novaSenha: password };
}
export function recoveryTokenFromLink(link: string | null): string {
  if (!link) return '';
  const fragment = link.indexOf('#');
  if (fragment === -1) return '';
  const values = new URLSearchParams(link.slice(fragment + 1)).getAll('token');
  return values.length === 1 && values[0].length <= 512 ? values[0] : '';
}
