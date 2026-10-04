// html2pdf.js ships without types; only the chain the monthly report uses.
declare module 'html2pdf.js' {
  interface Html2PdfWorker {
    set(options: Record<string, unknown>): Html2PdfWorker
    from(element: HTMLElement): Html2PdfWorker
    save(): Promise<void>
  }
  const html2pdf: () => Html2PdfWorker
  export default html2pdf
}
