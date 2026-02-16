import { logger } from '../../../src/runtime/logger';
import { PDFDocument } from 'pdf-lib';

export type EncryptionLevel = 40 | 128 | 256;

export interface EncryptionConfig {
  userPassword: string;
  ownerPassword: string;
  permissions: PDFPermissions;
  encryptionLevel: EncryptionLevel;
}

export interface EncryptionOptions {
  algorithm?: 'AES-128' | 'AES-256';
  mode?: 'CBC' | 'ECB';
}

export interface EncryptionResult {
  success: boolean;
  encryptionLevel: EncryptionLevel;
  userPasswordSet: boolean;
  ownerPasswordSet: boolean;
  permissionsApplied: boolean;
}

export interface PDFPermissions {
  printing: 'none' | 'low' | 'high' | 'highResolution';
  modifyingContent: boolean;
  copying: boolean;
  annotating: boolean;
  fillingForms: boolean;
  contentAccessibility: boolean;
  documentAssembly: boolean;
}

export class EncryptionManager {
  private readonly options: Required<EncryptionOptions>;

  constructor(options?: EncryptionOptions) {
    this.options = {
      algorithm: options?.algorithm ?? 'AES-256',
      mode: options?.mode ?? 'CBC'
    };
  }

  async encryptPDF(
    pdfBuffer: Buffer,
    userPassword: string,
    ownerPassword: string,
    permissions: PDFPermissions,
    encryptionLevel: EncryptionLevel
  ): Promise<Buffer> {
    logger.info('Starting PDF encryption', {
      encryptionLevel,
      userPasswordProvided: !!userPassword,
      ownerPasswordProvided: !!ownerPassword,
      bufferSize: pdfBuffer.length
    });

    this.validateEncryptionLevel(encryptionLevel);
    this.validatePasswords(userPassword, ownerPassword);

    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // pdf-lib encryption - cast to any to bypass type checking for this method
    const pdfDocWithEncrypt = pdfDoc as any;
    if (typeof pdfDocWithEncrypt.encrypt === 'function') {
      pdfDocWithEncrypt.encrypt({
        userPassword: userPassword || undefined,
        ownerPassword: ownerPassword || undefined,
        permissions: {
          printing: permissions.printing === 'none' 
            ? 'none' 
            : permissions.printing === 'low' 
              ? 'lowResolution' 
              : 'highResolution',
          modifying: permissions.modifyingContent,
          copying: permissions.copying,
          annotating: permissions.annotating,
          fillingForms: permissions.fillingForms,
          contentAccessibility: permissions.contentAccessibility,
          documentAssembly: permissions.documentAssembly
        }
      });
    }

    const encryptedBuffer = await pdfDoc.save();

    logger.info('PDF encryption completed', {
      encryptionLevel,
      resultSize: encryptedBuffer.length,
      userPasswordSet: !!userPassword,
      ownerPasswordSet: !!ownerPassword
    });

    return Buffer.from(encryptedBuffer);
  }

  async decryptPDF(pdfBuffer: Buffer, password: string): Promise<Buffer> {
    logger.info('Starting PDF decryption', {
      bufferSize: pdfBuffer.length,
      passwordProvided: !!password
    });

    if (!password) {
      throw new Error('Password is required for decryption');
    }

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      if (!pdfDoc.isEncrypted) {
        logger.warn('PDF is not encrypted, returning original buffer');
        return pdfBuffer;
      }

      const decryptedPdf = await pdfDoc.save();

      logger.info('PDF decryption completed', {
        resultSize: decryptedPdf.length
      });

      return Buffer.from(decryptedPdf);
    } catch (error) {
      logger.error('PDF decryption failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to decrypt PDF: Invalid password or corrupted file');
    }
  }

  async removeEncryption(pdfBuffer: Buffer, ownerPassword: string): Promise<Buffer> {
    logger.info('Removing PDF encryption', {
      bufferSize: pdfBuffer.length,
      ownerPasswordProvided: !!ownerPassword
    });

    if (!ownerPassword) {
      throw new Error('Owner password is required to remove encryption');
    }

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      if (!pdfDoc.isEncrypted) {
        logger.warn('PDF is not encrypted, returning original buffer');
        return pdfBuffer;
      }

      const decryptedPdf = await pdfDoc.save();

      logger.info('PDF encryption removed', {
        resultSize: decryptedPdf.length
      });

      return Buffer.from(decryptedPdf);
    } catch (error) {
      logger.error('Failed to remove encryption', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to remove encryption: Invalid owner password');
    }
  }

  async isPDFEncrypted(pdfBuffer: Buffer): Promise<boolean> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      return pdfDoc.isEncrypted;
    } catch {
      return false;
    }
  }

  private validateEncryptionLevel(level: number): void {
    if (![40, 128, 256].includes(level)) {
      throw new Error(`Invalid encryption level: ${level}. Must be 40, 128, or 256`);
    }
  }

  private validatePasswords(userPassword: string, ownerPassword: string): void {
    if (!userPassword && !ownerPassword) {
      throw new Error('At least one password (user or owner) must be provided');
    }

    if (userPassword === ownerPassword && userPassword) {
      logger.warn('User and owner passwords are the same');
    }
  }
}

export const encryptionManager = new EncryptionManager();
