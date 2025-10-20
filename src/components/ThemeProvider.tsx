import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Theme definitions
export interface Theme {
  name: string;
  displayName: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    primaryLight: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    muted: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    input: {
      background: string;
      border: string;
      text: string;
    };
    field: {
      background: string;
      border: string;
    };
  };
}

export const themes: Record<string, Theme> = {
  light: {
    name: 'light',
    displayName: 'Light Theme',
    colors: {
      background: '#ffffff',
      surface: '#f9fafb',
      primary: '#3b82f6',
      primaryLight: '#dbeafe',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      muted: '#f3f4f6',
      text: {
        primary: '#111827',
        secondary: '#374151',
        muted: '#6b7280',
      },
      border: '#d1d5db',
      input: {
        background: '#ffffff',
        border: '#d1d5db',
        text: '#111827',
      },
      field: {
        background: '#f9fafb',
        border: '#e5e7eb',
      },
    },
  },
  dark: {
    name: 'dark',
    displayName: 'Dark Theme',
    colors: {
      background: '#111827',
      surface: '#1f2937',
      primary: '#60a5fa',
      primaryLight: '#1e3a8a',
      secondary: '#9ca3af',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      muted: '#374151',
      text: {
        primary: '#f9fafb',
        secondary: '#e5e7eb',
        muted: '#9ca3af',
      },
      border: '#374151',
      input: {
        background: '#1f2937',
        border: '#374151',
        text: '#f9fafb',
      },
      field: {
        background: '#1f2937',
        border: '#374151',
      },
    },
  },
  highContrast: {
    name: 'highContrast',
    displayName: 'High Contrast',
    colors: {
      background: '#000000',
      surface: '#000000',
      primary: '#0080ff',
      primaryLight: '#001a33',
      secondary: '#808080',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      muted: '#333333',
      text: {
        primary: '#ffffff',
        secondary: '#ffffff',
        muted: '#cccccc',
      },
      border: '#ffffff',
      input: {
        background: '#000000',
        border: '#ffffff',
        text: '#ffffff',
      },
      field: {
        background: '#000000',
        border: '#ffffff',
      },
    },
  },
};

// Theme context
interface ThemeContextType {
  currentTheme: string;
  theme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  
  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const theme = themes[currentTheme];
  const availableThemes = Object.values(themes);

  return (
    <ThemeContext.Provider value={{ currentTheme, theme, setTheme, availableThemes }}>
      <div 
        className="theme-provider"
        style={{
          '--theme-background': theme.colors.background,
          '--theme-surface': theme.colors.surface,
          '--theme-primary': theme.colors.primary,
          '--theme-primary-light': theme.colors.primaryLight,
          '--theme-secondary': theme.colors.secondary,
          '--theme-success': theme.colors.success,
          '--theme-warning': theme.colors.warning,
          '--theme-error': theme.colors.error,
          '--theme-muted': theme.colors.muted,
          '--theme-text-primary': theme.colors.text.primary,
          '--theme-text-secondary': theme.colors.text.secondary,
          '--theme-text-muted': theme.colors.text.muted,
          '--theme-border': theme.colors.border,
          '--theme-input-background': theme.colors.input.background,
          '--theme-input-border': theme.colors.input.border,
          '--theme-input-text': theme.colors.input.text,
          '--theme-field-background': theme.colors.field.background,
          '--theme-field-border': theme.colors.field.border,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Theme selector component
export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="theme-selector">
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
        Theme
      </label>
      <select
        value={currentTheme}
        onChange={(e) => setTheme(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm min-w-32"
        style={{
          backgroundColor: 'var(--theme-input-background)',
          borderColor: 'var(--theme-input-border)',
          color: 'var(--theme-input-text)',
        }}
      >
        {availableThemes.map((theme) => (
          <option key={theme.name} value={theme.name}>
            {theme.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};

// Utility function to get themed classes
export const getThemedClasses = (baseClasses: string) => {
  return `${baseClasses} themed-component`;
};