/**
 * Office HTML Plugin for handling Microsoft Office paste content
 * This is a simplified implementation that integrates with the content editable approach
 */

import { cleanOfficeHtml, isOfficeHtml } from './officeHtmlTransform';

/**
 * Enhance content editable element to handle Office paste
 */
export const withOfficeHtmlSupport = (
  element: HTMLDivElement,
  onChange: (html: string) => void
) => {
  const handlePaste = (event: ClipboardEvent) => {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    // Get HTML content from clipboard
    const htmlData = clipboardData.getData('text/html');
    if (!htmlData) return;

    // Check if this is Office content
    if (isOfficeHtml(htmlData)) {
      // Prevent default paste behavior
      event.preventDefault();

      // Clean the Office HTML
      const cleanedHtml = cleanOfficeHtml(htmlData);

      // Insert the cleaned content
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create a document fragment from the cleaned HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanedHtml;
        
        // Insert each child node
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        range.insertNode(fragment);
        
        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger change event
        onChange(element.innerHTML);
      }
    }
  };

  // Add paste event listener
  element.addEventListener('paste', handlePaste);

  // Return cleanup function
  return () => {
    element.removeEventListener('paste', handlePaste);
  };
};