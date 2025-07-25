import { ReactNode, CSSProperties } from 'react';
import { Editor, TElement, TText } from '@platejs/slate';

// Extend Plate types
export type CustomEditor = Editor;

export type ParagraphElement = TElement & {
  type: 'p';
  children: CustomText[];
};

export type HeadingElement = TElement & {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: CustomText[];
};

export type ListElement = TElement & {
  type: 'ul' | 'ol';
  children: ListItemElement[];
};

export type ListItemElement = TElement & {
  type: 'li';
  children: CustomText[];
};

export type BlockquoteElement = TElement & {
  type: 'blockquote';
  children: CustomText[];
};

export type CustomElement = 
  | ParagraphElement 
  | HeadingElement 
  | ListElement 
  | ListItemElement 
  | BlockquoteElement;

export type FormattedText = TText & {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: string;
};

export type CustomText = FormattedText;

export interface RichTextEditorProps {
  /**
   * The current HTML value of the editor
   */
  value?: string;
  
  /**
   * Callback fired when the editor content changes
   */
  onChange?: (html: string) => void;
  
  /**
   * Placeholder text to display when the editor is empty
   */
  placeholder?: string;
  
  /**
   * Whether the editor is read-only
   */
  readOnly?: boolean;
  
  /**
   * Whether to auto-focus the editor on mount
   */
  autoFocus?: boolean;
  
  /**
   * Custom CSS class name for the editor container
   */
  className?: string;
  
  /**
   * Custom styles for the editor container
   */
  style?: CSSProperties;
  
  /**
   * Whether to show the toolbar
   */
  showToolbar?: boolean;
  
  /**
   * Custom toolbar component
   */
  toolbar?: ReactNode;
  
  /**
   * Maximum height of the editor
   */
  maxHeight?: number;
  
  /**
   * Minimum height of the editor
   */
  minHeight?: number;
}

export interface RichTextEditorRef {
  /**
   * Get the current HTML content
   */
  getHtml: () => string;
  
  /**
   * Set the HTML content
   */
  setHtml: (html: string) => void;
  
  /**
   * Focus the editor
   */
  focus: () => void;
  
  /**
   * Blur the editor
   */
  blur: () => void;
  
  /**
   * Check if the editor is focused
   */
  isFocused: () => boolean;
}