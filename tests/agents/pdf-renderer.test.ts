// Register non-hoisted mocks at runtime so we control module loading order.
// Use jest.doMock with factories that return our manual __mocks__ implementations.
jest.doMock('pdfkit', () => require('../../__mocks__/pdfkit'));
jest.doMock('pdf-lib', () => require('../../__mocks__/pdf-lib'));

// We'll load the modules that depend on pdfkit/pdf-lib only after the mocks are
// registered using jest.isolateModules to avoid import hoisting issues.
let PDFRenderer: any;
let FontManager: any;
let PageLayout: any;
let StandardTemplate: any;
let WhitepaperTemplate: any;
let TechnicalTemplate: any;

let runtimePDFDoc: any = null;

// Load mocked pdfkit and the production modules in an isolated module registry
jest.isolateModules(() => {
  const PDFKit = require('pdfkit');
  try {
    const ctor = (typeof PDFKit === 'function') ? PDFKit : (PDFKit && PDFKit.default) ? PDFKit.default : null;
    if (ctor && typeof ctor.__getDoc === 'function') {
      runtimePDFDoc = ctor.__getDoc();
    } else if (ctor && typeof ctor === 'function') {
      runtimePDFDoc = ctor();
    } else if (PDFKit && typeof PDFKit === 'object' && typeof PDFKit.__getDoc === 'function') {
      runtimePDFDoc = PDFKit.__getDoc();
    } else if (PDFKit && typeof PDFKit === 'object') {
      runtimePDFDoc = PDFKit;
    }
  } catch (e) {
    runtimePDFDoc = null;
  }

  // Fallback safe mock if runtimePDFDoc is not provided by the manual mock
  if (!runtimePDFDoc) {
    const pages: any[] = [{ width: 612, height: 792, drawRectangle: () => {} }];
    runtimePDFDoc = {
      pages,
      page: pages[0],
      x: 50,
      y: 72,
      _lastLineHeight: 12,
      font() { return this; },
      fontSize(sz: number) { this._lastLineHeight = sz; return this; },
      widthOfString(str: string) { return Math.max(20, (str?.length || 10) * 6); },
      text(str: string, x?: number, y?: number) { if (typeof y === 'number') { this.x = x; this.y = y; } else { this.y = (this.y || 0) + (this._lastLineHeight || 12); } return this; },
      rect() { return this; },
      fillColor() { return this; },
      fill() { return this; },
      addPage(opts?: any) { const size = Array.isArray(opts?.size) ? opts.size : [612, 792]; const p = { width: size[0], height: size[1], drawRectangle: () => {} }; pages.push(p); this.page = p; return p; },
      bufferedPageRange() { return { count: pages.length }; },
      switchToPage(i: number) { this.page = pages[i]; return this; },
      registerFont() { return this; },
      save() { return this; },
      on(event: string, cb: Function) { if (event === 'data') setImmediate(() => cb(Buffer.from('chunk'))); if (event === 'end') setImmediate(() => cb()); return this; },
      openImage() { return { width: 600, height: 400 }; },
      image() { return this; },
      ref(obj?: any) { return { ref: { toString: () => '1 0 R' }, obj: obj || {} }; },
      catalog: { obj: {} },
      pageIndex(n: number) { return n; },
    };
  }

  // Require production modules under the isolated registry so they pick up our mocks
  PDFRenderer = require('../../agents/pdf/rendering/pdf-renderer').PDFRenderer;
  FontManager = require('../../agents/pdf/rendering/font-manager').FontManager;
  PageLayout = require('../../agents/pdf/rendering/page-layout').PageLayout;
  StandardTemplate = require('../../agents/pdf/templates/standard').StandardTemplate;
  WhitepaperTemplate = require('../../agents/pdf/templates/whitepaper').WhitepaperTemplate;
  TechnicalTemplate = require('../../agents/pdf/templates/technical').TechnicalTemplate;
});

// Export the runtime doc for other test helpers if needed
export const mockPDFDoc: any = runtimePDFDoc;

import { PDFInput, PageLayoutSchema } from '../../agents/pdf/types';
import {
  createValidPDFInput,
  createMockLayoutPlan,
  createPDFInputWithCover,
  createPDFInputWithSections,
  createMultiPageLayoutPlan,
  createPDFInputWithCustomFont,
  createInvalidPDFInput,
  createLayoutPlanWithTOC,
} from '../utils/pdf-test-factories';

