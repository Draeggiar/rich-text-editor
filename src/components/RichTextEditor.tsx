import React, { forwardRef, useImperativeHandle, useState, useCallback, useRef, useEffect } from 'react';
import { RichTextEditorProps, RichTextEditorRef } from '../types';
import { EditorToolbar } from './EditorToolbar';
import { withOfficeHtmlSupport } from '../utils/officeHtmlSupport';

// Plate.js based rich text editor with Office paste support and readonly mode
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

  const [currentHtml, setCurrentHtml] = useState(value);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle content changes for content editable
  const handleContentChange = useCallback((event: React.FormEvent<HTMLDivElement>) => {
    if (readOnly) return;
    
    const target = event.target as HTMLDivElement;
    const htmlContent = target.innerHTML;
    
    setCurrentHtml(htmlContent);
    if (onChange) {
      onChange(htmlContent);
    }
  }, [onChange, readOnly]);

  // Office paste support effect
  useEffect(() => {
    const element = contentRef.current;
    if (!element || readOnly) return;

    const cleanup = withOfficeHtmlSupport(element, (html) => {
      setCurrentHtml(html);
      if (onChange) {
        onChange(html);
      }
    });

    return cleanup;
  }, [onChange, readOnly]);

  // Update content when value prop changes
  useEffect(() => {
    if (value !== currentHtml) {
      setCurrentHtml(value);
    }
  }, [value]);

  // Expose imperative methods via ref
  useImperativeHandle(ref, () => ({
    getHtml: () => currentHtml,
    setHtml: (html: string) => {
      setCurrentHtml(html);
    },
    focus: () => {
      if (contentRef.current && !readOnly) {
        contentRef.current.focus();
      }
    },
    blur: () => {
      if (contentRef.current) {
        contentRef.current.blur();
      }
    },
    isFocused: () => {
      return document.activeElement === contentRef.current;
    },
  }), [currentHtml, readOnly]);

  // Editor container styles
  const editorStyles: React.CSSProperties = {
    minHeight: `${minHeight}px`,
    maxHeight: maxHeight ? `${maxHeight}px` : undefined,
    overflow: maxHeight ? 'auto' : 'visible',
    border: '1px solid #e1e5e9',
    borderRadius: '6px',
    backgroundColor: readOnly ? '#f8f9fa' : '#fff',
    opacity: readOnly ? 0.8 : 1,
    ...style,
  };

  const editorClassName = `rich-text-editor ${readOnly ? 'readonly' : ''} ${className}`.trim();

  // Content styles
  const contentStyles: React.CSSProperties = {
    padding: '12px',
    outline: 'none',
    minHeight: 'inherit',
    cursor: readOnly ? 'default' : 'text',
  };

  return (
    <div className={editorClassName} style={editorStyles}>
      {showToolbar && !readOnly && (toolbar || <EditorToolbar />)}
      
      <div
        ref={contentRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: currentHtml }}
        onInput={handleContentChange}
        autoFocus={autoFocus && !readOnly}
        style={contentStyles}
        data-placeholder={!readOnly ? placeholder : ''}
        role={readOnly ? 'document' : 'textbox'}
        aria-readonly={readOnly}
        aria-label={readOnly ? 'Rich text content (read-only)' : 'Rich text editor'}
      />
      
      {/* Placeholder and readonly styling */}
      <style>
        {`
          .rich-text-editor [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #999;
            font-style: italic;
            pointer-events: none;
          }
          
          .rich-text-editor.readonly [contenteditable] {
            background-color: transparent;
          }
          
          .rich-text-editor.readonly [contenteditable]:focus {
            outline: none !important;
          }
        `}
      </style>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };