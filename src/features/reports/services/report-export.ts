import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { exportPdf } from './report-export-core';

export async function exportReport(html: string, signal?: AbortSignal): Promise<void> {
  await exportPdf(html, {
    available: () => Sharing.isAvailableAsync(),
    generate: async (content) => (await Print.printToFileAsync({ html: content, width: 595, height: 842 })).uri,
    share: (uri) => Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Compartilhar relatório GliCare' }),
    remove: async (uri) => {
      if (!FileSystem.cacheDirectory || !uri.startsWith(FileSystem.cacheDirectory)) {
        throw new Error('Arquivo de relatório fora do cache esperado.');
      }
      await FileSystem.deleteAsync(uri, { idempotent: true });
    },
  }, signal);
}
