/**
 * Utilities for handling Microsoft Office HTML paste content
 */

/**
 * Clean and transform Microsoft Office HTML for use in the editor
 */
export const cleanOfficeHtml = (html: string): string => {
  if (!html) return '';

  // Create a temporary element to work with
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove Office-specific XML namespaces and elements
  removeOfficeXmlElements(tempDiv);
  
  // Clean up Office-specific styles and classes
  cleanOfficeStyles(tempDiv);
  
  // Convert Office-specific formatting to standard HTML
  convertOfficeFormatting(tempDiv);
  
  // Remove empty elements and normalize structure
  normalizeStructure(tempDiv);

  return tempDiv.innerHTML;
};

/**
 * Remove Office XML elements and namespaces
 */
const removeOfficeXmlElements = (element: Element): void => {
  // Remove Office-specific elements like <o:p>, <w:*>, <v:*>, etc.
  const officeSelectors = [
    'o\\:p', 'w\\:*', 'v\\:*', 'm\\:*', // Office XML elements
    '[class*="mso"]', // MSO classes
    'meta[name*="generator"]', // Office generator meta tags
    'link[rel="File-List"]', // Office file lists
    'xml', 'style' // XML and embedded styles
  ];

  officeSelectors.forEach(selector => {
    try {
      const elements = element.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    } catch (e) {
      // Ignore invalid selectors for some older browsers
    }
  });
};

/**
 * Clean Office-specific CSS styles and classes
 */
const cleanOfficeStyles = (element: Element): void => {
  const allElements = element.querySelectorAll('*');
  
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    
    // Remove Office-specific classes
    if (htmlEl.className) {
      htmlEl.className = htmlEl.className
        .split(' ')
        .filter(cls => !cls.match(/^(mso|xl|Mso|apple-|webkit-)/))
        .join(' ');
      
      if (!htmlEl.className.trim()) {
        htmlEl.removeAttribute('class');
      }
    }

    // Clean inline styles
    if (htmlEl.style) {
      cleanInlineStyles(htmlEl);
    }

    // Remove Office-specific attributes
    const attributesToRemove = [
      'data-ccp-props',
      'data-paste-markdown-skip',
      'data-contrast',
      'data-print-width',
      'data-listid',
      'data-list-def-props',
      'data-aria-posinset',
      'data-aria-level',
      'data-font',
      'data-listidns',
      'data-leveltext'
    ];

    attributesToRemove.forEach(attr => {
      if (htmlEl.hasAttribute(attr)) {
        htmlEl.removeAttribute(attr);
      }
    });
  });
};

/**
 * Clean inline styles, preserving only relevant formatting
 */
const cleanInlineStyles = (element: HTMLElement): void => {
  const style = element.style;
  const preservedStyles: { [key: string]: string } = {};

  // Preserve font formatting
  if (style.fontWeight && (style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700)) {
    // Will be handled by converting to <strong>
  }
  if (style.fontStyle === 'italic') {
    // Will be handled by converting to <em>
  }
  if (style.textDecoration && style.textDecoration.includes('underline')) {
    // Will be handled by converting to <u>
  }
  if (style.textDecoration && style.textDecoration.includes('line-through')) {
    // Will be handled by converting to <del>
  }

  // Preserve color if it's not default
  if (style.color && style.color !== 'rgb(0, 0, 0)' && style.color !== '#000000' && style.color !== 'black') {
    preservedStyles.color = style.color;
  }

  // Preserve background color if specified
  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    preservedStyles.backgroundColor = style.backgroundColor;
  }

  // Preserve font family
  if (style.fontFamily) {
    // Clean up font family (remove quotes, normalize)
    const fontFamily = style.fontFamily
      .replace(/['"]/g, '')
      .replace(/,\s*serif$|,\s*sans-serif$|,\s*monospace$/i, '');
    if (fontFamily && !fontFamily.match(/Times|Arial|Helvetica|sans-serif|serif/i)) {
      preservedStyles.fontFamily = fontFamily;
    }
  }

  // Preserve font size if reasonable
  if (style.fontSize) {
    const fontSize = style.fontSize;
    if (fontSize.match(/^\d+(\.\d+)?(px|pt|em|rem)$/)) {
      preservedStyles.fontSize = fontSize;
    }
  }

  // Clear all styles and add back only preserved ones
  element.removeAttribute('style');
  Object.keys(preservedStyles).forEach(prop => {
    element.style.setProperty(prop, preservedStyles[prop]);
  });
};

/**
 * Convert Office formatting to standard HTML elements
 */
const convertOfficeFormatting = (element: Element): void => {
  const allElements = Array.from(element.querySelectorAll('*'));
  
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    const style = htmlEl.style;

    // Convert bold styling to <strong>
    if (style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700) {
      if (!isInsideElement(htmlEl, ['strong', 'b'])) {
        wrapWithElement(htmlEl, 'strong');
      }
      style.removeProperty('font-weight');
    }

    // Convert italic styling to <em>
    if (style.fontStyle === 'italic') {
      if (!isInsideElement(htmlEl, ['em', 'i'])) {
        wrapWithElement(htmlEl, 'em');
      }
      style.removeProperty('font-style');
    }

    // Convert underline styling to <u>
    if (style.textDecoration && style.textDecoration.includes('underline')) {
      if (!isInsideElement(htmlEl, ['u'])) {
        wrapWithElement(htmlEl, 'u');
      }
      // Remove underline from text-decoration
      const decorations = style.textDecoration.split(' ').filter(d => d !== 'underline');
      if (decorations.length > 0) {
        style.textDecoration = decorations.join(' ');
      } else {
        style.removeProperty('text-decoration');
      }
    }

    // Convert strikethrough styling to <del>
    if (style.textDecoration && style.textDecoration.includes('line-through')) {
      if (!isInsideElement(htmlEl, ['del', 's', 'strike'])) {
        wrapWithElement(htmlEl, 'del');
      }
      // Remove line-through from text-decoration
      const decorations = style.textDecoration.split(' ').filter(d => d !== 'line-through');
      if (decorations.length > 0) {
        style.textDecoration = decorations.join(' ');
      } else {
        style.removeProperty('text-decoration');
      }
    }
  });
};

