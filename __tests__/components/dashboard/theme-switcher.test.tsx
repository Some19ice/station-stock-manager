import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from '@/components/dashboard/theme-switcher';

// Mock next-themes
const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme
  })
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders correctly with light theme', () => {
    render(<ThemeSwitcher />);
    
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('calls onChange when provided', () => {
    const mockOnChange = jest.fn();
    render(<ThemeSwitcher onChange={mockOnChange} />);
    
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    
    expect(mockOnChange).toHaveBeenCalledWith('dark');
  });

  it('uses setTheme when no onChange provided', () => {
    render(<ThemeSwitcher />);
    
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('displays correct mode when value prop is provided', () => {
    render(<ThemeSwitcher value="dark" />);
    
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();
  });
});
