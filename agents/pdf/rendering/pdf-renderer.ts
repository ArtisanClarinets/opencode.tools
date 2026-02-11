import PDFDocument, { PDFDocumentOptions, PDFPage, RGBColor, PDFName, PDFDict, PDFArray, PDFString } from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { logger } from '../../src/runtime/logger';
import {
  PDFInput,
  PDFStyling,
  TOCEntry,
  BookmarkEntry,
  ChartConfig,
  DiagramConfig,
  TextStyle,
  PageLayout as PageLayoutType,
  PDFSection,
} from '../types';
import { FontManager } from './font-manager';
import { PageLayout } from './page-layout';

const VERSION = '1.0.0';

interface RenderedChart {
  config: ChartConfig;
  buffer: Buffer;
}

interface RenderedDiagram {
  config: DiagramConfig;
  buffer: Buffer;
}

interface LayoutPlan {
  pageCount: number;
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  contentHeight: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  tocStartPage: number;
  sectionStartPage: number;
  pageNumbers: {
    startPage: number;
    format: '1' | 'i' | 'I' | 'a' | 'A';
    position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center';
  };
}

export class PDFRenderer {
  private fontManager: FontManager;
  private pageLayout: PageLayout;
  private renderedCharts: Map<string, RenderedChart>;
  private renderedDiagrams: Map<string, RenderedDiagram>;
  private currentPageNumber: number;
  private tocEntries: TOCEntry[];
  private bookmarks: BookmarkEntry[];
  private sectionBookmarks: Map<string, BookmarkEntry>;
  private currentSectionId: string | null;
  private currentLevel: number;

  constructor() {
    this.fontManager = new FontManager();
    this.pageLayout = new PageLayout();
    this.renderedCharts = new Map();
    this.renderedDiagrams = new Map();
    this.currentPageNumber = 0;
    this.tocEntries = [];
    this.bookmarks = [];
    this.sectionBookmarks = new Map();
    this.currentSectionId = null;
    this.currentLevel = 0;

    logger.info('PDFRenderer initialized', { version: VERSION });
  }

  async createDocument(input: PDFInput, layoutPlan: LayoutPlan): Promise<PDFDocument> {
    logger.info('Creating PDF document', {
      title: input.title,
      sections: input.sections.length,
      layoutPlan,
    });

    const pdfOptions = this.buildPDFOptions(input, layoutPlan);
    const doc = new PDFDocument(pdfOptions);

    await this.registerFonts(doc, input.styling?.fontFamily);

    this.currentPageNumber = 0;
    this.tocEntries = [];
    this.bookmarks = [];
    this.sectionBookmarks = new Map();
    this.currentSectionId = null;
    this.currentLevel = 0;

    await this.renderCoverPage(doc, input, layoutPlan);

    if (input.output?.generateTOC !== false) {
      await this.renderTOC(doc, input.sections, input.styling, layoutPlan);
    }

    for (const section of input.sections) {
      await this.renderSection(doc, section, input.styling, layoutPlan);
    }

    this.addPageNumbers(doc, input.styling, layoutPlan);

    if (input.output?.generateBookmarks !== false) {
      this.addBookmarks(doc);
    }

    return doc;
  }

  private buildPDFOptions(input: PDFInput, layoutPlan: LayoutPlan): PDFDocumentOptions {
    const pageSize = this.pageLayout.getPageSize(layoutPlan.pageWidth, layoutPlan.pageHeight);
    
    return {
      size: pageSize,
      layout: layoutPlan.pageWidth > layoutPlan.pageHeight ? 'landscape' : 'portrait',
      margins: {
        top: layoutPlan.margins.top,
        bottom: layoutPlan.margins.bottom,
        left: layoutPlan.margins.left,
        right: layoutPlan.margins.right,
      },
      compress: input.output?.compress !== false,
      info: {
        Title: input.title,
        Author: input.authors.join(', '),
        Subject: input.subtitle || '',
        Creator: 'OpenCode Tools PDF Generator',
        Producer: `PDF Generator Agent v${VERSION}`,
        CreationDate: new Date(),
        ModDate: new Date(),
      },
      fontLayoutCache: true,
      useObjectStreams: true,
      addPageNumbers: false,
      autoFirstPage: false,
    };
  }

