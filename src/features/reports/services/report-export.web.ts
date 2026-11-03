export async function exportReport(html: string, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new Error('Exportação cancelada.');
  const preview = window.open('', '_blank');
  if (!preview) throw new Error('Permita abrir a janela de impressão para salvar o relatório em PDF.');
  preview.opener = null;
  preview.document.open();
  preview.document.write(html);
  preview.document.close();
  preview.focus();
  preview.print();
}
