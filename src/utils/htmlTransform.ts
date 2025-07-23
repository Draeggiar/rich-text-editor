import { TElement, TText } from '@platejs/slate';
import { CustomText } from '../types';
import { cleanOfficeHtml, isOfficeHtml } from './officeHtmlTransform';

/**
 * Convert HTML string to Plate value
 */
export const htmlToSlate = (html: string): TElement[] => {
  if (!html || html.trim() === '') {
    return [{ type: 'p', children: [{ text: '' }] }];
  }

  // Clean Office HTML if detected
  let cleanedHtml = html;
  if (isOfficeHtml(html)) {
    cleanedHtml = cleanOfficeHtml(html);
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanedHtml;

  const parseNode = (node: Node): TElement | TText | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      return text ? ({ text } as TText) : null;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      const children: (TElement | TText)[] = [];
      Array.from(element.childNodes).forEach(childNode => {
        const parsed = parseNode(childNode);
        if (parsed) {
          children.push(parsed);
        }
      });
      
      // If no children, add empty text node
      if (children.length === 0) {
        children.push({ text: '' } as TText);
      }

      // Extract style attributes for formatting
      const computedStyle = (element as HTMLElement).style;
      const marks: Partial<CustomText> = {};
      
      if (computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700) {
        marks.bold = true;
      }
      if (computedStyle.fontStyle === 'italic') {
        marks.italic = true;
      }
      if (computedStyle.textDecoration?.includes('underline')) {
        marks.underline = true;
      }
      if (computedStyle.textDecoration?.includes('line-through')) {
        marks.strikethrough = true;
      }
      if (computedStyle.color && computedStyle.color !== 'rgb(0, 0, 0)') {
        marks.color = computedStyle.color;
      }
      if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'transparent') {
        marks.backgroundColor = computedStyle.backgroundColor;
      }
      if (computedStyle.fontFamily) {
        marks.fontFamily = computedStyle.fontFamily;
      }
      if (computedStyle.fontSize) {
        marks.fontSize = computedStyle.fontSize;
      }

      // Apply marks to text children
      if (Object.keys(marks).length > 0) {
        children.forEach(child => {
          if ('text' in child) {
            Object.assign(child, marks);
          }
        });
      }

      // Handle specific HTML elements
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return { type: tagName, children } as TElement;
        
        case 'ul':
        case 'ol':
          return { type: tagName, children } as TElement;
          
        case 'li':
          return { type: 'li', children } as TElement;
          
        case 'blockquote':
          return { type: 'blockquote', children } as TElement;
          
        case 'strong':
        case 'b':
          // Apply bold mark to all text children
          children.forEach(child => {
            if ('text' in child) {
              child.bold = true;
            }
          });
          // Return children directly (inline element)
          return children.length === 1 ? children[0] : null;
          
        case 'em':
        case 'i':
          // Apply italic mark to all text children
          children.forEach(child => {
            if ('text' in child) {
              child.italic = true;
            }
          });
          return children.length === 1 ? children[0] : null;
          
        case 'u':
          // Apply underline mark to all text children
          children.forEach(child => {
            if ('text' in child) {
              child.underline = true;
            }
          });
          return children.length === 1 ? children[0] : null;
          
        case 'del':
        case 's':
        case 'strike':
          // Apply strikethrough mark to all text children
          children.forEach(child => {
            if ('text' in child) {
              child.strikethrough = true;
            }
          });
          return children.length === 1 ? children[0] : null;
          
        case 'code':
          // Apply code mark to all text children
          children.forEach(child => {
            if ('text' in child) {
              child.code = true;
            }
          });
          return children.length === 1 ? children[0] : null;
          
        case 'p':
        case 'div':
        default:
          // Default to paragraph
          return { type: 'p', children } as TElement;
      }
    }

    return null;
  };

  const result: TElement[] = [];
  Array.from(tempDiv.childNodes).forEach(node => {
    const parsed = parseNode(node);
    if (parsed && 'type' in parsed) {
      result.push(parsed as TElement);
    }
  });

  return result.length > 0 ? result : [{ type: 'p', children: [{ text: '' }] }];
};

/**
 * Convert Plate value to HTML string
 */
export const slateToHtml = (value: TElement[]): string => {
  const serialize = (node: TElement | TText): string => {
    if ('text' in node) {
      let text = node.text;
      
      // Apply text formatting
      if (node.bold) {
        text = `<strong>${text}</strong>`;
      }
      if (node.italic) {
        text = `<em>${text}</em>`;
      }
      if (node.underline) {
        text = `<u>${text}</u>`;
      }
      if (node.strikethrough) {
        text = `<del>${text}</del>`;
      }
      if (node.code) {
        text = `<code>${text}</code>`;
      }
      
      // Apply color and other styles
      const styles: string[] = [];
      if (node.color) {
        styles.push(`color: ${node.color}`);
      }
      if (node.backgroundColor) {
        styles.push(`background-color: ${node.backgroundColor}`);
      }
      if (node.fontFamily) {
        styles.push(`font-family: ${node.fontFamily}`);
      }
      if (node.fontSize) {
        styles.push(`font-size: ${node.fontSize}`);
      }
      
      if (styles.length > 0) {
        text = `<span style="${styles.join('; ')}">${text}</span>`;
      }
      
      return text as string;
    }

    const children = node.children.map(child => serialize(child)).join('');
    
    switch (node.type) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return `<${node.type}>${children}</${node.type}>`;
      case 'p':
        return `<p>${children}</p>`;
      case 'ul':
        return `<ul>${children}</ul>`;
      case 'ol':
        return `<ol>${children}</ol>`;
      case 'li':
        return `<li>${children}</li>`;
      case 'blockquote':
        return `<blockquote>${children}</blockquote>`;
      default:
        return `<p>${children}</p>`;
    }
  };

  return value.map(node => serialize(node)).join('');
};