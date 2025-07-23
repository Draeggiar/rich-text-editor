import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichTextEditor } from '../src/components/RichTextEditor';
import { RichTextEditorRef } from '../src/types';

describe('RichTextEditor', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<RichTextEditor />);
      
      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveAttribute('contenteditable', 'true');
      expect(editor).toHaveAttribute('aria-label', 'Rich text editor');
    });

    it('renders with custom className and style', () => {
      const customStyle = { backgroundColor: 'red' };
      render(
        <RichTextEditor 
          className="custom-editor" 
          style={customStyle}
        />
      );
      
      const container = screen.getByRole('textbox').parentElement;
      expect(container).toHaveClass('rich-text-editor', 'custom-editor');
      expect(container).toHaveStyle('background-color: red');
    });

    it('renders with placeholder', () => {
      render(<RichTextEditor placeholder="Type something..." />);
      
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveAttribute('data-placeholder', 'Type something...');
    });

    it('renders with initial value', () => {
      const initialValue = '<p>Hello <strong>world</strong>!</p>';
      render(<RichTextEditor value={initialValue} />);
      
      const editor = screen.getByRole('textbox');
      expect(editor.innerHTML).toBe(initialValue);
    });
  });

  describe('Props Behavior', () => {
    it('shows toolbar by default', () => {
      render(<RichTextEditor />);
      
      const toolbar = document.querySelector('.editor-toolbar');
      expect(toolbar).toBeInTheDocument();
    });

    it('hides toolbar when showToolbar is false', () => {
      render(<RichTextEditor showToolbar={false} />);
      
      const toolbar = document.querySelector('.editor-toolbar');
      expect(toolbar).not.toBeInTheDocument();
    });

    it('renders custom toolbar', () => {
      const CustomToolbar = () => <div data-testid="custom-toolbar">Custom</div>;
      render(<RichTextEditor toolbar={<CustomToolbar />} />);
      
      expect(screen.getByTestId('custom-toolbar')).toBeInTheDocument();
    });

    it('applies minHeight and maxHeight styles', () => {
      render(<RichTextEditor minHeight={300} maxHeight={500} />);
      
      const container = screen.getByRole('textbox').parentElement;
      expect(container).toHaveStyle('min-height: 300px');
      expect(container).toHaveStyle('max-height: 500px');
      expect(container).toHaveStyle('overflow: auto');
    });

    it('auto focuses when autoFocus is true', () => {
      const focusSpy = jest.spyOn(HTMLDivElement.prototype, 'focus');
      render(<RichTextEditor autoFocus />);
      
      // Check that focus was called on the content div
      expect(focusSpy).toHaveBeenCalled();
      focusSpy.mockRestore();
    });
  });

  describe('ReadOnly Mode', () => {
    it('renders in readonly mode correctly', () => {
      render(<RichTextEditor readOnly value="<p>Read only content</p>" />);
      
      const editor = screen.getByRole('document');
      expect(editor).toHaveAttribute('contenteditable', 'false');
      expect(editor).toHaveAttribute('aria-readonly', 'true');
      expect(editor).toHaveAttribute('aria-label', 'Rich text content (read-only)');
    });

    it('hides toolbar in readonly mode', () => {
      render(<RichTextEditor readOnly />);
      
      const toolbar = document.querySelector('.editor-toolbar');
      expect(toolbar).not.toBeInTheDocument();
    });

    it('applies readonly styling', () => {
      render(<RichTextEditor readOnly />);
      
      const container = screen.getByRole('document').parentElement;
      expect(container).toHaveClass('rich-text-editor', 'readonly');
      expect(container).toHaveStyle('background-color: #f8f9fa');
      expect(container).toHaveStyle('opacity: 0.8');
    });

    it('does not auto focus in readonly mode', () => {
      render(<RichTextEditor readOnly autoFocus />);
      
      const editor = screen.getByRole('document');
      expect(editor).not.toHaveFocus();
    });

    it('does not have placeholder in readonly mode', () => {
      render(<RichTextEditor readOnly placeholder="Should not show" />);
      
      const editor = screen.getByRole('document');
      expect(editor).toHaveAttribute('data-placeholder', '');
    });
  });

  describe('Content Changes', () => {
    it('calls onChange when content is modified', async () => {
      const onChange = jest.fn();
      render(<RichTextEditor onChange={onChange} />);
      
      const editor = screen.getByRole('textbox');
      
      // Simulate typing
      fireEvent.input(editor, {
        target: { innerHTML: '<p>New content</p>' }
      });
      
      expect(onChange).toHaveBeenCalledWith('<p>New content</p>');
    });

    it('does not call onChange in readonly mode', () => {
      const onChange = jest.fn();
      render(<RichTextEditor readOnly onChange={onChange} />);
      
      const editor = screen.getByRole('document');
      
      fireEvent.input(editor, {
        target: { innerHTML: '<p>Should not trigger</p>' }
      });
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('updates content when value prop changes', () => {
      const { rerender } = render(<RichTextEditor value="<p>Initial</p>" />);
      
      let editor = screen.getByRole('textbox');
      expect(editor.innerHTML).toBe('<p>Initial</p>');
      
      rerender(<RichTextEditor value="<p>Updated</p>" />);
      
      editor = screen.getByRole('textbox');
      expect(editor.innerHTML).toBe('<p>Updated</p>');
    });
  });

  describe('Ref Methods', () => {
    it('exposes ref methods correctly', () => {
      const ref = React.createRef<RichTextEditorRef>();
      render(<RichTextEditor ref={ref} value="<p>Test content</p>" />);
      
      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.getHtml).toBe('function');
      expect(typeof ref.current?.setHtml).toBe('function');
      expect(typeof ref.current?.focus).toBe('function');
      expect(typeof ref.current?.blur).toBe('function');
      expect(typeof ref.current?.isFocused).toBe('function');
    });

    it('getHtml returns current content', () => {
      const ref = React.createRef<RichTextEditorRef>();
      render(<RichTextEditor ref={ref} value="<p>Test content</p>" />);
      
      expect(ref.current?.getHtml()).toBe('<p>Test content</p>');
    });

    it('setHtml updates content', () => {
      const ref = React.createRef<RichTextEditorRef>();
      render(<RichTextEditor ref={ref} />);
      
      act(() => {
        ref.current?.setHtml('<p>New content via ref</p>');
      });
      
      expect(ref.current?.getHtml()).toBe('<p>New content via ref</p>');
    });

    it('focus method focuses the editor', () => {
      const ref = React.createRef<RichTextEditorRef>();
      const focusSpy = jest.spyOn(HTMLDivElement.prototype, 'focus');
      
      render(<RichTextEditor ref={ref} />);
      
      act(() => {
        ref.current?.focus();
      });
      
      expect(focusSpy).toHaveBeenCalled();
      focusSpy.mockRestore();
    });

    it('focus method does nothing in readonly mode', () => {
      const ref = React.createRef<RichTextEditorRef>();
      const focusSpy = jest.spyOn(HTMLDivElement.prototype, 'focus');
      
      render(<RichTextEditor ref={ref} readOnly />);
      
      ref.current?.focus();
      
      expect(focusSpy).not.toHaveBeenCalled();
      focusSpy.mockRestore();
    });

    it('blur method blurs the editor', () => {
      const ref = React.createRef<RichTextEditorRef>();
      const blurSpy = jest.spyOn(HTMLDivElement.prototype, 'blur');
      
      render(<RichTextEditor ref={ref} />);
      
      act(() => {
        ref.current?.blur();
      });
      
      expect(blurSpy).toHaveBeenCalled();
      blurSpy.mockRestore();
    });

    it('isFocused returns correct focus state', () => {
      const ref = React.createRef<RichTextEditorRef>();
      render(<RichTextEditor ref={ref} />);
      
      // Initially not focused
      expect(ref.current?.isFocused()).toBe(false);
      
      // Mock document.activeElement for focus test
      const editor = screen.getByRole('textbox');
      Object.defineProperty(document, 'activeElement', {
        writable: true,
        value: editor
      });
      
      expect(ref.current?.isFocused()).toBe(true);
      
      // Reset to no focus
      Object.defineProperty(document, 'activeElement', {
        writable: true,
        value: document.body
      });
      
      expect(ref.current?.isFocused()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid HTML gracefully', () => {
      const onChange = jest.fn();
      render(<RichTextEditor onChange={onChange} />);
      
      const editor = screen.getByRole('textbox');
      
      // Simulate invalid HTML input (browser will auto-correct)
      fireEvent.input(editor, {
        target: { innerHTML: '<div><p>Unclosed tag</p></div>' }
      });
      
      expect(onChange).toHaveBeenCalledWith('<div><p>Unclosed tag</p></div>');
      expect(() => screen.getByRole('textbox')).not.toThrow();
    });

    it('handles null/undefined values', () => {
      const { rerender } = render(<RichTextEditor value={undefined} />);
      
      expect(() => rerender(<RichTextEditor value={null as any} />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<RichTextEditor />);
      
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveAttribute('aria-label', 'Rich text editor');
      expect(editor).toHaveAttribute('aria-readonly', 'false');
    });

    it('has proper ARIA attributes in readonly mode', () => {
      render(<RichTextEditor readOnly />);
      
      const editor = screen.getByRole('document');
      expect(editor).toHaveAttribute('aria-label', 'Rich text content (read-only)');
      expect(editor).toHaveAttribute('aria-readonly', 'true');
    });
  });
});