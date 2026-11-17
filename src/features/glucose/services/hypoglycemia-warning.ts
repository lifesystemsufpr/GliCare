// Textos do aviso de glicemia abaixo de 54 mg/dL (hipoglicemia nível 2).
// Quem decide se a leitura está abaixo de 54 é a API (hipoglicemiaNivel2). Aqui
// só se escolhe o texto: a orientação imediata vale para uma medição recente;
// para um registro antigo, o aviso não trata o episódio como se fosse agora.

export const RECENT_READING_MINUTES = 60;

export const HYPO_URGENT_TITLE = 'Atenção: glicemia muito baixa';
export const HYPO_URGENT_TEXT =
  'Glicemia abaixo de 54 mg/dL. Isso é uma hipoglicemia que precisa de atenção agora. '
  + 'Siga o plano para hipoglicemia combinado com sua equipe de saúde e meça de novo. '
  + 'Se houver confusão, desmaio ou convulsão, ligue 192 (SAMU).';
export const HYPO_PAST_TEXT =
  'Este registro ficou abaixo de 54 mg/dL (hipoglicemia). Converse com sua equipe de saúde sobre esse episódio.';

export const HOME_HYPO_RECENT = 'Abaixo de 54 mg/dL: siga o plano para hipoglicemia e meça de novo.';
export const HOME_HYPO_PAST = 'Abaixo de 54 mg/dL (hipoglicemia).';

export function isRecentReading(measuredAt: string | Date, now = Date.now()): boolean {
  const time = new Date(measuredAt).getTime();
  if (!Number.isFinite(time)) return false;
  const age = now - time;
  return age >= -5 * 60_000 && age <= RECENT_READING_MINUTES * 60_000;
}
