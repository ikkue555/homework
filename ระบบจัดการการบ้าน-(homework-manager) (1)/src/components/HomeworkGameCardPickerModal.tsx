import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Search, 
  Calendar, 
  Clock, 
  Layers, 
  CheckSquare, 
  Square, 
  Flame, 
  Shield, 
  Zap, 
  Crown, 
  BookOpen, 
  Users, 
  Award, 
  Filter,
  Star,
  Swords,
  Compass,
  Scroll,
  Atom,
  Palette,
  Music,
  Code2,
  Globe2,
  RotateCcw
} from 'lucide-react';
import { Homework } from '../types';

interface HomeworkGameCardPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeworks: Homework[];
  selectedIds: string[];
  onConfirmSelection: (selectedIds: string[]) => void;
}

// Elemental / Subject Theme Palette with RPG / TCG Aesthetics
interface ElementTheme {
  name: string;
  element: string;
  icon: any;
  cardBorder: string;
  cardGlow: string;
  selectedGlow: string;
  foilGradient: string;
  bannerBg: string;
  orbBg: string;
  badgeBg: string;
  textColor: string;
  accentColor: string;
  elementSymbol: string;
}

const ELEMENT_THEMES: Record<string, ElementTheme> = {
  // Fire / Red - Math / Urgent
  fire: {
    name: 'เปลวเพลิงคำนวณ (Fire)',
    element: 'FIRE',
    icon: Flame,
    cardBorder: 'border-rose-500/80 dark:border-rose-400',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.45)]',
    selectedGlow: 'ring-4 ring-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.7)]',
    foilGradient: 'from-rose-600 via-orange-500 to-amber-400',
    bannerBg: 'bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-rose-500/40 text-rose-200',
    orbBg: 'bg-gradient-to-tr from-red-600 via-rose-500 to-orange-400 text-white shadow-rose-500/50',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    textColor: 'text-rose-400',
    accentColor: '#f43f5e',
    elementSymbol: '🔥',
  },
  // Lightning / Amber - Physics / Tech
  electric: {
    name: 'สายฟ้าวิศวะ (Electric)',
    element: 'THUNDER',
    icon: Zap,
    cardBorder: 'border-amber-500/80 dark:border-amber-400',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.45)]',
    selectedGlow: 'ring-4 ring-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.7)]',
    foilGradient: 'from-amber-500 via-yellow-400 to-orange-500',
    bannerBg: 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border-amber-500/40 text-amber-200',
    orbBg: 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 text-slate-950 shadow-amber-500/50',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    textColor: 'text-amber-400',
    accentColor: '#f59e0b',
    elementSymbol: '⚡',
  },
  // Water / Ice / Cyan - Languages / English
  water: {
    name: 'สมุทรพหุภาษา (Water)',
    element: 'WATER',
    icon: Globe2,
    cardBorder: 'border-cyan-500/80 dark:border-cyan-400',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.45)]',
    selectedGlow: 'ring-4 ring-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.7)]',
    foilGradient: 'from-cyan-500 via-sky-400 to-blue-600',
    bannerBg: 'bg-gradient-to-r from-cyan-950 via-sky-950 to-cyan-950 border-cyan-500/40 text-cyan-200',
    orbBg: 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-400 text-white shadow-cyan-500/50',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    textColor: 'text-cyan-400',
    accentColor: '#06b6d4',
    elementSymbol: '💧',
  },
  // Nature / Emerald - Biology / Health / PE
  nature: {
    name: 'พฤกษาพฤติกรรม (Nature)',
    element: 'NATURE',
    icon: Atom,
    cardBorder: 'border-emerald-500/80 dark:border-emerald-400',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.45)]',
    selectedGlow: 'ring-4 ring-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.7)]',
    foilGradient: 'from-emerald-500 via-teal-400 to-green-600',
    bannerBg: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 border-emerald-500/40 text-emerald-200',
    orbBg: 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 text-white shadow-emerald-500/50',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    textColor: 'text-emerald-400',
    accentColor: '#10b981',
    elementSymbol: '🌿',
  },
  // Mystic / Arcane / Purple - Social / Arts / Thai
  arcane: {
    name: 'มนตราประวัติศาสตร์ (Arcane)',
    element: 'ARCANE',
    icon: Scroll,
    cardBorder: 'border-purple-500/80 dark:border-purple-400',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.45)]',
    selectedGlow: 'ring-4 ring-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.7)]',
    foilGradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
    bannerBg: 'bg-gradient-to-r from-purple-950 via-fuchsia-950 to-purple-950 border-purple-500/40 text-purple-200',
    orbBg: 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-400 text-white shadow-purple-500/50',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    textColor: 'text-purple-400',
    accentColor: '#a855f7',
    elementSymbol: '🔮',
  },
  // Celestial / Gold - General / Special
  celestial: {
    name: 'สุริยันศักดิ์สิทธิ์ (Celestial)',
    element: 'COSMIC',
    icon: Crown,
    cardBorder: 'border-yellow-400 dark:border-yellow-300',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(234,179,8,0.45)]',
    selectedGlow: 'ring-4 ring-yellow-300 shadow-[0_0_35px_rgba(234,179,8,0.8)]',
    foilGradient: 'from-amber-400 via-yellow-200 to-yellow-500',
    bannerBg: 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-yellow-400/50 text-yellow-200',
    orbBg: 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 text-slate-950 shadow-yellow-400/50',
    badgeBg: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
    textColor: 'text-yellow-400',
    accentColor: '#eab308',
    elementSymbol: '✨',
  }
};

