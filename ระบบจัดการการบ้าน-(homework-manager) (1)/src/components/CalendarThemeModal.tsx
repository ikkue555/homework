import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Eye, 
  LayoutGrid, 
  Paintbrush
} from 'lucide-react';
import { 
  CalendarTheme, 
  PRESET_CALENDAR_THEMES, 
  DEFAULT_CALENDAR_THEME, 
  QUICK_ACCENT_COLORS,
  hexToRgba,
  getContrastTextColor 
} from '../lib/calendarTheme';

interface CalendarThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: CalendarTheme;
  onSaveTheme: (theme: CalendarTheme) => void;
}

export const CalendarThemeModal: React.FC<CalendarThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSaveTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [tempTheme, setTempTheme] = useState<CalendarTheme>(currentTheme);

  // Sync with current theme when opened
  React.useEffect(() => {
    if (isOpen) {
      setTempTheme(currentTheme);
      if (currentTheme.isCustom) {
        setActiveTab('custom');
      } else {
        setActiveTab('presets');
      }
    }
  }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: CalendarTheme) => {
    setTempTheme({ ...preset, isCustom: false });
  };

  const handleApplyQuickColor = (primary: string, secondary: string, name: string) => {
    setTempTheme(prev => ({
      ...prev,
      id: 'custom',
      name: `กำหนดเอง (${name})`,
      isCustom: true,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: primary,
      lightBgColor: hexToRgba(primary, 0.08),
      darkBgColor: hexToRgba(primary, 0.18),
    }));
  };

  const handleSave = () => {
    onSaveTheme(tempTheme);
    onClose();
  };

  const handleResetDefault = () => {
    setTempTheme(DEFAULT_CALENDAR_THEME);
    setActiveTab('presets');
  };

  // Contrast text for primary
  const primaryText = getContrastTextColor(tempTheme.primaryColor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div 
          className="p-5 sm:p-6 text-white transition-all flex items-start justify-between relative overflow-hidden"
          style={{
            background: tempTheme.headerStyle === 'gradient'
              ? `linear-gradient(135deg, ${tempTheme.primaryColor}, ${tempTheme.secondaryColor})`
              : tempTheme.primaryColor,
          }}
        >
          {/* Subtle decorative circles */}
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none blur-sm" />
          <div className="absolute -right-2 -bottom-10 w-24 h-24 rounded-full bg-black/10 pointer-events-none blur-sm" />

          <div className="flex items-center space-x-3.5 z-10" style={{ color: primaryText }}>
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold font-heading">
                  ตั้งค่าธีมปฏิทินแบบกำหนดเอง
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-white/25">
                  {tempTheme.isCustom ? 'กำหนดเอง' : tempTheme.name}
                </span>
              </div>
              <p className="text-xs opacity-90 font-medium">
                เลือกธีมโทนสี สไตล์ปฏิทิน และรูปแบบการแสดงผลตามความชอบของคุณ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer z-10"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold font-heading flex items-center space-x-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'presets'
                  ? 'border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900 shadow-2xs'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>ธีมสำเร็จรูป ({PRESET_CALENDAR_THEMES.length} แบบ)</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold font-heading flex items-center space-x-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'custom'
                  ? 'border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900 shadow-2xs'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>ปรับแต่งสีและสไตล์เองอิสระ</span>
            </button>
          </div>

          <button
            onClick={handleResetDefault}
            className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center space-x-1 cursor-pointer transition-colors pb-2"
            title="รีเซ็ตธีมกลับเป็นค่าเริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น</span>
          </button>
        </div>

        {/* Modal Body & Live Preview */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Controls Panel */}
          <div className="lg:col-span-7 space-y-5">
            {activeTab === 'presets' ? (
              /* Presets Grid */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    เลือกชุดสีและสไตล์ที่เข้ากับคุณ
                  </span>
                  <span className="text-[11px] text-slate-400">
                    แตะที่การ์ดเพื่อสลับและดูตัวอย่างสด
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_CALENDAR_THEMES.map((preset) => {
                    const isSelected = !tempTheme.isCustom && tempTheme.id === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                          isSelected
                            ? 'border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20 bg-sky-50/40 dark:bg-slate-800 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50/60 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Color swatch pill */}
                          <div 
                            className="w-10 h-10 rounded-xl shadow-xs flex items-center justify-center relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.secondaryColor})`,
                            }}
                          >
                            {isSelected && (
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-bold font-heading text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {preset.name}
                            </h4>
                            <div className="flex items-center space-x-1.5 mt-1">
                              <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: preset.primaryColor }} 
                                title="Primary"
                              />
                              <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: preset.secondaryColor }} 
                                title="Secondary"
                              />
                              <span className="text-[10px] text-slate-400 font-mono">
                                {preset.primaryColor}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                            ใช้งานอยู่
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Custom Controls */
              <div className="space-y-5">
                {/* Quick Palette Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <Paintbrush className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>คู่สียอดนิยม (คลิกเลือกเปลี่ยนได้ทันที)</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {QUICK_ACCENT_COLORS.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyQuickColor(c.primary, c.secondary, c.name)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 bg-white dark:bg-slate-850 flex items-center space-x-2 transition-all cursor-pointer text-left group"
                      >
                        <div 
                          className="w-5 h-5 rounded-lg shrink-0 shadow-2xs"
                          style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }}
                        />
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Pickers: Primary & Secondary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Primary Color Picker */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        สีหลัก (Primary Color)
                      </span>
                      <span className="text-[10px] text-slate-400">หัวข้อ, วันนี้, ปุ่ม</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={tempTheme.primaryColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempTheme(prev => ({
                            ...prev,
                            id: 'custom',
                            isCustom: true,
                            primaryColor: val,
                            accentColor: val,
                            lightBgColor: hexToRgba(val, 0.08),
                            darkBgColor: hexToRgba(val, 0.18),
                          }));
                        }}
                        className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={tempTheme.primaryColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#') || val.length <= 7) {
                            setTempTheme(prev => ({
                              ...prev,
                              id: 'custom',
                              isCustom: true,
                              primaryColor: val,
                              accentColor: val,
                              lightBgColor: hexToRgba(val, 0.08),
                              darkBgColor: hexToRgba(val, 0.18),
                            }));
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 uppercase"
                        placeholder="#0284c7"
                      />
                    </div>
                  </div>

                  {/* Secondary Color Picker */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        สีรอง (Secondary / Gradient)
                      </span>
                      <span className="text-[10px] text-slate-400">การไล่เฉดสี</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={tempTheme.secondaryColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempTheme(prev => ({
                            ...prev,
                            id: 'custom',
                            isCustom: true,
                            secondaryColor: val,
                          }));
                        }}
                        className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={tempTheme.secondaryColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#') || val.length <= 7) {
                            setTempTheme(prev => ({
                              ...prev,
                              id: 'custom',
                              isCustom: true,
                              secondaryColor: val,
                            }));
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 uppercase"
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                </div>

                {/* Style Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Header Style */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      สไตล์ส่วนหัวปฏิทิน (Header Style)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                      {[
                        { id: 'gradient', label: 'ไล่เฉด Gradient' },
                        { id: 'solid', label: 'สีเรียบ Solid' },
                        { id: 'clean', label: 'เรียบหรู Clean' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTempTheme(prev => ({ ...prev, headerStyle: item.id as any, isCustom: true }))}
                          className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                            tempTheme.headerStyle === item.id
                              ? 'bg-sky-50 dark:bg-sky-950/80 border-sky-500 text-sky-700 dark:text-sky-300 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weekend Highlight Style */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      ไฮไลต์วันเสาร์-อาทิตย์ (Weekend)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                      {[
                        { id: 'rose', label: 'สีแดง Rose' },
                        { id: 'theme', label: 'สีตามธีม Theme' },
                        { id: 'subtle', label: 'สีเทา Subtle' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTempTheme(prev => ({ ...prev, weekendStyle: item.id as any, isCustom: true }))}
                          className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                            tempTheme.weekendStyle === item.id
                              ? 'bg-sky-50 dark:bg-sky-950/80 border-sky-500 text-sky-700 dark:text-sky-300 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cell Rounding */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      ความโค้งมนของช่องตาราง (Rounding)
                    </label>
                    <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
                      {[
                        { id: 'rounded-lg', label: 'lg คมเรียบ' },
                        { id: 'rounded-xl', label: 'xl ปกติ' },
                        { id: 'rounded-2xl', label: '2xl มนพิเศษ' },
                        { id: 'rounded-3xl', label: '3xl โค้งมน' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTempTheme(prev => ({ ...prev, cellRounding: item.id as any, isCustom: true }))}
                          className={`py-2 px-0.5 rounded-xl text-center transition-all cursor-pointer border ${
                            tempTheme.cellRounding === item.id
                              ? 'bg-sky-50 dark:bg-sky-950/80 border-sky-500 text-sky-700 dark:text-sky-300 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Badge Style */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      สไตล์ป้ายเตือนการบ้าน/กิจกรรม
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                      {[
                        { id: 'pill', label: 'Pill แถบยาว' },
                        { id: 'dot', label: 'Dot จุดสี' },
                        { id: 'counter', label: 'ตัวเลขนับ' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTempTheme(prev => ({ ...prev, badgeStyle: item.id as any, isCustom: true }))}
                          className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                            tempTheme.badgeStyle === item.id
                              ? 'bg-sky-50 dark:bg-sky-950/80 border-sky-500 text-sky-700 dark:text-sky-300 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>ตัวอย่างสด (Live Preview)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {tempTheme.primaryColor}
              </span>
            </div>

            {/* Simulated Mini Calendar Card */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              {/* Simulated Month Header */}
              <div 
                className="p-3.5 rounded-2xl flex items-center justify-between text-white shadow-xs"
                style={{
                  background: tempTheme.headerStyle === 'gradient'
                    ? `linear-gradient(135deg, ${tempTheme.primaryColor}, ${tempTheme.secondaryColor})`
                    : tempTheme.headerStyle === 'solid'
                    ? tempTheme.primaryColor
                    : '#ffffff',
                  color: tempTheme.headerStyle === 'clean' ? '#0f172a' : primaryText,
                  border: tempTheme.headerStyle === 'clean' ? '1px solid #e2e8f0' : undefined,
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                    📅
                  </div>
                  <div>
                    <h5 className="text-xs font-bold font-heading leading-tight">
                      กันยายน 2569
                    </h5>
                    <p className="text-[9px] opacity-80">มุมมองจำลอง</p>
                  </div>
                </div>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 shadow-2xs"
                  style={{ color: tempTheme.headerStyle === 'clean' ? tempTheme.primaryColor : '#ffffff' }}
                >
                  วันนี้
                </span>
              </div>

              {/* Simulated Weekdays */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
                {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((w, i) => {
                  const isWeekend = i === 0 || i === 6;
                  let colorClass = 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-850';
                  let customStyle: React.CSSProperties = {};

                  if (isWeekend) {
                    if (tempTheme.weekendStyle === 'rose') {
                      colorClass = 'text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40';
                    } else if (tempTheme.weekendStyle === 'theme') {
                      customStyle = {
                        color: tempTheme.primaryColor,
                        backgroundColor: hexToRgba(tempTheme.primaryColor, 0.1),
                      };
                    } else {
                      colorClass = 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800';
                    }
                  }

                  return (
                    <div 
                      key={w} 
                      className={`py-1 rounded-lg ${colorClass}`}
                      style={customStyle}
                    >
                      {w}
                    </div>
                  );
                })}
              </div>

              {/* Simulated Mini Grid Days */}
              <div className="grid grid-cols-7 gap-1 text-[10px]">
                {/* 14 sample days */}
                {[
                  { d: 1, hw: false, exam: false, today: false },
                  { d: 2, hw: true, exam: false, today: false },
                  { d: 3, hw: false, exam: false, today: false },
                  { d: 4, hw: false, exam: true, today: false },
                  { d: 5, hw: true, exam: false, today: false },
                  { d: 6, hw: false, exam: false, today: false },
                  { d: 7, hw: false, exam: false, today: false },
                  { d: 8, hw: false, exam: false, today: false },
                  { d: 9, hw: true, exam: false, today: true },
                  { d: 10, hw: false, exam: false, today: false },
                  { d: 11, hw: false, exam: true, today: false },
                  { d: 12, hw: true, exam: false, today: false },
                  { d: 13, hw: false, exam: false, today: false },
                  { d: 14, hw: false, exam: false, today: false },
                ].map((cell) => {
                  const isSelected = cell.d === 9; // today selected
                  return (
                    <div
                      key={cell.d}
                      className={`p-1.5 h-14 bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${tempTheme.cellRounding}`}
                      style={{
                        borderColor: isSelected 
                          ? tempTheme.primaryColor 
                          : cell.today
                          ? hexToRgba(tempTheme.primaryColor, 0.5)
                          : undefined,
                        backgroundColor: isSelected
                          ? hexToRgba(tempTheme.primaryColor, 0.08)
                          : undefined,
                        boxShadow: isSelected
                          ? `0 0 0 2px ${hexToRgba(tempTheme.primaryColor, 0.2)}`
                          : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-bold px-1 rounded-md ${
                            cell.today ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          style={{
                            backgroundColor: cell.today ? tempTheme.primaryColor : 'transparent',
                          }}
                        >
                          {cell.d}
                        </span>

                        {cell.exam && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" title="มีสอบ" />
                        )}
                      </div>

                      {/* Badges preview */}
                      <div className="space-y-0.5 overflow-hidden">
                        {tempTheme.badgeStyle === 'pill' ? (
                          <>
                            {cell.exam && (
                              <div className="bg-rose-600 text-white rounded text-[7.5px] px-1 py-0.2 truncate font-bold">
                                📍 สอบ
                              </div>
                            )}
                            {cell.hw && (
                              <div 
                                className="rounded text-[7.5px] px-1 py-0.2 truncate font-semibold"
                                style={{
                                  backgroundColor: hexToRgba(tempTheme.primaryColor, 0.15),
                                  color: tempTheme.primaryColor,
                                }}
                              >
                                📚 การบ้าน
                              </div>
                            )}
                          </>
                        ) : tempTheme.badgeStyle === 'dot' ? (
                          <div className="flex items-center justify-center space-x-1 py-1">
                            {cell.exam && <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />}
                            {cell.hw && (
                              <span 
                                className="w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: tempTheme.primaryColor }}
                              />
                            )}
                          </div>
                        ) : (
                          // Counter badge
                          (cell.exam || cell.hw) && (
                            <div 
                              className="text-[7.5px] font-bold text-center rounded py-0.2"
                              style={{
                                backgroundColor: hexToRgba(tempTheme.primaryColor, 0.15),
                                color: tempTheme.primaryColor,
                              }}
                            >
                              {(cell.exam ? 1 : 0) + (cell.hw ? 1 : 0)} รายการ
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sample Month Tab Buttons */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center space-x-1.5 overflow-hidden">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: tempTheme.primaryColor }}
                >
                  กันยายน
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg text-[10px] font-medium bg-white dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-750"
                >
                  ตุลาคม
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg text-[10px] font-medium bg-white dark:bg-slate-850 text-slate-500 border border-slate-200 dark:border-slate-750"
                >
                  พฤศจิกายน
                </button>
              </div>
            </div>

            <div className="p-3 bg-sky-50/60 dark:bg-slate-850/60 rounded-2xl border border-sky-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                ธีมที่บันทึกจะถูกจดจำไว้ตลอดการใช้งานบนอุปกรณ์นี้อัตโนมัติ
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-bold font-heading text-white shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
              style={{
                backgroundColor: tempTheme.primaryColor,
                color: primaryText,
              }}
            >
              <Check className="w-4 h-4" />
              <span>นำธีมไปใช้และบันทึก</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
