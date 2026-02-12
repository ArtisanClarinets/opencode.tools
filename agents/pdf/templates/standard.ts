import PDFDocument from 'pdfkit';
import { PDFStyling, PDFSection, TextStyle } from '../types';
import { PageLayout } from '../rendering/page-layout';

// Type alias for PDFDocument instance
type PDFDoc = InstanceType<typeof PDFDocument>;

export interface StandardTemplateConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: number;
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

export class StandardTemplate {
  private config: StandardTemplateConfig;
  private pageLayout: PageLayout;

  constructor(config?: Partial<StandardTemplateConfig>) {
    this.config = {
      primaryColor: config?.primaryColor || '#2563EB',
      secondaryColor: config?.secondaryColor || '#1E40AF',
      accentColor: config?.accentColor || '#3B82F6',
      backgroundColor: config?.backgroundColor || '#FFFFFF',
      fontFamily: config?.fontFamily || 'Helvetica',
      fontSize: config?.fontSize || 12,
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

    console.log('[StandardTemplate] Initialized with config:', this.config);
  }

  getTemplateName(): string {
    return 'standard';
  }

  getConfig(): StandardTemplateConfig {
    return { ...this.config };
  }

  getHeaderConfig(): {
    height: number;
    showOnFirstPage: boolean;
    showOnLastPage: boolean;
    textStyle: TextStyle;
  } {
    return {
      height: 50,
      showOnFirstPage: false,
      showOnLastPage: true,
      textStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 10,
        color: '#6B7280',
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
      height: 50,
      showOnFirstPage: false,
      showOnLastPage: true,
      includePageNumber: true,
      pageNumberFormat: '1',
      textStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'center',
      },
    };
  }

  getCoverPageStyle(): TextStyle {
    return {
      fontFamily: this.config.fontFamily,
      fontSize: 36,
      fontWeight: '700',
      color: this.config.primaryColor,
      textAlign: 'center',
      marginTop: 0,
      marginBottom: 24,
    };
  }

  getTitlePageStyle(): TextStyle {
    return {
      fontFamily: this.config.fontFamily,
      fontSize: 24,
      fontWeight: '600',
      color: this.config.secondaryColor,
      textAlign: 'center',
      marginTop: 36,
      marginBottom: 18,
    };
  }

  getBodyTextStyle(): TextStyle {
    return {
      fontFamily: this.config.fontFamily,
      fontSize: this.config.fontSize,
      color: '#374151',
      lineHeight: this.config.lineHeight,
      textAlign: 'justify',
      marginBottom: 12,
    };
  }

  getHeadingStyles(): Record<string, TextStyle> {
    return {
      h1: {
        fontFamily: this.config.fontFamily,
        fontSize: 24,
        fontWeight: '700',
        color: this.config.primaryColor,
        marginTop: 24,
        marginBottom: 12,
      },
      h2: {
        fontFamily: this.config.fontFamily,
        fontSize: 18,
        fontWeight: '600',
        color: this.config.secondaryColor,
        marginTop: 20,
        marginBottom: 10,
      },
      h3: {
        fontFamily: this.config.fontFamily,
        fontSize: 14,
        fontWeight: '600',
        color: this.config.accentColor,
        marginTop: 16,
        marginBottom: 8,
      },
      h4: {
        fontFamily: this.config.fontFamily,
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        marginTop: 14,
        marginBottom: 6,
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
      title: 'Table of Contents',
      titleStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 20,
        fontWeight: '600',
        color: this.config.primaryColor,
        marginBottom: 16,
      },
      entryStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 12,
        color: '#374151',
      },
      pageNumberStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 12,
        color: '#6B7280',
      },
      indentLevel1: 0,
      indentLevel2: 20,
      indentLevel3: 40,
      indentLevel4: 60,
      showPageNumbers: true,
    };
  }

  getColorScheme(): {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    headings: string;
    metadata: string;
  } {
    return {
      primary: this.config.primaryColor,
      secondary: this.config.secondaryColor,
      accent: this.config.accentColor,
      background: this.config.backgroundColor,
      text: '#374151',
      headings: this.config.primaryColor,
      metadata: '#6B7280',
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
    doc.fontSize(10);
    doc.fillColor('#6B7280');
    
    doc.text(text, margins.left, margins.top - 15, {
      align: 'center',
      width: pageWidth - margins.left - margins.right,
    });
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
    doc.fontSize(10);
    doc.fillColor('#6B7280');
    
    const pageNumberText = `Page ${pageNumber} of ${totalPages}`;
    const textWidth = doc.widthOfString(pageNumberText);
    
    doc.text(
      pageNumberText,
      pageWidth / 2 - textWidth / 2,
      pageHeight - margins.bottom + 20,
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
    doc.fontSize(style.fontSize || 12);
    doc.fillColor(style.color || '#000000');

    doc.text(title, doc.x, currentY, {
      align: 'left',
      width: contentWidth,
    });

    return currentY + (style.fontSize || 12) * 1.5 + (style.marginBottom || 0);
  }

  renderBodyText(
    doc: PDFDoc,
    text: string,
    currentY: number,
    contentWidth: number
  ): number {
    const style = this.getBodyTextStyle();

    doc.font(style.fontFamily || this.config.fontFamily);
    doc.fontSize(style.fontSize || 12);
    doc.fillColor(style.color || '#000000');

    const lines = this.pageLayout.calculateTextWrapping(
      text,
      style.fontSize || 12,
      contentWidth
    );

    let newY = currentY;
    for (const line of lines) {
      doc.text(line, doc.x, newY, {
        align: style.textAlign || 'justify',
        width: contentWidth,
      });
      newY += (style.fontSize || 12) * (style.lineHeight || 1.5);
    }

    return newY + (style.marginBottom || 0);
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

export function createStandardTemplate(
  config?: Partial<StandardTemplateConfig>
): StandardTemplate {
  return new StandardTemplate(config);
}
