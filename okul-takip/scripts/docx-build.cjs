const fs = require('fs');
const C = require('./docx-content.cjs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, LevelFormat, BorderStyle, Footer, PageNumber, TableOfContents, PageBreak } = require('docx');
const out = process.argv[2] || require('path').join(__dirname, '../docs/Okul_Takip_Analiz_Sunumu');
const PRIMARY = '6D4AFF', DARK = '1F1640';
const W = 9026; // A4, 1" kenar
const border = { style: BorderStyle.SINGLE, size: 4, color: 'D9D3F5' };
const borders = { top: border, bottom: border, left: border, right: border };
const children = [];
let md = '';
for (const [type, a, b] of C) {
  if (type === 'title') {
    children.push(new Paragraph({ spacing: { before: 2400, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '📚', size: 96 })] }));
    children.push(new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [new TextRun(a)] }));
    md += `# ${a}\n\n`;
  } else if (type === 'subtitle') {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: a, size: 30, color: PRIMARY })] }));
    md += `**${a}**\n\n`;
  } else if (type === 'meta') {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: a, size: 22, color: '666666' })] }));
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('İçindekiler')] }));
    C.filter(([t]) => t === 'h1').forEach(([, h]) => children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: h, size: 24 })] })));
    children.push(new Paragraph({ children: [new PageBreak()] }));
    md += `_${a}_\n\n`;
  } else if (type === 'h1' || type === 'h2') {
    children.push(new Paragraph({ heading: type === 'h1' ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2, children: [new TextRun(a)] }));
    md += `${type === 'h1' ? '##' : '###'} ${a}\n\n`;
  } else if (type === 'p') {
    children.push(new Paragraph({ spacing: { after: 140 }, children: [new TextRun(a)] }));
    md += `${a}\n\n`;
  } else if (type === 'ul') {
    a.forEach((t) => children.push(new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 }, children: [new TextRun(t)] })));
    children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    md += a.map((t) => `- ${t}`).join('\n') + '\n\n';
  } else if (type === 'table') {
    const n = a.length;
    const widths = a[0] === 'İşlem' ? [5026, 2000, 2000] : n === 2 ? [2900, W - 2900] : n === 3 ? [2000, 4026, 3000] : Array(n).fill(Math.floor(W / n));
    const cell = (t, i, head, odd) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA }, borders,
      shading: { fill: head ? DARK : odd ? 'F6F4FD' : 'FFFFFF', type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: t, bold: head || i === 0, color: head ? 'FFFFFF' : '222222', size: 20 })] })],
    });
    children.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths,
      rows: [new TableRow({ tableHeader: true, children: a.map((t, i) => cell(t, i, true)) }), ...b.map((r, ri) => new TableRow({ children: r.map((t, i) => cell(t, i, false, ri % 2 === 1)) }))] }));
    children.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
    md += `| ${a.join(' | ')} |\n|${a.map(() => '---').join('|')}|\n` + b.map((r) => `| ${r.join(' | ')} |`).join('\n') + '\n\n';
  }
}
const doc = new Document({
  creator: 'Okul Takip', title: 'Okul Takip Sistemi — Analiz ve Teknik Sunum',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { font: 'Arial', size: 56, bold: true, color: DARK }, paragraph: { spacing: { before: 0, after: 120 }, keepNext: true } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 32, bold: true, color: PRIMARY }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D9D3F5', space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 26, bold: true, color: DARK }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Okul Takip Sistemi · Sayfa ', size: 18, color: '888888' }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '888888' })] })] }) },
    children,
  }],
});
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(out + '.docx', buf); fs.writeFileSync(require('path').join(require('path').dirname(out), 'ANALIZ.md'), md); console.log('ok'); });
