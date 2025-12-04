import { useEffect, useState } from 'react';

export function useDarkMode() {
  // Initialize state from localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const item = localStorage.getItem('dark-mode');
      if (item === null) return false;
      const parsed = JSON.parse(item);
      return parsed === true;
    } catch {
      return false;
    }
  });

  // Apply dark class to document element
  useEffect(() => {
    const root = document.documentElement;
    
    // Save to localStorage
    try {
      localStorage.setItem('dark-mode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
    
    // Force remove dark class first (use toggle with false to ensure removal)
    root.classList.remove('dark');
    
    // Then add if dark mode is enabled
    if (isDarkMode) {
      root.classList.add('dark');
    }
    
    // Verify the class was applied/removed correctly
    const hasDarkClass = root.classList.contains('dark');
    if (hasDarkClass !== isDarkMode) {
      console.warn('Dark class mismatch!', { isDarkMode, hasDarkClass });
      // Force correct state
      if (isDarkMode && !hasDarkClass) {
        root.classList.add('dark');
      } else if (!isDarkMode && hasDarkClass) {
        root.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return { isDarkMode, toggleDarkMode };
}

