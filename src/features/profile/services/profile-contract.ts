import { birthDateToApi } from '../../auth/services/auth-contract';

export type DiabetesType = 'TIPO_1' | 'TIPO_2' | 'OUTRO';
export const diabetesLabels: Record<DiabetesType, string> = {
  TIPO_1: 'Tipo 1', TIPO_2: 'Tipo 2', OUTRO: 'Outro',
};
export type Profile = {
  nome: string; dataNascimento: string | null; idade: number | null;
  alturaCm: number | null; pesoKg: number | null; tipoDiabetes: DiabetesType | null;
  perfilCompleto?: boolean;
};
export type ProfileForm = {
  birthDate: string; height: string; weight: string; diabetesType: DiabetesType | '';
};
export type ProfilePatch = Partial<{
  dataNascimento: string; alturaCm: number; pesoKg: number; tipoDiabetes: DiabetesType;
}>;

export function profileToForm(profile: Profile): ProfileForm {
  const date = profile.dataNascimento?.split('-');
  return {
    birthDate: date?.length === 3 ? `${date[2]}/${date[1]}/${date[0]}` : '',
    height: profile.alturaCm == null ? '' : String(profile.alturaCm / 100).replace('.', ','),
    weight: profile.pesoKg == null ? '' : String(profile.pesoKg).replace('.', ','),
    diabetesType: profile.tipoDiabetes ?? '',
  };
}

function numberInput(value: string, decimals: number, label: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!new RegExp(`^\\d+(?:\\.\\d{1,${decimals}})?$`).test(normalized)) {
    throw new Error(`Informe ${label} válido.`);
  }
  return Number(normalized);
}

export function profileToPatch(form: ProfileForm, initial: Profile): ProfilePatch {
  const previous = profileToForm(initial);
  const patch: ProfilePatch = {};
  if (form.birthDate !== previous.birthDate) patch.dataNascimento = birthDateToApi(form.birthDate);
  if (form.height !== previous.height) {
    const alturaCm = Math.round(numberInput(form.height, 4, 'uma altura em metros') * 10000) / 100;
    if (alturaCm < 30 || alturaCm > 272) throw new Error('Informe altura entre 0,30 e 2,72 metros.');
    if (alturaCm !== initial.alturaCm) patch.alturaCm = alturaCm;
  }
  if (form.weight !== previous.weight) {
    const pesoKg = numberInput(form.weight, 2, 'um peso em quilos');
    if (pesoKg < 1 || pesoKg > 500) throw new Error('Informe peso entre 1 e 500 kg.');
    if (pesoKg !== initial.pesoKg) patch.pesoKg = pesoKg;
  }
  if (form.diabetesType !== previous.diabetesType) {
    if (!Object.hasOwn(diabetesLabels, form.diabetesType)) throw new Error('Selecione o tipo de diabetes.');
    patch.tipoDiabetes = form.diabetesType as DiabetesType;
  }
  if (!Object.keys(patch).length) throw new Error('Nenhuma alteração para salvar.');
  return patch;
}
