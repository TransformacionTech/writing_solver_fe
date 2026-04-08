import { Injectable } from '@angular/core';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

@Injectable({ providedIn: 'root' })
export class DocxExportService {
  async exportPost(content: string, topic: string, score: number | null): Promise<{ blob: Blob; filename: string }> {
    const paragraphs = this.parseMarkdownToParagraphs(content);

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: topic, bold: true, size: 28, font: 'Calibri' })],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),
          ...(score !== null ? [new Paragraph({
            children: [new TextRun({ text: `Score: ${score}/10`, italics: true, size: 20, color: '6200EA', font: 'Calibri' })],
            spacing: { after: 300 },
          })] : []),
          ...paragraphs,
          new Paragraph({
            children: [new TextRun({ text: `Generado por Writing Solver — ${new Date().toLocaleDateString('es-CO')}`, size: 16, color: '999999', font: 'Calibri' })],
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const filename = topic.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').trim().replace(/\s+/g, '-').slice(0, 50);
    const fullName = `${filename}.docx`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fullName;
    a.click();
    URL.revokeObjectURL(url);

    return { blob, filename: fullName };
  }

  private parseMarkdownToParagraphs(markdown: string): Paragraph[] {
    const lines = markdown.split('\n');
    const paragraphs: Paragraph[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push(new Paragraph({ children: [], spacing: { after: 100 } }));
        continue;
      }

      // Headings
      const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = this.stripMarkdownInline(headingMatch[2]);
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text, bold: true, size: level === 1 ? 26 : level === 2 ? 24 : 22, font: 'Calibri' })],
          heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        }));
        continue;
      }

      // List items
      const listMatch = trimmed.match(/^[-*•]\s+(.+)/);
      if (listMatch) {
        paragraphs.push(new Paragraph({
          children: this.parseInlineFormatting(listMatch[1]),
          bullet: { level: 0 },
          spacing: { after: 60 },
        }));
        continue;
      }

      // Regular paragraph
      paragraphs.push(new Paragraph({
        children: this.parseInlineFormatting(trimmed),
        spacing: { after: 120 },
      }));
    }

    return paragraphs;
  }

  private parseInlineFormatting(text: string): TextRun[] {
    const runs: TextRun[] = [];
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|([^*]+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match[2]) {
        runs.push(new TextRun({ text: match[2], bold: true, size: 22, font: 'Calibri' }));
      } else if (match[4]) {
        runs.push(new TextRun({ text: match[4], italics: true, size: 22, font: 'Calibri' }));
      } else if (match[5]) {
        runs.push(new TextRun({ text: match[5], size: 22, font: 'Calibri' }));
      }
    }

    if (runs.length === 0) {
      runs.push(new TextRun({ text, size: 22, font: 'Calibri' }));
    }

    return runs;
  }

  private stripMarkdownInline(text: string): string {
    return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  }
}