  private async registerFonts(doc: PDFDocument, fontFamily?: string): Promise<void> {
    logger.debug('Registering fonts', { fontFamily });

    await this.fontManager.registerDefaultFonts(doc);

    if (fontFamily) {
      await this.fontManager.registerCustomFont(doc, fontFamily);
    }
  }

  private async renderCoverPage(
    doc: PDFDocument,
    input: PDFInput,
    layoutPlan: LayoutPlan
  ): Promise<void> {
    logger.debug('Rendering cover page');

    const page = doc.addPage({
      size: [layoutPlan.pageWidth, layoutPlan.pageHeight],
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    });

    this.currentPageNumber = 1;

    const centerX = layoutPlan.pageWidth / 2;
    const startY = layoutPlan.pageHeight * 0.35;
    const lineHeight = 24;

    const primaryColor = this.hexToRgb(input.styling?.primaryColor || '#2563EB');
    const textColor = this.hexToRgb(input.styling?.primaryColor || '#1F2937');

    if (input.styling?.coverPageStyle?.backgroundColor) {
      const bgColor = this.hexToRgb(input.styling.coverPageStyle.backgroundColor);
      page.drawRectangle({
        x: 0,
        y: 0,
        width: layoutPlan.pageWidth,
        height: layoutPlan.pageHeight,
        color: bgColor,
      });
    }

    doc.font('Helvetica-Bold');
    doc.fontSize(36);
    doc.fillColor(textColor || RGBColor(0, 0, 0));
    
    const titleLines = this.wrapText(input.title, layoutPlan.contentWidth - 100, 36, 'Helvetica-Bold');
    let currentY = startY;
    
    for (const line of titleLines) {
      const textWidth = doc.widthOfStringAtSize(line, 36);
      doc.text(line, centerX - textWidth / 2, currentY, { align: 'left' });
      currentY += lineHeight * 1.5;
    }

    if (input.subtitle) {
      currentY += 20;
      doc.font('Helvetica');
      doc.fontSize(18);
      doc.fillColor(RGBColor(0.3, 0.3, 0.3));
      
      const subtitleLines = this.wrapText(input.subtitle, layoutPlan.contentWidth - 100, 18, 'Helvetica');
      for (const line of subtitleLines) {
        const textWidth = doc.widthOfStringAtSize(line, 18);
        doc.text(line, centerX - textWidth / 2, currentY, { align: 'left' });
        currentY += lineHeight;
      }
    }

    currentY = layoutPlan.pageHeight * 0.75;

    if (input.authors && input.authors.length > 0) {
      doc.font('Helvetica');
      doc.fontSize(14);
      doc.fillColor(textColor || RGBColor(0, 0, 0));
      
      const authorText = input.authors.join(', ');
      const authorWidth = doc.widthOfStringAtSize(authorText, 14);
      doc.text(authorText, centerX - authorWidth / 2, currentY, { align: 'left' });
      
      currentY += 24;
    }

    if (input.organization) {
      doc.fontSize(12);
      doc.fillColor(RGBColor(0.4, 0.4, 0.4));
      
      const orgWidth = doc.widthOfStringAtSize(input.organization, 12);
      doc.text(input.organization, centerX - orgWidth / 2, currentY, { align: 'left' });
    }

    currentY += 48;

    if (input.version || input.date) {
      const versionDateParts: string[] = [];
      
      if (input.version) {
        versionDateParts.push(`Version ${input.version}`);
      }
      
      if (input.date) {
        const formattedDate = typeof input.date === 'string' 
          ? input.date 
          : input.date.toLocaleDateString();
        versionDateParts.push(formattedDate);
      }
      
      if (versionDateParts.length > 0) {
        doc.fontSize(10);
        doc.fillColor(RGBColor(0.5, 0.5, 0.5));
        
        const versionText = versionDateParts.join(' | ');
        const versionWidth = doc.widthOfStringAtSize(versionText, 10);
        doc.text(versionText, centerX - versionWidth / 2, currentY, { align: 'left' });
      }
    }

    this.addCoverPageBookmark(input.title, 1);
  }

