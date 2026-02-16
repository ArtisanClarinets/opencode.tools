import PDFDocument from 'pdfkit';
import { PDFStyling, PDFSection, TextStyle } from '../types';
import { PageLayout } from '../rendering/page-layout';

// Type alias for PDFDocument instance
type PDFDoc = InstanceType<typeof PDFDocument>;

export interface WhitepaperTemplateConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  coverBackgroundColor: string;
  fontFamily: string;
  headingFontFamily: string;
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
  paddingBottom?: number;
}

export class WhitepaperTemplate {
  private config: WhitepaperTemplateConfig;
  private pageLayout: PageLayout;

  constructor(config?: Partial<WhitepaperTemplateConfig>) {
    this.config = {
      primaryColor: config?.primaryColor || '#1E3A5F',
      secondaryColor: config?.secondaryColor || '#2563EB',
      accentColor: config?.accentColor || '#60A5FA',
      backgroundColor: config?.backgroundColor || '#F8FAFC',
      coverBackgroundColor: config?.coverBackgroundColor || '#0F172A',
      fontFamily: config?.fontFamily || 'Helvetica',
      headingFontFamily: config?.headingFontFamily || 'Helvetica-Bold',
      fontSize: config?.fontSize || 11,
      lineHeight: config?.lineHeight || 1.6,
      pageSize: config?.pageSize || 'Letter',
      orientation: config?.orientation || 'portrait',
      margins: config?.margins || {
        top: 80,
        bottom: 80,
        left: 80,
        right: 80,
      },
    };
    this.pageLayout = new PageLayout();

    console.log('[WhitepaperTemplate] Initialized with config:', this.config);
  }

  getTemplateName(): string {
    return 'whitepaper';
  }

