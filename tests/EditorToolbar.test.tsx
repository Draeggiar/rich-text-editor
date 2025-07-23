import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorToolbar } from '../src/components/EditorToolbar';

describe('EditorToolbar', () => {
  beforeEach(() => {
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all toolbar buttons', () => {
    render(<EditorToolbar />);
    
    // Check all expected buttons are present
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Underline')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 1')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 2')).toBeInTheDocument();
    expect(screen.getByTitle('Bulleted List')).toBeInTheDocument();
    expect(screen.getByTitle('Numbered List')).toBeInTheDocument();
  });

  it('displays correct button icons', () => {
    render(<EditorToolbar />);
    
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('H1')).toBeInTheDocument();
    expect(screen.getByText('H2')).toBeInTheDocument();
    expect(screen.getByText('•')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
  });

  it('calls console.log when buttons are clicked', () => {
    render(<EditorToolbar />);
    
    // Test Bold button
    fireEvent.click(screen.getByTitle('Bold'));
    expect(console.log).toHaveBeenCalledWith('Bold clicked');
    
    // Test Italic button
    fireEvent.click(screen.getByTitle('Italic'));
    expect(console.log).toHaveBeenCalledWith('Italic clicked');
    
    // Test Underline button
    fireEvent.click(screen.getByTitle('Underline'));
    expect(console.log).toHaveBeenCalledWith('Underline clicked');
    
    // Test H1 button
    fireEvent.click(screen.getByTitle('Heading 1'));
    expect(console.log).toHaveBeenCalledWith('H1 clicked');
    
    // Test H2 button
    fireEvent.click(screen.getByTitle('Heading 2'));
    expect(console.log).toHaveBeenCalledWith('H2 clicked');
    
    // Test Bullet List button
    fireEvent.click(screen.getByTitle('Bulleted List'));
    expect(console.log).toHaveBeenCalledWith('Bullet list clicked');
    
    // Test Numbered List button
    fireEvent.click(screen.getByTitle('Numbered List'));
    expect(console.log).toHaveBeenCalledWith('Numbered list clicked');
  });

  it('has proper toolbar structure and styling', () => {
    render(<EditorToolbar />);
    
    const toolbar = document.querySelector('.editor-toolbar');
    expect(toolbar).toBeInTheDocument();
    expect(toolbar).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
      borderBottom: '1px solid #e1e5e9',
      backgroundColor: '#f8f9fa',
      gap: '4px',
      flexWrap: 'wrap'
    });
  });

  it('includes separator between format and heading buttons', () => {
    render(<EditorToolbar />);
    
    const toolbar = document.querySelector('.editor-toolbar');
    const separator = toolbar?.querySelector('div[style*="width: 1px"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveStyle({
      width: '1px',
      height: '20px',
      backgroundColor: '#e1e5e9',
      margin: '0 4px'
    });
  });

  it('buttons have correct styling', () => {
    render(<EditorToolbar />);
    
    const boldButton = screen.getByTitle('Bold');
    expect(boldButton).toHaveStyle({
      minWidth: '32px',
      height: '32px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: 'transparent',
      color: '#333',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'normal'
    });
  });

  it('renders as button elements with proper type', () => {
    render(<EditorToolbar />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7); // 7 toolbar buttons
    
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('has accessible button titles', () => {
    render(<EditorToolbar />);
    
    const buttons = [
      { title: 'Bold', text: 'B' },
      { title: 'Italic', text: 'I' },
      { title: 'Underline', text: 'U' },
      { title: 'Heading 1', text: 'H1' },
      { title: 'Heading 2', text: 'H2' },
      { title: 'Bulleted List', text: '•' },
      { title: 'Numbered List', text: '1.' }
    ];

    buttons.forEach(({ title, text }) => {
      const button = screen.getByTitle(title);
      expect(button).toHaveTextContent(text);
      expect(button).toHaveAttribute('title', title);
    });
  });
});