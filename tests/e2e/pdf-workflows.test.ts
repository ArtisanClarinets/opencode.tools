import { PDFGeneratorAgent } from '../../agents/pdf/pdf-agent';
import {
  createCompletePDFInput,
  createBatchPDFInputs,
  convertToWhitepaperInput,
  loadTemplate,
  loadClientData,
  mergeTemplateAndData,
  createMockDatabase,
  createMockAuditService,
} from '../utils/pdf-test-factories';

describe('PDF Generator E2E Workflows', () => {
  describe('Whitepaper Generation', () => {
    it('should generate complete whitepaper from research dossier', async () => {
      const researchResult = {
        dossier: {
          companySummary: 'TechCorp is a leading technology company specializing in AI solutions.',
          industryOverview: 'The AI industry is growing rapidly with increasing adoption.',
        },
      };
      
      const pdfInput = convertToWhitepaperInput(researchResult);
      
      const agent = new PDFGeneratorAgent();
      const result = await agent.execute(pdfInput);
      
      expect(result).toBeDefined();
      expect(result.documentPath).toBeDefined();
      expect(result.metadata.pageCount).toBeGreaterThan(0);
    });
  });

  describe('Client Documentation', () => {
    it('should generate client documentation from templates', async () => {
      const template = loadTemplate('client-proposal');
      const clientData = loadClientData('client-123');
      const pdfInput = mergeTemplateAndData(template, clientData);
      
      const agent = new PDFGeneratorAgent();
      const result = await agent.execute(pdfInput);
      
      expect(result).toBeDefined();
      expect(result.metadata.title).toContain('Client Corporation');
    });
  });

  describe('Batch Generation', () => {
    it('should generate multiple PDFs in batch', async () => {
      const inputs = createBatchPDFInputs(10);
      const results = [];
      
      const agent = new PDFGeneratorAgent();
      
      for (const input of inputs) {
        const result = await agent.execute(input);
        results.push(result);
      }
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    it('should handle batch with performance constraints', async () => {
      const inputs = createBatchPDFInputs(5);
      const startTime = Date.now();
      
      const agent = new PDFGeneratorAgent();
      
      for (const input of inputs) {
        await agent.execute(input);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(120000);
    });
  });

  describe('Complete Document Workflow', () => {
    it('should generate comprehensive technical document', async () => {
      const input = createCompletePDFInput();
      
      const agent = new PDFGeneratorAgent();
      const result = await agent.execute(input);
      
      expect(result).toBeDefined();
      expect(result.documentPath).toBeDefined();
      expect(result.metadata.fileSize).toBeGreaterThan(0);
      expect(result.tocEntries.length).toBeGreaterThan(0);
      expect(result.bookmarks.length).toBeGreaterThan(0);
      expect(result.meta.agent).toBe('pdf-generator-agent');
    });

    it('should generate document with security features', async () => {
      const input = createCompletePDFInput();
      input.security = {
        encrypt: true,
        userPassword: 'SecureP@ss123!',
        ownerPassword: 'OwnerSecure!456',
        encryptionLevel: '256',
      };
      
      const agent = new PDFGeneratorAgent();
      const result = await agent.execute(input);
      
      expect(result).toBeDefined();
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle missing optional components gracefully', async () => {
      const input = createCompletePDFInput();
      delete input.charts;
      delete input.diagrams;
      delete input.assets;
      
      const agent = new PDFGeneratorAgent();
      const result = await agent.execute(input);
      
      expect(result).toBeDefined();
    });

    it('should generate warnings for large documents', async () => {
      const input = createCompletePDFInput();
      input.charts = Array.from({ length: 15 }, (_, i) => ({
        id: `chart-${i}`,
        type: 'bar' as const,
        title: `Chart ${i}`,
        data: { 
          labels: ['A', 'B'], 
          datasets: [{ label: 'Data', data: [1, 2] }] 
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
        },
      }));
      
      const agent = new PDFGeneratorAgent();
      const result = await agent.execute(input);
      
      expect(result.warnings.some(w => w.includes('charts'))).toBe(true);
    });
  });
});
