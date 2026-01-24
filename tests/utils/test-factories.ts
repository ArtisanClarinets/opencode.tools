/**
 * Test Data Factories for OpenCode Tools
 * 
 * Provides factory functions to create consistent, valid test data
 * for all agents and components.
 */

import { ResearchInput, ResearchOutput, ClientBrief, Source, ProvenanceMeta } from '../../agents/research/types';
import { IAgent, BacklogItem, ProjectScaffoldResult } from '../../agents/types';

// ====================
// Research Agent Factories
// ====================

export class ResearchInputFactory {
  static createValidInput(overrides?: Partial<ResearchInput>): ResearchInput {
    return {
      brief: {
        company: 'TechCorp',
        industry: 'FinTech',
        description: 'A fintech company specializing in payment processing solutions for small businesses',
        goals: ['Increase market share', 'Improve user experience', 'Expand to new markets'],
        constraints: ['Regulatory compliance', 'Security requirements', 'Budget limitations'],
        timeline: '6 months'
      },
      keywords: ['fintech', 'payments', 'small business', 'SaaS'],
      urls: ['https://techcorp.com', 'https://techcorp.com/about'],
      priorNotes: 'Previous research indicates strong growth potential in the SMB market',
      ...overrides
    };
  }

  static createMinimalInput(overrides?: Partial<ResearchInput>): ResearchInput {
    return {
      brief: {
        company: 'StartupX',
        industry: 'Technology',
        description: 'A technology startup',
        goals: ['Growth'],
        timeline: '1 year'
      },
      ...overrides
    };
  }

  static createInvalidInput(): ResearchInput {
    return {
      brief: {
        company: '',
        industry: '',
        description: '',
        goals: [],
        timeline: ''
      }
    } as ResearchInput;
  }

  static createFintechInput(): ResearchInput {
    return this.createValidInput({
      brief: {
        company: 'PayFlow',
        industry: 'FinTech',
        description: 'Mobile payment processing platform for small merchants',
        goals: ['Reduce transaction fees', 'Improve settlement speed', 'Expand internationally'],
        constraints: ['PCI compliance', 'Banking regulations', 'Fraud prevention'],
        timeline: '9 months'
      },
      keywords: ['payments', 'mobile', 'merchants', 'fintech']
    });
  }

  static createHealthcareInput(): ResearchInput {
    return this.createValidInput({
      brief: {
        company: 'HealthTech Solutions',
        industry: 'Healthcare Technology',
        description: 'AI-powered diagnostic tools for rural healthcare providers',
        goals: ['Improve diagnostic accuracy', 'Reduce costs', 'Expand access'],
        constraints: ['HIPAA compliance', 'FDA approval', 'Data privacy'],
        timeline: '12 months'
      },
      keywords: ['healthcare', 'AI', 'diagnostics', 'rural']
    });
  }
}

