import { Descendant } from 'slate';
import { CustomElement, CustomText } from '../types';

/**
 * Convert HTML string to Slate value
 */
export const htmlToSlate = (html: string): Descendant[] => {
  if (!html || html.trim() === '') {
    return [{ type: 'p', children: [{ text: '' }] } as CustomElement];
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const parseNode = (node: Node): Descendant | Descendant[] | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      return text ? ({ text } as CustomText) : null;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      const children: Descendant[] = [];
      Array.from(element.childNodes).forEach(childNode => {
        const parsed = parseNode(childNode);
        if (parsed) {
          if (Array.isArray(parsed)) {
            children.push(...parsed);
          } else {
            children.push(parsed);
          }
        }
      });
      
      // If no children, add empty text node
      if (children.length === 0) {
        children.push({ text: '' } as CustomText);
      }

      // Handle text formatting elements by applying marks to children
      if (['strong', 'b'].includes(tagName)) {
        return children.map(child => 
          'text' in child ? { ...child, bold: true } as CustomText : child
        );
      }
      
      if (['em', 'i'].includes(tagName)) {
        return children.map(child => 
          'text' in child ? { ...child, italic: true } as CustomText : child
        );
      }
      
      if (tagName === 'u') {
        return children.map(child => 
          'text' in child ? { ...child, underline: true } as CustomText : child
        );
      }
      
      if (['del', 's'].includes(tagName)) {
        return children.map(child => 
          'text' in child ? { ...child, strikethrough: true } as CustomText : child
        );
      }
      
      if (['code'].includes(tagName)) {
        return children.map(child => 
          'text' in child ? { ...child, code: true } as CustomText : child
        );
      }

      // Handle block elements
      switch (tagName) {
        case 'p':
          return { type: 'p', children: children as CustomText[] } as CustomElement;
        case 'h1':
          return { type: 'h1', children: children as CustomText[] } as CustomElement;
        case 'h2':
          return { type: 'h2', children: children as CustomText[] } as CustomElement;
        case 'h3':
          return { type: 'h3', children: children as CustomText[] } as CustomElement;
        case 'h4':
          return { type: 'h4', children: children as CustomText[] } as CustomElement;
        case 'h5':
          return { type: 'h5', children: children as CustomText[] } as CustomElement;
        case 'h6':
          return { type: 'h6', children: children as CustomText[] } as CustomElement;
        case 'ul':
          return { type: 'ul', children: children as any[] } as CustomElement;
        case 'ol':
          return { type: 'ol', children: children as any[] } as CustomElement;
        case 'li':
          return { type: 'li', children: children as CustomText[] } as CustomElement;
        case 'blockquote':
          return { type: 'blockquote', children: children as CustomText[] } as CustomElement;
        case 'br':
          return { text: '\n' } as CustomText;
        case 'div':
          // Treat div as paragraph if it has block content
          return { type: 'p', children: children as CustomText[] } as CustomElement;
        default:
          // For unknown elements, return children
          return children;
      }
    }

    return null;
  };

  const result: Descendant[] = [];
  Array.from(tempDiv.childNodes).forEach(node => {
    const parsed = parseNode(node);
    if (parsed) {
      if (Array.isArray(parsed)) {
        result.push(...parsed);
      } else {
        result.push(parsed);
      }
    }
  });
  
  // Ensure we have at least one paragraph
  return result.length > 0 ? result : [{ type: 'p', children: [{ text: '' }] } as CustomElement];
};

/**
 * Convert Slate value to HTML string
 */
export const slateToHtml = (value: Descendant[]): string => {
  if (!value || value.length === 0) {
    return '';
  }

  const serializeNode = (node: Descendant): string => {
    if ('text' in node) {
      let text = node.text;
      
      if ((node as CustomText).bold) {
        text = `<strong>${text}</strong>`;
      }
      if ((node as CustomText).italic) {
        text = `<em>${text}</em>`;
      }
      if ((node as CustomText).underline) {
        text = `<u>${text}</u>`;
      }
      if ((node as CustomText).strikethrough) {
        text = `<del>${text}</del>`;
      }
      if ((node as CustomText).code) {
        text = `<code>${text}</code>`;
      }
      
      return text;
    }

    const element = node as CustomElement;
    const children = 'children' in element && element.children 
      ? element.children.map(serializeNode).join('') 
      : '';

    if ('type' in element) {
      switch (element.type) {
        case 'p':
          return `<p>${children}</p>`;
        case 'h1':
          return `<h1>${children}</h1>`;
        case 'h2':
          return `<h2>${children}</h2>`;
        case 'h3':
          return `<h3>${children}</h3>`;
        case 'h4':
          return `<h4>${children}</h4>`;
        case 'h5':
          return `<h5>${children}</h5>`;
        case 'h6':
          return `<h6>${children}</h6>`;
        case 'ul':
          return `<ul>${children}</ul>`;
        case 'ol':
          return `<ol>${children}</ol>`;
        case 'li':
          return `<li>${children}</li>`;
        case 'blockquote':
          return `<blockquote>${children}</blockquote>`;
        default:
          return children;
      }
    }

    return children;
  };

  return value.map(serializeNode).join('');
};