  private addCoverPageBookmark(title: string, pageNumber: number): void {
    const bookmark: BookmarkEntry = {
      id: 'cover',
      title: title,
      level: 0,
      pageNumber,
      children: [],
    };
    this.bookmarks.push(bookmark);
  }

  private async renderTOC(
    doc: PDFDocument,
    sections: PDFSection[],
    styling: PDFStyling | undefined,
    layoutPlan: LayoutPlan
  ): Promise<void> {
    logger.debug('Rendering table of contents');

    const tocPage = doc.addPage({
      size: [layoutPlan.pageWidth, layoutPlan.pageHeight],
      margins: {
        top: layoutPlan.margins.top,
        bottom: layoutPlan.margins.bottom,
        left: layoutPlan.margins.left,
        right: layoutPlan.margins.right,
      },
    });

    this.currentPageNumber++;
    layoutPlan.tocStartPage = this.currentPageNumber;

    const tocTitle = styling?.tocStyle?.title || 'Table of Contents';
    const centerX = layoutPlan.pageWidth / 2;

    doc.font('Helvetica-Bold');
    doc.fontSize(24);
    doc.fillColor(this.hexToRgb(styling?.primaryColor || '#1F2937'));
    
    const titleWidth = doc.widthOfStringAtSize(tocTitle, 24);
    doc.text(tocTitle, centerX - titleWidth / 2, layoutPlan.margins.top, { align: 'left' });

    let yPosition = layoutPlan.margins.top + 50;
    const indentAmount = 20;

    for (const section of sections) {
      if (yPosition > layoutPlan.contentHeight - 50) {
        const newPage = doc.addPage({
          size: [layoutPlan.pageWidth, layoutPlan.pageHeight],
          margins: {
            top: layoutPlan.margins.top,
            bottom: layoutPlan.margins.bottom,
            left: layoutPlan.margins.left,
            right: layoutPlan.margins.right,
          },
        });
        this.currentPageNumber++;
        yPosition = layoutPlan.margins.top + 20;
      }

      const level = parseInt(section.level) || 1;
      const indent = (level - 1) * indentAmount;
      const fontSize = level === 1 ? 12 : level === 2 ? 11 : 10;

      doc.font(level === 1 ? 'Helvetica-Bold' : 'Helvetica');
      doc.fontSize(fontSize);
      doc.fillColor(this.hexToRgb(styling?.primaryColor || '#1F2937'));

      const tocEntry: TOCEntry = {
        id: section.id,
        title: section.title,
        level,
        pageNumber: this.currentPageNumber,
      };
      this.tocEntries.push(tocEntry);

      const entryText = section.title;
      doc.text(entryText, layoutPlan.margins.left + indent, yPosition, {
        continued: false,
        width: layoutPlan.contentWidth - 100,
      });

      const pageNumberText = String(this.currentPageNumber);
      const pageNumberWidth = doc.widthOfStringAtSize(pageNumberText, fontSize);
      
      doc.fillColor(this.hexToRgb(styling?.tocStyle?.pageNumberStyle?.color || '#6B7280'));
      doc.text(pageNumberText, layoutPlan.pageWidth - layoutPlan.margins.right - pageNumberWidth, yPosition, {
        align: 'right',
      });

      yPosition += fontSize * 1.5;
    }

    this.addTOCBookmark(tocTitle, layoutPlan.tocStartPage);
  }

  private addTOCBookmark(title: string, pageNumber: number): void {
    const tocBookmark: BookmarkEntry = {
      id: 'toc',
      title: title,
      level: 0,
      pageNumber,
      children: [],
    };
    this.bookmarks.push(tocBookmark);
  }

