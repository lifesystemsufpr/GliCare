import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
export async function exportReport(html: string) {
  if (Platform.OS === "web") {
    const report = window.open("", "_blank");
    if (!report)
      throw new Error(
        "Permita abrir uma nova janela para exportar o relatório.",
      );
    report.document.write(html);
    report.document.close();
    report.focus();
    report.print();
    return;
  }
  if (!(await Sharing.isAvailableAsync()))
    throw new Error(
      "O compartilhamento de PDF não está disponível neste dispositivo.",
    );
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    UTI: ".pdf",
    dialogTitle: "Salvar ou compartilhar relatório GliCare",
  });
}
