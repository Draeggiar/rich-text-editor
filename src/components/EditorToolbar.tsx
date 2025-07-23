import React from 'react';
import { Editor, Element as SlateElement, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { CustomElement } from '../types';

interface EditorToolbarProps {}

export const EditorToolbar: React.FC<EditorToolbarProps> = () => {

  return (
    <div className="editor-toolbar" style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
      borderBottom: '1px solid #e1e5e9',
      backgroundColor: '#f8f9fa',
      gap: '4px',
      flexWrap: 'wrap',
    }}>
      <MarkButton
        format="bold"
        icon="B"
        title="Bold"
      />
      <MarkButton
        format="italic"
        icon="I"
        title="Italic"
      />
      <MarkButton
        format="underline"
        icon="U"
        title="Underline"
      />
      <div style={{ width: '1px', height: '20px', backgroundColor: '#e1e5e9', margin: '0 4px' }} />
      <BlockButton
        format="h1"
        icon="H1"
        title="Heading 1"
      />
      <BlockButton
        format="h2"
        icon="H2"
        title="Heading 2"
      />
      <BlockButton
        format="h3"
        icon="H3"
        title="Heading 3"
      />
      <div style={{ width: '1px', height: '20px', backgroundColor: '#e1e5e9', margin: '0 4px' }} />
      <BlockButton
        format="ul"
        icon="•"
        title="Bullet List"
      />
      <BlockButton
        format="ol"
        icon="1."
        title="Numbered List"
      />
    </div>
  );
};

interface MarkButtonProps {
  format: string;
  icon: string;
  title: string;
}

const MarkButton: React.FC<MarkButtonProps> = ({ format, icon, title }) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    toggleMark(editor, format);
  };

  return (
    <button
      type="button"
      title={title}
      onMouseDown={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: '1px solid transparent',
        borderRadius: '4px',
        backgroundColor: isActive ? '#e9ecef' : 'transparent',
        color: '#333',
        fontSize: '14px',
        fontWeight: format === 'bold' ? 'bold' : 'normal',
        fontStyle: format === 'italic' ? 'italic' : 'normal',
        textDecoration: format === 'underline' ? 'underline' : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#e9ecef';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {icon}
    </button>
  );
};

interface BlockButtonProps {
  format: string;
  icon: string;
  title: string;
}

const BlockButton: React.FC<BlockButtonProps> = ({ format, icon, title }) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    toggleBlock(editor, format);
  };

  return (
    <button
      type="button"
      title={title}
      onMouseDown={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: '1px solid transparent',
        borderRadius: '4px',
        backgroundColor: isActive ? '#e9ecef' : 'transparent',
        color: '#333',
        fontSize: '12px',
        fontWeight: 'normal',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#e9ecef';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {icon}
    </button>
  );
};

// Helper functions
const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] === true : false;
};

// Helper function to toggle block types
const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = format === 'ul' || format === 'ol';

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ['ul', 'ol'].includes((n as CustomElement).type as string),
    split: true,
  });

  const newProperties: Partial<CustomElement> = {
    type: isActive ? 'p' : isList ? 'li' : format,
  } as any;
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format as any, children: [] } as CustomElement;
    Transforms.wrapNodes(editor, block);
  }
};

// Helper function to check if a block is active
const isBlockActive = (editor: Editor, format: string) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as CustomElement).type === format,
    })
  );

  return !!match;
};