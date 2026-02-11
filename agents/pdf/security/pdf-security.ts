import { logger } from '../../../src/runtime/logger';
import { PDFDocument } from 'pdf-lib';
import { EncryptionManager, EncryptionLevel } from './encryption-manager';
import { PermissionManager, PDFPermissions, PermissionConfig } from './permission-manager';
import { PasswordManager } from './password-manager';

export interface SecurityOptions {
  defaultEncryptionLevel?: EncryptionLevel;
  defaultPermissions?: PDFPermissions;
}

export interface PDFSecurityConfig {
  encrypt?: boolean;
  userPassword?: string;
  ownerPassword?: string;
  permissions?: PermissionConfig;
  encryptionLevel?: EncryptionLevel;
}

export interface SecurityInfo {
  isEncrypted: boolean;
  encryptionLevel?: EncryptionLevel;
  hasUserPassword: boolean;
  hasOwnerPassword: boolean;
  permissions?: PDFPermissions;
}

export interface SecurityResult {
  success: boolean;
  originalSize: number;
  securedSize: number;
  encryptionLevel?: EncryptionLevel;
  userPasswordSet: boolean;
  ownerPasswordSet: boolean;
  permissionsApplied: boolean;
}

export class PDFSecurity {
  private readonly encryptionManager: EncryptionManager;
  private readonly permissionManager: PermissionManager;
  private readonly passwordManager: PasswordManager;
  private readonly defaultEncryptionLevel: EncryptionLevel;
  private readonly defaultPermissions: PDFPermissions;

  constructor(options?: SecurityOptions) {
    this.encryptionManager = new EncryptionManager();
    this.permissionManager = new PermissionManager();
    this.passwordManager = new PasswordManager();
    this.defaultEncryptionLevel = options?.defaultEncryptionLevel ?? 256;
    this.defaultPermissions = this.permissionManager.getDefaultPermissions(false);

    logger.info('PDFSecurity initialized', {
      defaultEncryptionLevel: this.defaultEncryptionLevel,
      hasDefaultPermissions: true
    });
  }

  async encrypt(pdfBuffer: Buffer, security: PDFSecurityConfig): Promise<Buffer> {
    logger.info('Starting PDF encryption', {
      encrypt: security.encrypt,
      userPasswordProvided: !!security.userPassword,
      ownerPasswordProvided: !!security.ownerPassword,
      encryptionLevel: security.encryptionLevel ?? this.defaultEncryptionLevel,
      bufferSize: pdfBuffer.length
    });

    if (!security.encrypt) {
      logger.debug('Encryption not requested, returning original buffer');
      return pdfBuffer;
    }

    const userPassword = security.userPassword || '';
    const ownerPassword = security.ownerPassword || '';
    const encryptionLevel = security.encryptionLevel ?? this.defaultEncryptionLevel;
    const permissions = security.permissions 
      ? this.permissionManager.createPermissions(security.permissions)
      : this.defaultPermissions;

    const permissionValidation = this.permissionManager.validatePermissions(permissions);
    if (!permissionValidation.valid) {
      throw new Error(`Invalid permissions: ${permissionValidation.errors.join(', ')}`);
    }

    if (userPassword || ownerPassword) {
      if (userPassword) {
        const userValidation = this.passwordManager.validatePassword(userPassword);
        if (!userValidation.valid) {
          logger.warn('Weak user password detected', {
            strength: userValidation.strength,
            errors: userValidation.errors
          });
        }
      }

      if (ownerPassword) {
        const ownerValidation = this.passwordManager.validatePassword(ownerPassword);
        if (!ownerValidation.valid) {
          throw new Error(`Invalid owner password: ${ownerValidation.errors.join(', ')}`);
        }
      }
    } else {
      throw new Error('At least one password (user or owner) must be provided for encryption');
    }

    const encryptedBuffer = await this.encryptionManager.encryptPDF(
      pdfBuffer,
      userPassword,
      ownerPassword,
      permissions,
      encryptionLevel
    );

    logger.info('PDF encryption completed', {
      originalSize: pdfBuffer.length,
      securedSize: encryptedBuffer.length,
      encryptionLevel,
      userPasswordSet: !!userPassword,
      ownerPasswordSet: !!ownerPassword
    });

    return encryptedBuffer;
  }

