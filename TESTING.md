# Testing Documentation

This document describes the comprehensive testing framework implemented for the Rich Text Editor library.

## Overview

The testing suite includes:
- **Unit Tests**: Jest + React Testing Library for component and utility testing
- **E2E Tests**: Playwright for end-to-end browser testing
- **Code Coverage**: Jest coverage reporting
- **Cross-browser Testing**: Chromium, Firefox, and WebKit support

## Test Structure

```
tests/
├── setup.ts                      # Test configuration and mocks
├── RichTextEditor.test.tsx       # Main editor component tests
├── EditorToolbar.test.tsx        # Toolbar component tests
├── officeHtmlTransform.test.ts   # Office HTML cleaning utilities
├── htmlTransform.test.ts         # HTML/Slate transformation tests
└── officeHtmlSupport.test.ts     # Office paste functionality tests

e2e/
├── test-app.html                 # Test application for E2E tests
└── editor.spec.ts               # Playwright E2E test scenarios
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright browsers (one-time setup)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

### All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Unit Test Categories

### 1. RichTextEditor Component Tests

**Basic Rendering**
- Default props and rendering
- Custom className and styling
- Placeholder text
- Initial value

**Props Behavior**
- Toolbar visibility
- Custom toolbar rendering
- Height constraints
- Auto-focus functionality

**ReadOnly Mode**
- ReadOnly rendering and behavior
- Toolbar hiding in readonly mode
- Readonly styling
- Accessibility attributes

**Content Changes**
- onChange callback functionality
- Content updates via props
- ReadOnly mode restrictions

**Ref Methods**
- getHtml() method
- setHtml() method
- focus() and blur() methods
- isFocused() method

**Error Handling**
- Invalid HTML handling
- Null/undefined values
- Edge cases

**Accessibility**
- ARIA attributes
- Role assignments
- ReadOnly accessibility

### 2. EditorToolbar Component Tests

- Button rendering and styling
- Click event handling
- Icon display
- Toolbar structure
- Accessibility features

### 3. Office HTML Transform Tests

**HTML Detection**
- Office HTML indicators (MSO classes, XML elements, etc.)
- False positive prevention
- Edge cases

**HTML Cleaning**
- Office-specific element removal
- Style cleaning and preservation
- Attribute removal
- Text formatting conversion
- Structure normalization

### 4. HTML Transform Tests

**HTML to Slate Conversion**
- Basic element conversion
- Text formatting preservation
- List and heading handling
- Style attribute processing
- Office HTML integration

**Slate to HTML Conversion**
- Element serialization
- Text formatting export
- Structure preservation
- Round-trip compatibility

### 5. Office HTML Support Tests

**Setup and Cleanup**
- Event listener management
- Memory leak prevention

**Paste Event Handling**
- Office HTML detection
- Content cleaning and insertion
- Selection management
- Error handling

## E2E Test Scenarios

### 1. Basic Functionality
- Initial content rendering
- Text input and editing
- HTML output synchronization

### 2. Toolbar Functionality
- Bold, italic, underline formatting
- Heading creation (H1, H2)
- List creation (bulleted, numbered)
- Button interactions

### 3. Keyboard Shortcuts
- Ctrl/Cmd+B for bold
- Ctrl/Cmd+I for italic
- Ctrl/Cmd+U for underline

### 4. Control Buttons
- Sample content loading
- Content clearing
- Focus/blur operations
- HTML setting via ref

### 5. ReadOnly Mode
- Editing prevention
- Toolbar hiding
- Visual styling changes
- Accessibility compliance

### 6. Styling and Appearance
- CSS styling verification
- Custom styling application
- Placeholder visibility
- Responsive behavior

### 7. Content Persistence
- Content preservation during interactions
- Complex formatting persistence
- State management

### 8. Edge Cases
- Rapid user interactions
- Large content handling
- Special character support
- Error recovery

### 9. Cross-browser Compatibility
- Functionality across browsers
- Consistent behavior
- Browser-specific feature testing

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  // ... additional configuration
};
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // ... additional configuration
});
```

## Test Mocks and Setup

The test setup includes comprehensive mocks for:

- **ClipboardEvent**: For testing Office paste functionality
- **Selection API**: For range and selection operations
- **Document methods**: execCommand, createRange, etc.
- **Focus/blur behavior**: For testing editor interactions

## Coverage Goals

The testing suite aims for:
- **95%+ Code Coverage**: All critical paths covered
- **Component Coverage**: Every public API tested
- **Integration Coverage**: Real-world usage scenarios
- **Error Coverage**: Edge cases and error conditions

## Continuous Integration

Tests are designed to run in CI environments with:
- Deterministic behavior
- No external dependencies
- Cross-platform compatibility
- Performance optimization

## Best Practices

1. **Test Isolation**: Each test is independent and self-contained
2. **Real User Scenarios**: Tests mirror actual user interactions
3. **Accessibility**: Testing includes accessibility compliance
4. **Performance**: Tests verify performance characteristics
5. **Maintainability**: Tests are easy to read and maintain

## Troubleshooting

### Common Issues

1. **Focus/Blur Tests**: Browser focus behavior varies in test environments
2. **ClipboardEvent**: Requires polyfills for jsdom compatibility
3. **Selection API**: Mock implementation for consistent behavior
4. **Timing Issues**: Use appropriate waits and timeouts

### Debug Tips

1. Use `--verbose` flag for detailed test output
2. Enable debug mode for Playwright tests
3. Check browser console for E2E test errors
4. Verify test environment setup and dependencies

## Future Enhancements

Planned testing improvements:
- Visual regression testing
- Performance benchmarking
- Mobile device testing
- Accessibility automation
- Integration with design systems