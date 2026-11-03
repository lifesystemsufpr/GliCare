export type PdfPorts = {
  available(): Promise<boolean>;
  generate(html: string): Promise<string>;
  share(uri: string): Promise<void>;
  remove(uri: string): Promise<void>;
};
export async function exportPdf(html: string, ports: PdfPorts, signal?: AbortSignal): Promise<void> {
  const check = () => { if (signal?.aborted) throw new Error('Exportação cancelada.'); };
  check();
  if (!await ports.available()) throw new Error('Compartilhamento de arquivos indisponível neste dispositivo.');
  check();
  let uri: string | undefined;
  let failed = false;
  try {
    uri = await ports.generate(html);
    check();
    await ports.share(uri);
  } catch (error) { failed = true; throw error; }
  finally {
    if (uri) {
      try { await ports.remove(uri); }
      catch { if (!failed) throw new Error('Não foi possível remover o PDF temporário.'); }
    }
  }
}
