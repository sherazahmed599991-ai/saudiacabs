import { renderToBuffer } from "@react-pdf/renderer";
import { DocumentPDF, type DocumentPDFProps } from "./DocumentPDF";

export async function renderDocumentPDF(props: DocumentPDFProps): Promise<Buffer> {
  return renderToBuffer(<DocumentPDF {...props} />);
}
