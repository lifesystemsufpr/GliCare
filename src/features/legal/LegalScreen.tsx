import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton, ScreenContainer } from '@/shared/components';
import { makeStyles } from '@/shared/theme';
import { privacyPolicy, termsOfUse, type LegalDocument } from './legal-texts';

function DocumentScreen({ document }: { document: LegalDocument }) {
  const styles = useStyles();
  return <ScreenContainer scrollable>
    <View style={styles.content}>
      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.updated}>Atualizado em {document.updatedAt}</Text>
      {document.sections.map((section) => <View key={section.title} style={styles.section}>
        <Text style={styles.heading}>{section.title}</Text>
        {section.paragraphs.map((paragraph, index) => <Text key={index} style={styles.paragraph}>{paragraph}</Text>)}
      </View>)}
      <AppButton title="Voltar" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
    </View>
  </ScreenContainer>;
}

export function TermsScreen() { return <DocumentScreen document={termsOfUse} />; }
export function PrivacyScreen() { return <DocumentScreen document={privacyPolicy} />; }

const useStyles = makeStyles((c) => StyleSheet.create({
  content: { paddingTop: 24, gap: 16 },
  title: { color: c.defaultText, fontSize: 24, fontWeight: '700' },
  updated: { color: c.defaultText },
  section: { gap: 8 },
  heading: { color: c.defaultText, fontSize: 17, fontWeight: '700' },
  paragraph: { color: c.defaultText, lineHeight: 22 },
}));
