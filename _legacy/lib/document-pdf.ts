// Shared A4 PDF generation for every printable document (Quotation, Invoice,
// Receipt). Each document renders its printable area into a DOM node with a
// known id and calls these helpers instead of re-declaring the same
// html2pdf/html2canvas options object in four separate places.

const PDF_OPTIONS = {
    margin: [0, 0, 0, 0] as [number, number, number, number],
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        windowWidth: 1200, // capture at desktop width regardless of viewport
        scrollY: 0,
        scrollX: 0,
    },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
};

async function getHtml2Pdf() {
    // Wait for the web font to finish loading before the DOM is
    // screenshotted — otherwise mobile (slower/cold cache) captures the
    // fallback system font mid-swap, producing a flat/italic PDF.
    if (document.fonts?.ready) await document.fonts.ready;
    // @ts-ignore - dynamic import to avoid SSR 'self is not defined'
    return (await import('html2pdf.js')).default;
}

/** Downloads the element as a PDF. Falls back to window.print() on failure. */
export async function downloadDocumentPdf(elementId: string, filename: string) {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
        const html2pdf = await getHtml2Pdf();
        await html2pdf().set({ ...PDF_OPTIONS, filename }).from(element).save();
    } catch (error) {
        console.error('PDF Generation Error:', error);
        window.print();
    }
}

/** Renders the element to a PDF and returns it as a base64 string, for
 *  attaching to an outgoing email. Throws if the element/library is unavailable. */
export async function documentPdfToBase64(elementId: string, filename: string): Promise<string> {
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Document element #${elementId} not found`);
    const html2pdf = await getHtml2Pdf();
    const blob: Blob = await html2pdf().set({ ...PDF_OPTIONS, filename }).from(element).outputPdf('blob');
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}
