import PDFDocument from 'pdfkit';
import { PDFStyling, PDFSection, TextStyle } from '../types';
import { PageLayout } from '../rendering/page-layout';

// Type alias for PDFDocument instance
type PDFDoc = InstanceType<typeof PDFDocument>;

export interface TechnicalTemplateConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  codeBackgroundColor: string;
  backgroundColor: string;
  fontFamily: string;
  codeFontFamily: string;
  fontSize: number;
  codeFontSize: number;
  lineHeight: number;
  pageSize: 'A4' | 'Letter' | 'Legal' | 'Tabloid';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export class TechnicalTemplate {
  private config: TechnicalTemplateConfig;
  private pageLayout: PageLayout;

  constructor(config?: Partial<TechnicalTemplateConfig>) {
    this.config = {
      primaryColor: config?.primaryColor || '#1E40AF',
      secondaryColor: config?.secondaryColor || '#3B82F6',
      accentColor: config?.accentColor || '#60A5FA',
      codeBackgroundColor: config?.codeBackgroundColor || '#1E293B',
      backgroundColor: config?.backgroundColor || '#FFFFFF',
      fontFamily: config?.fontFamily || 'Helvetica',
      codeFontFamily: config?.codeFontFamily || 'Courier',
      fontSize: config?.fontSize || 10,
      codeFontSize: config?.codeFontSize || 9,
      lineHeight: config?.lineHeight || 1.5,
      pageSize: config?.pageSize || 'Letter',
      orientation: config?.orientation || 'portrait',
      margins: config?.margins || {
        top: 72,
        bottom: 72,
        left: 72,
        right: 72,
      },
    };
    this.pageLayout = new PageLayout();

    console.log('[TechnicalTemplate] Initialized with config:', this.config);
  }

  getTemplateName(): string {
    return 'technical';
  }

  getConfig(): TechnicalTemplateConfig {
    return { ...this.config };
  }

  getHeaderConfig(): {
    height: number;
    showOnFirstPage: boolean;
    showOnLastPage: boolean;
    textStyle: TextStyle;
    includePageNumber: boolean;
  } {
    return {
      height: 40,
      showOnFirstPage: false,
      showOnLastPage: true,
      includePageNumber: true,
      textStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 8,
        color: '#64748B',
        textAlign: 'left',
      },
    };
  }

  getFooterConfig(): {
    height: number;
    showOnFirstPage: boolean;
    showOnLastPage: boolean;
    includePageNumber: boolean;
    pageNumberFormat: '1' | 'i' | 'I' | 'a' | 'A';
    textStyle: TextStyle;
  } {
    return {
      height: 40,
      showOnFirstPage: false,
      showOnLastPage: true,
      includePageNumber: true,
      pageNumberFormat: '1',
      textStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 8,
        color: '#64748B',
        textAlign: 'center',
      },
    };
  }

  getCoverPageStyle(): TextStyle {
    return {
      fontFamily: this.config.fontFamily,
      fontSize: 28,
      fontWeight: '700',
      color: this.config.primaryColor,
      textAlign: 'center',
      marginTop: 0,
      marginBottom: 16,
    };
  }

  getTitlePageStyle(): TextStyle {
    return {
      fontFamily: this.config.fontFamily,
      fontSize: 18,
      fontWeight: '600',
      color: this.config.secondaryColor,
      textAlign: 'center',
      marginTop: 24,
      marginBottom: 12,
    };
  }

  getBodyTextStyle(): TextStyle {
    return {
      fontFamily: this.config.fontFamily,
      fontSize: this.config.fontSize,
      color: '#334155',
      lineHeight: this.config.lineHeight,
      textAlign: 'left',
      marginBottom: 10,
    };
  }

  getCodeBlockStyle(): {
    fontFamily: string;
    fontSize: number;
    backgroundColor: string;
    textColor: string;
    padding: number;
    borderRadius: number;
    lineHeight: number;
  } {
    return {
      fontFamily: this.config.codeFontFamily,
      fontSize: this.config.codeFontSize,
      backgroundColor: this.config.codeBackgroundColor,
      textColor: '#E2E8F0',
      padding: 12,
      borderRadius: 4,
      lineHeight: 1.4,
    };
  }

  getHeadingStyles(): Record<string, TextStyle> {
    return {
      h1: {
        fontFamily: this.config.fontFamily,
        fontSize: 20,
        fontWeight: '700',
        color: this.config.primaryColor,
        marginTop: 20,
        marginBottom: 10,
      },
      h2: {
        fontFamily: this.config.fontFamily,
        fontSize: 16,
        fontWeight: '600',
        color: this.config.secondaryColor,
        marginTop: 16,
        marginBottom: 8,
      },
      h3: {
        fontFamily: this.config.fontFamily,
        fontSize: 13,
        fontWeight: '600',
        color: this.config.accentColor,
        marginTop: 14,
        marginBottom: 6,
      },
      h4: {
        fontFamily: this.config.fontFamily,
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
        marginTop: 12,
        marginBottom: 4,
      },
    };
  }

  getTOCStyle(): {
    title: string;
    titleStyle: TextStyle;
    entryStyle: TextStyle;
    pageNumberStyle: TextStyle;
    indentLevel1: number;
    indentLevel2: number;
    indentLevel3: number;
    indentLevel4: number;
    showPageNumbers: boolean;
  } {
    return {
      title: 'Contents',
      titleStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 16,
        fontWeight: '600',
        color: this.config.primaryColor,
        marginBottom: 12,
      },
      entryStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 10,
        color: '#334155',
      },
      pageNumberStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 10,
        color: '#64748B',
      },
      indentLevel1: 0,
      indentLevel2: 16,
      indentLevel3: 32,
      indentLevel4: 48,
      showPageNumbers: true,
    };
  }

  getColorScheme(): {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    codeBackground: string;
    text: string;
    headings: string;
    metadata: string;
    borders: string;
    links: string;
  } {
    return {
      primary: this.config.primaryColor,
      secondary: this.config.secondaryColor,
      accent: this.config.accentColor,
      background: this.config.backgroundColor,
      codeBackground: this.config.codeBackgroundColor,
      text: '#334155',
      headings: this.config.primaryColor,
      metadata: '#64748B',
      borders: '#E2E8F0',
      links: '#2563EB',
    };
  }

  applyToDocument(doc: PDFDoc, pageWidth: number, pageHeight: number): void {
    doc.fillColor(this.config.backgroundColor);
    doc.rect(0, 0, pageWidth, pageHeight).fill();
  }

  renderHeader(
    doc: PDFDoc,
    text: string,
    pageWidth: number,
    margins: { top: number; left: number; right: number }
  ): void {
    doc.font(this.config.fontFamily);
    doc.fontSize(8);
    doc.fillColor('#64748B');
    
    doc.text(text, margins.left, margins.top - 12, {
      align: 'left',
      width: pageWidth - margins.left - margins.right,
    });

    doc.strokeColor('#E2E8F0');
    doc.lineWidth(0.5);
    doc.moveTo(margins.left, margins.top - 5);
    doc.lineTo(pageWidth - margins.right, margins.top - 5);
    doc.stroke();
  }

  renderFooter(
    doc: PDFDoc,
    pageNumber: number,
    totalPages: number,
    pageWidth: number,
    pageHeight: number,
    margins: { bottom: number; left: number; right: number }
  ): void {
    doc.font(this.config.fontFamily);
    doc.fontSize(8);
    doc.fillColor('#64748B');

    const footerLineY = pageHeight - margins.bottom - 8;
    doc.strokeColor('#E2E8F0');
    doc.lineWidth(0.5);
    doc.moveTo(margins.left, footerLineY);
    doc.lineTo(pageWidth - margins.right, footerLineY);
    doc.stroke();

    const pageNumberText = `${pageNumber}`;
    const textWidth = doc.widthOfString(pageNumberText);
    
    doc.text(
      pageNumberText,
      pageWidth / 2 - textWidth / 2,
      footerLineY + 12,
      { align: 'left' }
    );
  }

  renderSectionTitle(
    doc: PDFDoc,
    title: string,
    level: number,
    currentY: number,
    contentWidth: number
  ): number {
    const headingStyles = this.getHeadingStyles();
    const styleKey = `h${level}` as keyof typeof headingStyles;
    const style = headingStyles[styleKey] || headingStyles.h1;

    doc.font(style.fontFamily || this.config.fontFamily);
    doc.fontSize(style.fontSize || 14);
    doc.fillColor(style.color || '#000000');

    doc.text(title, doc.x, currentY, {
      align: 'left',
      width: contentWidth,
    });

    const nextY = currentY + (style.fontSize || 14) * 1.4 + (style.marginBottom || 0);

    if (level <= 2) {
      doc.strokeColor(this.config.accentColor);
      doc.lineWidth(1);
      doc.moveTo(doc.x, nextY);
      doc.lineTo(doc.x + 60, nextY);
      doc.stroke();
    }

    return nextY + 8;
  }

  renderBodyText(
    doc: PDFDoc,
    text: string,
    currentY: number,
    contentWidth: number
  ): number {
    const style = this.getBodyTextStyle();

    doc.font(style.fontFamily || this.config.fontFamily);
    doc.fontSize(style.fontSize || 10);
    doc.fillColor(style.color || '#000000');

    const lines = this.pageLayout.calculateTextWrapping(
      text,
      style.fontSize || 10,
      contentWidth
    );

    let newY = currentY;
    for (const line of lines) {
      doc.text(line, doc.x, newY, {
        align: style.textAlign || 'left',
        width: contentWidth,
      });
      newY += (style.fontSize || 10) * (style.lineHeight || 1.5);
    }

    return newY + (style.marginBottom || 0);
  }

  renderCodeBlock(
    doc: PDFDoc,
    code: string,
    currentY: number,
    contentWidth: number,
    language: string = ''
  ): number {
    const codeStyle = this.getCodeBlockStyle();

    const padding = codeStyle.padding;
    const lineHeight = codeStyle.fontSize * codeStyle.lineHeight;
    const lines = code.split('\n');
    const codeHeight = lines.length * lineHeight + padding * 2;

    doc.fillColor(codeStyle.backgroundColor);
    doc.rect(doc.x, currentY, contentWidth, codeHeight).fill();

    doc.font(codeStyle.fontFamily);
    doc.fontSize(codeStyle.fontSize);
    doc.fillColor(codeStyle.textColor);

    let codeY = currentY + padding;
    for (const line of lines) {
      doc.text(line, doc.x + padding, codeY, {
        align: 'left',
        width: contentWidth - padding * 2,
      });
      codeY += lineHeight;
    }

    if (language) {
      doc.font(this.config.fontFamily);
      doc.fontSize(7);
      doc.fillColor('#64748B');
      doc.text(language.toUpperCase(), doc.x + padding, currentY + codeHeight + 4, {
        align: 'left',
      });
    }

    return currentY + codeHeight + 20;
  }

  renderNote(
    doc: PDFDoc,
    text: string,
    currentY: number,
    contentWidth: number,
    noteType: 'info' | 'warning' | 'tip' | 'important' = 'info'
  ): number {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
      warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
      tip: { bg: '#F0FDF4', border: '#22C55E', text: '#166534' },
      important: { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B' },
    };

    const colorsConfig = colors[noteType] || colors.info;
    const icon = noteType === 'warning' ? '⚠' : noteType === 'tip' ? '💡' : noteType === 'important' ? '❗' : 'ℹ';

    const padding = 10;
    const iconSize = 14;
    const textStyle = this.getBodyTextStyle();
    
    const lines = this.pageLayout.calculateTextWrapping(text, textStyle.fontSize || 10, contentWidth - padding * 3 - iconSize);
    const boxHeight = lines.length * 14 + padding * 2;

    doc.fillColor(colorsConfig.bg);
    doc.rect(doc.x, currentY, contentWidth, boxHeight).fill();

    doc.strokeColor(colorsConfig.border);
    doc.lineWidth(1);
    doc.rect(doc.x, currentY, contentWidth, boxHeight).stroke();

    doc.font(this.config.fontFamily);
    doc.fontSize(iconSize);
    doc.fillColor(colorsConfig.text);
    doc.text(icon, doc.x + padding, currentY + padding, {
      align: 'left',
    });

    doc.font(textStyle.fontFamily || this.config.fontFamily);
    doc.fontSize(textStyle.fontSize || 10);
    doc.fillColor(colorsConfig.text);

    let textY = currentY + padding;
    for (const line of lines) {
      doc.text(line, doc.x + padding + iconSize, textY, {
        align: 'left',
        width: contentWidth - padding * 2 - iconSize,
      });
      textY += 14;
    }

    return currentY + boxHeight + 12;
  }

  renderPageBreak(doc: PDFDoc): void {
    doc.addPage();
  }

  getStyling(): PDFStyling {
    return {
      primaryColor: this.config.primaryColor,
      secondaryColor: this.config.secondaryColor,
      accentColor: this.config.accentColor,
      backgroundColor: this.config.backgroundColor,
      fontFamily: this.config.fontFamily,
      fontSize: this.config.fontSize,
      lineHeight: this.config.lineHeight,
      tocStyle: this.getTOCStyle(),
      coverPageStyle: this.getCoverPageStyle(),
      titlePageStyle: this.getTitlePageStyle(),
      bodyTextStyle: this.getBodyTextStyle(),
      headingStyles: this.getHeadingStyles(),
    };
  }
}

export function createTechnicalTemplate(
  config?: Partial<TechnicalTemplateConfig>
): TechnicalTemplate {
  return new TechnicalTemplate(config);
}