  private async renderSection(
    doc: PDFDocument,
    section: PDFSection,
    styling: PDFStyling | undefined,
    layoutPlan: LayoutPlan
  ): Promise<void> {
    logger.debug('Rendering section', { sectionId: section.id, title: section.title });

    this.currentSectionId = section.id;
    this.currentLevel = parseInt(section.level) || 1;

    const headingSizes: Record<number, number> = {
      1: 24,
      2: 18,
      3: 14,
      4: 12,
    };

    const headingSize = headingSizes[this.currentLevel] || 18;
    const headingFont = this.currentLevel === 1 ? 'Helvetica-Bold' : 'Helvetica';

    let yPosition = doc.y;

    if (section.layout?.breakBefore === 'always' || this.currentLevel === 1) {
      const newPage = doc.addPage({
        size: [layoutPlan.pageWidth, layoutPlan.pageHeight],
        margins: {
          top: layoutPlan.margins.top,
          bottom: layoutPlan.margins.bottom,
          left: layoutPlan.margins.left,
          right: layoutPlan.margins.right,
        },
      });
      this.currentPageNumber++;
      yPosition = layoutPlan.margins.top + 20;
    }

    doc.font(headingFont);
    doc.fontSize(headingSize);

    const primaryColor = this.hexToRgb(styling?.primaryColor || '#1F2937');
    doc.fillColor(primaryColor);

    const headingLines = this.wrapText(section.title, layoutPlan.contentWidth, headingSize, headingFont);
    
    for (const line of headingLines) {
      if (yPosition > layoutPlan.contentHeight - 50) {
        const newPage = doc.addPage({
          size: [layoutPlan.pageWidth, layoutPlan.pageHeight],
          margins: {
            top: layoutPlan.margins.top,
            bottom: layoutPlan.margins.bottom,
            left: layoutPlan.margins.left,
            right: layoutPlan.margins.right,
          },
        });
        this.currentPageNumber++;
        yPosition = layoutPlan.margins.top + 20;
      }

      doc.text(line, layoutPlan.margins.left, yPosition, {
        align: 'left',
        lineBreak: false,
      });
      yPosition += headingSize * 1.3;
    }

    yPosition += 12;

    const sectionBookmark: BookmarkEntry = {
      id: section.id,
      title: section.title,
      level: this.currentLevel,
      pageNumber: this.currentPageNumber,
      children: [],
    };

    const parentBookmark = this.findParentBookmark(this.currentLevel);
    if (parentBookmark) {
      parentBookmark.children.push(sectionBookmark);
    } else {
      this.bookmarks.push(sectionBookmark);
    }
    this.sectionBookmarks.set(section.id, sectionBookmark);

    doc.font('Helvetica');
    doc.fontSize(styling?.fontSize || 12);

    const bodyColor = this.hexToRgb(styling?.bodyTextStyle?.color || '#374151');
    doc.fillColor(bodyColor);

    const contentLines = this.wrapText(section.content, layoutPlan.contentWidth, 12, 'Helvetica');
    
    for (const line of contentLines) {
      if (yPosition > layoutPlan.contentHeight - 50) {
        const newPage = doc.addPage({
          size: [layoutPlan.pageWidth, layoutPlan.pageHeight],
          margins: {
            top: layoutPlan.margins.top,
            bottom: layoutPlan.margins.bottom,
            left: layoutPlan.margins.left,
            right: layoutPlan.margins.right,
          },
        });
        this.currentPageNumber++;
        yPosition = layoutPlan.margins.top + 20;
      }

      doc.text(line, layoutPlan.margins.left, yPosition, {
        align: 'justify',
        lineBreak: false,
      });
      yPosition += 12 * (styling?.lineHeight || 1.5);
    }

    if (section.charts && section.charts.length > 0) {
      await this.renderSectionCharts(doc, section.charts, layoutPlan);
    }

    if (section.diagrams && section.diagrams.length > 0) {
      await this.renderSectionDiagrams(doc, section.diagrams, layoutPlan);
    }
  }

  private findParentBookmark(level: number): BookmarkEntry | null {
    if (level === 1) {
      return null;
    }

    for (let i = this.bookmarks.length - 1; i >= 0; i--) {
      const bookmark = this.bookmarks[i];
      if (bookmark.level === level - 1) {
        return bookmark;
      }
      if (bookmark.level === 1 && level > 2) {
        return bookmark;
      }
    }

    return null;
  }

