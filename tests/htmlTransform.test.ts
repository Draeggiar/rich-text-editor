import { htmlToSlate, slateToHtml } from '../src/utils/htmlTransform';
import { TElement } from '@platejs/slate';

describe('HTML Transform Utilities', () => {
  describe('htmlToSlate', () => {
    it('converts empty string to default paragraph', () => {
      const result = htmlToSlate('');
      expect(result).toEqual([{ type: 'p', children: [{ text: '' }] }]);
    });

    it('converts whitespace-only string to default paragraph', () => {
      const result = htmlToSlate('   \n\t   ');
      expect(result).toEqual([{ type: 'p', children: [{ text: '' }] }]);
    });

    it('converts simple text to paragraph', () => {
      const result = htmlToSlate('Simple text');
      expect(result).toEqual([{ type: 'p', children: [{ text: 'Simple text' }] }]);
    });

    it('converts paragraph with text', () => {
      const result = htmlToSlate('<p>Paragraph text</p>');
      expect(result).toEqual([{ type: 'p', children: [{ text: 'Paragraph text' }] }]);
    });

    it('converts headings correctly', () => {
      const result = htmlToSlate('<h1>Heading 1</h1><h2>Heading 2</h2>');
      expect(result).toEqual([
        { type: 'h1', children: [{ text: 'Heading 1' }] },
        { type: 'h2', children: [{ text: 'Heading 2' }] }
      ]);
    });

    it('converts strong/bold elements', () => {
      const result = htmlToSlate('<p><strong>Bold text</strong></p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Bold text', bold: true }] }
      ]);
    });

    it('converts em/italic elements', () => {
      const result = htmlToSlate('<p><em>Italic text</em></p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Italic text', italic: true }] }
      ]);
    });

    it('converts underline elements', () => {
      const result = htmlToSlate('<p><u>Underlined text</u></p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Underlined text', underline: true }] }
      ]);
    });

    it('converts strikethrough elements', () => {
      const result = htmlToSlate('<p><del>Deleted text</del></p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Deleted text', strikethrough: true }] }
      ]);
    });

    it('converts code elements', () => {
      const result = htmlToSlate('<p><code>Code text</code></p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Code text', code: true }] }
      ]);
    });

    it('converts mixed formatting', () => {
      const result = htmlToSlate('<p><strong><em>Bold and italic</em></strong></p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Bold and italic', bold: true, italic: true }] }
      ]);
    });

    it('converts unordered lists', () => {
      const result = htmlToSlate('<ul><li>Item 1</li><li>Item 2</li></ul>');
      expect(result).toEqual([
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'Item 1' }] },
            { type: 'li', children: [{ text: 'Item 2' }] }
          ]
        }
      ]);
    });

    it('converts ordered lists', () => {
      const result = htmlToSlate('<ol><li>First</li><li>Second</li></ol>');
      expect(result).toEqual([
        {
          type: 'ol',
          children: [
            { type: 'li', children: [{ text: 'First' }] },
            { type: 'li', children: [{ text: 'Second' }] }
          ]
        }
      ]);
    });

    it('converts blockquotes', () => {
      const result = htmlToSlate('<blockquote>Quoted text</blockquote>');
      expect(result).toEqual([
        { type: 'blockquote', children: [{ text: 'Quoted text' }] }
      ]);
    });

    it('converts divs to paragraphs', () => {
      const result = htmlToSlate('<div>Div content</div>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Div content' }] }
      ]);
    });

    it('handles inline styles for colors', () => {
      const result = htmlToSlate('<p style="color: red;">Red text</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Red text', color: 'red' }] }
      ]);
    });

    it('handles inline styles for background color', () => {
      const result = htmlToSlate('<p style="background-color: yellow;">Highlighted</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Highlighted', backgroundColor: 'yellow' }] }
      ]);
    });

    it('handles inline styles for font family', () => {
      const result = htmlToSlate('<p style="font-family: Arial;">Arial text</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Arial text', fontFamily: 'Arial' }] }
      ]);
    });

    it('handles inline styles for font size', () => {
      const result = htmlToSlate('<p style="font-size: 16px;">Sized text</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Sized text', fontSize: '16px' }] }
      ]);
    });

    it('handles inline styles for bold font weight', () => {
      const result = htmlToSlate('<p style="font-weight: bold;">Bold via style</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Bold via style', bold: true }] }
      ]);
    });

    it('handles numeric font weight', () => {
      const result = htmlToSlate('<p style="font-weight: 700;">Bold 700</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Bold 700', bold: true }] }
      ]);
    });

    it('handles italic font style', () => {
      const result = htmlToSlate('<p style="font-style: italic;">Italic via style</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Italic via style', italic: true }] }
      ]);
    });

    it('handles underline text decoration', () => {
      const result = htmlToSlate('<p style="text-decoration: underline;">Underlined via style</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Underlined via style', underline: true }] }
      ]);
    });

    it('handles line-through text decoration', () => {
      const result = htmlToSlate('<p style="text-decoration: line-through;">Strikethrough via style</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Strikethrough via style', strikethrough: true }] }
      ]);
    });

    it('ignores default black color', () => {
      const result = htmlToSlate('<p style="color: rgb(0, 0, 0);">Black text</p>');
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Black text' }] }
      ]);
    });

    it('handles complex nested structure', () => {
      const html = '<p>Normal <strong>bold <em>and italic</em></strong> text</p>';
      const result = htmlToSlate(html);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('p');
      expect(result[0].children).toHaveLength(3);
      
      expect(result[0].children[0]).toEqual({ text: 'Normal ' });
      expect(result[0].children[1]).toEqual({ text: 'bold and italic', bold: true, italic: true });
      expect(result[0].children[2]).toEqual({ text: ' text' });
    });

    it('automatically cleans Office HTML', () => {
      const officeHtml = '<p class="MsoNormal"><span style="font-weight: bold;">Office text</span><o:p></o:p></p>';
      const result = htmlToSlate(officeHtml);
      
      expect(result).toEqual([
        { type: 'p', children: [{ text: 'Office text', bold: true }] }
      ]);
    });
  });

  describe('slateToHtml', () => {
    it('converts empty paragraph to HTML', () => {
      const slate: TElement[] = [{ type: 'p', children: [{ text: '' }] }];
      const result = slateToHtml(slate);
      expect(result).toBe('<p></p>');
    });

    it('converts simple paragraph to HTML', () => {
      const slate: TElement[] = [{ type: 'p', children: [{ text: 'Simple text' }] }];
      const result = slateToHtml(slate);
      expect(result).toBe('<p>Simple text</p>');
    });

    it('converts headings to HTML', () => {
      const slate: TElement[] = [
        { type: 'h1', children: [{ text: 'Heading 1' }] },
        { type: 'h2', children: [{ text: 'Heading 2' }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<h1>Heading 1</h1><h2>Heading 2</h2>');
    });

    it('converts bold text to strong', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Bold text', bold: true }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><strong>Bold text</strong></p>');
    });

    it('converts italic text to em', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Italic text', italic: true }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><em>Italic text</em></p>');
    });

    it('converts underlined text to u', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Underlined text', underline: true }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><u>Underlined text</u></p>');
    });

    it('converts strikethrough text to del', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Deleted text', strikethrough: true }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><del>Deleted text</del></p>');
    });

    it('converts code text to code', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Code text', code: true }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><code>Code text</code></p>');
    });

    it('converts mixed formatting', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Bold italic', bold: true, italic: true }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><em><strong>Bold italic</strong></em></p>');
    });

    it('converts text with color', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Red text', color: 'red' }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><span style="color: red">Red text</span></p>');
    });

    it('converts text with background color', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Highlighted', backgroundColor: 'yellow' }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><span style="background-color: yellow">Highlighted</span></p>');
    });

    it('converts text with font family', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Arial text', fontFamily: 'Arial' }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><span style="font-family: Arial">Arial text</span></p>');
    });

    it('converts text with font size', () => {
      const slate: TElement[] = [
        { type: 'p', children: [{ text: 'Large text', fontSize: '18px' }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><span style="font-size: 18px">Large text</span></p>');
    });

    it('converts text with multiple styles', () => {
      const slate: TElement[] = [
        { 
          type: 'p', 
          children: [{ 
            text: 'Styled text', 
            color: 'red', 
            backgroundColor: 'yellow',
            fontFamily: 'Arial',
            fontSize: '16px'
          }] 
        }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p><span style="color: red; background-color: yellow; font-family: Arial; font-size: 16px">Styled text</span></p>');
    });

    it('converts unordered lists', () => {
      const slate: TElement[] = [
        {
          type: 'ul',
          children: [
            { type: 'li', children: [{ text: 'Item 1' }] },
            { type: 'li', children: [{ text: 'Item 2' }] }
          ]
        }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
    });

    it('converts ordered lists', () => {
      const slate: TElement[] = [
        {
          type: 'ol',
          children: [
            { type: 'li', children: [{ text: 'First' }] },
            { type: 'li', children: [{ text: 'Second' }] }
          ]
        }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<ol><li>First</li><li>Second</li></ol>');
    });

    it('converts blockquotes', () => {
      const slate: TElement[] = [
        { type: 'blockquote', children: [{ text: 'Quoted text' }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<blockquote>Quoted text</blockquote>');
    });

    it('handles unknown types as paragraphs', () => {
      const slate: TElement[] = [
        { type: 'unknown' as any, children: [{ text: 'Unknown content' }] }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p>Unknown content</p>');
    });

    it('converts complex nested structure', () => {
      const slate: TElement[] = [
        {
          type: 'p',
          children: [
            { text: 'Normal ' },
            { text: 'bold ', bold: true },
            { text: 'and italic', bold: true, italic: true },
            { text: ' text' }
          ]
        }
      ];
      const result = slateToHtml(slate);
      expect(result).toBe('<p>Normal <strong>bold </strong><em><strong>and italic</strong></em> text</p>');
    });
  });

  describe('Round-trip conversion', () => {
    const testCases = [
      '<p>Simple text</p>',
      '<h1>Heading</h1>',
      '<p><strong>Bold</strong> and <em>italic</em></p>',
      '<ul><li>Item 1</li><li>Item 2</li></ul>',
      '<blockquote>Quote</blockquote>'
    ];

    testCases.forEach(html => {
      it(`round-trip converts: ${html}`, () => {
        const slate = htmlToSlate(html);
        const backToHtml = slateToHtml(slate);
        
        // The conversion should preserve the semantic meaning
        // (though exact formatting may differ)
        expect(backToHtml).toContain('Simple text' in html ? 'Simple text' : 
                                    'Heading' in html ? 'Heading' :
                                    'Bold' in html ? 'Bold' :
                                    'Item 1' in html ? 'Item 1' :
                                    'Quote');
      });
    });
  });
});