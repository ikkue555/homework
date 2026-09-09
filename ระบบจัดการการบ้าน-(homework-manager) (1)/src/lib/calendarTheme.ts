export interface CalendarTheme {
  id: string;
  name: string;
  isCustom?: boolean;
  primaryColor: string;    // Hex code e.g. '#0284c7'
  secondaryColor: string;  // Hex code e.g. '#2563eb'
  accentColor: string;     // Hex code e.g. '#0369a1'
  lightBgColor: string;    // Hex code e.g. '#f0f9ff'
  darkBgColor?: string;    // Hex code e.g. 'rgba(2, 132, 199, 0.15)'
  headerStyle: 'gradient' | 'solid' | 'clean';
  weekendStyle: 'rose' | 'theme' | 'subtle';
  cellRounding: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-lg';
  badgeStyle: 'pill' | 'dot' | 'counter';
}

export const CALENDAR_THEME_STORAGE_KEY = 'homework_app_calendar_theme';

export const PRESET_CALENDAR_THEMES: CalendarTheme[] = [
  {
    id: 'ocean',
    name: 'ครามมหาสมุทร (Ocean Blue)',
    primaryColor: '#0284c7',
    secondaryColor: '#2563eb',
    accentColor: '#0369a1',
    lightBgColor: '#f0f9ff',
    darkBgColor: 'rgba(2, 132, 199, 0.15)',
    headerStyle: 'gradient',
    weekendStyle: 'rose',
    cellRounding: 'rounded-2xl',
    badgeStyle: 'pill',
  },
  {
    id: 'sakura',
    name: 'ซากุระพาสเทล (Sakura Rose)',
    primaryColor: '#ec4899',
    secondaryColor: '#f43f5e',
    accentColor: '#be185d',
    lightBgColor: '#fdf2f8',
    darkBgColor: 'rgba(236, 72, 153, 0.15)',
    headerStyle: 'gradient',
    weekendStyle: 'rose',
    cellRounding: 'rounded-2xl',
    badgeStyle: 'pill',
  },
  {
    id: 'emerald',
    name: 'เอเมอรัลด์ธรรมชาติ (Forest Emerald)',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    accentColor: '#047857',
    lightBgColor: '#ecfdf5',
    darkBgColor: 'rgba(5, 150, 105, 0.15)',
    headerStyle: 'gradient',
    weekendStyle: 'theme',
    cellRounding: 'rounded-2xl',
    badgeStyle: 'pill',
  },
  {
    id: 'lavender',
    name: 'ม่วงลาเวนเดอร์ (Royal Lavender)',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    accentColor: '#6d28d9',
    lightBgColor: '#f5f3ff',
    darkBgColor: 'rgba(124, 58, 237, 0.15)',
    headerStyle: 'gradient',
    weekendStyle: 'rose',
    cellRounding: 'rounded-2xl',
    badgeStyle: 'pill',
  },
  {
    id: 'sunset',
    name: 'อาทิตย์อัสดง (Sunset Amber)',
    primaryColor: '#ea580c',
    secondaryColor: '#f59e0b',
    accentColor: '#c2410c',
    lightBgColor: '#fff7ed',
    darkBgColor: 'rgba(234, 88, 12, 0.15)',
    headerStyle: 'gradient',
    weekendStyle: 'rose',
    cellRounding: 'rounded-2xl',
    badgeStyle: 'pill',
  },
  {
    id: 'indigo',
    name: 'มิดไนท์อินดิโก้ (Midnight Indigo)',
    primaryColor: '#4f46e5',
    secondaryColor: '#6366f1',
    accentColor: '#4338ca',
    lightBgColor: '#eef2ff',
    darkBgColor: 'rgba(79, 70, 229, 0.15)',
    headerStyle: 'gradient',
    weekendStyle: 'theme',
    cellRounding: 'rounded-2xl',
    badgeStyle: 'pill',
  },
  {
    id: 'matcha',
    name: 'ชาเขียวมัทฉะ (Matcha Tea)',
    primaryColor: '#65a30d',
    secondaryColor: '#84cc16',
    accentColor: '#4d7c0f',
    lightBgColor: '#f7fee7',
    darkBgColor: 'rgba(101, 163, 13, 0.15)',
    headerStyle: 'gradient',
    weekendStyle: 'theme',
    cellRounding: 'rounded-2xl',
    badgeStyle: 'pill',
  },
  {
    id: 'cyan',
    name: 'สกายมินต์ (Sky & Mint)',
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4',
    accentColor: '#0e7490',
    lightBgColor: '#ecfeff',
    darkBgColor: 'rgba(8, 145, 178, 0.15)',
    headerStyle: 'gradient',
    weekendStyle: 'rose',
    cellRounding: 'rounded-2xl',
    badgeStyle: 'pill',
  },
  {
    id: 'monochrome',
    name: 'มินิมอลโมโนโครม (Minimal Slate)',
    primaryColor: '#475569',
    secondaryColor: '#64748b',
    accentColor: '#334155',
    lightBgColor: '#f8fafc',
    darkBgColor: 'rgba(71, 85, 105, 0.15)',
    headerStyle: 'solid',
    weekendStyle: 'subtle',
    cellRounding: 'rounded-xl',
    badgeStyle: 'dot',
  },
];

