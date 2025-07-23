import { Descendant } from 'slate';
import { CustomElement, CustomText } from '../types';
import { cleanOfficeHtml, isOfficeHtml } from './officeHtmlTransform';

/**
 * Convert HTML string to Slate value
 */
export const htmlToSlate = (html: string): Descendant[] => {
  if (!html || html.trim() === '') {
    return [{ type: 'p', children: [{ text: '' }] } as CustomElement];
  }

  // Clean Office HTML if detected
  let cleanedHtml = html;
  if (isOfficeHtml(html)) {
    cleanedHtml = cleanOfficeHtml(html);
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanedHtml;

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

      // Extract style attributes for formatting
      const htmlElement = element as HTMLElement;
      const style = htmlElement.style;
      
      // Build formatting attributes from styles
      const textFormatting: Partial<CustomText> = {};
      if (style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700) {
        textFormatting.bold = true;
      }
      if (style.fontStyle === 'italic') {
        textFormatting.italic = true;
      }
      if (style.textDecoration && style.textDecoration.includes('underline')) {
        textFormatting.underline = true;
      }
      if (style.textDecoration && style.textDecoration.includes('line-through')) {
        textFormatting.strikethrough = true;
      }
      if (style.color && style.color !== 'rgb(0, 0, 0)' && style.color !== '#000000') {
        textFormatting.color = style.color;
      }
      if (style.backgroundColor && style.backgroundColor !== 'transparent') {
        textFormatting.backgroundColor = style.backgroundColor;
      }
      if (style.fontFamily) {
        textFormatting.fontFamily = style.fontFamily.replace(/['"]/g, '');
      }
      if (style.fontSize) {
        textFormatting.fontSize = style.fontSize;
      }

      // Handle text formatting elements by applying marks to children
      if (['strong', 'b'].includes(tagName)) {
        return children.map(child => 
          'text' in child ? { ...child, bold: true, ...textFormatting } as CustomText : child
        );
      }
      
      if (['em', 'i'].includes(tagName)) {
        return children.map(child => 
          'text' in child ? { ...child, italic: true, ...textFormatting } as CustomText : child
        );
      }
      
      if (tagName === 'u') {
        return children.map(child => 
          'text' in child ? { ...child, underline: true, ...textFormatting } as CustomText : child
        );
      }
      
      if (['del', 's'].includes(tagName)) {
        return children.map(child => 
          'text' in child ? { ...child, strikethrough: true, ...textFormatting } as CustomText : child
        );
      }
      
      if (['code'].includes(tagName)) {
        return children.map(child => 
          'text' in child ? { ...child, code: true, ...textFormatting } as CustomText : child
        );
      }

      // Handle span elements with inline styles
      if (tagName === 'span' && Object.keys(textFormatting).length > 0) {
        return children.map(child => 
          'text' in child ? { ...child, ...textFormatting } as CustomText : child
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
        case 'span':
          // For spans without formatting, just return children
          return children;
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
      const textNode = node as CustomText;
      
      // Build inline styles
      const styles: string[] = [];
      if (textNode.color) {
        styles.push(`color: ${textNode.color}`);
      }
      if (textNode.backgroundColor) {
        styles.push(`background-color: ${textNode.backgroundColor}`);
      }
      if (textNode.fontFamily) {
        styles.push(`font-family: ${textNode.fontFamily}`);
      }
      if (textNode.fontSize) {
        styles.push(`font-size: ${textNode.fontSize}`);
      }
      
      const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
      
      // Wrap text in formatting tags in a consistent order
      const formatTags = [
        { condition: textNode.bold, tag: 'strong' },
        { condition: textNode.italic, tag: 'em' },
        { condition: textNode.underline, tag: 'u' },
        { condition: textNode.strikethrough, tag: 'del' },
        { condition: textNode.code, tag: 'code' },
      ];
      
      formatTags.forEach(({ condition, tag }) => {
        if (condition) {
          text = `<${tag}>${text}</${tag}>`;
        }
      });
      
      // Apply styles to the outermost element if present
      if (styleAttr) {
        text = `<span${styleAttr}>${text}</span>`;
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