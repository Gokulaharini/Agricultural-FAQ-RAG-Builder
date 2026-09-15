import { jsPDF } from "jspdf";
import { AgriculturalDoc } from "../types";

/**
 * Downloads an AgriculturalDoc as a clean, professionally formatted PDF.
 * If the document was directly uploaded by the user as a .pdf File, it downloads
 * the original binary file. Otherwise (or for preloaded manuals), it generates
 * an authoritative, publication-styled PDF with page headers, footers, and margins.
 */
export function downloadManualAsPDF(doc: AgriculturalDoc): void {
  // If the user uploaded a native PDF file, preserve and download the exact original
  if (doc.rawFile && doc.rawFile.type === "application/pdf") {
    const url = URL.createObjectURL(doc.rawFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename.endsWith(".pdf") ? doc.filename : `${doc.filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  // Otherwise, construct a formatted PDF document using jsPDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  const totalPages = Math.max(1, doc.pages.length);

  doc.pages.forEach((pageData, index) => {
    if (index > 0) {
      pdf.addPage();
    }

    // Top Header Banner (Forest Green Accent)
    pdf.setFillColor(27, 67, 50); // #1b4332
    pdf.rect(margin, 12, contentWidth, 1.5, "F");

    // Header Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(45, 106, 79); // #2d6a4f
    pdf.text("AGRIKNOWLEDGE • AGRICULTURAL EXTENSION SERVICE", margin, 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`AGRICULTURAL KNOWLEDGE BASE`, pageWidth - margin, 18, { align: "right" });

    // Document Title & Page Info
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(20, 20, 20);
    pdf.text(doc.title || doc.filename.replace(/\.pdf$/i, ""), margin, 27);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Document: ${doc.filename}  |  Section Page ${pageData.pageNumber} of ${totalPages}`,
      margin,
      33
    );

    // Subtle divider rule
    pdf.setDrawColor(225, 225, 225);
    pdf.setLineWidth(0.3);
    pdf.line(margin, 36, pageWidth - margin, 36);

    // Page Body Text
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);

    const textLines = pdf.splitTextToSize(pageData.text, contentWidth);
    
    // Check if lines fit on page or need wrapping
    let currentY = 44;
    const lineHeight = 5.5;

    for (const line of textLines) {
      if (currentY > pageHeight - 25) {
        // Footer before overflow
        renderFooter(pdf, pageWidth, pageHeight, margin, index + 1, totalPages);
        pdf.addPage();
        currentY = 25;
      }
      pdf.text(line, margin, currentY);
      currentY += lineHeight;
    }

    // Footer
    renderFooter(pdf, pageWidth, pageHeight, margin, index + 1, totalPages);
  });

  const downloadFilename = doc.filename.endsWith(".pdf")
    ? doc.filename
    : `${doc.filename}.pdf`;

  pdf.save(downloadFilename);
}

function renderFooter(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  currentPage: number,
  totalPages: number
) {
  const footerY = pageHeight - 12;

  pdf.setDrawColor(230, 230, 230);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(130, 130, 130);
  pdf.text(
    "AgriKnowledge Agricultural FAQ Assistant — Verified Extension Manual",
    margin,
    footerY
  );

  pdf.text(
    `Page ${currentPage} of ${totalPages}`,
    pageWidth - margin,
    footerY,
    { align: "right" }
  );
}

/**
 * Generates a Blob URL of the manual PDF for inline viewing/previewing.
 */
export function generateManualPDFBlobUrl(doc: AgriculturalDoc): string {
  if (doc.rawFile && doc.rawFile.type === "application/pdf") {
    return URL.createObjectURL(doc.rawFile);
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const totalPages = Math.max(1, doc.pages.length);

  doc.pages.forEach((pageData, index) => {
    if (index > 0) pdf.addPage();

    pdf.setFillColor(27, 67, 50);
    pdf.rect(margin, 12, contentWidth, 1.5, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(45, 106, 79);
    pdf.text("AGRIKNOWLEDGE • AGRICULTURAL EXTENSION SERVICE", margin, 18);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(20, 20, 20);
    pdf.text(doc.title || doc.filename.replace(/\.pdf$/i, ""), margin, 27);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Document: ${doc.filename}  |  Page ${pageData.pageNumber} of ${totalPages}`,
      margin,
      33
    );

    pdf.setDrawColor(225, 225, 225);
    pdf.setLineWidth(0.3);
    pdf.line(margin, 36, pageWidth - margin, 36);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);

    const textLines = pdf.splitTextToSize(pageData.text, contentWidth);
    let currentY = 44;
    const lineHeight = 5.5;

    for (const line of textLines) {
      if (currentY > pageHeight - 25) {
        renderFooter(pdf, pageWidth, pageHeight, margin, index + 1, totalPages);
        pdf.addPage();
        currentY = 25;
      }
      pdf.text(line, margin, currentY);
      currentY += lineHeight;
    }

    renderFooter(pdf, pageWidth, pageHeight, margin, index + 1, totalPages);
  });

  const blob = pdf.output("blob");
  return URL.createObjectURL(blob);
}