  async decrypt(pdfBuffer: Buffer, password: string): Promise<Buffer> {
    logger.info('Starting PDF decryption', {
      bufferSize: pdfBuffer.length,
      passwordProvided: !!password
    });

    const decryptedBuffer = await this.encryptionManager.decryptPDF(pdfBuffer, password);

    logger.info('PDF decryption completed', {
      originalSize: pdfBuffer.length,
      decryptedSize: decryptedBuffer.length
    });

    return decryptedBuffer;
  }

  async applyPermissions(pdfBuffer: Buffer, permissions: PDFPermissions): Promise<Buffer> {
    logger.info('Applying permissions to PDF', {
      bufferSize: pdfBuffer.length,
      permissions: {
        printing: permissions.printing,
        modifyingContent: permissions.modifyingContent,
        copying: permissions.copying
      }
    });

    const validation = this.permissionManager.validatePermissions(permissions);
    if (!validation.valid) {
      throw new Error(`Invalid permissions: ${validation.errors.join(', ')}`);
    }

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    this.permissionManager.applyPermissions(pdfDoc, permissions);
    const modifiedBuffer = await pdfDoc.save();

    logger.info('Permissions applied successfully', {
      resultSize: modifiedBuffer.length
    });

    return Buffer.from(modifiedBuffer);
  }

  async removeEncryption(pdfBuffer: Buffer, ownerPassword: string): Promise<Buffer> {
    logger.info('Removing encryption from PDF', {
      bufferSize: pdfBuffer.length,
      ownerPasswordProvided: !!ownerPassword
    });

    const unencryptedBuffer = await this.encryptionManager.removeEncryption(
      pdfBuffer,
      ownerPassword
    );

    logger.info('Encryption removed successfully', {
      resultSize: unencryptedBuffer.length
    });

    return unencryptedBuffer;
  }

  async getSecurityInfo(pdfBuffer: Buffer): Promise<SecurityInfo> {
    logger.debug('Getting security info', {
      bufferSize: pdfBuffer.length
    });

    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      const info: SecurityInfo = {
        isEncrypted: pdfDoc.isEncrypted,
        hasUserPassword: false,
        hasOwnerPassword: false
      };

      if (pdfDoc.isEncrypted) {
        info.encryptionLevel = 256;
        info.permissions = {
          printing: 'highResolution',
          modifyingContent: true,
          copying: true,
          annotating: true,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: true
        };
      }

      logger.debug('Security info retrieved', {
        isEncrypted: info.isEncrypted,
        encryptionLevel: info.encryptionLevel
      });

      return info;
    } catch (error) {
      logger.error('Failed to get security info', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to retrieve PDF security information');
    }
  }

  validatePassword(password: string): ReturnType<PasswordManager['validatePassword']> {
    return this.passwordManager.validatePassword(password);
  }

  validateSecurity(password: string): ReturnType<PasswordManager['validateSecurity']> {
    return this.passwordManager.validateSecurity(password);
  }

  generateStrongPassword(length?: number): string {
    return this.passwordManager.generateStrongPassword(length);
  }

  createPermissions(config: PermissionConfig): PDFPermissions {
    return this.permissionManager.createPermissions(config);
  }

  mergePermissions(
    base: PDFPermissions,
    override: Partial<PDFPermissions>
  ): PDFPermissions {
    return this.permissionManager.mergePermissions(base, override);
  }

  getDefaultPermissions(restricted: boolean = false): PDFPermissions {
    return this.permissionManager.getDefaultPermissions(restricted);
  }
}

export const pdfSecurity = new PDFSecurity();
