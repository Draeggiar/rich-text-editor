import { cleanOfficeHtml, isOfficeHtml } from '../src/utils/officeHtmlTransform';

describe('Office HTML Transform Utilities', () => {
  describe('isOfficeHtml', () => {
    it('detects Office HTML with conditional comments', () => {
      const html = '<!--[if gte mso 9]><xml>content</xml><![endif]--><p>Test</p>';
      expect(isOfficeHtml(html)).toBe(true);
    });

    it('detects Office HTML with MSO classes', () => {
      const html = '<p class="MsoNormal">Test content</p>';
      expect(isOfficeHtml(html)).toBe(true);
    });

    it('detects Office HTML with mso- styles', () => {
      const html = '<p style="mso-line-height-alt: 12pt;">Test</p>';
      expect(isOfficeHtml(html)).toBe(true);
    });

    it('detects Office HTML with Word XML elements', () => {
      const html = '<p>Test <w:sdt>content</w:sdt></p>';
      expect(isOfficeHtml(html)).toBe(true);
    });

    it('detects Office HTML with VML elements', () => {
      const html = '<p>Test <v:shape>content</v:shape></p>';
      expect(isOfficeHtml(html)).toBe(true);
    });

    it('detects Office HTML with O:P elements', () => {
      const html = '<p>Test <o:p>content</o:p></p>';
      expect(isOfficeHtml(html)).toBe(true);
    });

    it('detects Office HTML with Microsoft Word generator', () => {
      const html = '<meta name="Generator" content="Microsoft Word 15">content';
      expect(isOfficeHtml(html)).toBe(true);
    });

    it('detects Office HTML with Office MIME types', () => {
      const html = '<meta content="application/vnd.ms-word">content';
      expect(isOfficeHtml(html)).toBe(true);
    });

    it('detects Office HTML with Office XML namespaces', () => {
      const html = '<xml xmlns:w="urn:schemas-microsoft-com:office:word">content</xml>';
      expect(isOfficeHtml(html)).toBe(true);
    });

    it('returns false for regular HTML', () => {
      const html = '<p>Regular <strong>HTML</strong> content</p>';
      expect(isOfficeHtml(html)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isOfficeHtml('')).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(isOfficeHtml(null as any)).toBe(false);
      expect(isOfficeHtml(undefined as any)).toBe(false);
    });
  });

  describe('cleanOfficeHtml', () => {
    beforeEach(() => {
      // Reset DOM
      document.body.innerHTML = '';
    });

    it('returns empty string for empty input', () => {
      expect(cleanOfficeHtml('')).toBe('');
      expect(cleanOfficeHtml(null as any)).toBe('');
      expect(cleanOfficeHtml(undefined as any)).toBe('');
    });

    it('removes MSO classes', () => {
      const html = '<p class="MsoNormal mso-style-name">Test content</p>';
      const cleaned = cleanOfficeHtml(html);
      
      expect(cleaned).not.toContain('MsoNormal');
      expect(cleaned).not.toContain('mso-style-name');
      expect(cleaned).toContain('Test content');
    });

    it('removes Office-specific attributes', () => {
      const html = `
        <p data-ccp-props='{"prop":"value"}' data-paste-markdown-skip="true" data-contrast="auto">
          Test content
        </p>
      `;
      const cleaned = cleanOfficeHtml(html);
      
      expect(cleaned).not.toContain('data-ccp-props');
      expect(cleaned).not.toContain('data-paste-markdown-skip');
      expect(cleaned).not.toContain('data-contrast');
      expect(cleaned).toContain('Test content');
    });

    it('preserves non-default colors', () => {
      const html = '<span style="color: rgb(255, 0, 0);">Red text</span>';
      const cleaned = cleanOfficeHtml(html);
      
      expect(cleaned).toContain('color: rgb(255, 0, 0)');
      expect(cleaned).toContain('Red text');
    });

    it('removes default black color', () => {
      const html = '<span style="color: rgb(0, 0, 0);">Black text</span>';
      const cleaned = cleanOfficeHtml(html);
      
      expect(cleaned).not.toContain('color: rgb(0, 0, 0)');
      expect(cleaned).toContain('Black text');
    });

    it('preserves background colors', () => {
      const html = '<span style="background-color: yellow;">Highlighted text</span>';
      const cleaned = cleanOfficeHtml(html);
      
      expect(cleaned).toContain('background-color: yellow');
      expect(cleaned).toContain('Highlighted text');
    });

    it('preserves custom font families', () => {
      const html = '<span style="font-family: \'Courier New\';">Monospace text</span>';
      const cleaned = cleanOfficeHtml(html);
      
      expect(cleaned).toContain('Courier New');
      expect(cleaned).toContain('Monospace text');
    });

    it('preserves valid font sizes', () => {
      const html = '<span style="font-size: 14px;">Sized text</span>';
      const cleaned = cleanOfficeHtml(html);
      
      expect(cleaned).toContain('font-size: 14px');
      expect(cleaned).toContain('Sized text');
    });

    it('removes empty elements', () => {
      const html = '<p>Content</p><p></p><div><span></span></div>';
      const cleaned = cleanOfficeHtml(html);
      
      expect(cleaned).toContain('<p>Content</p>');
      expect(cleaned).not.toContain('<p></p>');
    });

    it('converts divs to paragraphs when appropriate', () => {
      const html = '<div>Simple text content</div>';
      const cleaned = cleanOfficeHtml(html);
      
      expect(cleaned).toContain('<p>Simple text content</p>');
    });

    it('handles complex Office HTML structure', () => {
      const html = `
        <div class="WordSection1">
          <p class="MsoNormal" style="mso-line-height-alt: 12pt;">
            <span style="color: rgb(255, 0, 0);">Red text content</span>
          </p>
          <p class="MsoListParagraph" data-ccp-props='{"listId":1}'>
            <span>List item text</span>
          </p>
        </div>
      `;
      const cleaned = cleanOfficeHtml(html);
      
      // Should contain semantic content
      expect(cleaned).toContain('Red text content');
      expect(cleaned).toContain('List item text');
      expect(cleaned).toContain('color: rgb(255, 0, 0)');
      
      // Should not contain Office elements/attributes
      expect(cleaned).not.toContain('MsoNormal');
      expect(cleaned).not.toContain('WordSection1');
      expect(cleaned).not.toContain('mso-line-height-alt');
      expect(cleaned).not.toContain('data-ccp-props');
    });

    it('handles formatting conversion', () => {
      const html = '<span style="font-weight: bold; font-style: italic;">Bold italic text</span>';
      const cleaned = cleanOfficeHtml(html);
      
      // Should process and clean the content
      expect(cleaned).toContain('Bold italic text');
      // The formatting conversion may wrap in semantic elements or preserve styles
    });
  });
});