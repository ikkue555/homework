import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  BookOpen, 
  Tag, 
  Clock, 
  Layers,
  Sparkles,
  Info,
  Edit3,
  Trash2,
  MapPin
} from 'lucide-react';
import { Homework, CalendarEvent, ThemeId } from '../types';
import { getThemeConfig } from '../lib/themes';

interface CalendarViewProps {
  homeworks: Homework[];
  events: CalendarEvent[];
  onAddEventClick: (date?: string) => void;
  onHomeworkClick: (homework: Homework) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  currentTheme?: ThemeId;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  homeworks,
  events,
  onAddEventClick,
  onHomeworkClick,
  onEditEvent,
  onDeleteEvent,
  currentTheme = 'sky',
}) => {
  const activeThemeConfig = getThemeConfig(currentTheme as ThemeId);
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0 - 11
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    today.toISOString().split('T')[0]
  );

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
  const selectedHomeworks = selectedDateStr
    ? homeworks.filter(h => h.dueDate === selectedDateStr)
    : [];

  const selectedEvents = selectedDateStr
    ? events.filter(e => e.date === selectedDateStr)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Month Switcher */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 text-2xl">
              {activeThemeConfig.symbol}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold font-heading text-slate-800 flex items-center gap-1.5">
                  <span>{THAI_MONTHS[currentMonth]} {currentYear + 543}</span>
                  <span className="text-lg animate-bounce">{activeThemeConfig.symbol}</span>
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {currentYear}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ปฏิทินแสดงวันกำหนดส่งการบ้านและกิจกรรมต่างๆ ครบถ้วน 12 เดือน
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher (1 Month vs 12 Months Matrix) */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'month' ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                มุมมองเดือน
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'year' ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                ภาพรวม 12 เดือน
              </button>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleTodayClick}
                className="px-3 py-1.5 text-xs font-bold font-heading border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>{activeThemeConfig.symbol}</span>
                <span>วันนี้</span>
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Add Event Button */}
            <button
              onClick={() => onAddEventClick(selectedDateStr || undefined)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-heading shadow-md flex items-center space-x-1.5 cursor-pointer ml-auto sm:ml-0 transition-transform active:scale-95"
            >
              <span className="text-sm">{activeThemeConfig.symbol}</span>
              <Plus className="w-4 h-4" />
              <span>เพิ่ม Event / กิจกรรม</span>
            </button>
          </div>
        </div>

        {/* Month Selector Bar (Quick Switch to Any Month 0-11) */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {THAI_MONTHS.map((mName, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentMonth(idx);
                setViewMode('month');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                currentMonth === idx
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-700 border border-slate-200/60'
              }`}
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
                className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer hover:shadow-md ${
                  currentMonth === mIdx
                    ? 'border-sky-500 ring-2 ring-sky-200'
                    : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold font-heading text-slate-800">
                    {mName} {currentYear + 543}
                  </h3>
                  {mIdx === today.getMonth() && currentYear === today.getFullYear() && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full">
                      เดือนนี้
                    </span>
                  )}
                </div>

                {/* Mini Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                  {WEEKDAYS.map((w, i) => (
                    <span key={i} className="text-slate-400 font-semibold">{w[0]}</span>
                  ))}

                  {/* Empty offsets */}
                  {Array.from({ length: firstWeekDay }).map((_, i) => (
                    <span key={`empty-${i}`} />
                  ))}

                  {/* Day numbers */}
                  {Array.from({ length: daysCount }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = formatDayString(currentYear, mIdx, dayNum);
                    const hasHw = homeworks.some(h => h.dueDate === dateStr);
                    const hasEvt = events.some(e => e.date === dateStr);
                    const isToday = dateStr === today.toISOString().split('T')[0];

                    return (
                      <span
                        key={dayNum}
                        className={`p-1 rounded-md text-slate-700 relative flex items-center justify-center ${
                          isToday ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-100'
                        }`}
                      >
                        {dayNum}
                        {(hasHw || hasEvt) && (
                          <span
                            className={`w-1 h-1 rounded-full absolute bottom-0.5 ${
                              hasHw ? 'bg-rose-500' : 'bg-blue-500'
                            }`}
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
          {/* Calendar Grid (2 cols on desktop) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-6 border border-sky-100 shadow-xs">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-2 text-center mb-3">
              {WEEKDAYS.map((dayName, idx) => (
                <div
                  key={idx}
                  className={`py-2 text-xs font-bold font-heading rounded-xl ${
                    idx === 0 || idx === 6
                      ? 'text-rose-600 bg-rose-50/50'
                      : 'text-slate-600 bg-slate-50'
                  }`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Empty padding before month starts */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[70px] sm:min-h-[90px] rounded-2xl bg-slate-50/50 border border-transparent opacity-30"
                />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = formatDayString(currentYear, currentMonth, dayNum);

                const isToday = dateStr === today.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDateStr;

                const dayHomeworks = homeworks.filter(h => h.dueDate === dateStr);
                const dayEvents = events.filter(e => e.date === dateStr);

                return (
                  <div
                    key={dayNum}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[75px] sm:min-h-[95px] p-2 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden group ${
                      isSelected
                        ? 'border-sky-500 ring-2 ring-sky-300 bg-sky-50/40 shadow-xs'
                        : isToday
                        ? 'border-sky-300 bg-sky-50/20'
                        : 'border-slate-100 hover:border-sky-200 hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between z-10">
                      <span
                        className={`text-xs sm:text-sm font-extrabold font-heading px-2 py-0.5 rounded-lg ${
                          isToday
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-800 group-hover:text-sky-600'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Item Counter Badges */}
                      <div className="flex items-center space-x-1">
                        {dayHomeworks.length > 0 && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                            title={`การบ้าน ${dayHomeworks.length} รายการ`}
                          />
                        )}
                        {dayEvents.length > 0 && (
                          <span
                            className="w-2 h-2 rounded-full bg-blue-500"
                            title={`กิจกรรม ${dayEvents.length} รายการ`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Active Theme Symbol Watermark on Selected or Today Day */}
                    {(isSelected || isToday) && (
                      <div className="absolute right-0 bottom-0 text-3xl opacity-15 pointer-events-none select-none transform translate-x-1 translate-y-1">
                        {activeThemeConfig.symbol}
                      </div>
                    )}

                    {/* Preview Cards/Pills on day cell */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {/* Show top homework */}
                      {dayHomeworks.slice(0, 2).map((hw) => (
                        <div
                          key={hw.id}
                          className={`text-[10px] font-semibold truncate px-1.5 py-0.5 rounded-md border ${
                            hw.completed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          📚 {hw.subject}
                        </div>
                      ))}

                      {/* Show top event */}
                      {dayEvents.slice(0, 1).map((evt) => (
                        <div
                          key={evt.id}
                          className="text-[10px] font-semibold truncate px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200"
                        >
                          📌 {evt.title}
                        </div>
                      ))}

                      {dayHomeworks.length + dayEvents.length > 3 && (
                        <div className="text-[9px] text-slate-400 font-bold px-1">
                          +{dayHomeworks.length + dayEvents.length - 3} เพิ่มเติม
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail Inspector Panel */}
          <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">วันที่เลือก:</span>
                  <h3 className="text-lg font-bold font-heading text-slate-800">
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
                    className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer border border-sky-200"
                    title="เพิ่ม Event สำหรับวันนี้"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Items List for Selected Day */}
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {/* Homeworks due section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                    <span>การบ้านที่ต้องส่ง ({selectedHomeworks.length})</span>
                  </h4>

                  {selectedHomeworks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 pl-2">
                      ไม่มีการบ้านกำหนดส่งในวันนี้
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedHomeworks.map((hw) => (
                        <div
                          key={hw.id}
                          onClick={() => onHomeworkClick(hw)}
                          className="p-3 bg-slate-50 hover:bg-sky-50 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg">
                              {hw.subject}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                              {hw.progress}%
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                            {hw.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calendar Events section */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>กิจกรรม / Event ({selectedEvents.length})</span>
                  </h4>

                  {selectedEvents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 pl-2">
                      ไม่มีกิจกรรมสำหรับวันนี้
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-3.5 rounded-2xl border bg-sky-50/50 border-sky-200 text-xs hover:border-sky-300 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="space-y-1 pr-1">
                              <span className="font-bold text-slate-800 text-xs block">
                                📌 {evt.title}
                              </span>
                              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200/60">
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
                                  className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
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
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                  title="ลบกิจกรรม"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {evt.time && (
                            <div className="text-[11px] text-slate-600 flex items-center space-x-1 mt-1.5">
                              <Clock className="w-3 h-3 text-sky-600" />
                              <span>เวลา {evt.time} น.</span>
                            </div>
                          )}
                          {evt.location && (
                            <div className="text-[11px] text-slate-600 flex items-center space-x-1 mt-1">
                              <MapPin className="w-3 h-3 text-sky-600" />
                              <span>สถานที่: {evt.location}</span>
                            </div>
                          )}
                          {evt.description && (
                            <p className="text-[11px] text-slate-600 mt-1.5 bg-white/80 p-2 rounded-xl border border-slate-100">
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
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => onAddEventClick(selectedDateStr || undefined)}
                className="w-full py-2.5 bg-slate-50 hover:bg-sky-50 text-sky-700 font-bold font-heading text-xs rounded-xl border border-sky-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span className="text-sm">{activeThemeConfig.symbol}</span>
                <Plus className="w-4 h-4" />
                <span>+ เพิ่ม Event ในวันที่ {selectedDateStr || ''}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
