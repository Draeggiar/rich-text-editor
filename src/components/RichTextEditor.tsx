import React, { forwardRef, useImperativeHandle, useCallback, useMemo, useState } from 'react';
import { createEditor, Descendant, Editor } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { RichTextEditorProps, RichTextEditorRef } from '../types';
import { EditorToolbar } from './EditorToolbar';
import { htmlToSlate, slateToHtml } from '../utils/htmlTransform';

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  readOnly = false,
  autoFocus = false,
  className = '',
  style,
  showToolbar = true,
  toolbar,
  maxHeight,
  minHeight = 200,
}, ref) => {
  
  // Create the editor instance
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // Convert HTML to Slate value - only recalculate when value prop changes
  const initialValue = useMemo(() => {
    return htmlToSlate(value);
  }, [value]);

  const [slateValue, setSlateValue] = useState<Descendant[]>(initialValue);

  // Handle change events
  const handleChange = useCallback((newValue: Descendant[]) => {
    setSlateValue(newValue);
    
    if (onChange && !readOnly) {
      const html = slateToHtml(newValue);
      onChange(html);
    }
  }, [onChange, readOnly]);

  // Custom rendering for elements
  const renderElement = useCallback((props: any) => {
    const { attributes, children, element } = props;
    
    switch (element.type) {
      case 'h1':
        return <h1 {...attributes}>{children}</h1>;
      case 'h2':
        return <h2 {...attributes}>{children}</h2>;
      case 'h3':
        return <h3 {...attributes}>{children}</h3>;
      case 'h4':
        return <h4 {...attributes}>{children}</h4>;
      case 'h5':
        return <h5 {...attributes}>{children}</h5>;
      case 'h6':
        return <h6 {...attributes}>{children}</h6>;
      case 'ul':
        return <ul {...attributes}>{children}</ul>;
      case 'ol':
        return <ol {...attributes}>{children}</ol>;
      case 'li':
        return <li {...attributes}>{children}</li>;
      case 'blockquote':
        return <blockquote {...attributes}>{children}</blockquote>;
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  // Custom rendering for leaves (text formatting)
  const renderLeaf = useCallback((props: any) => {
    const { attributes, children, leaf } = props;
    let element = children;

    if (leaf.bold) {
      element = <strong>{element}</strong>;
    }
    if (leaf.italic) {
      element = <em>{element}</em>;
    }
    if (leaf.underline) {
      element = <u>{element}</u>;
    }
    if (leaf.strikethrough) {
      element = <del>{element}</del>;
    }
    if (leaf.code) {
      element = <code>{element}</code>;
    }

    return <span {...attributes}>{element}</span>;
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    switch (event.key) {
      case 'b': {
        event.preventDefault();
        toggleMark(editor, 'bold');
        break;
      }
      case 'i': {
        event.preventDefault();
        toggleMark(editor, 'italic');
        break;
      }
      case 'u': {
        event.preventDefault();
        toggleMark(editor, 'underline');
        break;
      }
    }
  }, [editor]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getHtml: () => {
      return slateToHtml(slateValue);
    },
    setHtml: (html: string) => {
      const newValue = htmlToSlate(html);
      setSlateValue(newValue);
    },
    focus: () => {
      ReactEditor.focus(editor);
    },
    blur: () => {
      ReactEditor.blur(editor);
    },
    isFocused: () => {
      return ReactEditor.isFocused(editor);
    },
  }), [editor, slateValue]);

  const editorStyle = {
    minHeight: `${minHeight}px`,
    ...(maxHeight && { maxHeight: `${maxHeight}px`, overflowY: 'auto' as const }),
    border: '1px solid #e1e5e9',
    borderRadius: '4px',
    backgroundColor: '#fff',
    ...style,
  };

  const editableStyle = {
    padding: '12px',
    outline: 'none',
    minHeight: `${minHeight - 24}px`,
  };

  return (
    <div className={`rich-text-editor ${className}`} style={editorStyle}>
      <Slate editor={editor} initialValue={slateValue} onChange={handleChange}>
        {showToolbar && (toolbar || <EditorToolbar editor={editor} />)}
        <Editable
          placeholder={placeholder}
          readOnly={readOnly}
          autoFocus={autoFocus}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          style={editableStyle}
        />
      </Slate>
    </div>
  );
});

// Helper function to toggle text marks
const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Helper function to check if a mark is active
const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] === true : false;
};

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };