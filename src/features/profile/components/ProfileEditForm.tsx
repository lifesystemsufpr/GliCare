import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { AppButton, AppInput } from '@/shared/components';
import { colors } from '@/shared/theme';
import { errorMessage } from '@/shared/api/errors';
import { formatBirthDateInput } from '@/features/auth/services/auth-contract';
import { DiabetesTypeSelector } from '@/features/auth/components/DiabetesTypeSelector';
import { profileToForm, type Profile, type ProfileForm } from '../services/profile-contract';
import { updateProfile } from '../services/profile-service';

export function ProfileEditForm({ initial, onSaved, onCancel }: {
  initial: Profile; onSaved: (profile: Profile) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(() => profileToForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  function change<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function save() {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError('');
    try { onSaved(await updateProfile(form, initial)); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { busy.current = false; setSaving(false); }
  }
  const toSelector = { TIPO_1: 'type1', TIPO_2: 'type2', OUTRO: 'other' } as const;
  const fromSelector = { type1: 'TIPO_1', type2: 'TIPO_2', other: 'OUTRO' } as const;
  return <View style={{ gap: 12 }}>
    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Editar perfil</Text>
    <View pointerEvents={saving ? 'none' : 'auto'}>
      <AppInput label="Data de nascimento" placeholder="dd/mm/aaaa" value={form.birthDate}
        onChangeText={(value) => change('birthDate', formatBirthDateInput(value))} keyboardType="numeric" maxLength={10} editable={!saving} />
      <AppInput label="Altura (metros)" placeholder="Ex.: 1,70" value={form.height}
        onChangeText={(value) => change('height', value)} keyboardType="decimal-pad" editable={!saving} />
      <AppInput label="Peso (kg)" placeholder="Ex.: 68,30" value={form.weight}
        onChangeText={(value) => change('weight', value)} keyboardType="decimal-pad" editable={!saving} />
      <DiabetesTypeSelector value={form.diabetesType ? toSelector[form.diabetesType] : null}
        onChange={(value) => change('diabetesType', fromSelector[value])} />
      <Text style={{ fontSize: 17, fontWeight: '600' }}>Contato de emergência</Text>
      <AppInput label="Nome do contato" value={form.emergencyName} onChangeText={(value) => change('emergencyName', value)} maxLength={100} editable={!saving} />
      <AppInput label="Relação" value={form.emergencyRelation} onChangeText={(value) => change('emergencyRelation', value)} maxLength={50} editable={!saving} />
      <AppInput label="Telefone" value={form.emergencyPhone} onChangeText={(value) => change('emergencyPhone', value)} keyboardType="phone-pad" maxLength={20} editable={!saving} />
    </View>
    {error ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : null}
    <AppButton title="Salvar alterações" loading={saving} onPress={save} />
    <AppButton title="Cancelar edição" variant="secondary" disabled={saving} onPress={onCancel} />
  </View>;
}
