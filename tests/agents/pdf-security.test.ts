import {
  PDFSecurity,
  PasswordManager,
  PermissionManager,
  EncryptionManager
} from '../../agents/pdf/security';
import { PDFACompliance } from '../../agents/pdf/compliance/pdfa-compliance';
import { PDFXCompliance } from '../../agents/pdf/compliance/pdfx-compliance';
import {
  PDFPermissions,
  PermissionConfig
} from '../../agents/pdf/security/permission-manager';
import {
  PasswordValidationResult,
  SecurityAssessment,
  PasswordStrength
} from '../../agents/pdf/security/password-manager';

describe('PDFSecurity', () => {
  let security: PDFSecurity;

  beforeEach(() => {
    security = new PDFSecurity();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(security).toBeDefined();
    });

    it('should accept custom default encryption level', () => {
      const customSecurity = new PDFSecurity({
        defaultEncryptionLevel: 128
      });
      expect(customSecurity).toBeDefined();
    });

    it('should accept custom default permissions', () => {
      const customPermissions: PDFPermissions = {
        printing: 'none',
        modifyingContent: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false
      };
      const customSecurity = new PDFSecurity({
        defaultPermissions: customPermissions
      });
      expect(customSecurity).toBeDefined();
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = security.validatePassword('SecureP@ss123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(['strong', 'good']).toContain(result.strength);
    });

    it('should reject short password', () => {
      const result = security.validatePassword('Ab1!');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('at least 8 characters'))).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = security.validatePassword('securepass123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
    });

    it('should reject password without lowercase', () => {
      const result = security.validatePassword('SECUREPASS123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
    });

    it('should reject password without numbers', () => {
      const result = security.validatePassword('SecurePass!!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('number'))).toBe(true);
    });

    it('should reject password without special characters', () => {
      const result = security.validatePassword('SecurePass123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('special character'))).toBe(true);
    });

    it('should reject common passwords', () => {
      const result = security.validatePassword('password123');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('common words'))).toBe(true);
    });

    it('should reject password with repeated characters', () => {
      const result = security.validatePassword('SecureeePass123!');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('repeated characters'))).toBe(true);
    });
  });

  describe('validateSecurity', () => {
    it('should return high score for strong password', () => {
      const assessment = security.validateSecurity('SecureP@ss123!');
      expect(assessment.score).toBeGreaterThanOrEqual(70);
      expect(assessment.suggestions.length).toBeLessThan(3);
    });

    it('should return low score for weak password', () => {
      const assessment = security.validateSecurity('weak');
      expect(assessment.score).toBeLessThan(40);
      expect(assessment.suggestions.length).toBeGreaterThan(0);
    });

    it('should provide suggestions for improvement', () => {
      const assessment = security.validateSecurity('password');
      expect(assessment.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('generateStrongPassword', () => {
    it('should generate password of specified length', () => {
      const password = security.generateStrongPassword(20);
      expect(password.length).toBe(20);
    });

    it('should generate password with default length', () => {
      const password = security.generateStrongPassword();
      expect(password.length).toBe(16);
    });

    it('should contain uppercase letter', () => {
      const password = security.generateStrongPassword();
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    it('should contain lowercase letter', () => {
      const password = security.generateStrongPassword();
      expect(/[a-z]/.test(password)).toBe(true);
    });

    it('should contain number', () => {
      const password = security.generateStrongPassword();
      expect(/[0-9]/.test(password)).toBe(true);
    });

    it('should contain special character', () => {
      const password = security.generateStrongPassword();
      expect(/[!@#$%^&*(),.?":{}|<>]/.test(password)).toBe(true);
    });

    it('should validate generated password', () => {
      const password = security.generateStrongPassword();
      const validation = security.validatePassword(password);
      expect(validation.valid).toBe(true);
    });
  });

  describe('createPermissions', () => {
    it('should create permissions from config', () => {
      const config: PermissionConfig = {
        print: 'none',
        copy: true,
        modify: false
      };
      const permissions = security.createPermissions(config);
      expect(permissions.printing).toBe('none');
      expect(permissions.copying).toBe(true);
      expect(permissions.modifyingContent).toBe(false);
    });

    it('should use default values for unspecified permissions', () => {
      const config: PermissionConfig = {};
      const permissions = security.createPermissions(config);
      expect(permissions.printing).toBe('highResolution');
      expect(permissions.copying).toBe(true);
    });
  });

  describe('mergePermissions', () => {
    it('should merge base and override permissions', () => {
      const base: PDFPermissions = {
        printing: 'highResolution',
        modifyingContent: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
      };
      const override: Partial<PDFPermissions> = {
        printing: 'none',
        copying: false
      };
      const merged = security.mergePermissions(base, override);
      expect(merged.printing).toBe('none');
      expect(merged.copying).toBe(false);
      expect(merged.modifyingContent).toBe(true);
    });

    it('should keep base values when override is undefined', () => {
      const base: PDFPermissions = {
        printing: 'highResolution',
        modifyingContent: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
      };
      const override: Partial<PDFPermissions> = {};
      const merged = security.mergePermissions(base, override);
      expect(merged.printing).toBe('highResolution');
    });
  });

  describe('getDefaultPermissions', () => {
    it('should return default permissions', () => {
      const permissions = security.getDefaultPermissions(false);
      expect(permissions.printing).toBe('highResolution');
      expect(permissions.modifyingContent).toBe(true);
      expect(permissions.copying).toBe(true);
    });

    it('should return restricted permissions', () => {
      const permissions = security.getDefaultPermissions(true);
      expect(permissions.printing).toBe('none');
      expect(permissions.modifyingContent).toBe(false);
      expect(permissions.copying).toBe(false);
    });
  });
});

describe('PasswordManager', () => {
  let passwordManager: PasswordManager;

  beforeEach(() => {
    passwordManager = new PasswordManager();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(passwordManager).toBeDefined();
    });

    it('should accept custom options', () => {
      const customManager = new PasswordManager({
        minLength: 12,
        requireSpecialChars: false
      });
      expect(customManager).toBeDefined();
    });
  });

  describe('validatePassword', () => {
    it('should validate very strong password', () => {
      const result = passwordManager.validatePassword('UltraSecure@Pass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return weak strength for simple password', () => {
      const result = passwordManager.validatePassword('abc123');
      expect(result.valid).toBe(false);
      expect(result.strength).toBe('weak');
    });

    it('should return fair strength for moderate password', () => {
      const result = passwordManager.validatePassword('Password1!');
      expect(result.valid).toBe(true);
      expect(['fair', 'good', 'strong']).toContain(result.strength);
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash password', () => {
      const hash = passwordManager.hashPassword('TestPassword123!');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('TestPassword123!');
      expect(hash.includes(':')).toBe(true);
    });

    it('should verify correct password', () => {
      const password = 'TestPassword123!';
      const hash = passwordManager.hashPassword(password);
      const result = passwordManager.verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should reject incorrect password', () => {
      const password = 'TestPassword123!';
      const hash = passwordManager.hashPassword(password);
      const result = passwordManager.verifyPassword('WrongPassword!', hash);
      expect(result).toBe(false);
    });

    it('should generate different hashes for same password', () => {
      const password = 'TestPassword123!';
      const hash1 = passwordManager.hashPassword(password);
      const hash2 = passwordManager.hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateStrongPassword', () => {
    it('should generate valid password', () => {
      const password = passwordManager.generateStrongPassword();
      const result = passwordManager.validatePassword(password);
      expect(result.valid).toBe(true);
    });

    it('should generate unique passwords', () => {
      const passwords = new Set<string>();
      for (let i = 0; i < 100; i++) {
        passwords.add(passwordManager.generateStrongPassword());
      }
      expect(passwords.size).toBe(100);
    });
  });

  describe('validateSecurity', () => {
    it('should provide comprehensive assessment', () => {
      const assessment = passwordManager.validateSecurity('TestPassword123!');
      expect(assessment).toHaveProperty('score');
      expect(assessment).toHaveProperty('feedback');
      expect(assessment).toHaveProperty('suggestions');
      expect(typeof assessment.score).toBe('number');
      expect(Array.isArray(assessment.feedback)).toBe(true);
      expect(Array.isArray(assessment.suggestions)).toBe(true);
    });

    it('should score 100 for excellent password', () => {
      const assessment = passwordManager.validateSecurity('MyS3cur3P@ssw0rd!2024');
      expect(assessment.score).toBeGreaterThanOrEqual(80);
    });
  });
});

describe('PermissionManager', () => {
  let permissionManager: PermissionManager;

  beforeEach(() => {
    permissionManager = new PermissionManager();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(permissionManager).toBeDefined();
    });

    it('should accept custom options', () => {
      const customManager = new PermissionManager({
        strict: true,
        allowAllByDefault: false
      });
      expect(customManager).toBeDefined();
    });
  });

  describe('createPermissions', () => {
    it('should create full permissions', () => {
      const config: PermissionConfig = {
        print: 'high',
        copy: true,
        modify: true,
        annotate: true,
        formFields: true
      };
      const permissions = permissionManager.createPermissions(config);
      expect(permissions.printing).toBe('highResolution');
      expect(permissions.copying).toBe(true);
      expect(permissions.modifyingContent).toBe(true);
    });

    it('should create restricted permissions', () => {
      const config: PermissionConfig = {
        print: 'none',
        copy: false,
        modify: false,
        annotate: false,
        formFields: false
      };
      const permissions = permissionManager.createPermissions(config);
      expect(permissions.printing).toBe('none');
      expect(permissions.copying).toBe(false);
      expect(permissions.modifyingContent).toBe(false);
    });
  });

  describe('validatePermissions', () => {
    it('should validate correct permissions', () => {
      const permissions: PDFPermissions = {
        printing: 'highResolution',
        modifyingContent: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
      };
      const result = permissionManager.validatePermissions(permissions);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid permission level', () => {
      const permissions: PDFPermissions = {
        printing: 'invalid' as any,
        modifyingContent: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
      };
      const result = permissionManager.validatePermissions(permissions);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('print permission level'))).toBe(true);
    });

    it('should warn in strict mode when appropriate', () => {
      const strictManager = new PermissionManager({ strict: true });
      const permissions: PDFPermissions = {
        printing: 'none',
        modifyingContent: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
      };
      const result = strictManager.validatePermissions(permissions);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('mergePermissions', () => {
    it('should merge permissions correctly', () => {
      const base: PDFPermissions = {
        printing: 'highResolution',
        modifyingContent: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
      };
      const override: Partial<PDFPermissions> = {
        printing: 'none',
        copying: false
      };
      const result = permissionManager.mergePermissions(base, override);
      expect(result.printing).toBe('none');
      expect(result.copying).toBe(false);
      expect(result.modifyingContent).toBe(true);
    });
  });

  describe('getDefaultPermissions', () => {
    it('should return unrestricted defaults', () => {
      const permissions = permissionManager.getDefaultPermissions(false);
      expect(permissions.printing).toBe('highResolution');
      expect(permissions.modifyingContent).toBe(true);
    });

    it('should return restricted defaults', () => {
      const permissions = permissionManager.getDefaultPermissions(true);
      expect(permissions.printing).toBe('none');
      expect(permissions.modifyingContent).toBe(false);
    });
  });
});

describe('EncryptionManager', () => {
  let encryptionManager: EncryptionManager;

  beforeEach(() => {
    encryptionManager = new EncryptionManager();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(encryptionManager).toBeDefined();
    });

    it('should accept custom options', () => {
      const customManager = new EncryptionManager({
        algorithm: 'AES-128',
        mode: 'CBC'
      });
      expect(customManager).toBeDefined();
    });
  });

  describe('isPDFEncrypted', () => {
    it('should return false for non-PDF buffer', () => {
      const result = encryptionManager.isPDFEncrypted(Buffer.from('not a pdf'));
      expect(result).toBe(false);
    });

    it('should return false for empty buffer', () => {
      const result = encryptionManager.isPDFEncrypted(Buffer.from([]));
      expect(result).toBe(false);
    });
  });
});

describe('PDFACompliance', () => {
  let pdfaCompliance: PDFACompliance;

  beforeEach(() => {
    pdfaCompliance = new PDFACompliance();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(pdfaCompliance).toBeDefined();
    });

    it('should accept custom options', () => {
      const customCompliance = new PDFACompliance({
        generateSRGB: false,
        embedFonts: true
      });
      expect(customCompliance).toBeDefined();
    });
  });

  describe('validatePDFA', () => {
    it('should reject invalid PDF buffer', () => {
      const result = pdfaCompliance.validatePDFA(Buffer.from('not a pdf'));
      expect(result.compliant).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should return error for missing required metadata', () => {
      const result = pdfaCompliance.validatePDFA(Buffer.from('%PDF-1.4'));
      expect(result.issues.some(i => i.type === 'error')).toBe(true);
    });
  });
});

describe('PDFXCompliance', () => {
  let pdfxCompliance: PDFXCompliance;

  beforeEach(() => {
    pdfxCompliance = new PDFXCompliance();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(pdfxCompliance).toBeDefined();
    });

    it('should accept custom options', () => {
      const customCompliance = new PDFXCompliance({
        addOutputIntent: true,
        validatePageSize: true
      });
      expect(customCompliance).toBeDefined();
    });
  });

  describe('validatePDFX', () => {
    it('should reject invalid PDF buffer', () => {
      const result = pdfxCompliance.validatePDFX(Buffer.from('not a pdf'));
      expect(result.compliant).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect missing required fields', () => {
      const result = pdfxCompliance.validatePDFX(Buffer.from('%PDF-1.4'));
      expect(result.issues.some(i => i.type === 'error')).toBe(true);
    });
  });
});

describe('Security Module Exports', () => {
  it('should export PDFSecurity class', () => {
    expect(PDFSecurity).toBeDefined();
    expect(typeof PDFSecurity).toBe('function');
  });

  it('should export PasswordManager class', () => {
    expect(PasswordManager).toBeDefined();
    expect(typeof PasswordManager).toBe('function');
  });

  it('should export PermissionManager class', () => {
    expect(PermissionManager).toBeDefined();
    expect(typeof PermissionManager).toBe('function');
  });

  it('should export EncryptionManager class', () => {
    expect(EncryptionManager).toBeDefined();
    expect(typeof EncryptionManager).toBe('function');
  });

  it('should export PDFACompliance class', () => {
    expect(PDFACompliance).toBeDefined();
    expect(typeof PDFACompliance).toBe('function');
  });

  it('should export PDFXCompliance class', () => {
    expect(PDFXCompliance).toBeDefined();
    expect(typeof PDFXCompliance).toBe('function');
  });

  it('should export password manager instance', () => {
    const { passwordManager } = require('../../agents/pdf/security');
    expect(passwordManager).toBeDefined();
    expect(typeof passwordManager.validatePassword).toBe('function');
  });

  it('should export permission manager instance', () => {
    const { permissionManager } = require('../../agents/pdf/security');
    expect(permissionManager).toBeDefined();
    expect(typeof permissionManager.createPermissions).toBe('function');
  });

  it('should export encryption manager instance', () => {
    const { encryptionManager } = require('../../agents/pdf/security');
    expect(encryptionManager).toBeDefined();
    expect(typeof encryptionManager.encryptPDF).toBe('function');
  });

  it('should export pdfa compliance instance', () => {
    const { pdfaCompliance } = require('../../agents/pdf/compliance');
    expect(pdfaCompliance).toBeDefined();
    expect(typeof pdfaCompliance.validatePDFA).toBe('function');
  });

  it('should export pdfx compliance instance', () => {
    const { pdfxCompliance } = require('../../agents/pdf/compliance');
    expect(pdfxCompliance).toBeDefined();
    expect(typeof pdfxCompliance.validatePDFX).toBe('function');
  });
});

describe('Password Strength Categories', () => {
  let passwordManager: PasswordManager;

  beforeEach(() => {
    passwordManager = new PasswordManager();
  });

  const testPasswordStrength = (password: string, expected: PasswordStrength) => {
    const result = passwordManager.validatePassword(password);
    expect(result.strength).toBe(expected);
  };

  it('should classify weak passwords', () => {
    testPasswordStrength('weak', 'weak');
    testPasswordStrength('12345678', 'weak');
    testPasswordStrength('abcdefgh', 'weak');
  });

  it('should classify fair passwords', () => {
    testPasswordStrength('Password1', 'fair');
    testPasswordStrength('test1234', 'fair');
  });

  it('should classify good passwords', () => {
    testPasswordStrength('SecurePass1!', 'good');
    testPasswordStrength('MyP@ssw0rd', 'good');
  });

  it('should classify strong passwords', () => {
    testPasswordStrength('UltraSecure@Pass123!', 'strong');
    testPasswordStrength('C0mpl3x!P@ssword#2024', 'strong');
  });
});

describe('Permission Configuration Scenarios', () => {
  let permissionManager: PermissionManager;

  beforeEach(() => {
    permissionManager = new PermissionManager();
  });

  it('should handle no-print scenario', () => {
    const config: PermissionConfig = {
      print: 'none',
      copy: false,
      modify: false,
      annotate: false
    };
    const permissions = permissionManager.createPermissions(config);
    expect(permissions.printing).toBe('none');
    expect(permissions.copying).toBe(false);
  });

  it('should handle print-only scenario', () => {
    const config: PermissionConfig = {
      print: 'high',
      copy: false,
      modify: false,
      annotate: false
    };
    const permissions = permissionManager.createPermissions(config);
    expect(permissions.printing).toBe('highResolution');
    expect(permissions.copying).toBe(false);
  });

  it('should handle full-access scenario', () => {
    const config: PermissionConfig = {
      print: 'high',
      copy: true,
      modify: true,
      annotate: true,
      formFields: true,
      documentAssembly: true
    };
    const permissions = permissionManager.createPermissions(config);
    expect(permissions.printing).toBe('highResolution');
    expect(permissions.copying).toBe(true);
    expect(permissions.modifyingContent).toBe(true);
    expect(permissions.annotating).toBe(true);
    expect(permissions.fillingForms).toBe(true);
    expect(permissions.documentAssembly).toBe(true);
  });

  it('should handle accessibility scenario', () => {
    const config: PermissionConfig = {
      print: 'high',
      copy: true,
      modify: false,
      annotate: false,
      contentAccessibility: true
    };
    const permissions = permissionManager.createPermissions(config);
    expect(permissions.contentAccessibility).toBe(true);
    expect(permissions.copying).toBe(true);
  });
});

describe('Edge Cases and Error Handling', () => {
  let passwordManager: PasswordManager;
  let permissionManager: PermissionManager;
  let security: PDFSecurity;

  beforeEach(() => {
    passwordManager = new PasswordManager();
    permissionManager = new PermissionManager();
    security = new PDFSecurity();
  });

  it('should handle empty password', () => {
    const result = passwordManager.validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should handle very long password', () => {
    const longPassword = 'A'.repeat(200);
    const result = passwordManager.validatePassword(longPassword);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('no more than'))).toBe(true);
  });

  it('should handle password with only special chars', () => {
    const result = passwordManager.validatePassword('!@#$%^&*()');
    expect(result.valid).toBe(false);
  });

  it('should handle password with spaces', () => {
    const result = passwordManager.validatePassword('My Password123!');
    expect(result.valid).toBe(true);
  });

  it('should handle Unicode characters', () => {
    const result = passwordManager.validatePassword('P@ssw0rd!日本語');
    expect(result.valid).toBe(true);
  });

  it('should handle maximum length valid password', () => {
    const maxLengthPassword = 'Ab1!'.repeat(32);
    const result = passwordManager.validatePassword(maxLengthPassword);
    expect(result.valid).toBe(true);
  });

  it('should handle validation of permissions with all false', () => {
    const permissions: PDFPermissions = {
      printing: 'none',
      modifyingContent: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false
    };
    const result = permissionManager.validatePermissions(permissions);
    expect(result.valid).toBe(true);
  });
});

describe('Module Integration', () => {
  it('should integrate all security modules together', () => {
    const passwordManager = new PasswordManager();
    const permissionManager = new PermissionManager();
    const security = new PDFSecurity();

    const password = security.generateStrongPassword();
    expect(passwordManager.validatePassword(password).valid).toBe(true);

    const permissions = permissionManager.createPermissions({
      print: 'high',
      copy: true
    });
    expect(permissions.printing).toBe('highResolution');

    const validation = security.validatePassword(password);
    expect(validation.valid).toBe(true);
  });

  it('should allow permission merging workflow', () => {
    const security = new PDFSecurity();

    const base = security.getDefaultPermissions(false);
    const override: Partial<PDFPermissions> = {
      printing: 'none',
      copying: false
    };
    const merged = security.mergePermissions(base, override);

    expect(merged.printing).toBe('none');
    expect(merged.copying).toBe(false);
    expect(merged.modifyingContent).toBe(true);
  });

  it('should allow custom permission creation and validation', () => {
    const security = new PDFSecurity();

    const config: PermissionConfig = {
      print: 'low',
      copy: true,
      modify: false
    };
    const permissions = security.createPermissions(config);
    const validation = security.getDefaultPermissions();
    const merged = security.mergePermissions(validation, permissions);

    expect(merged.printing).toBe('low');
    expect(merged.copying).toBe(true);
    expect(merged.modifyingContent).toBe(false);
  });
});
