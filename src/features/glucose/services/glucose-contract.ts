export const momentToApi = {
  fasting: 'JEJUM', beforeBreakfast: 'ANTES_CAFE', afterBreakfast: 'APOS_CAFE',
  beforeLunch: 'ANTES_ALMOCO', afterLunch: 'APOS_ALMOCO',
  beforeDinner: 'ANTES_JANTAR', afterDinner: 'APOS_JANTAR',
} as const;
export type MeasurementMoment = keyof typeof momentToApi;
export type ApiMoment = typeof momentToApi[MeasurementMoment];
export const momentLabels: Record<ApiMoment, string> = {
  JEJUM: 'Jejum', ANTES_CAFE: 'Antes do café', APOS_CAFE: 'Após o café',
  ANTES_ALMOCO: 'Antes do almoço', APOS_ALMOCO: 'Após o almoço',
  ANTES_JANTAR: 'Antes do jantar', APOS_JANTAR: 'Após o jantar',
};
export type GlucoseRecord = {
  id: string; valor: number; momento: ApiMoment;
  status: 'BAIXA' | 'NORMAL' | 'ALTA'; dataHora: string; observacao: string | null;
};
export type GlucoseForm = {
  value: string; moment: MeasurementMoment; measuredAt: Date; notes: string;
};

export function glucoseToApi(form: GlucoseForm, now = Date.now()) {
  const normalized = form.value.trim().replace(',', '.');
  const value = Number(normalized);
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized) || !Number.isFinite(value) || value <= 0 || value > 999.99) {
    throw new Error('Informe uma glicemia maior que zero e até 999,99 mg/dL, com até duas casas decimais.');
  }
  if (!Number.isFinite(form.measuredAt.getTime()) || form.measuredAt.getTime() > now) {
    throw new Error('Informe uma data e hora válidas, que não estejam no futuro.');
  }
  const observacao = form.notes.trim();
  if (observacao.length > 255) throw new Error('As observações devem ter até 255 caracteres.');
  if (!Object.hasOwn(momentToApi, form.moment)) throw new Error('Selecione um momento de medição válido.');
  return { valor: value, momento: momentToApi[form.moment],
    dataHora: form.measuredAt.toISOString(), ...(observacao ? { observacao } : {}) };
}