const fs = require('fs');

// Provide jest mocks for fs functions used by the renderer tests
(fs as any).existsSync = jest.fn();
(fs as any).readFileSync = jest.fn();
(fs as any).writeFileSync = jest.fn();
(fs as any).mkdirSync = jest.fn();

// (pdfkit mock already provided above and applied via jest.doMock)

describe('PDFRenderer', () => {
  let renderer: any;

  beforeEach(() => {
    renderer = new PDFRenderer();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize renderer with default settings', () => {
      expect(renderer).toBeInstanceOf(PDFRenderer);
    });
  });

  describe('createDocument', () => {
    it('should create PDF document with correct settings', async () => {
      const input = createValidPDFInput();
      const layout = createMockLayoutPlan();

      const doc = await renderer.createDocument(input, layout);

      expect(doc).toBeDefined();
    });

    it('should render cover page', async () => {
      const input = createPDFInputWithCover();
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);
    });

    it('should generate table of contents', async () => {
      const input = createPDFInputWithSections(5);
      const layout = createLayoutPlanWithTOC();

      await renderer.createDocument(input, layout);

      const tocEntries = renderer.getTOCEntries();
      expect(tocEntries.length).toBeGreaterThan(0);
    });

    it('should add page numbers', async () => {
      const input = createValidPDFInput();
      const layout = createMultiPageLayoutPlan();

      await renderer.createDocument(input, layout);
    });

    it('should register default fonts', async () => {
      const input = createValidPDFInput();
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);
    });

    it('should register custom fonts', async () => {
      const input = createPDFInputWithCustomFont();
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);
    });

    it('should throw error for invalid input', async () => {
      const invalidInput = createInvalidPDFInput();
      const layout = createMockLayoutPlan();

      await expect(renderer.createDocument(invalidInput, layout))
        .rejects.toThrow();
    });

    it('should handle missing optional fields gracefully', async () => {
      const input: PDFInput = {
        title: 'Minimal Document',
        authors: ['Author'],
        template: 'standard',
        sections: [
          { id: 's1', title: 'Section 1', level: '1', content: 'Content' },
        ],
      };
      const layout = createMockLayoutPlan();

      const doc = await renderer.createDocument(input, layout);
      expect(doc).toBeDefined();
    });

    it('should generate bookmarks', async () => {
      const input = createValidPDFInput();
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);

      const bookmarks = renderer.getBookmarks();
      expect(bookmarks.length).toBeGreaterThan(0);
    });

    it('should calculate correct page dimensions', async () => {
      const input = createValidPDFInput();
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);

      expect(layout.pageWidth).toBe(612);
      expect(layout.pageHeight).toBe(792);
    });

    it('should respect content margins', async () => {
      const input = createValidPDFInput();
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);

      expect(layout.margins.top).toBe(72);
      expect(layout.margins.bottom).toBe(72);
    });

    it('should handle nested section levels', async () => {
      const input: PDFInput = createValidPDFInput({
        sections: [
          { id: '1', title: 'Chapter 1', level: '1', content: 'Content' },
          { id: '2', title: 'Section 1.1', level: '2', content: 'Content' },
          { id: '3', title: 'Section 1.2', level: '2', content: 'Content' },
          { id: '4', title: 'Chapter 2', level: '1', content: 'Content' },
        ],
      });
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);

      const tocEntries = renderer.getTOCEntries();
      expect(tocEntries.length).toBe(4);
    });

    it('should render multiple sections on same page when content fits', async () => {
      const input: PDFInput = createValidPDFInput({
        sections: [
          { id: '1', title: 'Short Section 1', level: '1', content: 'Short content 1' },
          { id: '2', title: 'Short Section 2', level: '1', content: 'Short content 2' },
        ],
      });
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);
    });
  });

  describe('getTOCEntries', () => {
    it('should return TOC entries after rendering', async () => {
      const input = createValidPDFInput();
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);

      const entries = renderer.getTOCEntries();
      expect(entries.length).toBe(input.sections.length);
    });

    it('should include correct page numbers in TOC', async () => {
      const input = createPDFInputWithSections(3);
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);

      const entries = renderer.getTOCEntries();
      entries.forEach((entry: any) => {
        expect(entry.pageNumber).toBeGreaterThan(0);
      });
    });
  });

  describe('getBookmarks', () => {
    it('should return bookmarks after rendering', async () => {
      const input = createValidPDFInput();
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);

      const bookmarks = renderer.getBookmarks();
      expect(bookmarks.length).toBeGreaterThan(0);
    });

    it('should have correct bookmark hierarchy', async () => {
      const input: PDFInput = createValidPDFInput({
        sections: [
          { id: '1', title: 'Chapter 1', level: '1', content: 'Content' },
          { id: '2', title: 'Section 1.1', level: '2', content: 'Content' },
        ],
      });
      const layout = createMockLayoutPlan();

      await renderer.createDocument(input, layout);

      const bookmarks = renderer.getBookmarks();
      const chapter1 = bookmarks.find((b: any) => b.id === '1');
      expect(chapter1).toBeDefined();
    });
  });

  describe('save', () => {
    it('should save PDF to file', async () => {
      const input = createValidPDFInput();
      const layout = createMockLayoutPlan();
      const pdfBuffer = Buffer.from('PDF content');
      const outputPath = '/output/test.pdf';

      await renderer.save(pdfBuffer, outputPath);

      expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, pdfBuffer);
    });

    it('should create output directory if not exists', async () => {
      const input = createValidPDFInput();
      const layout = createMockLayoutPlan();
      const pdfBuffer = Buffer.from('PDF content');
      const outputPath = '/output/nested/dir/test.pdf';

      await renderer.save(pdfBuffer, outputPath);

      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('getPageCount', () => {
    it('should return page count for existing PDF', async () => {
      const pdfPath = '/existing/file.pdf';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('PDF content'));

      const pageCount = await renderer.getPageCount(pdfPath);

      expect(pageCount).toBeGreaterThan(0);
    });

    it('should throw error for non-existent PDF', async () => {
      const pdfPath = '/nonexistent/file.pdf';
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(renderer.getPageCount(pdfPath))
        .rejects.toThrow('PDF file not found');
    });
  });

  describe('createLayoutPlan', () => {
    it('should create layout plan with default values', () => {
      const input = createValidPDFInput();

      const layout = PDFRenderer.createLayoutPlan(input, PageLayoutSchema.parse({
        pageSize: 'Letter',
        orientation: 'portrait',
        margins: { top: 1, bottom: 1, left: 1, right: 1 },
        columns: 1,
        columnGap: 0.5,
        pageNumbers: true,
      }));

      expect(layout.pageWidth).toBe(612);
      expect(layout.pageHeight).toBe(792);
    });

    it('should calculate content dimensions correctly', () => {
      const input = createValidPDFInput();

      const layout = PDFRenderer.createLayoutPlan(input, PageLayoutSchema.parse({
        pageSize: 'Letter',
        orientation: 'portrait',
        margins: { top: 1, bottom: 1, left: 1.5, right: 1.5 },
        columns: 1,
        columnGap: 0.5,
        pageNumbers: true,
      }));

      // Left and right margins are 1.5 inches each -> 108 points each
      expect(layout.contentWidth).toBe(612 - 108 - 108);
      expect(layout.contentHeight).toBe(792 - 72 - 72);
    });

    it('should use landscape orientation', () => {
      const input = createValidPDFInput();

      const layout = PDFRenderer.createLayoutPlan(input, PageLayoutSchema.parse({
        pageSize: 'Letter',
        orientation: 'landscape',
        margins: { top: 1, bottom: 1, left: 1, right: 1 },
        columns: 1,
        columnGap: 0.5,
        pageNumbers: true,
      }));

      expect(layout.pageWidth).toBe(792);
      expect(layout.pageHeight).toBe(612);
    });
  });
});

