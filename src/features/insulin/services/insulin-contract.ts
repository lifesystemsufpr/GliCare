export const insulinTypeLabels = {
  ULTRARRAPIDA: 'Ultrarrápida (lispro, asparte, glulisina, Fiasp)',
  RAPIDA: 'Rápida (regular)',
  INTERMEDIARIA: 'Intermediária (NPH, detemir)',
  LONGA: 'Longa (glargina U100)',
  ULTRALONGA: 'Ultralonga (degludeca, glargina U300)',
  PRE_MISTURADA: 'Pré-misturada (70/30, Mix)',
} as const;
export type InsulinType = keyof typeof insulinTypeLabels;
export function insulinTypeLabel(tipo: string): string {
  return Object.hasOwn(insulinTypeLabels, tipo) ? insulinTypeLabels[tipo as InsulinType] : tipo;
}
export const siteToApi = {
  abdomen: 'ABDOMEN', arm: 'BRACO', thigh: 'COXA', glute: 'GLUTEO',
} as const;
export type ApplicationSite = keyof typeof siteToApi;
export type ApiSite = typeof siteToApi[ApplicationSite];
export const siteLabels: Record<ApiSite, string> = {
  ABDOMEN: 'Abdômen', BRACO: 'Braço', COXA: 'Coxa', GLUTEO: 'Glúteo',
};
export type InsulinRecord = {
  id: string; tipo: string; doseUi: number; localAplicacao: ApiSite | null;
  dataHora: string; observacao: string | null;
};
export type InsulinForm = {
  type: InsulinType | null; dose: string; applicationSite: ApplicationSite | null;
  appliedAt: Date; notes: string;
};

export function insulinToApi(form: InsulinForm, now = Date.now()) {
  if (!form.type || !Object.hasOwn(insulinTypeLabels, form.type)) {
    throw new Error('Selecione o tipo de insulina.');
  }
  if (!form.applicationSite || !Object.hasOwn(siteToApi, form.applicationSite)) {
    throw new Error('Selecione o local da aplicação.');
  }
  const normalized = form.dose.trim().replace(',', '.');
  const doseUi = Number(normalized);
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized) || !Number.isFinite(doseUi) || doseUi <= 0 || doseUi > 9999.99) {
    throw new Error('Informe uma dose maior que zero e até 9999,99 UI, com até duas casas decimais.');
  }
  if (!Number.isFinite(form.appliedAt.getTime()) || form.appliedAt.getTime() > now) {
    throw new Error('Informe uma data e hora válidas, que não estejam no futuro.');
  }
  const observacao = form.notes.trim();
  if (observacao.length > 255) throw new Error('As observações devem ter até 255 caracteres.');
  return { tipo: form.type, doseUi,
    localAplicacao: siteToApi[form.applicationSite], dataHora: form.appliedAt.toISOString(),
    ...(observacao ? { observacao } : {}) };
}
