import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'light' | 'dark' | 'sepia';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from chrome.storage on mount
  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  // Apply theme to body element whenever it changes
  useEffect(() => {
    if (!isLoading) {
      applyTheme(theme);
    }
  }, [theme, isLoading]);

  const loadThemeFromStorage = async () => {
    try {
      const result = await chrome.storage.local.get('theme');
      const savedTheme = result.theme as ThemeName;

      if (savedTheme && ['light', 'dark', 'sepia'].includes(savedTheme)) {
        setThemeState(savedTheme);
      } else {
        // Default to dark theme (Chrome style)
        setThemeState('dark');
      }
    } catch (error) {
      console.error('Error loading theme from storage:', error);
      setThemeState('dark');
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (themeName: ThemeName) => {
    // Set data attribute on root element
    document.documentElement.setAttribute('data-theme', themeName);
  };

  const setTheme = async (newTheme: ThemeName) => {
    try {
      // Save to chrome.storage.local
      await chrome.storage.local.set({ theme: newTheme });

      // Update state
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