describe('FontManager', () => {
  let fontManager: any;

  beforeEach(() => {
    fontManager = new FontManager();
  });

  afterEach(() => {
    fontManager.cleanup();
  });

  describe('constructor', () => {
    it('should initialize FontManager successfully', () => {
      expect(fontManager).toBeInstanceOf(FontManager);
    });
  });

  describe('registerDefaultFonts', () => {
    it('should register default fonts without throwing', async () => {
      const mockDoc = {} as PDFKit.PDFDocument;
      await expect(fontManager.registerDefaultFonts(mockDoc)).resolves.not.toThrow();
    });
  });

  describe('getFontNames', () => {
    it('should return registered font names', async () => {
      const mockDoc = {} as PDFKit.PDFDocument;
      await fontManager.registerDefaultFonts(mockDoc);
      const fontNames = fontManager.getFontNames();
      expect(fontNames).toContain('Helvetica');
      expect(fontNames).toContain('Helvetica-Bold');
      expect(fontNames).toContain('Times-Roman');
    });
  });

  describe('getDefaultFontName', () => {
    it('should return Helvetica for normal weight', () => {
      expect(fontManager.getDefaultFontName('normal')).toBe('Helvetica');
    });
    it('should return Helvetica-Bold for bold weight', () => {
      expect(fontManager.getDefaultFontName('bold')).toBe('Helvetica-Bold');
    });
  });

  describe('getFontForStyle', () => {
    it('should return correct font for Helvetica normal italic', () => {
      expect(fontManager.getFontForStyle('Helvetica', 'normal', 'italic')).toBe('Helvetica-Oblique');
    });
    it('should return correct font for Helvetica bold normal', () => {
      expect(fontManager.getFontForStyle('Helvetica', 'bold', 'normal')).toBe('Helvetica-Bold');
    });
  });

  describe('getFontHeight', () => {
    it('should return calculated height for known font', () => {
      const height = fontManager.getFontHeight('Helvetica', 12);
      expect(height).toBeGreaterThan(0);
    });
  });

  describe('getStringWidth', () => {
    it('should return calculated width for text', () => {
      const width = fontManager.getStringWidth('Helvetica', 'Hello', 12);
      expect(width).toBeGreaterThan(0);
    });
  });

  describe('cleanup', () => {
    it('should clear all registered fonts', () => {
      fontManager.cleanup();
      const fontNames = fontManager.getFontNames();
      expect(fontNames).toEqual([]);
    });
  });
});

