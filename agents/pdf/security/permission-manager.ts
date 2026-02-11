import { logger } from '../../../src/runtime/logger';

export type PermissionLevel = 'none' | 'low' | 'high' | 'highResolution';

export interface PDFPermissions {
  printing: PermissionLevel;
  modifyingContent: boolean;
  copying: boolean;
  annotating: boolean;
  fillingForms: boolean;
  contentAccessibility: boolean;
  documentAssembly: boolean;
}

export interface PermissionConfig {
  print?: 'none' | 'low' | 'high';
  copy?: boolean;
  modify?: boolean;
  annotate?: boolean;
  formFields?: boolean;
  contentAccessibility?: boolean;
  documentAssembly?: boolean;
  printing?: boolean;
  fillingForms?: boolean;
  modifyingContent?: boolean;
  copying?: boolean;
}

export interface PermissionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PermissionOptions {
  strict?: boolean;
  allowAllByDefault?: boolean;
}

const DEFAULT_PERMISSIONS_CONST: PDFPermissions = {
  printing: 'highResolution',
  modifyingContent: true,
  copying: true,
  annotating: true,
  fillingForms: true,
  contentAccessibility: true,
  documentAssembly: true
};

const RESTRICTED_PERMISSIONS_CONST: PDFPermissions = {
  printing: 'none',
  modifyingContent: false,
  copying: false,
  annotating: false,
  fillingForms: false,
  contentAccessibility: false,
  documentAssembly: false
};

export class PermissionManager {
  private readonly options: Required<PermissionOptions>;

  constructor(options?: PermissionOptions) {
    this.options = {
      strict: options?.strict ?? false,
      allowAllByDefault: options?.allowAllByDefault ?? true
    };
  }

  createPermissions(config: PermissionConfig): PDFPermissions {
    const permissions: PDFPermissions = {
      printing: this.mapPrintPermission(config.print),
      modifyingContent: config.modify ?? config.modifyingContent ?? this.options.allowAllByDefault,
      copying: config.copy ?? config.copying ?? this.options.allowAllByDefault,
      annotating: config.annotate ?? this.options.allowAllByDefault,
      fillingForms: config.formFields ?? config.fillingForms ?? this.options.allowAllByDefault,
      contentAccessibility: config.contentAccessibility ?? this.options.allowAllByDefault,
      documentAssembly: config.documentAssembly ?? this.options.allowAllByDefault
    };

    logger.info('Permissions created from config', {
      printing: permissions.printing,
      modifyingContent: permissions.modifyingContent,
      copying: permissions.copying,
      annotating: permissions.annotating,
      fillingForms: permissions.fillingForms,
      contentAccessibility: permissions.contentAccessibility,
      documentAssembly: permissions.documentAssembly
    });

    return permissions;
  }

  applyPermissions(_pdfDoc: any, permissions: PDFPermissions): void {
    logger.info('Permissions configuration logged', {
      printing: permissions.printing,
      modifyingContent: permissions.modifyingContent,
      copying: permissions.copying,
      annotating: permissions.annotating,
      fillingForms: permissions.fillingForms,
      contentAccessibility: permissions.contentAccessibility,
      documentAssembly: permissions.documentAssembly
    });
  }

  validatePermissions(permissions: PDFPermissions): PermissionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!['none', 'low', 'high', 'highResolution'].includes(permissions.printing)) {
      errors.push('Invalid print permission level');
    }

    if (typeof permissions.modifyingContent !== 'boolean') {
      errors.push('modifyingContent must be a boolean');
    }

    if (typeof permissions.copying !== 'boolean') {
      errors.push('copying must be a boolean');
    }

    if (typeof permissions.annotating !== 'boolean') {
      errors.push('annotating must be a boolean');
    }

    if (typeof permissions.fillingForms !== 'boolean') {
      errors.push('fillingForms must be a boolean');
    }

    if (typeof permissions.contentAccessibility !== 'boolean') {
      errors.push('contentAccessibility must be a boolean');
    }

    if (typeof permissions.documentAssembly !== 'boolean') {
      errors.push('documentAssembly must be a boolean');
    }

    if (this.options.strict) {
      if (permissions.printing === 'none' && (permissions.copying || permissions.modifyingContent)) {
        warnings.push('Allowing copy/modify while printing is disabled may not provide expected protection');
      }

      if (permissions.contentAccessibility && !permissions.copying) {
        warnings.push('Content accessibility enabled without copy permission may cause accessibility issues');
      }
    }

    logger.debug('Permissions validation completed', {
      valid: errors.length === 0,
      errorCount: errors.length,
      warningCount: warnings.length
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  mergePermissions(base: PDFPermissions, override: Partial<PDFPermissions>): PDFPermissions {
    const merged: PDFPermissions = {
      printing: override.printing ?? base.printing,
      modifyingContent: override.modifyingContent ?? base.modifyingContent,
      copying: override.copying ?? base.copying,
      annotating: override.annotating ?? base.annotating,
      fillingForms: override.fillingForms ?? base.fillingForms,
      contentAccessibility: override.contentAccessibility ?? base.contentAccessibility,
      documentAssembly: override.documentAssembly ?? base.documentAssembly
    };

    logger.info('Permissions merged', {
      base: {
        printing: base.printing,
        modifyingContent: base.modifyingContent,
        copying: base.copying
      },
      override: override,
      result: {
        printing: merged.printing,
        modifyingContent: merged.modifyingContent,
        copying: merged.copying
      }
    });

    return merged;
  }

  getDefaultPermissions(restricted: boolean = false): PDFPermissions {
    return restricted ? RESTRICTED_PERMISSIONS_CONST : DEFAULT_PERMISSIONS_CONST;
  }

  private mapPrintPermission(level?: 'none' | 'low' | 'high'): PermissionLevel {
    switch (level) {
      case 'none':
        return 'none';
      case 'low':
        return 'low';
      case 'high':
        return 'highResolution';
      default:
        return 'highResolution';
    }
  }
}

export const permissionManager = new PermissionManager();
export { DEFAULT_PERMISSIONS_CONST as DEFAULT_PERMISSIONS, RESTRICTED_PERMISSIONS_CONST as RESTRICTED_PERMISSIONS };
