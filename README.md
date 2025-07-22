# Rich Text Editor

A WYSIWYG rich-text editor component for React applications, built with TypeScript and Slate.js.

## Features

- 🎨 **WYSIWYG Editing** - Visual rich text editing experience
- 📝 **HTML State Management** - Stores and manages content as HTML
- 🎛️ **Controlled Component** - Full external control over editor state
- 🔧 **TypeScript Support** - Complete type definitions included
- ⚛️ **React Integration** - Built specifically for React applications
- 🎯 **Extensible** - Based on Slate.js for powerful customization
- 📦 **Library Ready** - Packaged for easy npm distribution
- 📋 **Office Paste Support** - Smart handling of Microsoft Office clipboard content

## Supported Formatting

- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Headings**: H1, H2, H3, H4, H5, H6
- **Lists**: Bullet lists, Numbered lists
- **Text Styling**: Colors, fonts, background colors
- **Office Content**: Automatic cleanup and formatting preservation from Word, Excel, PowerPoint
- **Keyboard Shortcuts**: Ctrl/Cmd + B (Bold), Ctrl/Cmd + I (Italic), Ctrl/Cmd + U (Underline)

## Installation

```bash
npm install @draeggiar/rich-text-editor
```

## Basic Usage

```jsx
import React, { useState } from 'react';
import { RichTextEditor } from '@draeggiar/rich-text-editor';

function MyComponent() {
  const [content, setContent] = useState('<p>Hello <strong>world</strong>!</p>');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
```

## Microsoft Office Paste Support

The editor includes intelligent handling of content copied from Microsoft Office applications (Word, Excel, PowerPoint). When you paste content from these applications, the editor:

### 🧹 **Automatic Cleanup**
- Removes Office-specific XML elements (`<o:p>`, `<w:*>`, `<v:*>`)
- Strips MSO classes and proprietary attributes
- Cleans up redundant inline styles and formatting
- Eliminates conditional comments and metadata

### 🎨 **Format Preservation**
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Colors**: Text and background colors
- **Typography**: Font families and sizes (when reasonable)
- **Structure**: Headings, paragraphs, and lists
- **Spacing**: Proper paragraph and line breaks

### 📋 **How to Use**
1. Copy formatted content from any Office application (Ctrl+C / Cmd+C)
2. Paste into the editor (Ctrl+V / Cmd+V)
3. The editor automatically detects and cleans Office markup
4. Formatting is preserved while removing bloated HTML

### 🔧 **Technical Details**
- Detects Office content using multiple indicators (XML namespaces, MSO classes, etc.)
- Converts inline styles to semantic HTML elements where possible
- Preserves only relevant formatting attributes
- Maintains clean, standards-compliant HTML output

```jsx
// Example: Office content is automatically cleaned on paste
const MyEditor = () => {
  const [content, setContent] = useState('');
  
  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Paste your Office content here..."
    />
  );
};
```

Try the [Office Paste Demo](./office-paste-demo.html) to see this feature in action!

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | The current HTML content of the editor |
| `onChange` | `(html: string) => void` | - | Callback fired when content changes |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text when editor is empty |
| `readOnly` | `boolean` | `false` | Whether the editor is read-only |
| `autoFocus` | `boolean` | `false` | Whether to auto-focus on mount |
| `className` | `string` | `''` | Custom CSS class for the editor container |
| `style` | `React.CSSProperties` | - | Custom styles for the editor container |
| `showToolbar` | `boolean` | `true` | Whether to show the formatting toolbar |
| `toolbar` | `ReactNode` | - | Custom toolbar component |
| `maxHeight` | `number` | - | Maximum height of the editor in pixels |
| `minHeight` | `number` | `200` | Minimum height of the editor in pixels |

### Ref Methods

When using a ref, the following methods are available:

```jsx
import React, { useRef } from 'react';
import { RichTextEditor, RichTextEditorRef } from '@draeggiar/rich-text-editor';

function MyComponent() {
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleGetContent = () => {
    console.log(editorRef.current?.getHtml());
  };

  return (
    <RichTextEditor
      ref={editorRef}
      value="<p>Initial content</p>"
    />
  );
}
```

| Method | Description |
|--------|-------------|
| `getHtml()` | Returns the current HTML content |
| `setHtml(html: string)` | Sets the HTML content |
| `focus()` | Focuses the editor |
| `blur()` | Blurs the editor |
| `isFocused()` | Returns whether the editor is focused |

## Advanced Usage

### Custom Toolbar

```jsx
import { RichTextEditor } from '@draeggiar/rich-text-editor';

function CustomToolbar() {
  return (
    <div style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
      <button>Custom Button</button>
    </div>
  );
}

function MyComponent() {
  return (
    <RichTextEditor
      toolbar={<CustomToolbar />}
      value="<p>Content with custom toolbar</p>"
    />
  );
}
```

### Controlled with External State

```jsx
import React, { useState } from 'react';
import { RichTextEditor } from '@draeggiar/rich-text-editor';

function MyComponent() {
  const [content, setContent] = useState('<p>Initial content</p>');

  const handleReset = () => {
    setContent('<p>Reset content</p>');
  };

  return (
    <div>
      <button onClick={handleReset}>Reset Content</button>
      <RichTextEditor
        value={content}
        onChange={setContent}
      />
      <div>
        <h3>Current HTML:</h3>
        <pre>{content}</pre>
      </div>
    </div>
  );
}
```

## Styling

The editor comes with basic styling, but you can customize it:

```css
.rich-text-editor {
  /* Custom editor container styles */
}

.editor-toolbar {
  /* Custom toolbar styles */
}
```

## Development

### Building from Source

```bash
git clone https://github.com/Draeggiar/rich-text-editor.git
cd rich-text-editor
npm install
npm run build
```

### Available Scripts

- `npm run build` - Build the library for production
- `npm run dev` - Build in watch mode for development
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.