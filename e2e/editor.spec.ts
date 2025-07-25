import { test, expect } from '@playwright/test';

test.describe('Rich Text Editor E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test app
    await page.goto('/e2e/test-app.html');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="editor-content"]');
  });

  test.describe('Basic Functionality', () => {
    test('renders with initial content', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await expect(editor).toBeVisible();
      await expect(htmlOutput).toContainText('Hello');
      await expect(htmlOutput).toContainText('world');
      await expect(htmlOutput).toContainText('<strong>');
    });

    test('allows typing text', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      // Clear and type new content
      await editor.click();
      await editor.fill('');
      await editor.type('New text content');
      
      // Verify content updates
      await expect(htmlOutput).toContainText('New text content');
    });

    test('updates HTML output when content changes', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await editor.click();
      await editor.fill('');
      await editor.type('Test content');
      
      // The HTML output should update
      await expect(htmlOutput).toContainText('Test content');
    });
  });

  test.describe('Toolbar Functionality', () => {
    test('bold button makes text bold', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const boldButton = page.locator('[data-testid="toolbar-bold"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await editor.click();
      await editor.fill('');
      await editor.type('Bold text');
      
      // Select all text and make it bold
      await editor.press('Meta+a'); // Cmd+A on Mac, Ctrl+A on others
      await boldButton.click();
      
      // Check HTML contains bold tags
      await expect(htmlOutput).toContainText('<b>');
    });

    test('italic button makes text italic', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const italicButton = page.locator('[data-testid="toolbar-italic"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await editor.click();
      await editor.fill('');
      await editor.type('Italic text');
      
      await editor.press('Meta+a');
      await italicButton.click();
      
      await expect(htmlOutput).toContainText('<i>');
    });

    test('underline button makes text underlined', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const underlineButton = page.locator('[data-testid="toolbar-underline"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await editor.click();
      await editor.fill('');
      await editor.type('Underlined text');
      
      await editor.press('Meta+a');
      await underlineButton.click();
      
      await expect(htmlOutput).toContainText('<u>');
    });

    test('heading buttons create headings', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const h1Button = page.locator('[data-testid="toolbar-h1"]');
      const h2Button = page.locator('[data-testid="toolbar-h2"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      // Test H1
      await editor.click();
      await editor.fill('');
      await editor.type('Heading 1');
      await editor.press('Meta+a');
      await h1Button.click();
      
      await expect(htmlOutput).toContainText('<h1>');
      
      // Test H2
      await editor.press('End');
      await editor.press('Enter');
      await editor.type('Heading 2');
      await editor.press('Meta+a'); // Select the line
      await h2Button.click();
      
      await expect(htmlOutput).toContainText('<h2>');
    });

    test('list buttons create lists', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const ulButton = page.locator('[data-testid="toolbar-ul"]');
      const olButton = page.locator('[data-testid="toolbar-ol"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      // Test unordered list
      await editor.click();
      await editor.fill('');
      await editor.type('List item');
      await ulButton.click();
      
      await expect(htmlOutput).toContainText('<ul>');
      await expect(htmlOutput).toContainText('<li>');
      
      // Test ordered list
      await editor.press('End');
      await editor.press('Enter');
      await editor.type('Numbered item');
      await olButton.click();
      
      await expect(htmlOutput).toContainText('<ol>');
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('Cmd/Ctrl+B makes text bold', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await editor.click();
      await editor.fill('');
      await editor.type('Bold text');
      await editor.press('Meta+a');
      await editor.press('Meta+b');
      
      await expect(htmlOutput).toContainText('<b>');
    });

    test('Cmd/Ctrl+I makes text italic', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await editor.click();
      await editor.fill('');
      await editor.type('Italic text');
      await editor.press('Meta+a');
      await editor.press('Meta+i');
      
      await expect(htmlOutput).toContainText('<i>');
    });

    test('Cmd/Ctrl+U makes text underlined', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await editor.click();
      await editor.fill('');
      await editor.type('Underlined text');
      await editor.press('Meta+a');
      await editor.press('Meta+u');
      
      await expect(htmlOutput).toContainText('<u>');
    });
  });

  test.describe('Control Buttons', () => {
    test('set sample content button works', async ({ page }) => {
      const setSampleButton = page.locator('[data-testid="set-sample"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await setSampleButton.click();
      
      await expect(htmlOutput).toContainText('<h1>Rich Text Editor</h1>');
      await expect(htmlOutput).toContainText('<strong>bold</strong>');
      await expect(htmlOutput).toContainText('<em>italic</em>');
      await expect(htmlOutput).toContainText('<u>underlined</u>');
      await expect(htmlOutput).toContainText('<ul>');
      await expect(htmlOutput).toContainText('<li>');
    });

    test('clear content button works', async ({ page }) => {
      const clearButton = page.locator('[data-testid="clear-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await clearButton.click();
      
      await expect(htmlOutput).toBeEmpty();
    });

    test('set HTML via ref button works', async ({ page }) => {
      const setHtmlButton = page.locator('[data-testid="set-html"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await setHtmlButton.click();
      
      await expect(htmlOutput).toContainText('Content set via');
      await expect(htmlOutput).toContainText('<strong>ref</strong>');
    });

    test('focus and blur buttons work', async ({ page }) => {
      const focusButton = page.locator('[data-testid="focus-editor"]');
      const blurButton = page.locator('[data-testid="blur-editor"]');
      const editor = page.locator('[data-testid="editor-content"]');
      
      // Focus the editor
      await focusButton.click();
      await expect(editor).toBeFocused();
      
      // Blur the editor
      await blurButton.click();
      await expect(editor).not.toBeFocused();
    });
  });

  test.describe('Read-Only Mode', () => {
    test('readonly checkbox disables editing', async ({ page }) => {
      const readOnlyCheckbox = page.locator('[data-testid="readonly-checkbox"]');
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      const originalContent = await htmlOutput.textContent();
      
      // Enable readonly mode
      await readOnlyCheckbox.check();
      
      // Try to edit - should not work
      await editor.click();
      await editor.type('This should not appear');
      
      // Content should remain unchanged
      const newContent = await htmlOutput.textContent();
      expect(newContent).toBe(originalContent);
      
      // Editor should have readonly attributes
      await expect(editor).toHaveAttribute('contenteditable', 'false');
      await expect(editor).toHaveAttribute('aria-readonly', 'true');
    });

    test('readonly mode hides toolbar', async ({ page }) => {
      const readOnlyCheckbox = page.locator('[data-testid="readonly-checkbox"]');
      const boldButton = page.locator('[data-testid="toolbar-bold"]');
      
      // Initially toolbar should be visible
      await expect(boldButton).toBeVisible();
      
      // Enable readonly mode
      await readOnlyCheckbox.check();
      
      // Toolbar should be hidden
      await expect(boldButton).not.toBeVisible();
      
      // Disable readonly mode
      await readOnlyCheckbox.uncheck();
      
      // Toolbar should be visible again
      await expect(boldButton).toBeVisible();
    });

    test('dedicated readonly editor works', async ({ page }) => {
      // Find the dedicated readonly editor (the second one)
      const readonlyEditors = page.locator('[role="document"]');
      const readonlyEditor = readonlyEditors.nth(0); // First readonly editor
      
      await expect(readonlyEditor).toBeVisible();
      await expect(readonlyEditor).toHaveAttribute('contenteditable', 'false');
      await expect(readonlyEditor).toContainText('Read-Only Content');
      await expect(readonlyEditor).toContainText('read-only');
      
      // Should not be editable
      await readonlyEditor.click();
      await readonlyEditor.type('This should not work');
      
      // Content should still contain original text
      await expect(readonlyEditor).toContainText('Read-Only Content');
      await expect(readonlyEditor).not.toContainText('This should not work');
    });
  });

  test.describe('Styling and Appearance', () => {
    test('editor has proper styling', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const editorContainer = editor.locator('..');
      
      // Check basic styling
      await expect(editorContainer).toHaveCSS('border', '1px solid rgb(225, 229, 233)');
      await expect(editorContainer).toHaveCSS('border-radius', '6px');
      await expect(editor).toHaveCSS('padding', '12px');
    });

    test('custom styled editor has custom styling', async ({ page }) => {
      // The custom editor in the third section
      const customEditorSection = page.locator('.section').nth(2);
      const customEditor = customEditorSection.locator('[data-testid="editor-content"]');
      const customContainer = customEditor.locator('..');
      
      await expect(customContainer).toHaveCSS('border', '2px solid rgb(0, 123, 255)');
      await expect(customContainer).toHaveCSS('border-radius', '10px');
    });

    test('placeholder is shown when empty', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const clearButton = page.locator('[data-testid="clear-content"]');
      
      // Clear content to show placeholder
      await clearButton.click();
      
      // Check that placeholder attribute is set
      await expect(editor).toHaveAttribute('data-placeholder', 'Type something here...');
    });
  });

  test.describe('Content Persistence', () => {
    test('content persists between interactions', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      // Type some content
      await editor.click();
      await editor.fill('');
      await editor.type('Persistent content');
      
      // Click elsewhere and back
      await page.locator('h1').click();
      await editor.click();
      
      // Content should still be there
      await expect(htmlOutput).toContainText('Persistent content');
    });

    test('complex formatting persists', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const boldButton = page.locator('[data-testid="toolbar-bold"]');
      const italicButton = page.locator('[data-testid="toolbar-italic"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      // Create complex content
      await editor.click();
      await editor.fill('');
      await editor.type('Normal ');
      
      // Add bold text
      await boldButton.click();
      await editor.type('bold ');
      await boldButton.click(); // Turn off bold
      
      // Add italic text
      await italicButton.click();
      await editor.type('italic');
      await italicButton.click(); // Turn off italic
      
      await editor.type(' normal');
      
      // Check that formatting is preserved
      await expect(htmlOutput).toContainText('Normal');
      await expect(htmlOutput).toContainText('<b>bold</b>');
      await expect(htmlOutput).toContainText('<i>italic</i>');
    });
  });

  test.describe('Edge Cases', () => {
    test('handles rapid clicking', async ({ page }) => {
      const boldButton = page.locator('[data-testid="toolbar-bold"]');
      const editor = page.locator('[data-testid="editor-content"]');
      
      await editor.click();
      await editor.fill('');
      await editor.type('Test text');
      await editor.press('Meta+a');
      
      // Rapidly click bold button multiple times
      for (let i = 0; i < 5; i++) {
        await boldButton.click();
        await page.waitForTimeout(50);
      }
      
      // Should not crash and should handle gracefully
      await expect(editor).toBeVisible();
    });

    test('handles very long content', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      const longText = 'This is a very long text content that should test how the editor handles large amounts of text. '.repeat(50);
      
      await editor.click();
      await editor.fill('');
      await editor.type(longText.substring(0, 500)); // Type a portion to avoid timeout
      
      await expect(htmlOutput).toContainText('This is a very long text');
    });

    test('handles special characters', async ({ page }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      const specialText = 'Special chars: <>&"\'äöüß€@#$%^&*()';
      
      await editor.click();
      await editor.fill('');
      await editor.type(specialText);
      
      // Special characters should be handled properly
      await expect(htmlOutput).toContainText('Special chars:');
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('basic functionality works across browsers', async ({ page, browserName }) => {
      const editor = page.locator('[data-testid="editor-content"]');
      const boldButton = page.locator('[data-testid="toolbar-bold"]');
      const htmlOutput = page.locator('[data-testid="html-output"]');
      
      await editor.click();
      await editor.fill('');
      await editor.type('Cross-browser test');
      await editor.press('Meta+a');
      await boldButton.click();
      
      // Should work in all browsers
      expect(['chromium', 'firefox', 'webkit']).toContain(browserName);
      await expect(htmlOutput).toContainText('Cross-browser test');
    });
  });
});