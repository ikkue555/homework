import React, { useState } from 'react';
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
  MapPin 
} from 'lucide-react';
import { Homework, CalendarEvent } from '../types';

interface CalendarViewProps {
  homeworks: Homework[];
  events: CalendarEvent[];
  onAddEventClick: (date?: string) => void;
  onHomeworkClick: (homework: Homework) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
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
}) => {
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
  const safeHomeworks = (homeworks || []).filter(Boolean);
  const safeEvents = (events || []).filter(Boolean);

  const selectedHomeworks = selectedDateStr
    ? safeHomeworks.filter(h => h.dueDate === selectedDateStr)
    : [];

  const selectedEvents = selectedDateStr
    ? safeEvents.filter(e => e.date === selectedDateStr)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header & Month Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 text-2xl">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold font-heading text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{THAI_MONTHS[currentMonth]} {currentYear + 543}</span>
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
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
                    ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                มุมมองเดือน
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'year' 
                    ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
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
                className="px-3 py-1.5 text-xs font-bold font-heading border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
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

            {/* Add Event Button */}
            <button
              onClick={() => onAddEventClick(selectedDateStr || undefined)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-heading shadow-md flex items-center space-x-1.5 cursor-pointer ml-auto sm:ml-0 transition-transform active:scale-95"
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
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200/60 dark:border-slate-700'
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
                className={`bg-white dark:bg-slate-900 rounded-2xl p-3.5 border transition-all cursor-pointer hover:shadow-md ${
                  currentMonth === mIdx
                    ? 'border-sky-500 ring-2 ring-sky-200 dark:ring-sky-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold font-heading text-slate-800 dark:text-slate-200">
                    {mName} {currentYear + 543}
                  </h3>
                  {mIdx === today.getMonth() && currentYear === today.getFullYear() && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded-full">
                      เดือนนี้
                    </span>
                  )}
                </div>

                {/* Mini Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                  {WEEKDAYS.map((w, i) => (
                    <span key={i} className="text-slate-400 dark:text-slate-500 font-semibold">{w[0]}</span>
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
                    const isToday = dateStr === today.toISOString().split('T')[0];

                    return (
                      <span
                        key={dayNum}
                        className={`p-1 rounded-md text-slate-700 dark:text-slate-300 relative flex items-center justify-center ${
                          isToday ? 'bg-sky-600 text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
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
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-2 text-center mb-3">
              {WEEKDAYS.map((dayName, idx) => (
                <div
                  key={idx}
                  className={`py-2 text-xs font-bold font-heading rounded-xl ${
                    idx === 0 || idx === 6
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
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
                  className="min-h-[70px] sm:min-h-[90px] rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent opacity-30"
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

                return (
                  <div
                    key={dayNum}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[75px] sm:min-h-[95px] p-2 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden group ${
                      isSelected
                        ? 'border-sky-500 ring-2 ring-sky-300 dark:ring-sky-700 bg-sky-50/40 dark:bg-sky-950/40 shadow-xs'
                        : isToday
                        ? 'border-sky-300 dark:border-sky-700 bg-sky-50/20 dark:bg-sky-950/20'
                        : 'border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between z-10">
                      <span
                        className={`text-xs sm:text-sm font-extrabold font-heading px-2 py-0.5 rounded-lg ${
                          isToday
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400'
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

                    {/* Preview Cards/Pills on day cell */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {/* Show top homework */}
                      {dayHomeworks.slice(0, 2).map((hw) => (
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

                      {/* Show top event */}
                      {dayEvents.slice(0, 1).map((evt) => (
                        <div
                          key={evt.id}
                          className="text-[10px] font-semibold truncate px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        >
                          📌 {evt.title}
                        </div>
                      ))}

                      {dayHomeworks.length + dayEvents.length > 3 && (
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold px-1">
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
                    className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-sky-200 dark:border-slate-750"
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
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
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
                          className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-750 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-lg">
                              {hw.subject}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {hw.progress}%
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                            {hw.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calendar Events section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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
                          className="p-3.5 rounded-2xl border bg-sky-50/50 dark:bg-slate-800/80 border-sky-200 dark:border-slate-700 text-xs hover:border-sky-300 dark:hover:border-sky-600 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="space-y-1 pr-1">
                              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">
                                📌 {evt.title}
                              </span>
                              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800">
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
                                  className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
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
                              <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                              <span>เวลา {evt.time} น.</span>
                            </div>
                          )}
                          {evt.location && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1 mt-1">
                              <MapPin className="w-3 h-3 text-sky-600 dark:text-sky-400" />
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
                className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-750 text-sky-700 dark:text-sky-300 font-bold font-heading text-xs rounded-xl border border-sky-200 dark:border-slate-700 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
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