  private async renderSectionCharts(
    doc: PDFDocument,
    charts: ChartConfig[],
    layoutPlan: LayoutPlan
  ): Promise<void> {
    logger.debug('Rendering section charts', { chartCount: charts.length });

    for (const chart of charts) {
      const renderedChart = this.renderedCharts.get(chart.id);
      
      if (renderedChart) {
        const imageBuffer = renderedChart.buffer;
        const imageOptions = this.getChartImageOptions(chart, layoutPlan);
        
        const image = doc.openImage(imageBuffer);
        const imageWidth = chart.width || Math.min(layoutPlan.contentWidth - 100, 400);
        const imageHeight = (image.height / image.width) * imageWidth;
        
        let yPosition = doc.y;
        
        if (yPosition + imageHeight > layoutPlan.contentHeight - 50) {
          doc.addPage({
            size: [layoutPlan.pageWidth, layoutPlan.pageHeight],
            margins: {
              top: layoutPlan.margins.top,
              bottom: layoutPlan.margins.bottom,
              left: layoutPlan.margins.left,
              right: layoutPlan.margins.right,
            },
          });
          this.currentPageNumber++;
          yPosition = layoutPlan.margins.top + 20;
        }

        const xPosition = layoutPlan.margins.left + (layoutPlan.contentWidth - imageWidth) / 2;
        doc.image(imageBuffer, xPosition, yPosition, imageOptions);

        if (chart.caption) {
          yPosition += imageHeight + 10;
          doc.font('Helvetica-Oblique');
          doc.fontSize(10);
          doc.fillColor(this.hexToRgb('#6B7280'));
          
          const captionWidth = doc.widthOfStringAtSize(chart.caption, 10);
          doc.text(chart.caption, layoutPlan.pageWidth / 2 - captionWidth / 2, yPosition, {
            align: 'center',
          });
        }

        doc.y = yPosition + 30;
      }
    }
  }

  private getChartImageOptions(chart: ChartConfig, layoutPlan: LayoutPlan): {
    width?: number;
    height?: number;
    align?: string;
  } {
    return {
      width: chart.width || Math.min(layoutPlan.contentWidth - 100, 400),
      height: chart.height,
      align: 'center',
    };
  }

  private async renderSectionDiagrams(
    doc: PDFDocument,
    diagrams: DiagramConfig[],
    layoutPlan: LayoutPlan
  ): Promise<void> {
    logger.debug('Rendering section diagrams', { diagramCount: diagrams.length });

    for (const diagram of diagrams) {
      const renderedDiagram = this.renderedDiagrams.get(diagram.id);
      
      if (renderedDiagram) {
        const imageBuffer = renderedDiagram.buffer;
        const imageWidth = diagram.width || Math.min(layoutPlan.contentWidth - 100, 500);
        const imageHeight = (imageBuffer.length > 0) 
          ? (diagram.height || (imageWidth * 0.6))
          : 300;
        
        let yPosition = doc.y;
        
        if (yPosition + imageHeight > layoutPlan.contentHeight - 50) {
          doc.addPage({
            size: [layoutPlan.pageWidth, layoutPlan.pageHeight],
            margins: {
              top: layoutPlan.margins.top,
              bottom: layoutPlan.margins.bottom,
              left: layoutPlan.margins.left,
              right: layoutPlan.margins.right,
            },
          });
          this.currentPageNumber++;
          yPosition = layoutPlan.margins.top + 20;
        }

        const xPosition = layoutPlan.margins.left + (layoutPlan.contentWidth - imageWidth) / 2;
        
        if (imageBuffer.length > 0) {
          const image = doc.openImage(imageBuffer);
          doc.image(imageBuffer, xPosition, yPosition, {
            width: imageWidth,
            height: imageHeight,
          });
        } else {
          doc.font('Helvetica');
          doc.fontSize(12);
          doc.fillColor(this.hexToRgb('#9CA3AF'));
          doc.text(`[Diagram: ${diagram.title}]`, xPosition, yPosition, {
            width: imageWidth,
            align: 'center',
          });
        }

        if (diagram.caption) {
          yPosition += imageHeight + 10;
          doc.font('Helvetica-Oblique');
          doc.fontSize(10);
          doc.fillColor(this.hexToRgb('#6B7280'));
          
          const captionWidth = doc.widthOfStringAtSize(diagram.caption, 10);
          doc.text(diagram.caption, layoutPlan.pageWidth / 2 - captionWidth / 2, yPosition, {
            align: 'center',
          });
        }

        doc.y = yPosition + 30;
      }
    }
  }

