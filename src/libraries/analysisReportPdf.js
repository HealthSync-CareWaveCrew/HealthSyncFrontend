import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatLabel = (value) => {
  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const sanitizeFileName = (value) => {
  return String(value || 'analysis-report').replace(/[^a-z0-9-_]+/gi, '-');
};

const loadImageAsDataUrl = async (url) => {
  const response = await fetch(url, { mode: 'cors' });

  if (!response.ok) {
    throw new Error('Failed to fetch analysis image.');
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read analysis image.'));
    reader.readAsDataURL(blob);
  });
};

export const generateAnalysisReportPdf = async (analysis, options = {}) => {
  if (!analysis?._id) {
    throw new Error('Analysis details are missing.');
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const marginX = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - marginX * 2;
  const { isAdmin = false } = options;

  doc.setFontSize(18);
  doc.text('Analysis Report', marginX, 18);

  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, 25);

  autoTable(doc, {
    startY: 32,
    head: [['Field', 'Value']],
    body: [
      ['Analysis ID', formatValue(analysis._id)],
      ['Type', formatValue(analysis.type)],
      ['Disease', formatValue(analysis.diseaseType || analysis.disease?.name)],
      ['Created At', analysis.createdAt ? new Date(analysis.createdAt).toLocaleString() : '-'],
      ['Match Status', analysis.results?.match ? 'Match Found' : 'No Match'],
      ['Predicted Disease', formatValue(analysis.results?.disease)],
      ['Confidence', formatValue(analysis.results?.confidence)],
    ],
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [227, 106, 106] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: contentWidth - 50 },
    },
  });

  let currentY = (doc.lastAutoTable?.finalY || 32) + 8;

  if (analysis.results?.description) {
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text('Description', marginX, currentY);
    currentY += 6;

    const descriptionLines = doc.splitTextToSize(analysis.results.description, contentWidth);
    doc.setFontSize(10);
    doc.text(descriptionLines, marginX, currentY);
    currentY += descriptionLines.length * 5 + 4;
  }

  if (analysis.results?.reason) {
    doc.setFontSize(13);
    doc.text('Reason', marginX, currentY);
    currentY += 6;

    const reasonLines = doc.splitTextToSize(analysis.results.reason, contentWidth);
    doc.setFontSize(10);
    doc.text(reasonLines, marginX, currentY);
    currentY += reasonLines.length * 5 + 4;
  }

  if (analysis.type === 'clinical') {
    autoTable(doc, {
      startY: currentY,
      head: [['Clinical Field', 'Value']],
      body: Object.entries(analysis.formData || {}).map(([key, value]) => [
        formatLabel(key),
        formatValue(value),
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [227, 106, 106] },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: contentWidth - 70 },
      },
    });

    currentY = (doc.lastAutoTable?.finalY || currentY) + 6;
  }

  if (analysis.type === 'image') {
    doc.setFontSize(13);
    doc.text('Input Image', marginX, currentY);
    currentY += 6;

    if (analysis.inputImageUrl) {
      try {
        const imageDataUrl = await loadImageAsDataUrl(analysis.inputImageUrl);
        const imageProps = doc.getImageProperties(imageDataUrl);
        const imageWidth = 80;
        const imageHeight = (imageProps.height * imageWidth) / imageProps.width;
        doc.addImage(imageDataUrl, imageProps.fileType || 'JPEG', marginX, currentY, imageWidth, imageHeight);
        currentY += imageHeight + 6;
      } catch (error) {
        const imageNote = doc.splitTextToSize('Image preview could not be embedded in the PDF. Use the URL below to open it.', contentWidth);
        doc.setFontSize(10);
        doc.text(imageNote, marginX, currentY);
        currentY += imageNote.length * 5 + 4;
      }

      const urlLines = doc.splitTextToSize(`Image URL: ${analysis.inputImageUrl}`, contentWidth);
      doc.setFontSize(10);
      doc.text(urlLines, marginX, currentY);
      currentY += urlLines.length * 5 + 4;
    } else {
      doc.setFontSize(10);
      doc.text('Input image URL is not available.', marginX, currentY);
      currentY += 6;
    }
  }

  if (isAdmin && analysis.user) {
    autoTable(doc, {
      startY: currentY,
      head: [['User Field', 'Value']],
      body: [
        ['Name', formatValue(analysis.user.name)],
        ['Email', formatValue(analysis.user.email)],
        ['Role', formatValue(analysis.user.role)],
      ],
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [227, 106, 106] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: contentWidth - 50 },
      },
    });
  }

  const fileName = `${sanitizeFileName(analysis.type)}-${sanitizeFileName(
    analysis.diseaseType || analysis.results?.disease || analysis._id
  )}-report.pdf`;

  doc.save(fileName);
};