  getConfig(): WhitepaperTemplateConfig {
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
      height: 60,
      showOnFirstPage: false,
      showOnLastPage: true,
      includePageNumber: true,
      textStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 9,
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
      height: 60,
      showOnFirstPage: false,
      showOnLastPage: true,
      includePageNumber: true,
      pageNumberFormat: '1',
      textStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 9,
        color: '#64748B',
        textAlign: 'center',
      },
    };
  }

  getCoverPageStyle(): TextStyle {
    return {
      fontFamily: this.config.headingFontFamily,
      fontSize: 42,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      marginTop: 0,
      marginBottom: 32,
    };
  }

  getTitlePageStyle(): TextStyle {
    return {
      fontFamily: this.config.headingFontFamily,
      fontSize: 28,
      fontWeight: '600',
      color: this.config.primaryColor,
      textAlign: 'center',
      marginTop: 48,
      marginBottom: 24,
    };
  }

  getBodyTextStyle(): TextStyle {
    return {
      fontFamily: this.config.fontFamily,
      fontSize: this.config.fontSize,
      color: '#1E293B',
      lineHeight: this.config.lineHeight,
      textAlign: 'justify',
      marginBottom: 16,
    };
  }

  getHeadingStyles(): Record<string, TextStyle> {
    return {
      h1: {
        fontFamily: this.config.headingFontFamily,
        fontSize: 28,
        fontWeight: '700',
        color: this.config.primaryColor,
        marginTop: 32,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: this.config.accentColor,
        borderStyle: 'solid',
        paddingBottom: 8,
      },
      h2: {
        fontFamily: this.config.headingFontFamily,
        fontSize: 22,
        fontWeight: '600',
        color: this.config.secondaryColor,
        marginTop: 28,
        marginBottom: 14,
      },
      h3: {
        fontFamily: this.config.headingFontFamily,
        fontSize: 16,
        fontWeight: '600',
        color: this.config.accentColor,
        marginTop: 24,
        marginBottom: 10,
      },
      h4: {
        fontFamily: this.config.headingFontFamily,
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginTop: 20,
        marginBottom: 8,
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
        fontFamily: this.config.headingFontFamily,
        fontSize: 24,
        fontWeight: '600',
        color: this.config.primaryColor,
        marginBottom: 20,
      },
      entryStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 12,
        color: '#334155',
      },
      pageNumberStyle: {
        fontFamily: this.config.fontFamily,
        fontSize: 12,
        color: '#64748B',
      },
      indentLevel1: 0,
      indentLevel2: 24,
      indentLevel3: 48,
      indentLevel4: 72,
      showPageNumbers: true,
    };
  }

  getColorScheme(): {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    coverBackground: string;
    text: string;
    headings: string;
    metadata: string;
    borders: string;
  } {
    return {
      primary: this.config.primaryColor,
      secondary: this.config.secondaryColor,
      accent: this.config.accentColor,
      background: this.config.backgroundColor,
      coverBackground: this.config.coverBackgroundColor,
      text: '#1E293B',
      headings: this.config.primaryColor,
      metadata: '#64748B',
      borders: '#E2E8F0',
    };
  }

  applyToCoverPage(doc: PDFDoc, pageWidth: number, pageHeight: number): void {
    doc.rect(0, 0, pageWidth, pageHeight).fill(this.config.coverBackgroundColor);
    
    doc.fillColor('#FFFFFF');
    doc.opacity(0.1);
    doc.circle(pageWidth / 2, pageHeight / 2, Math.min(pageWidth, pageHeight) * 0.4);
    doc.fill();
    doc.opacity(1);
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
    doc.fontSize(9);
    doc.fillColor('#64748B');
    
    const separator = ' | ';
    const parts = text.split(separator);
    
    let xPosition = margins.left;
    
    for (let i = 0; i < parts.length; i++) {
      const partText = i < parts.length - 1 ? parts[i] : `Page ${doc.bufferedPageRange().count}`;
      const textWidth = doc.widthOfString(partText);
      
      doc.text(partText, xPosition, margins.top - 15, {
        align: 'left',
      });
      
      xPosition += textWidth + 30;
    }
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
    doc.fontSize(9);
    doc.fillColor('#64748B');
    
    const footerLineY = pageHeight - margins.bottom - 10;
    doc.strokeColor(this.config.accentColor);
    doc.lineWidth(1);
    doc.moveTo(margins.left, footerLineY);
    doc.lineTo(pageWidth - margins.right, footerLineY);
    doc.stroke();

    const pageNumberText = `${pageNumber}`;
    const textWidth = doc.widthOfString(pageNumberText);
    
    doc.text(
      pageNumberText,
      pageWidth / 2 - textWidth / 2,
      footerLineY + 15,
      { align: 'left' }
    );

    const disclaimer = '© Copyright. All rights reserved.';
    const disclaimerWidth = doc.widthOfString(disclaimer);
    doc.fontSize(8);
    doc.fillColor('#94A3B8');
    doc.text(disclaimer, margins.left, footerLineY + 15, {
      align: 'left',
    });
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

    doc.font(style.fontFamily || this.config.headingFontFamily);
    doc.fontSize(style.fontSize || 18);
    doc.fillColor(style.color || '#000000');

    if (style.borderWidth && style.borderColor) {
      doc.fontSize(style.fontSize || 18);
      const textHeight = (style.fontSize || 18) * 1.5;
      doc.text(title, doc.x, currentY, {
        align: 'left',
        width: contentWidth,
      });

      if (style.paddingBottom) {
        doc.strokeColor(style.borderColor);
        doc.lineWidth(style.borderWidth);
        doc.moveTo(doc.x, currentY + textHeight);
        doc.lineTo(doc.x + contentWidth, currentY + textHeight);
        doc.stroke();
      }

      return currentY + textHeight + (style.marginBottom || 0) + 10;
    }

    doc.text(title, doc.x, currentY, {
      align: 'left',
      width: contentWidth,
    });

    return currentY + (style.fontSize || 18) * 1.5 + (style.marginBottom || 0);
  }

  renderBodyText(
    doc: PDFDoc,
    text: string,
    currentY: number,
    contentWidth: number
  ): number {
    const style = this.getBodyTextStyle();

    doc.font(style.fontFamily || this.config.fontFamily);
    doc.fontSize(style.fontSize || 11);
    doc.fillColor(style.color || '#000000');

    const lines = this.pageLayout.calculateTextWrapping(
      text,
      style.fontSize || 11,
      contentWidth
    );

    let newY = currentY;
    for (const line of lines) {
      doc.text(line, doc.x, newY, {
        align: style.textAlign || 'justify',
        width: contentWidth,
      });
      newY += (style.fontSize || 11) * (style.lineHeight || 1.5);
    }

    return newY + (style.marginBottom || 0);
  }

  renderHighlightBox(
    doc: PDFDoc,
    text: string,
    currentY: number,
    contentWidth: number,
    color: string = '#EFF6FF'
  ): number {
    const textHeight = this.pageLayout.calculateVerticalSpace(11, 1.5, 0);
    const padding = 12;
    
    const boxHeight = textHeight + padding * 2;

    doc.fillColor(color);
    doc.rect(doc.x, currentY, contentWidth, boxHeight).fill();

    doc.font(this.config.fontFamily);
    doc.fontSize(11);
    doc.fillColor(this.config.primaryColor);

    const lines = this.pageLayout.calculateTextWrapping(text, 11, contentWidth - padding * 2);
    let textY = currentY + padding;

    for (const line of lines) {
      doc.text(line, doc.x + padding, textY, {
        align: 'justify',
        width: contentWidth - padding * 2,
      });
      textY += 16;
    }

    return currentY + boxHeight + 16;
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

export function createWhitepaperTemplate(
  config?: Partial<WhitepaperTemplateConfig>
): WhitepaperTemplate {
  return new WhitepaperTemplate(config);
}
