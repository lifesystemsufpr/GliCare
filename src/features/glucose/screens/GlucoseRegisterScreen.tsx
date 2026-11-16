import { contentWidth } from '@/shared/theme';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useRef, useState } from 'react';
import { createGlucose } from '../services/glucose-service';
import { errorMessage } from '@/shared/api/errors';
import { GlucoseHistory } from '../components/GlucoseHistory';
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

import {
  MeasurementMoment,
  MeasurementMomentSelector,
} from '../components/MeasurementMomentSelector';

export function GlucoseRegisterScreen() {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [revision, setRevision] = useState(0);
  const busy = useRef(false);
  const [glucoseValue, setGlucoseValue] = useState('');

  const [moment, setMoment] =
    useState<MeasurementMoment>('fasting');

  const [dateTime, setDateTime] = useState(new Date());

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  const [notes, setNotes] = useState('');

  const [glucoseError, setGlucoseError] =
    useState('');

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

  function handleGlucoseChange(value: string) {
    setGlucoseValue(value);

    if (glucoseError) {
      setGlucoseError('');
    }
  }

  async function handleSave() {
    if (busy.current) return;
    setGlucoseError('');
    setSaveError('');

    if (!glucoseValue.trim()) {
      setGlucoseError(
        'Informe o valor da glicemia.',
      );
      return;
    }

    busy.current = true;
    setSaving(true);
    try {
      await createGlucose({ value: glucoseValue, moment, measuredAt: dateTime, notes });
      setGlucoseValue('');
      setMoment('fasting');
      setDateTime(new Date());
      setNotes('');
      setRevision((value) => value + 1);
      Alert.alert('Registro salvo', 'Sua glicemia foi registrada com sucesso.');
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
        {/* Cabeçalho */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Registro de Glicemia
          </Text>

          <Text style={styles.subtitle}>
            Insira os dados da sua medição abaixo.
          </Text>
        </View>

        {/* Formulário */}

        <View style={styles.form} pointerEvents={saving ? 'none' : 'auto'}>
          {/* Valor */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Valor (mg/dL)
            </Text>

            <View
              style={[
                styles.glucoseInput,
                glucoseError
                  ? styles.inputError
                  : null,
              ]}
            >
              <TextInput
                value={glucoseValue}
                onChangeText={handleGlucoseChange}
                placeholder="Ex: 105"
                placeholderTextColor={colors.gray400}
                keyboardType="decimal-pad"
                maxLength={6}
                editable={!saving}
                style={styles.glucoseTextInput}
              />

              <Text style={styles.unit}>
                mg/dL
              </Text>
            </View>

            {glucoseError ? (
              <Text style={styles.errorText}>
                {glucoseError}
              </Text>
            ) : null}
          </View>

          {/* Momento da medição */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Momento da Medição
            </Text>

            <MeasurementMomentSelector
              value={moment}
              onChange={setMoment}
            />
          </View>

          {/* Data e hora */}

          <View style={styles.dateTimeRow}>
            {/* Data */}

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

            {/* Hora */}

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

          {/* Seletor de data */}

          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {/* Seletor de hora */}

          {showTimePicker && (
            <DateTimePicker
              value={dateTime}
              mode="time"
              display="default"
              is24Hour
              onChange={handleTimeChange}
            />
          )}

          {/* Observações */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Observações (Opcional)
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Sintomas, refeições atípicas..."
              placeholderTextColor={colors.gray400}
              multiline
              textAlignVertical="top"
              maxLength={255}
              editable={!saving}
              style={styles.notesInput}
            />
          </View>

          {/* Botão */}

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
              name="save-outline"
              size={19}
              color={colors.white}
            />}

            <Text style={styles.saveButtonText}>
              {saving ? 'Salvando...' : 'Salvar Registro'}
            </Text>
          </Pressable>
        </View>
        <GlucoseHistory revision={revision} />
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
    paddingBottom: 40,
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

  glucoseInput: {
    height: 68,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 14,

    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,

    backgroundColor: colors.white,
  },

  inputError: {
    borderColor: colors.error,
  },

  glucoseTextInput: {
    flex: 1,

    fontSize: 27,
    fontWeight: '600',

    color: colors.text,
  },

  unit: {
    fontSize: 12,
    color: colors.textSecondary,
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