/**
 * Check if element is inside a specific type of element
 */
const isInsideElement = (element: Element, tagNames: string[]): boolean => {
  let parent = element.parentElement;
  while (parent) {
    if (tagNames.includes(parent.tagName.toLowerCase())) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
};

/**
 * Wrap element content with a new element
 */
const wrapWithElement = (element: HTMLElement, tagName: string): void => {
  const wrapper = document.createElement(tagName);
  
  // Move all child nodes to wrapper
  while (element.firstChild) {
    wrapper.appendChild(element.firstChild);
  }
  
  // Add wrapper as only child
  element.appendChild(wrapper);
};

/**
 * Normalize document structure and remove empty elements
 */
const normalizeStructure = (element: Element): void => {
  // Remove empty elements (except for br, hr, img, etc.)
  const voidElements = ['br', 'hr', 'img', 'input', 'area', 'base', 'col', 'embed', 'link', 'meta', 'source', 'track', 'wbr'];
  
  const allElements = Array.from(element.querySelectorAll('*'));
  allElements.reverse().forEach(el => {
    const tagName = el.tagName.toLowerCase();
    
    if (!voidElements.includes(tagName)) {
      const hasContent = el.textContent && el.textContent.trim();
      const hasNonTextChildren = Array.from(el.children).some(child => 
        voidElements.includes(child.tagName.toLowerCase())
      );
      
      if (!hasContent && !hasNonTextChildren) {
        el.remove();
      }
    }
  });

  // Convert div elements to paragraphs if they contain block content
  const divs = Array.from(element.querySelectorAll('div'));
  divs.forEach(div => {
    // If div has no block children and contains text, convert to p
    const hasBlockChildren = Array.from(div.children).some(child => {
      const blockElements = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'];
      return blockElements.includes(child.tagName.toLowerCase());
    });

    if (!hasBlockChildren && div.textContent && div.textContent.trim()) {
      const p = document.createElement('p');
      p.innerHTML = div.innerHTML;
      // Copy relevant attributes
      if (div.style.cssText) {
        p.style.cssText = div.style.cssText;
      }
      div.parentNode?.replaceChild(p, div);
    }
  });

  // Merge consecutive text formatting elements
  mergeConsecutiveFormattingElements(element);
};

/**
 * Merge consecutive formatting elements (like multiple <strong> elements)
 */
const mergeConsecutiveFormattingElements = (element: Element): void => {
  const formattingTags = ['strong', 'em', 'u', 'del', 'code', 'b', 'i', 's'];
  
  formattingTags.forEach(tagName => {
    let found = true;
    while (found) {
      found = false;
      const elements = Array.from(element.querySelectorAll(tagName));
      
      for (let i = 0; i < elements.length - 1; i++) {
        const current = elements[i];
        const next = elements[i + 1];
        
        if (current.nextSibling === next && 
            current.parentNode === next.parentNode) {
          // Merge the elements
          current.appendChild(document.createTextNode(' '));
          while (next.firstChild) {
            current.appendChild(next.firstChild);
          }
          next.remove();
          found = true;
          break;
        }
      }
    }
  });
};

/**
 * Detect if HTML content came from Microsoft Office
 */
export const isOfficeHtml = (html: string): boolean => {
  if (!html) return false;
  
  const officeIndicators = [
    /<!--\[if [^>]*mso[^>]*\]>/i, // Conditional comments for Office
    /mso-/i, // MSO CSS classes/styles
    /<o:p>/i, // Office paragraph elements
    /<w:/i, // Word XML elements
    /<v:/i, // VML elements
    /class="?Mso/i, // MSO classes
    /Microsoft\s+Word/i, // Generator meta
    /application\/vnd\.ms-/i, // Office MIME types
    /urn:schemas-microsoft-com:/i // Office XML namespaces
  ];

  return officeIndicators.some(indicator => indicator.test(html));
};