export const DEFAULT_CALENDAR_THEME: CalendarTheme = PRESET_CALENDAR_THEMES[0];

// Quick palette choices for custom theme picker
export const QUICK_ACCENT_COLORS = [
  { name: 'ฟ้ามหาสมุทร', primary: '#0284c7', secondary: '#2563eb' },
  { name: 'ซากุระพาสเทล', primary: '#ec4899', secondary: '#f43f5e' },
  { name: 'เขียวเอเมอรัลด์', primary: '#059669', secondary: '#10b981' },
  { name: 'ม่วงลาเวนเดอร์', primary: '#7c3aed', secondary: '#8b5cf6' },
  { name: 'ส้มแสงตะวัน', primary: '#ea580c', secondary: '#f59e0b' },
  { name: 'ครามมิดไนท์', primary: '#4f46e5', secondary: '#6366f1' },
  { name: 'ชาเขียวมัทฉะ', primary: '#65a30d', secondary: '#84cc16' },
  { name: 'ฟ้าน้ำทะเล', primary: '#0891b2', secondary: '#06b6d4' },
  { name: 'แดงทับทิม', primary: '#e11d48', secondary: '#f43f5e' },
  { name: 'ชมพูคอรัล', primary: '#f97316', secondary: '#fb7185' },
  { name: 'ดำกราไฟต์', primary: '#334155', secondary: '#64748b' },
  { name: 'เหลืองอำพัน', primary: '#d97706', secondary: '#f59e0b' },
];

/**
 * Loads the saved calendar theme from localStorage or returns default
 */
export function getSavedCalendarTheme(): CalendarTheme {
  if (typeof window === 'undefined') return DEFAULT_CALENDAR_THEME;
  try {
    const saved = localStorage.getItem(CALENDAR_THEME_STORAGE_KEY);
    if (!saved) return DEFAULT_CALENDAR_THEME;
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed.primaryColor === 'string') {
      return {
        ...DEFAULT_CALENDAR_THEME,
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Error loading saved calendar theme:', e);
  }
  return DEFAULT_CALENDAR_THEME;
}

/**
 * Saves calendar theme to localStorage
 */
export function saveCalendarTheme(theme: CalendarTheme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CALENDAR_THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    console.error('Error saving calendar theme:', e);
  }
}

/**
 * Helper to compute contrast text (light or dark) for a hex color
 */
export function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#0f172a' : '#ffffff';
}

/**
 * Helper to generate light tint hex or rgba
 */
export function hexToRgba(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return `rgba(2, 132, 199, ${alpha})`;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
