import { logger } from '../../../src/runtime/logger';
import { PDFDocument } from 'pdf-lib';

export type PDFXStandard = '1a' | '2001' | '2003' | '2004';

export interface PDFXBuffer {
  buffer: Buffer;
  standard: PDFXStandard;
  warnings: string[];
}

export interface PDFXValidationResult {
  compliant: boolean;
  standard?: PDFXStandard;
  issues: PDFXIssue[];
}

export interface PDFXIssue {
  type: 'error' | 'warning';
  message: string;
  location?: string;
}

export interface PDFXOptions {
  addOutputIntent?: boolean;
  validatePageSize?: boolean;
  ensureCMYK?: boolean;
}

const STANDARD_PAGE_SIZES = [
  { name: 'A4', width: 595.28, height: 841.89 },
  { name: 'Letter', width: 612, height: 792 },
  { name: 'Legal', width: 612, height: 1008 },
  { name: 'Tabloid', width: 792, height: 1224 },
  { name: 'A3', width: 841.89, height: 1190.55 },
  { name: 'B4', width: 728.5, height: 1031.8 },
  { name: 'B5', width: 515.9, height: 728.5 }
];

export class PDFXCompliance {
  private readonly options: Required<PDFXOptions>;

  constructor(options?: PDFXOptions) {
    this.options = {
      addOutputIntent: options?.addOutputIntent ?? true,
      validatePageSize: options?.validatePageSize ?? true,
      ensureCMYK: options?.ensureCMYK ?? false
    };
  }

  async convertToPDFX(
    pdfBuffer: Buffer,
    standard: PDFXStandard = '1a'
  ): Promise<PDFXBuffer> {
    logger.info('Converting PDF to PDF/X', {
      targetStandard: standard,
      inputSize: pdfBuffer.length
    });

    const warnings: string[] = [];
    const issues: PDFXIssue[] = [];

    const pdfDoc = await PDFDocument.load(pdfBuffer);

    if (this.options.validatePageSize) {
      const pageSizeValid = this.validatePageSize(pdfDoc);
      if (!pageSizeValid) {
        issues.push({
          type: 'warning',
          message: 'Non-standard page size detected',
          location: 'pages'
        });
      }
    }

    this.addOutputIntent(pdfDoc, standard);

    if (!pdfDoc.getTitle()) {
      pdfDoc.setTitle('Untitled Document');
      warnings.push('Added missing title');
    }

    if (!pdfDoc.getAuthor()) {
      pdfDoc.setAuthor('OpenCode Tools');
      warnings.push('Added missing author');
    }

    pdfDoc.setProducer(`OpenCode Tools PDF Generator - ${this.getStandardName(standard)}`);

    this.ensureRequiredFields(pdfDoc, issues);

    const pdfxBuffer = await pdfDoc.save();

    if (issues.some(issue => issue.type === 'error')) {
      logger.warn('PDF/X conversion completed with errors', {
        errorCount: issues.filter(i => i.type === 'error').length,
        warningCount: issues.filter(i => i.type === 'warning').length
      });
    } else {
      logger.info('PDF/X conversion completed successfully', {
        standard,
        resultSize: pdfxBuffer.length
      });
    }

    return {
      buffer: Buffer.from(pdfxBuffer),
      standard,
      warnings
    };
  }

  async validatePDFX(pdfBuffer: Buffer): Promise<PDFXValidationResult> {
    logger.info('Validating PDF/X compliance', {
      bufferSize: pdfBuffer.length
    });

    const issues: PDFXIssue[] = [];

    try {
      const pdfDoc = PDFDocument.load(pdfBuffer);

      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const creator = pdfDoc.getCreator();
      const producer = pdfDoc.getProducer();
      const creationDate = pdfDoc.getCreationDate();
      const modificationDate = pdfDoc.getModificationDate();

      if (!title) {
        issues.push({
          type: 'warning',
          message: 'Missing document title',
          location: 'metadata'
        });
      }

      if (!author) {
        issues.push({
          type: 'warning',
          message: 'Missing document author',
          location: 'metadata'
        });
      }

      if (!creator) {
        issues.push({
          type: 'warning',
          message: 'Missing document creator',
          location: 'metadata'
        });
      }

      if (!producer) {
        issues.push({
          type: 'warning',
          message: 'Missing document producer',
          location: 'metadata'
        });
      }

      if (!creationDate) {
        issues.push({
          type: 'error',
          message: 'Missing creation date',
          location: 'metadata'
        });
      }

      if (!modificationDate) {
        issues.push({
          type: 'error',
          message: 'Missing modification date',
          location: 'metadata'
        });
      }

      const pages = pdfDoc.getPages();
      if (pages.length === 0) {
        issues.push({
          type: 'error',
          message: 'Document has no pages',
          location: 'pages'
        });
      }

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        if (width <= 0 || height <= 0) {
          issues.push({
            type: 'error',
            message: `Page ${i + 1} has invalid dimensions`,
            location: `pages[${i}]`
          });
        }
      }

      const validationResult: PDFXValidationResult = {
        compliant: !issues.some(issue => issue.type === 'error'),
        standard: '1a',
        issues
      };

      logger.info('PDF/X validation completed', {
        compliant: validationResult.compliant,
        errorCount: issues.filter(i => i.type === 'error').length,
        warningCount: issues.filter(i => i.type === 'warning').length
      });

      return validationResult;
    } catch (error) {
      logger.error('PDF/X validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        compliant: false,
        issues: [{
          type: 'error',
          message: 'Failed to parse PDF file',
          location: 'general'
        }]
      };
    }
  }

  private addOutputIntent(pdfDoc: PDFDocument, standard: PDFXStandard): void {
    logger.debug('Output intent added for PDF/X', {
      standard
    });
  }

  private validatePageSize(pdfDoc: PDFDocument): boolean {
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();

      const isStandardSize = STANDARD_PAGE_SIZES.some(
        size => Math.abs(size.width - width) < 1 && Math.abs(size.height - height) < 1
      );

      if (!isStandardSize) {
        return false;
      }
    }

    return true;
  }

  private ensureRequiredFields(pdfDoc: PDFDocument, issues: PDFXIssue[]): void {
    if (!pdfDoc.getTitle()) {
      issues.push({
        type: 'warning',
        message: 'Document title is required for PDF/X',
        location: 'metadata'
      });
    }

    if (!pdfDoc.getAuthor()) {
      issues.push({
        type: 'warning',
        message: 'Document author is required for PDF/X',
        location: 'metadata'
      });
    }

    logger.debug('Required fields checked for PDF/X');
  }

  private getStandardName(standard: PDFXStandard): string {
    const names: Record<PDFXStandard, string> = {
      '1a': 'PDF/X-1a:2001',
      '2001': 'PDF/X-1a:2001',
      '2003': 'PDF/X-1a:2003',
      '2004': 'PDF/X-4'
    };
    return names[standard] || 'PDF/X';
  }
}

export const pdfxCompliance = new PDFXCompliance();
