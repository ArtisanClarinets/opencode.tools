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

// ====================
// Mock Implementations
// ====================

export {};