  private addPageNumbers(
    doc: PDFDocument,
    styling: PDFStyling | undefined,
    layoutPlan: LayoutPlan
  ): void {
    logger.debug('Adding page numbers');

    const pageCount = this.currentPageNumber;
    const format = layoutPlan.pageNumbers.format || '1';
    const position = layoutPlan.pageNumbers.position || 'bottom-center';
    const startPage = layoutPlan.pageNumbers.startPage || 1;

    const pageNumbersRef = doc.ref({
      Type: 'Catalog',
      Pages: {
        Type: 'Pages',
        Count: pageCount,
      },
    });

    const formatPageNumber = (num: number): string => {
      const actualNum = num - startPage + 1;
      
      switch (format) {
        case 'i':
          return this.toRoman(actualNum).toLowerCase();
        case 'I':
          return this.toRoman(actualNum);
        case 'a':
          return this.toLetters(actualNum).toLowerCase();
        case 'A':
          return this.toLetters(actualNum);
        default:
          return String(actualNum);
      }
    };

    const drawPageNumbers = (page: PDFPage, num: number): void => {
      if (num < startPage) return;

      const pageNumberText = formatPageNumber(num);
      const fontSize = 10;
      const font = 'Helvetica';
      
      doc.font(font);
      doc.fontSize(fontSize);
      doc.fillColor(this.hexToRgb(styling?.footerStyle?.color || '#6B7280'));

      const textWidth = doc.widthOfStringAtSize(pageNumberText, fontSize);
      let xPosition: number;

      switch (position) {
        case 'bottom-left':
          xPosition = layoutPlan.margins.left;
          break;
        case 'bottom-right':
          xPosition = layoutPlan.pageWidth - layoutPlan.margins.right - textWidth;
          break;
        case 'top-center':
          xPosition = layoutPlan.pageWidth / 2 - textWidth / 2;
          doc.text(pageNumberText, xPosition, layoutPlan.margins.top - 20, {
            align: 'left',
          });
          return;
        default:
          xPosition = layoutPlan.pageWidth / 2 - textWidth / 2;
      }

      doc.text(pageNumberText, xPosition, layoutPlan.pageHeight - layoutPlan.margins.bottom + 20, {
        align: 'left',
      });
    };

    doc.on('pageAdded', (page: PDFPage) => {
      const pageIndex = doc.bufferedPageRange().count - 1;
      drawPageNumbers(page, this.currentPageNumber);
    });
  }

  private toRoman(num: number): string {
    if (num < 1) return '';
    const romanNumerals = [
      ['M', 1000],
      ['CM', 900],
      ['D', 500],
      ['CD', 400],
      ['C', 100],
      ['XC', 90],
      ['L', 50],
      ['XL', 40],
      ['X', 10],
      ['IX', 9],
      ['V', 5],
      ['IV', 4],
      ['I', 1],
    ];

    let result = '';
    for (const [letter, numValue] of romanNumerals) {
      const value = numValue as number;
      while (num >= value) {
        result += letter;
        num -= value;
      }
    }
    return result;
  }