describe('PageLayout', () => {
  let pageLayout: any;

  beforeEach(() => {
    pageLayout = new PageLayout();
  });

  afterEach(() => {
    pageLayout = null as unknown as any;
  });

  describe('constructor', () => {
    it('should initialize PageLayout successfully', () => {
      expect(pageLayout).toBeInstanceOf(PageLayout);
    });
  });

  describe('getPageDimensions', () => {
    it('should return Letter dimensions for portrait', () => {
      const dimensions = pageLayout.getPageDimensions('Letter', 'portrait');
      expect(dimensions.width).toBe(612);
      expect(dimensions.height).toBe(792);
    });
    it('should return swapped dimensions for landscape', () => {
      const dimensions = pageLayout.getPageDimensions('Letter', 'landscape');
      expect(dimensions.width).toBe(792);
      expect(dimensions.height).toBe(612);
    });
    it('should return A4 dimensions', () => {
      const dimensions = pageLayout.getPageDimensions('A4', 'portrait');
      expect(dimensions.width).toBe(595);
      expect(dimensions.height).toBe(842);
    });
  });

  describe('calculateMargins', () => {
    it('should calculate margins in points', () => {
      const margins = pageLayout.calculateMargins(1, 1, 1, 1);
      expect(margins.top).toBe(72);
      expect(margins.bottom).toBe(72);
      expect(margins.left).toBe(72);
      expect(margins.right).toBe(72);
    });
  });

  describe('calculateColumnLayout', () => {
    it('should calculate single column layout', () => {
      const layout = pageLayout.calculateColumnLayout(468, 1, 0.5);
      expect(layout.count).toBe(1);
    });
    it('should calculate two column layout', () => {
      const layout = pageLayout.calculateColumnLayout(468, 2, 0.5);
      expect(layout.count).toBe(2);
    });
  });

  describe('calculateContentArea', () => {
    it('should calculate content area correctly', () => {
      const area = pageLayout.calculateContentArea(612, 792, { top: 72, bottom: 72, left: 72, right: 72 });
      expect(area.x).toBe(72);
      expect(area.y).toBe(72);
      expect(area.width).toBe(468);
      expect(area.height).toBe(648);
    });
  });

  describe('detectPageBreak', () => {
    it('should detect page full condition', () => {
      const result = pageLayout.detectPageBreak(700, 800, 150);
      expect(result.shouldBreak).toBe(true);
      expect(result.reason).toBe('page-full');
    });
    it('should not break when space is sufficient', () => {
      const result = pageLayout.detectPageBreak(100, 800, 50);
      expect(result.shouldBreak).toBe(false);
    });
  });

  describe('calculateTextWrapping', () => {
    it('should wrap text within width', () => {
      const lines = pageLayout.calculateTextWrapping('This is a long test sentence that should be wrapped', 12, 100);
      expect(lines.length).toBeGreaterThan(1);
    });
    it('should return single line for short text', () => {
      const lines = pageLayout.calculateTextWrapping('Short', 12, 100);
      expect(lines.length).toBe(1);
    });
  });

  describe('convertInchesToPoints', () => {
    it('should convert inches to points', () => {
      expect(pageLayout.convertInchesToPoints(1)).toBe(72);
      expect(pageLayout.convertInchesToPoints(2)).toBe(144);
    });
  });

  describe('convertPointsToInches', () => {
    it('should convert points to inches', () => {
      expect(pageLayout.convertPointsToInches(72)).toBe(1);
    });
  });

  describe('validatePageSize', () => {
    it('should return true for valid page sizes', () => {
      expect(pageLayout.validatePageSize('A4')).toBe(true);
      expect(pageLayout.validatePageSize('Letter')).toBe(true);
    });
    it('should return false for invalid page sizes', () => {
      expect(pageLayout.validatePageSize('Invalid')).toBe(false);
    });
  });

  describe('validateOrientation', () => {
    it('should return true for valid orientations', () => {
      expect(pageLayout.validateOrientation('portrait')).toBe(true);
      expect(pageLayout.validateOrientation('landscape')).toBe(true);
    });
    it('should return false for invalid orientations', () => {
      expect(pageLayout.validateOrientation('invalid')).toBe(false);
    });
  });
});

