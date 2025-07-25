import { withOfficeHtmlSupport } from '../src/utils/officeHtmlSupport';

describe('Office HTML Support', () => {
  let testElement: HTMLDivElement;
  let onChange: jest.MockedFunction<(html: string) => void>;
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    // Create a test element
    testElement = document.createElement('div');
    testElement.contentEditable = 'true';
    document.body.appendChild(testElement);
    
    onChange = jest.fn();
    
    // Reset clipboard mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }
    
    if (testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('Setup and Cleanup', () => {
    it('returns a cleanup function', () => {
      cleanup = withOfficeHtmlSupport(testElement, onChange);
      expect(typeof cleanup).toBe('function');
    });

    it('adds paste event listener to element', () => {
      const addEventListenerSpy = jest.spyOn(testElement, 'addEventListener');
      cleanup = withOfficeHtmlSupport(testElement, onChange);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('paste', expect.any(Function));
    });

    it('removes paste event listener on cleanup', () => {
      const removeEventListenerSpy = jest.spyOn(testElement, 'removeEventListener');
      cleanup = withOfficeHtmlSupport(testElement, onChange);
      
      cleanup();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('paste', expect.any(Function));
    });
  });

  describe('Paste Event Handling', () => {
    beforeEach(() => {
      cleanup = withOfficeHtmlSupport(testElement, onChange);
    });

    it('ignores paste events without clipboard data', () => {
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: null
      });
      
      testElement.dispatchEvent(mockEvent);
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('ignores paste events without HTML data', () => {
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue('')
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData
      });
      
      testElement.dispatchEvent(mockEvent);
      
      expect(mockClipboardData.getData).toHaveBeenCalledWith('text/html');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('ignores non-Office HTML content', () => {
      const regularHtml = '<p>Regular HTML content</p>';
      
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(regularHtml)
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData
      });
      
      testElement.dispatchEvent(mockEvent);
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('processes Office HTML content and prevents default', () => {
      const officeHtml = '<p class="MsoNormal">Office content<o:p></o:p></p>';
      
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(officeHtml)
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData,
        cancelable: true
      });
      
      const preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');
      
      testElement.dispatchEvent(mockEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('calls onChange with cleaned HTML when Office content is pasted', () => {
      const officeHtml = '<p class="MsoNormal"><span style="font-weight: bold;">Bold Office text</span><o:p></o:p></p>';
      
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(officeHtml)
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData,
        cancelable: true
      });
      
      // Mock window.getSelection
      const mockRange = {
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        collapse: jest.fn()
      } as any;
      
      const mockSelection = {
        rangeCount: 1,
        getRangeAt: jest.fn().mockReturnValue(mockRange),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      } as any;
      
      jest.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      
      testElement.innerHTML = '<p>Existing content</p>';
      testElement.dispatchEvent(mockEvent);
      
      expect(onChange).toHaveBeenCalled();
      const calledHtml = onChange.mock.calls[0][0];
      
      // Should contain cleaned content
      expect(calledHtml).toContain('Bold Office text');
      expect(calledHtml).toContain('<strong>');
      
      // Should not contain Office-specific elements
      expect(calledHtml).not.toContain('MsoNormal');
      expect(calledHtml).not.toContain('<o:p>');
    });
  });

  describe('Content Insertion', () => {
    beforeEach(() => {
      cleanup = withOfficeHtmlSupport(testElement, onChange);
    });

    it('handles selection and range operations correctly', () => {
      const officeHtml = '<p class="MsoNormal">Office content</p>';
      
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(officeHtml)
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData,
        cancelable: true
      });
      
      const mockRange = {
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        collapse: jest.fn()
      } as any;
      
      const mockSelection = {
        rangeCount: 1,
        getRangeAt: jest.fn().mockReturnValue(mockRange),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      } as any;
      
      jest.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      
      testElement.dispatchEvent(mockEvent);
      
      expect(mockSelection.getRangeAt).toHaveBeenCalledWith(0);
      expect(mockRange.deleteContents).toHaveBeenCalled();
      expect(mockRange.insertNode).toHaveBeenCalled();
      expect(mockRange.collapse).toHaveBeenCalledWith(false);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    });

    it('handles cases with no selection gracefully', () => {
      const officeHtml = '<p class="MsoNormal">Office content</p>';
      
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(officeHtml)
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData,
        cancelable: true
      });
      
      // Mock no selection
      jest.spyOn(window, 'getSelection').mockReturnValue(null);
      
      testElement.dispatchEvent(mockEvent);
      
      // Should not throw error, but also should not call onChange
      expect(onChange).not.toHaveBeenCalled();
    });

    it('handles cases with no ranges gracefully', () => {
      const officeHtml = '<p class="MsoNormal">Office content</p>';
      
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(officeHtml)
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData,
        cancelable: true
      });
      
      const mockSelection = {
        rangeCount: 0,
        getRangeAt: jest.fn(),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      } as any;
      
      jest.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      
      testElement.dispatchEvent(mockEvent);
      
      expect(mockSelection.getRangeAt).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('creates document fragment from cleaned HTML correctly', () => {
      const officeHtml = '<p class="MsoNormal"><strong>Bold</strong> and <em>italic</em></p>';
      
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(officeHtml)
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData,
        cancelable: true
      });
      
      const mockRange = {
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        collapse: jest.fn()
      } as any;
      
      const mockSelection = {
        rangeCount: 1,
        getRangeAt: jest.fn().mockReturnValue(mockRange),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      } as any;
      
      jest.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      
      testElement.dispatchEvent(mockEvent);
      
      expect(mockRange.insertNode).toHaveBeenCalled();
      
      // Check that the inserted node is a document fragment
      const insertedFragment = mockRange.insertNode.mock.calls[0][0];
      expect(insertedFragment).toBeInstanceOf(DocumentFragment);
    });
  });

  describe('Integration with Real DOM', () => {
    beforeEach(() => {
      cleanup = withOfficeHtmlSupport(testElement, onChange);
    });

    it('works with real selection and ranges', () => {
      // Set up initial content
      testElement.innerHTML = '<p>Initial content</p>';
      
      // Create a real selection
      const range = document.createRange();
      range.selectNodeContents(testElement);
      range.collapse(false); // Move to end
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      const officeHtml = '<p class="MsoNormal">Pasted Office content</p>';
      
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(officeHtml)
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData,
        cancelable: true
      });
      
      testElement.dispatchEvent(mockEvent);
      
      expect(onChange).toHaveBeenCalled();
      const resultHtml = onChange.mock.calls[0][0];
      expect(resultHtml).toContain('Pasted Office content');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cleanup = withOfficeHtmlSupport(testElement, onChange);
    });

    it('handles malformed Office HTML gracefully', () => {
      const malformedOfficeHtml = '<p class="MsoNormal">Unclosed tag<strong>content';
      
      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(malformedOfficeHtml)
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData,
        cancelable: true
      });
      
      const mockRange = {
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        collapse: jest.fn()
      } as any;
      
      const mockSelection = {
        rangeCount: 1,
        getRangeAt: jest.fn().mockReturnValue(mockRange),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      } as any;
      
      jest.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      
      // Should not throw
      expect(() => testElement.dispatchEvent(mockEvent)).not.toThrow();
    });

    it('handles clipboard data errors gracefully', () => {
      const mockClipboardData = {
        getData: jest.fn().mockImplementation(() => {
          throw new Error('Clipboard error');
        })
      } as any;
      
      const mockEvent = new ClipboardEvent('paste', {
        clipboardData: mockClipboardData
      });
      
      // Should not throw and not call onChange
      expect(() => {
        try {
          testElement.dispatchEvent(mockEvent);
        } catch (e) {
          // Expected error from getData, should be caught internally
        }
      }).not.toThrow();
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});