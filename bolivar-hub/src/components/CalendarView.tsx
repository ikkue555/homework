import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  BookOpen, 
  Tag, 
  Clock, 
  Edit3, 
  Trash2, 
  MapPin,
  GraduationCap,
  Palette,
  Sparkles
} from 'lucide-react';
import { Homework, CalendarEvent, ExamSchedule } from '../types';
import { 
  CalendarTheme, 
  getSavedCalendarTheme, 
  saveCalendarTheme, 
  hexToRgba, 
  getContrastTextColor 
} from '../lib/calendarTheme';
import { CalendarThemeModal } from './CalendarThemeModal';

interface CalendarViewProps {
  homeworks: Homework[];
  events: CalendarEvent[];
  exams?: ExamSchedule[];
  onAddEventClick: (date?: string) => void;
  onHomeworkClick: (homework: Homework) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onNavigateToExam?: () => void;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  homeworks,
  events,
  exams = [],
  onAddEventClick,
  onHomeworkClick,
  onEditEvent,
  onDeleteEvent,
  onNavigateToExam,
}) => {
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0 - 11
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    today.toISOString().split('T')[0]
  );
  const [calendarTheme, setCalendarTheme] = useState<CalendarTheme>(getSavedCalendarTheme);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const handleSaveTheme = (newTheme: CalendarTheme) => {
    setCalendarTheme(newTheme);
    saveCalendarTheme(newTheme);
  };

  // Automatically update and reset to current month & today's date upon entering Calendar view
  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setViewMode('month');
    setSelectedDateStr(now.toISOString().split('T')[0]);
  }, []);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleTodayClick = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Days in current month calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Helper to build YYYY-MM-DD
  const formatDayString = (year: number, monthIndex: number, dayNum: number) => {
    const m = String(monthIndex + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Selected date items
  const safeHomeworks = (homeworks || []).filter(Boolean);
  const safeEvents = (events || []).filter(Boolean);
  const safeExams = (exams || []).filter(Boolean);

  const selectedHomeworks = selectedDateStr
    ? safeHomeworks.filter(h => h.dueDate === selectedDateStr)
    : [];

  const selectedEvents = selectedDateStr
    ? safeEvents.filter(e => e.date === selectedDateStr)
    : [];

  const selectedExams = selectedDateStr
    ? safeExams.filter(e => e.date === selectedDateStr)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Month Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-2xl transition-all"
              style={{
                background: calendarTheme.headerStyle === 'gradient'
                  ? `linear-gradient(135deg, ${calendarTheme.primaryColor}, ${calendarTheme.secondaryColor})`
                  : calendarTheme.primaryColor,
                boxShadow: `0 4px 14px ${hexToRgba(calendarTheme.primaryColor, 0.3)}`,
                color: getContrastTextColor(calendarTheme.primaryColor),
              }}
            >
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold font-heading text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{THAI_MONTHS[currentMonth]} {currentYear + 543}</span>
                </h2>
                <span 
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors"
                  style={{
                    backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.12),
                    color: calendarTheme.primaryColor,
                  }}
                >
                  {currentYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ปฏิทินแสดงวันกำหนดส่งการบ้านและกิจกรรมต่างๆ ครบถ้วน 12 เดือน
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'month' 
                    ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                style={viewMode === 'month' ? { color: calendarTheme.primaryColor } : undefined}
              >
                มุมมองเดือน
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'year' 
                    ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                style={viewMode === 'year' ? { color: calendarTheme.primaryColor } : undefined}
              >
                ภาพรวม 12 เดือน
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleTodayClick}
                className="px-3 py-1.5 text-xs font-bold font-heading rounded-xl transition-colors cursor-pointer flex items-center space-x-1 border"
                style={{
                  borderColor: hexToRgba(calendarTheme.primaryColor, 0.4),
                  backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.08),
                  color: calendarTheme.primaryColor,
                }}
              >
                <span>วันนี้</span>
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Theme Switcher Button */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="px-3 py-2 border rounded-xl text-xs font-bold font-heading flex items-center space-x-1.5 transition-all cursor-pointer hover:shadow-xs active:scale-95"
              style={{
                borderColor: hexToRgba(calendarTheme.primaryColor, 0.4),
                backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.08),
                color: calendarTheme.primaryColor,
              }}
              title="ปรับแต่งธีมปฏิทิน (โทนสี, สไตล์, ขอบมน)"
            >
              <span 
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white/60"
                style={{
                  background: calendarTheme.headerStyle === 'gradient'
                    ? `linear-gradient(135deg, ${calendarTheme.primaryColor}, ${calendarTheme.secondaryColor})`
                    : calendarTheme.primaryColor,
                }}
              />
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ธีม:</span>
              <span className="max-w-[75px] sm:max-w-none truncate">{calendarTheme.name.split(' ')[0]}</span>
            </button>

            {/* Add Event Button */}
            <button
              onClick={() => onAddEventClick(selectedDateStr || undefined)}
              className="px-3.5 py-2 text-white rounded-xl text-xs font-bold font-heading shadow-md flex items-center space-x-1.5 cursor-pointer ml-auto sm:ml-0 transition-all active:scale-95"
              style={{
                backgroundColor: calendarTheme.primaryColor,
                color: getContrastTextColor(calendarTheme.primaryColor),
              }}
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่ม Event / กิจกรรม</span>
            </button>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {THAI_MONTHS.map((mName, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentMonth(idx);
                setViewMode('month');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                currentMonth === idx
                  ? 'font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-700'
              }`}
              style={currentMonth === idx ? {
                backgroundColor: calendarTheme.primaryColor,
                color: getContrastTextColor(calendarTheme.primaryColor),
              } : undefined}
            >
              {mName}
            </button>
          ))}
        </div>
      </div>

      {/* Main View: Month Grid OR 12-Month Year Overview Matrix */}
      {viewMode === 'year' ? (
        /* 12-Month Overview Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {THAI_MONTHS.map((mName, mIdx) => {
            const daysCount = new Date(currentYear, mIdx + 1, 0).getDate();
            const firstWeekDay = new Date(currentYear, mIdx, 1).getDay();

            return (
              <div
                key={mIdx}
                onClick={() => {
                  setCurrentMonth(mIdx);
                  setViewMode('month');
                }}
                className={`bg-white dark:bg-slate-900 ${calendarTheme.cellRounding} p-3.5 border transition-all cursor-pointer hover:shadow-md ${
                  currentMonth === mIdx
                    ? 'ring-2'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                style={currentMonth === mIdx ? {
                  borderColor: calendarTheme.primaryColor,
                  boxShadow: `0 0 0 2px ${hexToRgba(calendarTheme.primaryColor, 0.25)}`,
                } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold font-heading text-slate-800 dark:text-slate-200">
                    {mName} {currentYear + 543}
                  </h3>
                  {mIdx === today.getMonth() && currentYear === today.getFullYear() && (
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.12),
                        color: calendarTheme.primaryColor,
                      }}
                    >
                      เดือนนี้
                    </span>
                  )}
                </div>

                {/* Mini Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                  {WEEKDAYS.map((w, i) => (
                    <span 
                      key={i} 
                      className="font-semibold"
                      style={
                        (i === 0 || i === 6) && calendarTheme.weekendStyle === 'theme'
                          ? { color: calendarTheme.primaryColor }
                          : undefined
                      }
                    >
                      {w[0]}
                    </span>
                  ))}

                  {/* Empty offsets */}
                  {Array.from({ length: firstWeekDay }).map((_, i) => (
                    <span key={`empty-${i}`} />
                  ))}

                  {/* Day numbers */}
                  {Array.from({ length: daysCount }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = formatDayString(currentYear, mIdx, dayNum);
                    const hasHw = safeHomeworks.some(h => h.dueDate === dateStr);
                    const hasEvt = safeEvents.some(e => e.date === dateStr);
                    const hasExam = safeExams.some(e => e.date === dateStr);
                    const isToday = dateStr === today.toISOString().split('T')[0];

                    return (
                      <span
                        key={dayNum}
                        className={`p-1 rounded-md text-slate-700 dark:text-slate-300 relative flex items-center justify-center ${
                          isToday ? 'font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        style={isToday ? {
                          backgroundColor: calendarTheme.primaryColor,
                          color: getContrastTextColor(calendarTheme.primaryColor),
                        } : undefined}
                      >
                        {dayNum}
                        {(hasHw || hasEvt || hasExam) && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 ${
                              hasExam ? 'bg-rose-600 animate-pulse ring-1 ring-white' : hasHw ? 'bg-rose-500' : 'bg-blue-500'
                            }`}
                            title={hasExam ? 'มีสอบ' : hasHw ? 'มีกำหนดส่งการบ้าน' : 'มีกิจกรรม'}
                          />
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full Single Month Calendar + Inspector Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-2 text-center mb-3">
              {WEEKDAYS.map((dayName, idx) => {
                const isWeekend = idx === 0 || idx === 6;
                let weekendStyleClass = 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
                let customStyle: React.CSSProperties | undefined = undefined;

                if (isWeekend) {
                  if (calendarTheme.weekendStyle === 'rose') {
                    weekendStyleClass = 'text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30';
                  } else if (calendarTheme.weekendStyle === 'theme') {
                    weekendStyleClass = 'border border-transparent';
                    customStyle = {
                      color: calendarTheme.primaryColor,
                      backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.08),
                    };
                  } else {
                    weekendStyleClass = 'text-slate-400 dark:text-slate-500 bg-slate-100/60 dark:bg-slate-800/50';
                  }
                }

                return (
                  <div
                    key={idx}
                    style={customStyle}
                    className={`py-2 text-xs font-bold font-heading rounded-xl transition-colors ${weekendStyleClass}`}
                  >
                    {dayName}
                  </div>
                );
              })}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Empty padding before month starts */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className={`min-h-[70px] sm:min-h-[90px] ${calendarTheme.cellRounding} bg-slate-50/50 dark:bg-slate-800/30 border border-transparent opacity-30`}
                />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = formatDayString(currentYear, currentMonth, dayNum);

                const isToday = dateStr === today.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDateStr;

                const dayHomeworks = safeHomeworks.filter(h => h.dueDate === dateStr);
                const dayEvents = safeEvents.filter(e => e.date === dateStr);
                const dayExams = safeExams.filter(e => e.date === dateStr);

                // Compute dynamic cell styles based on theme
                let cellBorderClass = 'border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/60';
                let cellInlineStyle: React.CSSProperties = {};

                if (isSelected) {
                  cellInlineStyle = {
                    borderColor: calendarTheme.primaryColor,
                    backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.06),
                    boxShadow: `0 0 0 2px ${hexToRgba(calendarTheme.primaryColor, 0.3)}`,
                  };
                } else if (isToday) {
                  cellInlineStyle = {
                    borderColor: hexToRgba(calendarTheme.primaryColor, 0.4),
                    backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.03),
                  };
                } else if (dayExams.length > 0) {
                  cellBorderClass = 'border-rose-300/80 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/15 hover:border-rose-400';
                }

                return (
                  <div
                    key={dayNum}
                    onClick={() => setSelectedDateStr(dateStr)}
                    style={cellInlineStyle}
                    className={`min-h-[75px] sm:min-h-[95px] p-2 ${calendarTheme.cellRounding} border transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden group ${cellBorderClass}`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between z-10">
                      <span
                        className={`text-xs sm:text-sm font-extrabold font-heading px-2 py-0.5 rounded-lg transition-colors ${
                          isToday
                            ? 'shadow-xs'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                        style={isToday ? {
                          backgroundColor: calendarTheme.primaryColor,
                          color: getContrastTextColor(calendarTheme.primaryColor),
                        } : undefined}
                      >
                        {dayNum}
                      </span>

                      {/* Item Counter Badges */}
                      <div className="flex items-center space-x-1">
                        {dayExams.length > 0 && (
                          <span
                            className="flex items-center space-x-0.5 px-1 py-0.2 bg-rose-600 text-white rounded text-[8.5px] font-black shadow-2xs animate-pulse"
                            title={`📍 มีสอบ ${dayExams.length} วิชา: ${dayExams.map(x => x.subject).join(', ')}`}
                          >
                            <MapPin className="w-2.5 h-2.5 fill-current" />
                            <span>สอบ</span>
                          </span>
                        )}
                        {dayHomeworks.length > 0 && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                            title={`การบ้าน ${dayHomeworks.length} รายการ`}
                          />
                        )}
                        {dayEvents.length > 0 && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: calendarTheme.secondaryColor }}
                            title={`กิจกรรม ${dayEvents.length} รายการ`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Dynamic Badges according to calendarTheme.badgeStyle */}
                    {calendarTheme.badgeStyle === 'pill' ? (
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {/* Show exam pills first with Red Pin 📍 */}
                        {dayExams.map((ex) => (
                          <div
                            key={ex.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigateToExam) onNavigateToExam();
                            }}
                            className="text-[10px] font-bold truncate px-1.5 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-2xs flex items-center space-x-1 cursor-pointer transition-colors"
                            title={`📍 สอบ ${ex.subject} (${ex.startTime} - ${ex.endTime})`}
                          >
                            <span className="text-[9px]">📍</span>
                            <span className="truncate">สอบ {ex.subject}</span>
                          </div>
                        ))}

                        {/* Show top homework */}
                        {dayHomeworks.slice(0, dayExams.length > 0 ? 1 : 2).map((hw) => (
                          <div
                            key={hw.id}
                            className={`text-[10px] font-semibold truncate px-1.5 py-0.5 rounded-md border ${
                              hw.completed
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            📚 {hw.subject}
                          </div>
                        ))}

                        {/* Show top event if space */}
                        {dayExams.length === 0 && dayEvents.slice(0, 1).map((evt) => (
                          <div
                            key={evt.id}
                            className="text-[10px] font-semibold truncate px-1.5 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.1),
                              color: calendarTheme.primaryColor,
                              borderColor: hexToRgba(calendarTheme.primaryColor, 0.25),
                            }}
                          >
                            📌 {evt.title}
                          </div>
                        ))}

                        {dayExams.length + dayHomeworks.length + dayEvents.length > 3 && (
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold px-1">
                            +{dayExams.length + dayHomeworks.length + dayEvents.length - 3} เพิ่มเติม
                          </div>
                        )}
                      </div>
                    ) : calendarTheme.badgeStyle === 'dot' ? (
                      <div className="flex items-center justify-center space-x-1.5 py-2 mt-auto">
                        {dayExams.map((ex) => (
                          <span
                            key={ex.id}
                            className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse ring-2 ring-rose-200 dark:ring-rose-900"
                            title={`📍 สอบ ${ex.subject}`}
                          />
                        ))}
                        {dayHomeworks.map((hw) => (
                          <span
                            key={hw.id}
                            className={`w-2 h-2 rounded-full ${hw.completed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            title={`📚 ${hw.subject}`}
                          />
                        ))}
                        {dayEvents.map((evt) => (
                          <span
                            key={evt.id}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: calendarTheme.primaryColor }}
                            title={`📌 ${evt.title}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-auto space-y-1">
                        {dayExams.length > 0 && (
                          <div className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-bold truncate flex items-center justify-between">
                            <span>📍 สอบ</span>
                            <span>{dayExams.length} วิชา</span>
                          </div>
                        )}
                        {(dayHomeworks.length > 0 || dayEvents.length > 0) && (
                          <div 
                            className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold truncate flex items-center justify-between"
                            style={{
                              backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.12),
                              color: calendarTheme.primaryColor,
                            }}
                          >
                            <span>{dayHomeworks.length > 0 ? `📚 ${dayHomeworks.length}` : ''}</span>
                            <span>{dayEvents.length > 0 ? `📌 ${dayEvents.length}` : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail Inspector Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
            <div>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">วันที่เลือก:</span>
                  <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100">
                    {selectedDateStr
                      ? new Date(selectedDateStr).toLocaleDateString('th-TH', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'กรุณาเลือกวันที่'}
                  </h3>
                </div>

                {selectedDateStr && (
                  <button
                    onClick={() => onAddEventClick(selectedDateStr)}
                    className="p-2 rounded-xl transition-colors cursor-pointer border"
                    style={{
                      color: calendarTheme.primaryColor,
                      borderColor: hexToRgba(calendarTheme.primaryColor, 0.35),
                      backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.05),
                    }}
                    title="เพิ่ม Event สำหรับวันนี้"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Items List for Selected Day */}
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {/* Exams section if any */}
                {selectedExams.length > 0 && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <GraduationCap className="w-4 h-4 text-rose-600" />
                        <span>มีสอบวันนี้ ({selectedExams.length} วิชา)</span>
                      </h4>
                      {onNavigateToExam && (
                        <button
                          onClick={onNavigateToExam}
                          className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer flex items-center space-x-1"
                        >
                          <span>เปิดตารางสอบ</span>
                          <span>→</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {selectedExams.map((ex) => (
                        <div
                          key={ex.id}
                          onClick={onNavigateToExam}
                          className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200/80 dark:border-rose-900/60 shadow-2xs hover:border-rose-400 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1">
                              <span>📍</span>
                              <span>{ex.subject}</span>
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                              {ex.examType}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                            <span>⏰ {ex.startTime} - {ex.endTime}</span>
                            {ex.room && <span>• 🏛️ {ex.room}</span>}
                            {ex.seatNumber && <span>• 🪑 ที่นั่ง {ex.seatNumber}</span>}
                          </div>
                          {ex.topics && ex.topics.length > 0 && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                              <span>อ่านแล้ว {ex.topics.filter(t => t.completed).length}/{ex.topics.length} เรื่อง</span>
                              <span className="font-bold text-rose-600">
                                {Math.round((ex.topics.filter(t => t.completed).length / ex.topics.length) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Homeworks due section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <BookOpen 
                      className="w-3.5 h-3.5" 
                      style={{ color: calendarTheme.primaryColor }}
                    />
                    <span>การบ้านที่ต้องส่ง ({selectedHomeworks.length})</span>
                  </h4>

                  {selectedHomeworks.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 pl-2">
                      ไม่มีการบ้านกำหนดส่งในวันนี้
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedHomeworks.map((hw) => (
                        <div
                          key={hw.id}
                          onClick={() => onHomeworkClick(hw)}
                          className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span 
                              className="text-xs font-bold px-2 py-0.5 rounded-lg"
                              style={{
                                backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.12),
                                color: calendarTheme.primaryColor,
                              }}
                            >
                              {hw.subject}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {hw.progress}%
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                            {hw.title || hw.subject}
                          </h5>
                          {hw.description && (
                            <p className="text-[11px] font-normal text-slate-600 dark:text-slate-400 line-clamp-2">
                              {hw.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calendar Events section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Tag 
                      className="w-3.5 h-3.5" 
                      style={{ color: calendarTheme.secondaryColor }}
                    />
                    <span>กิจกรรม / Event ({selectedEvents.length})</span>
                  </h4>

                  {selectedEvents.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 pl-2">
                      ไม่มีกิจกรรมสำหรับวันนี้
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-3.5 rounded-2xl border bg-slate-50/60 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-xs transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="space-y-1 pr-1">
                              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">
                                📌 {evt.title}
                              </span>
                              <span 
                                className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.1),
                                  color: calendarTheme.primaryColor,
                                  borderColor: hexToRgba(calendarTheme.primaryColor, 0.25),
                                }}
                              >
                                {evt.type}
                              </span>
                            </div>

                            {/* Edit & Delete Action Buttons */}
                            <div className="flex items-center space-x-1 shrink-0">
                              {onEditEvent && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditEvent(evt);
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                  title="แก้ไขกิจกรรม"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteEvent && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteEvent(evt.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                                  title="ลบกิจกรรม"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {evt.time && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1 mt-1.5">
                              <Clock 
                                className="w-3 h-3" 
                                style={{ color: calendarTheme.primaryColor }}
                              />
                              <span>เวลา {evt.time} น.</span>
                            </div>
                          )}
                          {evt.location && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1 mt-1">
                              <MapPin 
                                className="w-3 h-3" 
                                style={{ color: calendarTheme.primaryColor }}
                              />
                              <span>สถานที่: {evt.location}</span>
                            </div>
                          )}
                          {evt.description && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-100 dark:border-slate-750">
                              {evt.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                onClick={() => onAddEventClick(selectedDateStr || undefined)}
                className="w-full py-2.5 font-bold font-heading text-xs rounded-xl border transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                style={{
                  color: calendarTheme.primaryColor,
                  borderColor: hexToRgba(calendarTheme.primaryColor, 0.35),
                  backgroundColor: hexToRgba(calendarTheme.primaryColor, 0.05),
                }}
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่ม Event ในวันที่ {selectedDateStr || ''}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Theme Customizer Modal */}
      <CalendarThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={calendarTheme}
        onSaveTheme={handleSaveTheme}
      />
    </div>
  );
};
