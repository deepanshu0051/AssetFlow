import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  const [useSystemTheme, setUseSystemTheme] = useState(() => {
    return localStorage.getItem('useSystemTheme') === 'true';
  });

  useEffect(() => {
    if (!useSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');

    // Set initially
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [useSystemTheme]);

  useEffect(() => {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
    if (!useSystemTheme) {
      localStorage.setItem('theme', theme);
    }
    localStorage.setItem('useSystemTheme', useSystemTheme);
  }, [theme, useSystemTheme]);

  const toggleTheme = () => {
    setUseSystemTheme(false);
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setSpecificTheme = (newTheme) => {
    setUseSystemTheme(false);
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setSpecificTheme, useSystemTheme, setUseSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
