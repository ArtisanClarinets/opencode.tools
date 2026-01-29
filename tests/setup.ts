// Test setup
import { jest } from '@jest/globals';

// Mock console methods to reduce noise in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).testUtils = {
  createMockBrief: () => ({
    company: 'TestCorp',
    industry: 'Test Industry',
    description: 'A test company for unit testing',
    goals: ['Goal 1', 'Goal 2', 'Goal 3'],
    constraints: ['Constraint 1', 'Constraint 2'],
    timeline: '6 months'
  }),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createMockResearchInput: () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    brief: (global as any).testUtils.createMockBrief(),
    keywords: ['test', 'mock', 'unit'],
    urls: ['https://example.com'],
    priorNotes: 'Previous research notes'
  })
};