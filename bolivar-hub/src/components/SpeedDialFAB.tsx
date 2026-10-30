import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  X, 
  BookOpen, 
  GraduationCap, 
  ListTodo, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SpeedDialFABProps {
  activeTab: ActiveTab;
  onAddHomework: () => void;
  onAddExam: () => void;
  onAddTodo: () => void;
}

export const SpeedDialFAB: React.FC<SpeedDialFABProps> = ({
  activeTab,
  onAddHomework,
  onAddExam,
  onAddTodo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle long press triggers
  const startLongPress = () => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setIsOpen(true);
    }, 350);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClickMainButton = () => {
    // If long press already toggled it, don't double toggle
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSelectAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  // Speed Dial Action Items
  const actions = [
    {
      id: 'homework',
      label: 'เพิ่มการบ้านใหม่',
      shortLabel: 'การบ้าน',
      icon: BookOpen,
      gradient: 'from-sky-500 via-blue-600 to-indigo-600',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/80 text-sky-800 dark:text-sky-200 border-sky-200/80 dark:border-sky-800',
      shadow: 'shadow-sky-500/30',
      onClick: onAddHomework,
      description: 'วิชา กำหนดส่ง และรูปภาพประกอบ',
    },
    {
      id: 'exam',
      label: 'เพิ่มตารางสอบ',
      shortLabel: 'ตารางสอบ',
      icon: GraduationCap,
      gradient: 'from-rose-500 via-pink-600 to-amber-500',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200/80 dark:border-rose-800',
      shadow: 'shadow-rose-500/30',
      onClick: onAddExam,
      description: 'วันสอบ ห้องสอบ และหัวข้ออ่านหนังสือ',
    },
    {
      id: 'todo',
      label: 'เพิ่มสิ่งที่ต้องทำ (To Do)',
      shortLabel: 'To Do',
      icon: ListTodo,
      gradient: 'from-indigo-500 via-purple-600 to-cyan-500',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border-indigo-200/80 dark:border-indigo-800',
      shadow: 'shadow-indigo-500/30',
      onClick: onAddTodo,
      description: 'เช็คลิสต์งานส่วนตัวและการเตรียมตัว',
    },
  ];

  return (
    <>
      {/* Subtle Backdrop when Speed Dial is open */}
      <div 
        className={`fixed inset-0 z-30 transition-all duration-300 pointer-events-none ${
          isOpen ? 'bg-slate-950/30 backdrop-blur-xs opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div 
        ref={menuRef}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end pointer-events-none"
      >
        {/* Speed Dial Expanded Sub-actions List */}
        <div 
          className={`flex flex-col items-end space-y-3 mb-3.5 transition-all duration-300 ease-out origin-bottom-right ${
            isOpen 
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
          }`}
        >
          {actions.map((item, idx) => {
            const Icon = item.icon;
            // Delay for staggered entrance
            const transitionDelay = isOpen ? `${(actions.length - 1 - idx) * 45}ms` : '0ms';

            return (
              <div
                key={item.id}
                className="flex items-center space-x-2.5 transition-all duration-200"
                style={{
                  transitionDelay,
                  transform: isOpen ? 'translateY(0)' : 'translateY(12px)',
                  opacity: isOpen ? 1 : 0,
                }}
              >
                {/* Floating Action Label Pill */}
                <button
                  type="button"
                  onClick={() => handleSelectAction(item.onClick)}
                  className="px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl hover:shadow-2xl text-slate-800 dark:text-slate-100 text-xs font-bold font-heading cursor-pointer btn-interactive flex items-center space-x-1.5 group select-none"
                >
                  <span className="text-[11px] sm:text-xs tracking-wide">{item.label}</span>
                </button>

                {/* Circular Action Button */}
                <button
                  type="button"
                  onClick={() => handleSelectAction(item.onClick)}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-lg ${item.shadow} hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Primary FAB Trigger Button */}
        <div className="pointer-events-auto flex items-center">
          <button
            id="speed-dial-main-btn"
            type="button"
            onClick={handleClickMainButton}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            aria-label={isOpen ? 'ปิดเมนูด่วน' : 'เปิดเมนูด่วน (Speed Dial)'}
            aria-expanded={isOpen}
            className={`group relative flex items-center space-x-2 px-4 py-3 sm:py-3 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer border border-white/20 select-none ${
              isOpen
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-600/30 scale-105 rotate-0'
                : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-600/30 hover:shadow-2xl hover:scale-105 active:scale-95'
            }`}
            title={isOpen ? 'คลิกเพื่อปิดเมนูด่วน' : 'คลิกหรือกดค้างเพื่อเปิดเมนู เพิ่มการบ้าน / สอบ / To Do'}
          >
            {/* Rotating Icon (+ transforms into X when expanded) */}
            <div 
              className={`transition-transform duration-300 ease-out transform ${
                isOpen ? 'rotate-135' : 'rotate-0'
              }`}
            >
              <Plus className="w-5 h-5 stroke-[2.6]" />
            </div>

            <span className="font-heading font-bold text-xs sm:text-sm tracking-wide">
              {isOpen ? 'ปิดเมนู' : 'สร้างรายการใหม่'}
            </span>

            {/* Glowing Accent Ring when closed */}
            {!isOpen && (
              <span className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all pointer-events-none" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};
