import '@testing-library/jest-dom';
import { act } from '@testing-library/react';

// Polyfill ClipboardEvent for jsdom
global.ClipboardEvent = class ClipboardEvent extends Event {
  clipboardData: DataTransfer | null;
  
  constructor(type: string, options: ClipboardEventInit = {}) {
    super(type, options);
    this.clipboardData = options.clipboardData || null;
  }
} as any;

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
});

// Mock window.getSelection
global.Range = class Range {
  selectNode = jest.fn();
  selectNodeContents = jest.fn();
  deleteContents = jest.fn();
  insertNode = jest.fn();
  collapse = jest.fn();
  getBoundingClientRect = jest.fn(() => ({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
  }));
  getClientRects = jest.fn(() => []);
};

global.Selection = class Selection {
  rangeCount = 0;
  anchorNode = null;
  anchorOffset = 0;
  focusNode = null;
  focusOffset = 0;
  isCollapsed = true;
  
  getRangeAt = jest.fn(() => new Range());
  removeAllRanges = jest.fn();
  addRange = jest.fn();
  selectAllChildren = jest.fn();
  setBaseAndExtent = jest.fn();
  toString = jest.fn(() => '');
};

global.getSelection = jest.fn(() => new Selection());

// Mock document.execCommand
document.execCommand = jest.fn();

// Mock createRange
document.createRange = jest.fn(() => new Range());

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Reset selection mock
  (global.getSelection as jest.Mock).mockReturnValue(new Selection());
});

// Automatically wrap React state updates in act()
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});