export class ResearchOutputFactory {
  static createValidOutput(overrides?: Partial<ResearchOutput>): ResearchOutput {
    return {
      dossier: {
        companySummary: 'TechCorp operates in the FinTech industry, specializing in payment processing solutions for small businesses. The company has shown consistent growth and aims to expand its market presence.',
        industryOverview: 'The fintech industry is experiencing rapid growth with increasing adoption of digital payment solutions. Key trends include mobile-first approaches and AI-powered fraud detection.',
        competitors: [
          {
            name: 'Square',
            url: 'https://squareup.com',
            differentiation: 'Market leader with comprehensive POS solutions',
            marketPosition: 'Dominant player'
          },
          {
            name: 'Stripe',
            url: 'https://stripe.com',
            differentiation: 'Developer-focused with robust API',
            marketPosition: 'Strong competitor'
          }
        ],
        techStack: {
          frontend: ['React', 'TypeScript'],
          backend: ['Node.js', 'Python', 'PostgreSQL'],
          infrastructure: ['AWS', 'Docker', 'Kubernetes'],
          thirdParty: ['Stripe API', 'SendGrid', 'Auth0']
        },
        risks: [
          'High regulatory requirements in fintech space',
          'Intense competition from established players',
          'Technical complexity of payment processing'
        ],
        opportunities: [
          'Growing SMB market adoption of digital payments',
          'International expansion opportunities',
          'AI-powered fraud detection capabilities'
        ],
        recommendations: [
          'Focus on regulatory compliance as a competitive advantage',
          'Develop strong partnerships with financial institutions',
          'Invest in AI/ML capabilities for fraud prevention'
        ]
      },
      sources: [
        {
          url: 'https://fintech-industry-report.com',
          title: 'FinTech Industry Analysis 2024',
          relevance: 'High',
          accessedAt: new Date().toISOString()
        },
        {
          url: 'https://payment-processing-market.com',
          title: 'Payment Processing Market Trends',
          relevance: 'High',
          accessedAt: new Date().toISOString()
        }
      ],
      meta: {
        agent: 'research-agent',
        promptVersion: 'v1',
        mcpVersion: 'v1',
        timestamp: new Date().toISOString(),
        runId: `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      ...overrides
    };
  }

  static createMinimalOutput(): ResearchOutput {
    return {
      dossier: {
        companySummary: 'A technology company',
        industryOverview: 'The technology industry',
        competitors: [],
        techStack: {},
        risks: [],
        opportunities: [],
        recommendations: []
      },
      sources: [],
      meta: {
        agent: 'research-agent',
        promptVersion: 'v1',
        mcpVersion: 'v1',
        timestamp: new Date().toISOString(),
        runId: `research-${Date.now()}`
      }
    };
  }
}

// ====================
// CodeGen Agent Factories
// ====================

export class BacklogItemFactory {
  static createValidItem(overrides?: Partial<BacklogItem>): BacklogItem {
    return {
      id: 'FEAT-001',
      title: 'User Authentication System',
      description: 'Implement secure user authentication with JWT tokens, password hashing, and multi-factor authentication support',
      techStack: 'Node.js/TypeScript/PostgreSQL/JWT',
      ...overrides
    };
  }

  static createApiItem(): BacklogItem {
    return this.createValidItem({
      id: 'API-001',
      title: 'REST API for User Management',
      description: 'Build RESTful API endpoints for user CRUD operations with proper validation and error handling',
      techStack: 'Node.js/Express/TypeScript/Prisma'
    });
  }

  static createFrontendItem(): BacklogItem {
    return this.createValidItem({
      id: 'UI-001',
      title: 'Responsive Dashboard Interface',
      description: 'Create responsive dashboard with React, TypeScript, and Material-UI for data visualization',
      techStack: 'React/TypeScript/Material-UI/D3.js'
    });
  }
}

export class ProjectScaffoldResultFactory {
  static createValidResult(overrides?: Partial<ProjectScaffoldResult>): ProjectScaffoldResult {
    return {
      success: true,
      log: `Project scaffolded successfully
Created project structure
Initialized git repository
Installed dependencies
Generated initial test suite`,
      filesCreated: [
        'package.json',
        'tsconfig.json',
        'src/index.ts',
        'src/controllers/user.controller.ts',
        'src/services/user.service.ts',
        'src/models/user.model.ts',
        'tests/user.test.ts',
        '.gitignore',
        'README.md'
      ],
      ...overrides
    };
  }

  static createFailureResult(): ProjectScaffoldResult {
    return {
      success: false,
      log: 'Failed to scaffold project: Invalid tech stack specified',
      filesCreated: []
    };
  }
}

// ====================
// QA Agent Factories
// ====================

export class TestCaseFactory {
  static createValidTestCase(overrides?: Partial<TestCase>): TestCase {
    return {
      id: 'TC-001',
      title: 'User registration with valid data',
      description: 'Verify that a user can successfully register with valid input data',
      priority: 'High',
      type: 'Unit',
      acceptanceCriteria: [
        'User is created successfully in database',
        'Password is properly hashed',
        'Confirmation email is sent',
        'User receives success response'
      ],
      ...overrides
    };
  }

  static createSecurityTestCase(): TestCase {
    return this.createValidTestCase({
      id: 'SEC-001',
      title: 'Prevent SQL injection in user search',
      description: 'Verify that user search functionality is protected against SQL injection attacks',
      priority: 'High',
      type: 'Security',
      acceptanceCriteria: [
        'Malicious SQL input is properly sanitized',
        'Database remains secure',
        'Appropriate error is returned'
      ]
    });
  }

  static createPerformanceTestCase(): TestCase {
    return this.createValidTestCase({
      id: 'PERF-001',
      title: 'User search response time under load',
      description: 'Verify that user search functionality responds within acceptable time limits under concurrent load',
      priority: 'Medium',
      type: 'Performance',
      acceptanceCriteria: [
        'Response time < 200ms for 95th percentile',
        'System handles 1000 concurrent users',
        'No memory leaks detected'
      ]
    });
  }
}

// ====================
// Common Test Data
// ====================

export const MockCompanies = {
  fintech: {
    name: 'PayFlow Technologies',
    industry: 'FinTech',
    description: 'Mobile payment processing for small businesses'
  },
  healthcare: {
    name: 'HealthTech Solutions',
    industry: 'Healthcare Technology',
    description: 'AI-powered diagnostic tools for healthcare providers'
  },
  ecommerce: {
    name: 'ShopEZ',
    industry: 'E-commerce',
    description: 'AI-powered personalization for online retailers'
  },
  education: {
    name: 'EduTech Pro',
    industry: 'Education Technology',
    description: 'Online learning platform with AI tutoring'
  }
};

export const MockIndustries = {
  fintech: {
    trends: ['Digital payments', 'AI fraud detection', 'Mobile-first', 'RegTech'],
    growth: '15% annually',
    challenges: ['Regulatory compliance', 'Security threats', 'Legacy systems']
  },
  healthcare: {
    trends: ['AI diagnostics', 'Telemedicine', 'Wearable devices', 'Personalized medicine'],
    growth: '12% annually',
    challenges: ['HIPAA compliance', 'Integration complexity', 'Cost pressures']
  }
};

export const MockTechnologies = {
  modernStack: {
    frontend: ['React', 'Vue.js', 'Angular', 'Next.js'],
    backend: ['Node.js', 'Python', 'Go', 'Java'],
    database: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
    infrastructure: ['AWS', 'Docker', 'Kubernetes', 'Terraform']
  },
  legacyStack: {
    frontend: ['jQuery', 'AngularJS'],
    backend: ['PHP', 'Ruby', 'Java EE'],
    database: ['MySQL', 'Oracle'],
    infrastructure: ['On-premise', 'VMware']
  }
};

// ====================
// Validation Helpers
// ====================

export const ValidationHelpers = {
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidISODate: (date: string): boolean => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    return isoDateRegex.test(date) && !isNaN(Date.parse(date));
  },

  isValidRunId: (runId: string): boolean => {
    return /^research-\d+-[a-z0-9]{9}$/.test(runId);
  }
};

// ====================
// Test Setup Helpers
// ====================

export class TestSetupHelpers {
  static setupMockWebfetch() {
    return {
      success: jest.fn().mockResolvedValue({
        content: 'Mock web content with relevant industry information',
        url: 'https://example.com',
        success: true
      }),
      failure: jest.fn().mockRejectedValue(new Error('Service unavailable'))
    };
  }

  static setupMockEnvironment() {
    process.env.NODE_ENV = 'test';
    process.env.TEST_MODE = 'true';
  }

  static cleanupMocks() {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  }
}

export default {
  ResearchInputFactory,
  ResearchOutputFactory,
  BacklogItemFactory,
  ProjectScaffoldResultFactory,
  TestCaseFactory,
  MockCompanies,
  MockIndustries,
  MockTechnologies,
  ValidationHelpers,
  TestSetupHelpers
};