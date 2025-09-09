import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from '@/components/dashboard/color-picker';

describe('ColorPicker', () => {
  it('renders with default color', () => {
    render(<ColorPicker />);
    
    expect(screen.getByText('Primary Color')).toBeInTheDocument();
    // Use getAllByText since the color appears in multiple places
    expect(screen.getAllByText('#3B82F6')).toHaveLength(2);
  });

  it('renders with provided value', () => {
    render(<ColorPicker value="#FF0000" />);
    
    expect(screen.getByText('#FF0000')).toBeInTheDocument();
  });

  it('calls onChange when color input changes', () => {
    const mockOnChange = jest.fn();
    render(<ColorPicker onChange={mockOnChange} />);
    
    // Find the color input by type attribute
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    expect(colorInput).toBeTruthy();
    
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('#ff0000');
  });

  it('calls onChange when preset color is clicked', () => {
    const mockOnChange = jest.fn();
    render(<ColorPicker onChange={mockOnChange} />);
    
    // Click the first preset color button (should be blue #3B82F6 based on the array)
    const presetButtons = screen.getAllByRole('button');
    fireEvent.click(presetButtons[0]);
    
    expect(mockOnChange).toHaveBeenCalledWith('#3B82F6');
  });

  it('renders all preset colors', () => {
    render(<ColorPicker />);
    
    // Should have 8 preset color buttons
    const presetButtons = screen.getAllByRole('button');
    expect(presetButtons).toHaveLength(8);
  });
});
