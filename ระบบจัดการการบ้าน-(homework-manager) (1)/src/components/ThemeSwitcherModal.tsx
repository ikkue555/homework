import React from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import { ThemeId } from '../types';
import { THEMES } from '../lib/themes';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  showFloatingIcons: boolean;
  onToggleFloatingIcons: (enabled: boolean) => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  showFloatingIcons,
  onToggleFloatingIcons,
}) => {
  if (!isOpen) return null;

  const fruitThemes = THEMES.filter(t => t.category === 'fruit');
  const animalThemes = THEMES.filter(t => t.category === 'animal');
  const specialThemes = THEMES.filter(t => t.category === 'special');
  const classicThemes = THEMES.filter(t => t.category === 'classic');

  const renderThemeCard = (theme: typeof THEMES[0]) => {
    const isActive = currentTheme === theme.id;

    return (
      <button
        key={theme.id}
        onClick={() => onSelectTheme(theme.id)}
        className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden group cursor-pointer ${
          isActive
            ? 'border-sky-500 bg-sky-50/70 shadow-md ring-2 ring-sky-500/20'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
              {theme.symbol}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-800">
                  {theme.name}
                </h4>
                {isActive && (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-600 text-white shadow-xs">
                    <Check className="w-2.5 h-2.5" />
                    <span>ใช้งานอยู่</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                {theme.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Color Palette Preview Swatches */}
        <div className="flex items-center space-x-1.5 mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium">โทนสีหลัก:</span>
          <div className="flex items-center space-x-1">
            {theme.previewColors.map((color, i) => (
              <span
                key={i}
                className="w-4 h-4 rounded-full border border-slate-300/80 shadow-2xs"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>เลือกธีมตกแต่ง</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500">
                เลือกธีมสีและสัญลักษณ์บรรยากาศที่ชอบ ปรับแต่งความสดใสให้ระบบการบ้าน
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme List Content (Scrollable) */}
        <div className="overflow-y-auto py-5 space-y-6 pr-1 my-2">
          {/* Toggle Switch for Floating Icons */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all shadow-2xs ${
                showFloatingIcons ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-300/50' : 'bg-slate-200 text-slate-500'
              }`}>
                {showFloatingIcons ? '✨' : '🚫'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-800">
                    แสดงไอคอนลอยตกแต่งหลังจอ
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    showFloatingIcons ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {showFloatingIcons ? 'เปิดใช้งาน' : 'ปิดอยู่'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  สัญลักษณ์ประจำธีมจะลอยเบาๆ อยู่บริเวณแถบขอบข้างซ้าย-ขวา
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleFloatingIcons(!showFloatingIcons)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                showFloatingIcons ? 'bg-sky-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={showFloatingIcons}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  showFloatingIcons ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 🍊 หมวดผลไม้ */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-base">🍊</span>
              <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                1. หมวดผลไม้ (Fruit Themes)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fruitThemes.map(renderThemeCard)}
            </div>
          </div>

          {/* 🐼 หมวดสัตว์ */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-base">🐼</span>
              <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                2. หมวดสัตว์ (Animal Themes)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {animalThemes.map(renderThemeCard)}
            </div>
          </div>

          {/* 🦖 หมวดธีมพิเศษ */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-base">🦖</span>
              <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                3. หมวดธีมพิเศษ (Special Themes)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specialThemes.map(renderThemeCard)}
            </div>
          </div>

          {/* 🩵 หมวดคลาสสิก */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-base">🩵</span>
              <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                4. หมวดคลาสสิก (Classic)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classicThemes.map(renderThemeCard)}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span>💡 สามารถเปลี่ยนธีมเมื่อไหร่ก็ได้ตามต้องการ</span>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-all"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
