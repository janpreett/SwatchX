import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export { ThemeContext };
export type { ThemeMode };

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    // Check localStorage for saved preference, default to 'light'
    const saved = localStorage.getItem('swatchx-theme-mode');
    return (saved as ThemeMode) || 'light';
  });

  // Computed values for backwards compatibility
  const isDarkMode = themeMode === 'dark';

  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('swatchx-theme-mode', themeMode);
    
    // Apply CSS custom properties for dark mode (jet black styling)
    if (isDarkMode) {
      document.documentElement.style.setProperty('--swatchx-bg-primary', '#000000');
      document.documentElement.style.setProperty('--swatchx-bg-secondary', '#1a1a1a');
      document.documentElement.style.setProperty('--swatchx-text-primary', '#ffffff');
      document.documentElement.style.setProperty('--swatchx-text-secondary', '#e0e0e0');
      document.documentElement.style.setProperty('--swatchx-border', '#ffffff');
    } else {
      document.documentElement.style.removeProperty('--swatchx-bg-primary');
      document.documentElement.style.removeProperty('--swatchx-bg-secondary');
      document.documentElement.style.removeProperty('--swatchx-text-primary');
      document.documentElement.style.removeProperty('--swatchx-text-secondary');
      document.documentElement.style.removeProperty('--swatchx-border');
    }
  }, [themeMode, isDarkMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleDarkMode = () => {
    setThemeModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setDarkMode = (isDark: boolean) => {
    setThemeModeState(isDark ? 'dark' : 'light');
  };

  const value = {
    themeMode,
    isDarkMode,
    setThemeMode,
    toggleDarkMode,
    setDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
