import React from 'react';

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
      <ToolbarButton
        icon="B"
        title="Bold"
        onClick={() => {
          // Placeholder - will be implemented with proper Plate hooks
          console.log('Bold clicked');
        }}
      />
      <ToolbarButton
        icon="I"
        title="Italic"
        onClick={() => {
          // Placeholder - will be implemented with proper Plate hooks
          console.log('Italic clicked');
        }}
      />
      <ToolbarButton
        icon="U"
        title="Underline"
        onClick={() => {
          // Placeholder - will be implemented with proper Plate hooks
          console.log('Underline clicked');
        }}
      />
      <div style={{ width: '1px', height: '20px', backgroundColor: '#e1e5e9', margin: '0 4px' }} />
      <ToolbarButton
        icon="H1"
        title="Heading 1"
        onClick={() => {
          console.log('H1 clicked');
        }}
      />
      <ToolbarButton
        icon="H2"
        title="Heading 2"
        onClick={() => {
          console.log('H2 clicked');
        }}
      />
      <ToolbarButton
        icon="•"
        title="Bulleted List"
        onClick={() => {
          console.log('Bullet list clicked');
        }}
      />
      <ToolbarButton
        icon="1."
        title="Numbered List"
        onClick={() => {
          console.log('Numbered list clicked');
        }}
      />
    </div>
  );
};

// Simple toolbar button component
interface ToolbarButtonProps {
  icon: string;
  title: string;
  onClick: () => void;
  isActive?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, title, onClick, isActive = false }) => {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        minWidth: '32px',
        height: '32px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: isActive ? '#e3f2fd' : 'transparent',
        color: isActive ? '#1976d2' : '#333',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'normal',
      }}
    >
      {icon}
    </button>
  );
};