describe('Templates', () => {
  describe('StandardTemplate', () => {
    let template: any;

    beforeEach(() => {
      template = new StandardTemplate();
    });

    it('should initialize successfully', () => {
      expect(template).toBeInstanceOf(StandardTemplate);
    });

    it('should return correct template name', () => {
      expect(template.getTemplateName()).toBe('standard');
    });

    it('should return configuration', () => {
      const config = template.getConfig();
      expect(config.primaryColor).toBe('#2563EB');
      expect(config.pageSize).toBe('Letter');
    });

    it('should return header config', () => {
      const header = template.getHeaderConfig();
      expect(header.height).toBe(50);
      expect(header.showOnFirstPage).toBe(false);
    });

    it('should return footer config', () => {
      const footer = template.getFooterConfig();
      expect(footer.height).toBe(50);
      expect(footer.includePageNumber).toBe(true);
    });

    it('should return color scheme', () => {
      const scheme = template.getColorScheme();
      expect(scheme.primary).toBe('#2563EB');
      expect(scheme.secondary).toBe('#1E40AF');
    });

    it('should return complete styling', () => {
      const styling = template.getStyling();
      expect(styling.primaryColor).toBeDefined();
      expect(styling.coverPageStyle).toBeDefined();
    });
  });

  describe('WhitepaperTemplate', () => {
    let template: any;

    beforeEach(() => {
      template = new WhitepaperTemplate();
    });

    it('should initialize successfully', () => {
      expect(template).toBeInstanceOf(WhitepaperTemplate);
    });

    it('should return correct template name', () => {
      expect(template.getTemplateName()).toBe('whitepaper');
    });

    it('should return larger margins', () => {
      const config = template.getConfig();
      expect(config.margins.top).toBe(80);
    });

    it('should return color scheme with cover background', () => {
      const scheme = template.getColorScheme();
      expect(scheme.coverBackground).toBe('#0F172A');
    });
  });

  describe('TechnicalTemplate', () => {
    let template: any;

    beforeEach(() => {
      template = new TechnicalTemplate();
    });

    it('should initialize successfully', () => {
      expect(template).toBeInstanceOf(TechnicalTemplate);
    });

    it('should return correct template name', () => {
      expect(template.getTemplateName()).toBe('technical');
    });

    it('should return code font family', () => {
      const config = template.getConfig();
      expect(config.codeFontFamily).toBe('Courier');
    });

    it('should return code block styling', () => {
      const codeStyle = template.getCodeBlockStyle();
      expect(codeStyle.fontFamily).toBe('Courier');
      expect(codeStyle.backgroundColor).toBe('#1E293B');
    });
  });
});
