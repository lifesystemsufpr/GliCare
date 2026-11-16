import { contentWidth } from '@/shared/theme';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useRef, useState } from 'react';
import { createInsulin } from '../services/insulin-service';
import { InsulinHistory } from '../components/InsulinHistory';
import { errorMessage } from '@/shared/api/errors';
import {
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type {
    ApplicationSite,
} from '../components/ApplicationSiteSelector';
import {
    ApplicationSiteSelector,
} from '../components/ApplicationSiteSelector';

import type {
    InsulinType,
} from '../components/InsulinTypeSelector';
import {
    InsulinTypeSelector,
} from '../components/InsulinTypeSelector';

export function InsulinRegisterScreen() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [revision, setRevision] = useState(0);
  const busy = useRef(false);

  const [insulinType, setInsulinType] =
    useState<InsulinType | null>(null);

  const [dose, setDose] = useState('');

  const [applicationSite, setApplicationSite] =
    useState<ApplicationSite | null>(null);

  const [dateTime, setDateTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [notes, setNotes] = useState('');

  const [typeError, setTypeError] = useState('');
  const [doseError, setDoseError] = useState('');
  const [siteError, setSiteError] = useState('');

  function handleDateChange(
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) {
    setShowDatePicker(false);

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    const updatedDate = new Date(dateTime);

    updatedDate.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    setDateTime(updatedDate);
  }

  function handleTimeChange(
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) {
    setShowTimePicker(false);

    if (event.type === 'dismissed' || !selectedTime) {
      return;
    }

    const updatedDate = new Date(dateTime);

    updatedDate.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0,
    );

    setDateTime(updatedDate);
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('pt-BR');
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function handleTypeChange(value: InsulinType) {
    setInsulinType(value);

    if (typeError) {
      setTypeError('');
    }
  }

  function handleDoseChange(value: string) {
    setDose(value);

    if (doseError) {
      setDoseError('');
    }
  }

  function handleSiteChange(value: ApplicationSite) {
    setApplicationSite(value);

    if (siteError) {
      setSiteError('');
    }
  }

  async function handleSave() {
    if (busy.current) return;
    setSaveError('');
    setTypeError('');
    setDoseError('');
    setSiteError('');

    let hasError = false;

    if (!insulinType) {
      setTypeError('Selecione o tipo de insulina.');
      hasError = true;
    }

    if (!dose.trim()) {
      setDoseError('Informe a dose aplicada.');
      hasError = true;
    } else {
      const doseValue = Number(dose.replace(',', '.'));

      if (
        Number.isNaN(doseValue) ||
        doseValue <= 0
      ) {
        setDoseError('Informe uma dose válida.');
        hasError = true;
      }
    }

    if (!applicationSite) {
      setSiteError(
        'Selecione o local da aplicação.',
      );
      hasError = true;
    }

    if (hasError) {
      return;
    }

    busy.current = true;
    setSaving(true);
    try {
      await createInsulin({ type: insulinType, dose, applicationSite, appliedAt: dateTime, notes });
      setInsulinType(null);
      setDose('');
      setApplicationSite(null);
      setDateTime(new Date());
      setNotes('');
      setRevision((value) => value + 1);
      Alert.alert('Aplicação registrada', 'Os dados da aplicação foram salvos com sucesso.');
    } catch (error) {
      setSaveError(errorMessage(error));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Registro de Insulina
          </Text>

          <Text style={styles.subtitle}>
            Preencha os detalhes da aplicação de insulina.
          </Text>
        </View>

        <View style={styles.form} pointerEvents={saving ? 'none' : 'auto'}>
          <View style={styles.field}>
            <Text style={styles.label}>
              Tipo de Insulina
            </Text>

            <InsulinTypeSelector
              value={insulinType}
              onChange={handleTypeChange}
            />

            {typeError ? (
              <Text style={styles.errorText}>
                {typeError}
              </Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Dose (UI)
            </Text>

            <View
              style={[
                styles.doseInput,
                doseError
                  ? styles.inputError
                  : null,
              ]}
            >
              <TextInput
                value={dose}
                onChangeText={handleDoseChange}
                placeholder="Ex: 10"
                placeholderTextColor={colors.gray400}
                keyboardType="decimal-pad"
                maxLength={7}
                editable={!saving}
                style={styles.doseTextInput}
              />

              <Text style={styles.unit}>
                UI
              </Text>
            </View>

            {doseError ? (
              <Text style={styles.errorText}>
                {doseError}
              </Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Local da Aplicação
            </Text>

            <ApplicationSiteSelector
              value={applicationSite}
              onChange={handleSiteChange}
            />

            {siteError ? (
              <Text style={styles.errorText}>
                {siteError}
              </Text>
            ) : null}
          </View>

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeField}>
              <Text style={styles.label}>
                Data
              </Text>

              <Pressable
                style={styles.standardInput}
                onPress={() =>
                  setShowDatePicker(true)
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />

                <Text style={styles.dateTimeText}>
                  {formatDate(dateTime)}
                </Text>
              </Pressable>
            </View>

            <View style={styles.dateTimeField}>
              <Text style={styles.label}>
                Hora
              </Text>

              <Pressable
                style={styles.standardInput}
                onPress={() =>
                  setShowTimePicker(true)
                }
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={colors.primary}
                />

                <Text style={styles.dateTimeText}>
                  {formatTime(dateTime)}
                </Text>
              </Pressable>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dateTime}
              mode="time"
              display="default"
              is24Hour
              onChange={handleTimeChange}
            />
          )}

          <View style={styles.field}>
            <Text style={styles.label}>
              Observações (Opcional)
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Informações adicionais sobre a aplicação..."
              placeholderTextColor={colors.gray400}
              multiline
              maxLength={255}
              editable={!saving}
              textAlignVertical="top"
              style={styles.notesInput}
            />
          </View>

          {saveError ? <Text accessibilityRole="alert" style={styles.errorText}>{saveError}</Text> : null}
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed &&
                styles.saveButtonPressed,
            ]}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityState={{ disabled: saving, busy: saving }}
          >
            {saving ? <ActivityIndicator color={colors.white} /> : <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.white}
            />}

            <Text style={styles.saveButtonText}>
              {saving ? 'Salvando...' : 'Registrar Aplicação'}
            </Text>
          </Pressable>
        </View>
        <InsulinHistory revision={revision} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen,
  },

  content: {
    ...contentWidth,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 140,
  },

  header: {
    marginBottom: 22,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: colors.textSecondary,
  },

  form: {
    padding: 18,
    backgroundColor: colors.white,

    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,

    gap: 20,

    elevation: 1,
  },

  field: {
    gap: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },

  doseInput: {
    height: 68,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 14,

    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,

    backgroundColor: colors.white,
  },

  doseTextInput: {
    flex: 1,

    fontSize: 27,
    fontWeight: '600',

    color: colors.text,

    paddingRight: 8,
  },

  unit: {
    width: 30,

    marginLeft: 8,

    fontSize: 14,
    fontWeight: '600',

    color: colors.textSecondary,

    textAlign: 'center',
  },

  inputError: {
    borderColor: colors.error,
  },

  errorText: {
    marginTop: 2,

    fontSize: 11,
    color: colors.error,
  },

  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },

  dateTimeField: {
    flex: 1,
    gap: 8,
  },

  standardInput: {
    height: 50,

    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,

    paddingHorizontal: 12,

    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,

    backgroundColor: colors.white,
  },

  dateTimeText: {
    flex: 1,

    fontSize: 13,
    color: colors.text,
  },

  notesInput: {
    minHeight: 100,

    padding: 14,

    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,

    backgroundColor: colors.white,

    fontSize: 13,
    color: colors.text,
  },

  saveButton: {
    height: 52,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    marginTop: 2,

    borderRadius: 26,

    backgroundColor: colors.primary,
  },

  saveButtonPressed: {
    opacity: 0.85,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