function getCardTheme(subject: string, priority?: string): ElementTheme {
  const sub = (subject || '').toLowerCase();
  
  if (sub.includes('คณิต') || sub.includes('math') || sub.includes('แคล') || priority === 'ด่วนมาก') {
    return ELEMENT_THEMES.fire;
  }
  if (sub.includes('ฟิสิกส์') || sub.includes('คอม') || sub.includes('วิศว') || sub.includes('เทคโน') || sub.includes('code')) {
    return ELEMENT_THEMES.electric;
  }
  if (sub.includes('อังกฤษ') || sub.includes('eng') || sub.includes('จีน') || sub.includes('ญี่ปุ่น') || sub.includes('ภาษาต่าง')) {
    return ELEMENT_THEMES.water;
  }
  if (sub.includes('ชีว') || sub.includes('เคมี') || sub.includes('วิทย์') || sub.includes('สุขศึกษา') || sub.includes('พละ')) {
    return ELEMENT_THEMES.nature;
  }
  if (sub.includes('ไทย') || sub.includes('สังคม') || sub.includes('ประวัติ') || sub.includes('ศิลปะ') || sub.includes('ดนตรี') || sub.includes('แนะแนว')) {
    return ELEMENT_THEMES.arcane;
  }
  
  return ELEMENT_THEMES.celestial;
}

// Calculate Card Rarity tier based on priority and difficulty
function getRarityInfo(hw: Homework) {
  if (hw.priority === 'ด่วนที่สุด') {
    return {
      code: 'UR',
      title: 'ULTRA RARE',
      stars: 5,
      badgeClass: 'bg-gradient-to-r from-rose-500 via-amber-400 to-purple-600 text-white font-black shadow-rose-500/40',
    };
  }
  if (hw.priority === 'สำคัญ' || hw.workType === 'กลุ่ม') {
    return {
      code: 'SSR',
      title: 'SUPER SPECIAL RARE',
      stars: 4,
      badgeClass: 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 text-slate-950 font-black shadow-amber-500/40',
    };
  }
  return {
    code: 'SR',
    title: 'SUPER RARE',
    stars: 3,
    badgeClass: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white font-bold shadow-cyan-500/40',
  };
}

