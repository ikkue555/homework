import { ThemeMode } from '../types';

const THEME_STORAGE_KEY = 'homework_app_theme_mode';

export function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  
  // Default to system preference if available
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

export function applyThemeMode(mode: ThemeMode) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-mode', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-mode', 'light');
  }
  
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}
