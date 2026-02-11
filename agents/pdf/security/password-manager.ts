import { logger } from '../../../src/runtime/logger';
import * as crypto from 'crypto';

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  disallowCommonWords: true,
  disallowRepeatedChars: true
};

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'password123',
  'admin', 'root', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
  '123456789', 'sunshine', 'princess', 'football', 'iloveyou', 'admin123'
];

const SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>';

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: PasswordStrength;
}

export interface SecurityAssessment {
  score: number;
  feedback: string[];
  suggestions: string[];
}

export interface PasswordOptions {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  disallowCommonWords?: boolean;
  disallowRepeatedChars?: boolean;
}

export class PasswordManager {
  private readonly options: Required<PasswordOptions>;

  constructor(options?: PasswordOptions) {
    this.options = {
      minLength: options?.minLength ?? PASSWORD_REQUIREMENTS.minLength,
      maxLength: options?.maxLength ?? PASSWORD_REQUIREMENTS.maxLength,
      requireUppercase: options?.requireUppercase ?? PASSWORD_REQUIREMENTS.requireUppercase,
      requireLowercase: options?.requireLowercase ?? PASSWORD_REQUIREMENTS.requireLowercase,
      requireNumbers: options?.requireNumbers ?? PASSWORD_REQUIREMENTS.requireNumbers,
      requireSpecialChars: options?.requireSpecialChars ?? PASSWORD_REQUIREMENTS.requireSpecialChars,
      disallowCommonWords: options?.disallowCommonWords ?? PASSWORD_REQUIREMENTS.disallowCommonWords,
      disallowRepeatedChars: options?.disallowRepeatedChars ?? PASSWORD_REQUIREMENTS.disallowRepeatedChars
    };
  }

  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < this.options.minLength) {
      errors.push(`Password must be at least ${this.options.minLength} characters`);
    }

    if (password.length > this.options.maxLength) {
      errors.push(`Password must be no more than ${this.options.maxLength} characters`);
    }

    if (this.options.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.options.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.options.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.options.requireSpecialChars && !new RegExp(`[${SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (this.options.disallowCommonWords && COMMON_PASSWORDS.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password contains common words or patterns');
    }

    if (this.options.disallowRepeatedChars) {
      const repeatedChars = password.match(/(.)\1{2,}/g);
      if (repeatedChars) {
        errors.push('Password contains repeated characters (3 or more times)');
      }
    }

    const strength = this.calculateStrength(password);

    logger.debug('Password validation completed', {
      valid: errors.length === 0,
      strength,
      errorCount: errors.length
    });

    return {
      valid: errors.length === 0,
      errors,
      strength
    };
  }

  hashPassword(password: string): string {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, hash: string): boolean {
    const [salt, originalHash] = hash.split(':');
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash), Buffer.from(computedHash));
  }

  generateStrongPassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = SPECIAL_CHARS;
    const allChars = uppercase + lowercase + numbers + special;

    let password = '';
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    while (password.length < length) {
      password += allChars[crypto.randomInt(allChars.length)];
    }

    const shuffled = password.split('').sort(() => crypto.randomInt(3) - 1).join('');

    logger.info('Strong password generated', {
      length: shuffled.length,
      hasUppercase: /[A-Z]/.test(shuffled),
      hasLowercase: /[a-z]/.test(shuffled),
      hasNumber: /[0-9]/.test(shuffled),
      hasSpecial: new RegExp(`[${SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(shuffled)
    });

    return shuffled;
  }

  validateSecurity(password: string): SecurityAssessment {
    const assessment = this.validatePassword(password);
    const score = this.calculateSecurityScore(password);
    const feedback: string[] = [];
    const suggestions: string[] = [];

    if (assessment.errors.length > 0) {
      feedback.push(...assessment.errors);
    }

    if (score < 40) {
      suggestions.push('Consider using a longer password');
      suggestions.push('Add uppercase and lowercase letters');
      suggestions.push('Include numbers and special characters');
    } else if (score < 70) {
      suggestions.push('Consider adding more special characters');
      suggestions.push('Increase password length for better security');
    }

    if (/^[a-zA-Z]+$/.test(password)) {
      suggestions.push('Add numbers to increase complexity');
    }

    if (/^[0-9]+$/.test(password)) {
      suggestions.push('Add letters to increase complexity');
    }

    const hasCommonPattern = COMMON_PASSWORDS.some(common => 
      password.toLowerCase().includes(common) || 
      password.toLowerCase() === common
    );
    if (hasCommonPattern) {
      suggestions.push('Avoid common passwords or patterns');
    }

    logger.debug('Security assessment completed', {
      score,
      feedbackCount: feedback.length,
      suggestionCount: suggestions.length
    });

    return {
      score,
      feedback,
      suggestions
    };
  }

  private calculateStrength(password: string): PasswordStrength {
    const score = this.calculateSecurityScore(password);

    if (score >= 80) return 'strong';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'weak';
  }

  private calculateSecurityScore(password: string): number {
    let score = 0;
    const length = password.length;

    score += Math.min(length * 4, 40);

    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (new RegExp(`[${SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) score += 15;

    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 20);

    if (/^[a-zA-Z]+$/.test(password)) score -= 10;
    if (/^[0-9]+$/.test(password)) score -= 15;
    if (/^(.)\1{2,}/.test(password)) score -= 10;

    if (COMMON_PASSWORDS.some(common => password.toLowerCase().includes(common))) {
      score -= 30;
    }

    return Math.max(0, Math.min(100, score));
  }
}

export const passwordManager = new PasswordManager();
export { PASSWORD_REQUIREMENTS, COMMON_PASSWORDS, SPECIAL_CHARS };
