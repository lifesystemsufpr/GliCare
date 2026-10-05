import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

export type ApplicationSite =
  | 'abdomen'
  | 'arm'
  | 'thigh'
  | 'glute';

interface ApplicationSiteSelectorProps {
  value: ApplicationSite | null;
  onChange: (value: ApplicationSite) => void;
}

const sites: {
  label: string;
  value: ApplicationSite;
}[] = [
  { label: 'Abdômen', value: 'abdomen' },
  { label: 'Braço', value: 'arm' },
  { label: 'Coxa', value: 'thigh' },
  { label: 'Glúteo', value: 'glute' },
];

export function ApplicationSiteSelector({
  value,
  onChange,
}: ApplicationSiteSelectorProps) {
  return (
    <View style={styles.container}>
      {sites.map((site) => {
        const selected = value === site.value;

        return (
          <Pressable
            key={site.value}
            onPress={() => onChange(site.value)}
            style={[
              styles.option,
              selected && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selected && styles.selectedOptionText,
              ]}
            >
              {site.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  option: {
    width: '48%',
    height: 44,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',

    backgroundColor: '#FFFFFF',
  },

  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: '#EAF5FC',
  },

  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },

  selectedOptionText: {
    fontWeight: '600',
    color: colors.primary,
  },
});