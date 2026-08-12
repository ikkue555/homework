import { ThemeConfig, ThemeId } from '../types';

export const THEMES: ThemeConfig[] = [
  // 🍎 หมวดผลไม้ (Fruit Themes)
  {
    id: 'orange',
    name: 'ธีมส้ม (Orange Citrus)',
    category: 'fruit',
    symbol: '🍊',
    tagline: 'สดใส มีพลัง ใช้โทนสีส้ม ขาว และเขียวอ่อน',
    badgeBg: '#ffedd5',
    badgeText: '#c2410c',
    previewColors: ['#ea580c', '#16a34a', '#fffdfa'],
  },
  {
    id: 'kiwi',
    name: 'ธีมกีวี่ (Kiwi Green)',
    category: 'fruit',
    symbol: '🥝',
    tagline: 'สดชื่น เป็นธรรมชาติ โทนสีเขียวสด นวลตา ตัดกับสีน้ำตาลอ่อน',
    badgeBg: '#ecfccb',
    badgeText: '#3f6212',
    previewColors: ['#65a30d', '#b45309', '#f7fbf7'],
  },

  // 🐼 หมวดสัตว์ (Animal Themes)
  {
    id: 'panda',
    name: 'ธีมแพนด้า (Minimal Panda)',
    category: 'animal',
    symbol: '🐼',
    tagline: 'คลีน มินิมอล โทนสีขาว-ดำ-เทาเข้ม ชวนโฟกัส',
    badgeBg: '#e2e8f0',
    badgeText: '#0f172a',
    previewColors: ['#0f172a', '#475569', '#ffffff'],
  },
  {
    id: 'flamingo',
    name: 'ธีมฟลามิงโก้ (Pink Flamingo)',
    category: 'animal',
    symbol: '🦩',
    tagline: 'ชิค ผ่อนคลาย โทนสีชมพูพาสเทลตัดกับฟ้าอ่อน',
    badgeBg: '#fce7f3',
    badgeText: '#be185d',
    previewColors: ['#ec4899', '#0284c7', '#fff5f7'],
  },

  // 🦖 หมวดธีมพิเศษ (Special Themes)
  {
    id: 'jungle',
    name: 'ธีมกินพืช (Plant Eater / Jungle)',
    category: 'special',
    symbol: '🌿',
    tagline: 'โทนสีเขียวป่าเข้ม ป่าทาซาน ผ่อนคลาย ธรรมชาติ มีไดโนเสาร์กินพืช 🦕',
    badgeBg: '#d1fae5',
    badgeText: '#047857',
    previewColors: ['#064e3b', '#059669', '#d97706'],
  },
  {
    id: 'crimson',
    name: 'ธีมกินเนื้อ (Meat Eater / Crimson)',
    category: 'special',
    symbol: '🦖',
    tagline: 'โทนสีแดง Crimson และน้ำตาล ดุดัน มีพลัง กระตุ้นให้รีบทำ มีไดโนเสาร์ทีเร็กซ์',
    badgeBg: '#fee2e2',
    badgeText: '#b91c1c',
    previewColors: ['#450a0a', '#dc2626', '#92400e'],
  },

  // 🩵 หมวดคลาสสิก (Classic)
  {
    id: 'sky',
    name: 'ธีมฟ้าคลาสสิก (Classic Sky)',
    category: 'classic',
    symbol: '🩵',
    tagline: 'เรียบหรู สบายตา โทนสีฟ้าและเทาอ่อนสว่าง',
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
    previewColors: ['#0284c7', '#0f172a', '#f8fafc'],
  },
];

const THEME_STORAGE_KEY = 'homework_app_theme';

export function getStoredTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved;
    }
  } catch {
    // Fallback if localStorage unavailable
  }
  return 'sky';
}

export function applyTheme(themeId: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // Ignore error
  }

  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);
}

export function getThemeConfig(themeId: ThemeId): ThemeConfig {
  return THEMES.find(t => t.id === themeId) || THEMES[THEMES.length - 1];
}
