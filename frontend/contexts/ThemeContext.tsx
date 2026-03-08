import React, { createContext, ReactNode, useContext, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    header: string;
    tabSwitcher: string;
    tabActive: string;
    button: string;
    toggleSwitch: string;
    toggleActive: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const colors = {
    background: theme === 'dark' ? '#1a1a1a' : '#fff',
    card: theme === 'dark' ? '#2d2d2d' : '#fff',
    text: theme === 'dark' ? '#fff' : '#333',
    textSecondary: theme === 'dark' ? '#aaa' : '#666',
    border: theme === 'dark' ? '#404040' : '#e0e0e0',
    header: theme === 'dark' ? '#2d2d2d' : '#fff',
    tabSwitcher: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
    tabActive: theme === 'dark' ? '#fff' : '#333',
    button: '#ff8b4c',
    toggleSwitch: theme === 'dark' ? '#555' : '#ccc',
    toggleActive: '#ff8b4c',
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    // Отправляем событие для синхронизации с MainScreen.web.tsx
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
