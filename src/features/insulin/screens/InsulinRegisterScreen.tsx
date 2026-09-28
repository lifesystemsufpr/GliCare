import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    Alert,
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

  function handleSave() {
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

    if (dateTime.getTime() > Date.now()) {
      Alert.alert(
        'Data inválida',
        'A data e a hora da aplicação não podem estar no futuro.',
      );
      return;
    }

    const insulinRecord = {
      type: insulinType,
      doseUi: Number(dose.replace(',', '.')),
      applicationSite,
      appliedAt: dateTime.toISOString(),
      notes: notes.trim(),
    };

    console.log(
      'Registro de insulina:',
      insulinRecord,
    );

    Alert.alert(
      'Aplicação registrada',
      'Sua aplicação de insulina foi registrada com sucesso.',
    );

    setInsulinType(null);
    setDose('');
    setApplicationSite(null);
    setDateTime(new Date());
    setNotes('');

    setTypeError('');
    setDoseError('');
    setSiteError('');
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

        <View style={styles.form}>
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
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                maxLength={6}
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
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              textAlignVertical="top"
              style={styles.notesInput}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed &&
                styles.saveButtonPressed,
            ]}
            onPress={handleSave}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.saveButtonText}>
              Registrar Aplicação
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  content: {
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
    backgroundColor: '#FFFFFF',

    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',

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
    borderColor: '#CBD5E1',
    borderRadius: 8,

    backgroundColor: '#FFFFFF',
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
    borderColor: '#DC2626',
  },

  errorText: {
    marginTop: 2,

    fontSize: 11,
    color: '#DC2626',
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
    borderColor: '#CBD5E1',
    borderRadius: 8,

    backgroundColor: '#FFFFFF',
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
    borderColor: '#CBD5E1',
    borderRadius: 8,

    backgroundColor: '#FFFFFF',

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
    color: '#FFFFFF',
  },
});