  private toLetters(num: number): string {
    if (num < 1) return '';
    let result = '';
    while (num > 0) {
      const remainder = (num - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      num = Math.floor((num - 1) / 26);
    }
    return result;
  }

  private addBookmarks(doc: PDFDocument): void {
    logger.debug('Adding PDF bookmarks');

    const outlineRef = doc.ref({
      Type: 'Outlines',
      Count: this.bookmarks.length,
    });

    const createOutlineItem = (
      bookmark: BookmarkEntry,
      parentRef?: PDFDict
    ): PDFDict => {
      const outlineItem = doc.ref({
        Title: new PDFString(bookmark.title),
        Dest: [doc.pageIndex(bookmark.pageNumber), 'Fit'],
        Parent: parentRef,
      });

      if (bookmark.children.length > 0) {
        const firstChild = createOutlineItem(bookmark.children[0], outlineItem);
        let prevChild: PDFDict | null = firstChild;
        
        for (let i = 1; i < bookmark.children.length; i++) {
          const child = createOutlineItem(bookmark.children[i], outlineItem);
          (prevChild as PDFDict).obj.Prev = child.ref;
          child.obj.Next = prevChild.ref;
          prevChild = child;
        }

        outlineItem.obj.First = firstChild.ref;
        outlineItem.obj.Last = prevChild?.ref;
        outlineItem.obj.Count = bookmark.children.length;
      }

      return outlineItem;
    };

    let previousOutline: PDFDict | null = null;
    
    for (const bookmark of this.bookmarks) {
      const outlineItem = createOutlineItem(bookmark);
      
      if (previousOutline) {
        previousOutline.obj.Next = outlineItem.ref;
        outlineItem.obj.Prev = previousOutline.ref;
      }
      
      previousOutline = outlineItem;
    }

    if (this.bookmarks.length > 0) {
      outlineRef.obj.First = doc.ref({
        Title: new PDFString(this.bookmarks[0].title),
        Dest: [doc.pageIndex(this.bookmarks[0].pageNumber), 'Fit'],
      });
    }

    doc.catalog.obj.Outline = outlineRef;
  }

  private wrapText(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontName: string
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length * fontSize * 0.5 > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
  }

  private hexToRgb(hex: string): RGBColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    if (result) {
      const r = parseInt(result[1], 16) / 255;
      const g = parseInt(result[2], 16) / 255;
      const b = parseInt(result[3], 16) / 255;
      return RGBColor(r, g, b);
    }
    
    return RGBColor(0, 0, 0);
  }

  setRenderedCharts(charts: Map<string, RenderedChart>): void {
    this.renderedCharts = charts;
  }

  setRenderedDiagrams(diagrams: Map<string, RenderedDiagram>): void {
    this.renderedDiagrams = diagrams;
  }

  getTOCEntries(): TOCEntry[] {
    return this.tocEntries;
  }

  getBookmarks(): BookmarkEntry[] {
    return this.bookmarks;
  }

  async save(pdfBuffer: Buffer, outputPath: string): Promise<void> {
    logger.info('Saving PDF to file', { outputPath, size: pdfBuffer.length });

    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, pdfBuffer);
  }

  async getPageCount(pdfPath: string): Promise<number> {
    logger.debug('Getting page count', { pdfPath });

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    const buffer = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(buffer);
    
    return pdfDoc.getPageCount();
  }

  static createLayoutPlan(
    input: PDFInput,
    pageLayoutConfig: PageLayoutType
  ): LayoutPlan {
    const pageSize = pageLayoutConfig.pageSize || 'Letter';
    const orientation = pageLayoutConfig.orientation || 'portrait';
    
    const layoutCalculator = new PageLayout();
    const dimensions = layoutCalculator.getPageDimensions(pageSize, orientation);
    
    const margins = {
      top: (pageLayoutConfig.margins?.top || 1) * 72,
      bottom: (pageLayoutConfig.margins?.bottom || 1) * 72,
      left: (pageLayoutConfig.margins?.left || 1) * 72,
      right: (pageLayoutConfig.margins?.right || 1) * 72,
    };

    const contentWidth = dimensions.width - margins.left - margins.right;
    const contentHeight = dimensions.height - margins.top - margins.bottom;

    return {
      pageCount: 0,
      pageWidth: dimensions.width,
      pageHeight: dimensions.height,
      contentWidth,
      contentHeight,
      margins,
      tocStartPage: 0,
      sectionStartPage: 0,
      pageNumbers: {
        startPage: pageLayoutConfig.pageNumbers !== false ? 1 : 0,
        format: '1',
        position: 'bottom-center',
      },
    };
  }
}