export const HomeworkGameCardPickerModal: React.FC<HomeworkGameCardPickerModalProps> = ({
  isOpen,
  onClose,
  homeworks,
  selectedIds,
  onConfirmSelection,
}) => {
  const [selectedHwIds, setSelectedHwIds] = useState<string[]>(() => selectedIds || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FIRE' | 'THUNDER' | 'WATER' | 'NATURE' | 'ARCANE' | 'COSMIC'>('ALL');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Sync state if initial ids change
  React.useEffect(() => {
    setSelectedHwIds(selectedIds || []);
  }, [selectedIds, isOpen]);

  // Filter homeworks
  const filteredHomeworks = useMemo(() => {
    return (homeworks || []).filter(hw => {
      if (!hw) return false;
      const theme = getCardTheme(hw.subject, hw.priority);

      if (activeFilter !== 'ALL' && theme.element !== activeFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchSubject = (hw.subject || '').toLowerCase().includes(q);
        const matchTitle = (hw.title || '').toLowerCase().includes(q);
        const matchDesc = (hw.description || '').toLowerCase().includes(q);
        if (!matchSubject && !matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [homeworks, activeFilter, searchQuery]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedHwIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentFilteredIds = filteredHomeworks.map(h => h.id);
    const allSelected = currentFilteredIds.every(id => selectedHwIds.includes(id));
    if (allSelected) {
      setSelectedHwIds(prev => prev.filter(id => !currentFilteredIds.includes(id)));
    } else {
      setSelectedHwIds(prev => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const handleClearAll = () => {
    setSelectedHwIds([]);
  };

  const handleSaveAndClose = () => {
    onConfirmSelection(selectedHwIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md overflow-hidden animate-fadeIn select-none">
      {/* Dynamic Background Mesh Effect with Cosmic Dust */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      {/* TOP HEADER: GAME HUD STYLE */}
      <div className="relative z-10 p-4 sm:px-8 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 shadow-xl">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-white/20">
            <Swords className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-base sm:text-xl font-black font-heading text-white tracking-wide flex items-center gap-2">
                <span>สำรับการ์ดการบ้าน</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black shadow-amber-400/30">
                  CARD DECK PICKER
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>คลิกที่การ์ดเพื่อเลือกหรือยกเลิก (เลือกได้หลายใบพร้อมกันเพื่อแชร์ให้เพื่อน)</span>
            </p>
          </div>
        </div>

        {/* Selected Deck Counter & Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex items-center px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-bold space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>เลือกแล้ว:</span>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-extrabold text-xs">
              {selectedHwIds.length} / {homeworks.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 sm:p-3 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
            title="ปิดหน้าต่างสำรับการ์ด"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* FILTER HUD & SEARCH BAR */}
      <div className="relative z-10 px-4 sm:px-8 py-3 bg-slate-900/60 border-b border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อการ์ดวิชา, หัวข้อภารกิจ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Element Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 border ${
              activeFilter === 'ALL'
                ? 'bg-slate-100 text-slate-950 border-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ทั้งหมด ({homeworks.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('FIRE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 border ${
              activeFilter === 'FIRE'
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/50'
            }`}
          >
            <span>🔥 เพลิงคำนวณ</span>
          </button>

          <button
            onClick={() => setActiveFilter('WATER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 border ${
              activeFilter === 'WATER'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60 hover:bg-cyan-900/50'
            }`}
          >
            <span>💧 สมุทรภาษา</span>
          </button>

          <button
            onClick={() => setActiveFilter('THUNDER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 border ${
              activeFilter === 'THUNDER'
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50'
            }`}
          >
            <span>⚡ สายฟ้ารหัส</span>
          </button>

          <button
            onClick={() => setActiveFilter('NATURE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 border ${
              activeFilter === 'NATURE'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
            }`}
          >
            <span>🌿 พฤกษาวิทย์</span>
          </button>

          <button
            onClick={() => setActiveFilter('ARCANE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 border ${
              activeFilter === 'ARCANE'
                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                : 'bg-purple-950/40 text-purple-300 border-purple-800/60 hover:bg-purple-900/50'
            }`}
          >
            <span>🔮 มนตราสังคม</span>
          </button>
        </div>

        {/* Select All Quick Actions */}
        <div className="flex items-center space-x-2 self-end md:self-auto shrink-0">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>เลือกหน้านี้ ({filteredHomeworks.length})</span>
          </button>
          {selectedHwIds.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้าง</span>
            </button>
          )}
        </div>
      </div>

      {/* FULLSCREEN GAME CARD ARENA (3D FLOATING PERSPECTIVE) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-10 [perspective:1200px]">
        {homeworks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4 shadow-xl">
              <BookOpen className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">ยังไม่มีการ์ดการบ้านในสำรับ</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              เพิ่มการบ้านในระบบก่อน จากนั้นเปิดสำรับการ์ดนี้เพื่อเลือกแชร์ให้เพื่อนได้อย่างง่ายดาย
            </p>
          </div>
        ) : filteredHomeworks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <p className="text-sm font-bold text-slate-400 font-heading">
              ไม่พบการ์ดการบ้านในธาตุ "{activeFilter}" หรือคำค้น "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setActiveFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-amber-400 text-xs font-bold hover:bg-slate-700"
            >
              แสดงการ์ดทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 max-w-7xl mx-auto pb-24">
            {filteredHomeworks.map((hw) => {
              const isSelected = selectedHwIds.includes(hw.id);
              const theme = getCardTheme(hw.subject, hw.priority);
              const rarity = getRarityInfo(hw);
              const ElementIcon = theme.icon;

              return (
                <div
                  key={hw.id}
                  onClick={() => toggleSelect(hw.id)}
                  onMouseEnter={() => setHoveredCardId(hw.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className={`group relative rounded-3xl p-1 transition-all duration-300 transform-gpu cursor-pointer ${
                    isSelected 
                      ? `scale-105 -translate-y-3 ${theme.selectedGlow} z-20` 
                      : `hover:-translate-y-3 hover:scale-102 ${theme.cardGlow} z-10 opacity-90 hover:opacity-100`
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Holographic / Foil Border Frame */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${theme.foilGradient} p-[2px] shadow-2xl transition-all`}>
                    <div className="w-full h-full rounded-[22px] bg-slate-950/95" />
                  </div>

                  {/* REAL GAME CARD BODY */}
                  <div className="relative rounded-[22px] bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 p-3.5 flex flex-col justify-between h-[360px] border border-white/10 overflow-hidden">
                    {/* Glowing Top Ambient Arc */}
                    <div 
                      className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-24 rounded-full blur-2xl opacity-40 pointer-events-none"
                      style={{ backgroundColor: theme.accentColor }}
                    />

                    {/* TOP HUD: Elemental Mana Orb + Subject Name + Rarity */}
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-2.5">
                        {/* Mana Orb */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 border border-white/40 shadow-lg ${theme.orbBg}`}>
                          {theme.elementSymbol}
                        </div>

                        {/* Subject Header Banner */}
                        <div className={`flex-1 px-2.5 py-1 rounded-xl border text-center truncate ${theme.bannerBg}`}>
                          <span className="font-extrabold text-xs tracking-wide uppercase truncate block font-heading">
                            {hw.subject}
                          </span>
                        </div>

                        {/* Rarity Emblem (UR / SSR / SR) */}
                        <div className={`px-2 py-0.5 rounded-lg text-[10px] tracking-wider shadow-md shrink-0 ${rarity.badgeClass}`}>
                          {rarity.code}
                        </div>
                      </div>

                      {/* CENTER ARTWORK FRAME / ICON AURA */}
                      <div className="relative h-28 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border border-white/10 flex flex-col items-center justify-center p-3 overflow-hidden shadow-inner group-hover:border-white/20 transition-all">
                        {/* Shimmer line */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        {/* Central Subject Crest */}
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-1 shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300"
                          style={{
                            background: `radial-gradient(circle, ${theme.accentColor} 0%, rgba(15,23,42,0.8) 100%)`
                          }}
                        >
                          <ElementIcon className="w-6 h-6 stroke-[2.5]" />
                        </div>

                        {/* Stars */}
                        <div className="flex items-center space-x-1 text-amber-400 mt-1">
                          {Array.from({ length: rarity.stars }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 stroke-none" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* MIDDLE: MISSION TITLE & SPELL DESCRIPTION SCROLL */}
                    <div className="my-2 space-y-1 min-h-0 flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1 font-heading text-center tracking-tight">
                        {hw.title || hw.description.slice(0, 30) || 'ภารกิจลับ'}
                      </h4>

                      {hw.description ? (
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed text-center px-1 font-sans">
                          {hw.description}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic text-center">
                          (ไม่มีคำอธิบายเพิ่มเติม)
                        </p>
                      )}
                    </div>

                    {/* CARD FOOTER STATS HUD */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <div className="flex items-center space-x-1 text-sky-400">
                          <Calendar className="w-3 h-3" />
                          <span className="font-semibold">{hw.dueDate || 'ไร้กำหนด'}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            hw.workType === 'กลุ่ม' 
                              ? 'bg-purple-950/80 text-purple-300 border-purple-800/70' 
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {hw.workType === 'กลุ่ม' ? '👥 PARTY' : '👤 SOLO'}
                          </span>
                        </div>
                      </div>

                      {/* SELECTION STAMP / CHECKMARK BUTTON */}
                      <div className={`w-full py-1.5 rounded-xl font-bold font-heading text-xs text-center transition-all flex items-center justify-center space-x-1.5 shadow-md ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-amber-400/40 ring-2 ring-white/50'
                          : 'bg-slate-800/90 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}>
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>เลือกการ์ดใบนี้แล้ว</span>
                          </>
                        ) : (
                          <span>แตะเพื่อเลือก</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING BOTTOM ACTION TRAY: SELECTED CARDS & CONFIRM */}
      <div className="relative z-20 p-4 sm:px-8 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl shrink-0">
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-sm border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              {selectedHwIds.length}
            </div>
            <div>
              <span className="text-xs font-bold text-white block font-heading">
                การ์ดที่เลือกไว้ในสำรับ
              </span>
              <span className="text-[11px] text-slate-400">
                {selectedHwIds.length === 0 ? 'ยังไม่ได้เลือกการ์ดใดๆ' : `พร้อมแชร์ ${selectedHwIds.length} รายการ`}
              </span>
            </div>
          </div>

          {/* Miniature Selected Card Chips */}
          <div className="hidden lg:flex items-center space-x-1.5 max-w-md overflow-x-auto py-1 scrollbar-none">
            {homeworks.filter(h => selectedHwIds.includes(h.id)).map(h => (
              <span 
                key={h.id}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold text-amber-300 truncate max-w-[120px] shrink-0"
              >
                {h.subject}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold font-heading border border-slate-700 cursor-pointer transition-all"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            disabled={selectedHwIds.length === 0}
            onClick={handleSaveAndClose}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-slate-950 font-black font-heading text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer transition-all btn-interactive"
          >
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>
              ยืนยันการเลือก ({selectedHwIds.length} การ์ด)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
