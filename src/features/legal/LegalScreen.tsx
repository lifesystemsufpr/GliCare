import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton, ScreenContainer } from '@/shared/components';
import { makeStyles, useThemeColors } from '@/shared/theme';
import { privacyPolicy, termsOfUse, type LegalDocument } from './legal-texts';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function DocumentScreen({ document }: { document: LegalDocument }) {
  const styles = useStyles();
  const c = useThemeColors();
  return <ScreenContainer scrollable>
    <View style={styles.content}>
      <Pressable style={styles.back} onPress={goBack} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
        <Ionicons name="arrow-back" size={24} color={c.text} />
      </Pressable>
      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.updated}>Atualizado em {document.updatedAt}</Text>
      {document.sections.map((section) => <View key={section.title} style={styles.section}>
        <Text style={styles.heading}>{section.title}</Text>
        {section.paragraphs.map((paragraph, index) => <Text key={index} style={styles.paragraph}>{paragraph}</Text>)}
      </View>)}
      <AppButton title="Voltar" onPress={goBack} />
    </View>
  </ScreenContainer>;
}

export function TermsScreen() { return <DocumentScreen document={termsOfUse} />; }
export function PrivacyScreen() { return <DocumentScreen document={privacyPolicy} />; }

const useStyles = makeStyles((c) => StyleSheet.create({
  content: { paddingTop: 8, gap: 16 },
  back: { width: 40, height: 40, justifyContent: 'center' },
  title: { color: c.defaultText, fontSize: 24, fontWeight: '700' },
  updated: { color: c.defaultText },
  section: { gap: 8 },
  heading: { color: c.defaultText, fontSize: 17, fontWeight: '700' },
  paragraph: { color: c.defaultText, lineHeight: 22 },
}));
