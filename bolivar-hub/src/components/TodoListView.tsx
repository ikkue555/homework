import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Check,
  AlertCircle,
  TrendingUp,
  ListTodo,
  ArrowRight
} from 'lucide-react';
import { TodoItem, Homework, ExamSchedule, TodoItemType } from '../types';

interface TodoListViewProps {
  todos: TodoItem[];
  homeworks: Homework[];
  exams: ExamSchedule[];
  siteSettings?: any;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onToggleCompleteTodo?: (todo: TodoItem) => void;
  onDeleteTodo: (id: string) => void;
  onClearCompletedTodos?: () => void;
  onClearCompleted?: () => void;
  onOpenAddModal?: (type?: TodoItemType, date?: string) => void;
  onOpenAddTodo?: (prefill?: { type?: TodoItemType; date?: string }) => void;
  onEditTodo: (todo: TodoItem) => void;
  onViewHomeworkDetail?: (homework: Homework) => void;
  onNavigateToHomework?: (hwId: string) => void;
  onNavigateToExamTab?: () => void;
  onNavigateToExam?: () => void;
  onNavigateToHomeworkTab?: () => void;
  onNavigateToCalendar?: () => void;
}

export const TodoListView: React.FC<TodoListViewProps> = ({
  todos,
  homeworks,
  exams,
  onToggleComplete,
  onToggleCompleteTodo,
  onDeleteTodo,
  onClearCompletedTodos,
  onClearCompleted,
  onOpenAddModal,
  onOpenAddTodo,
  onEditTodo,
  onViewHomeworkDetail,
  onNavigateToHomework,
  onNavigateToExamTab,
  onNavigateToExam,
  onNavigateToHomeworkTab,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Safe wrapper for opening Add Todo modal
  const handleOpenAdd = (type?: TodoItemType, date?: string) => {
    if (typeof onOpenAddModal === 'function') {
      onOpenAddModal(type, date);
    } else if (typeof onOpenAddTodo === 'function') {
      onOpenAddTodo({ type, date });
    }
  };

  // Safe wrapper for toggling completion
  const handleToggle = (id: string, nextCompleted: boolean) => {
    if (typeof onToggleComplete === 'function') {
      onToggleComplete(id, nextCompleted);
    } else if (typeof onToggleCompleteTodo === 'function') {
      const item = todos.find(t => t.id === id);
      if (item) onToggleCompleteTodo({ ...item, completed: nextCompleted });
    }
  };

  // Safe wrapper for clearing completed todos
  const handleClearCompletedTasks = () => {
    if (typeof onClearCompletedTodos === 'function') {
      onClearCompletedTodos();
    } else if (typeof onClearCompleted === 'function') {
      onClearCompleted();
    }
  };

  const hasClearHandler = Boolean(onClearCompletedTodos || onClearCompleted);

  // Filter States
  const [selectedDate, setSelectedDate] = useState<string>(''); // '' means all or using dateFilter
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'all' | 'custom'>('today');
  const [typeFilter, setTypeFilter] = useState<'all' | 'homework' | 'exam' | 'custom'>('all');
  // Default to 'pending' so completed items immediately disappear from view
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleCheckClick = (item: TodoItem) => {
    if (!item.completed) {
      setCompletingId(item.id);
      setTimeout(() => {
        handleToggle(item.id, true);
        setCompletingId(null);
      }, 250);
    } else {
      handleToggle(item.id, false);
    }
  };

  // Date Nav Helpers
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const next7DaysEndStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, []);

  // Active target date string for display
  const activeDateTarget = useMemo(() => {
    if (dateFilter === 'today') return todayStr;
    if (dateFilter === 'tomorrow') return tomorrowStr;
    if (dateFilter === 'custom' && selectedDate) return selectedDate;
    return '';
  }, [dateFilter, selectedDate, todayStr, tomorrowStr]);

  // Filtered Todos
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Type Filter
      if (typeFilter !== 'all' && todo.type !== typeFilter) return false;

      // Status Filter
      if (statusFilter === 'pending' && todo.completed) return false;
      if (statusFilter === 'completed' && !todo.completed) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = todo.title.toLowerCase().includes(q);
        const matchesSubject = todo.subject?.toLowerCase().includes(q);
        const matchesDesc = todo.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject && !matchesDesc) return false;
      }

      // Date Filter
      if (dateFilter === 'today') {
        return todo.date === todayStr;
      }
      if (dateFilter === 'tomorrow') {
        return todo.date === tomorrowStr;
      }
      if (dateFilter === 'week') {
        return todo.date >= todayStr && todo.date <= next7DaysEndStr;
      }
      if (dateFilter === 'custom' && selectedDate) {
        return todo.date === selectedDate;
      }

      return true;
    });
  }, [todos, typeFilter, statusFilter, searchQuery, dateFilter, todayStr, tomorrowStr, next7DaysEndStr, selectedDate]);

  // Statistics
  const todayTodos = useMemo(() => todos.filter(t => t.date === todayStr), [todos, todayStr]);
  const todayCompletedCount = useMemo(() => todayTodos.filter(t => t.completed).length, [todayTodos]);
  const todayTotalCount = todayTodos.length;
  const todayProgressPercent = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  const totalPendingCount = useMemo(() => todos.filter(t => !t.completed).length, [todos]);
  const totalCompletedCount = useMemo(() => todos.filter(t => t.completed).length, [todos]);

  // Date Formatting Helper in Thai
  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      const dayName = thaiDays[dateObj.getDay()];
      const monthName = thaiMonths[dateObj.getMonth()];
      const thaiYear = (dateObj.getFullYear() + 543) % 100;
      return `${dayName} ${d} ${monthName} ${thaiYear}`;
    } catch {
      return dateStr;
    }
  };

  // Group Todos by Date for clean timeline layout
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: TodoItem[] } = {};
    filteredTodos.forEach((item) => {
      const d = item.date || 'ไม่มีวันที่';
      if (!groups[d]) groups[d] = [];
      groups[d].push(item);
    });

    // Sort dates ascending
    const sortedDates = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    return sortedDates.map(d => ({
      date: d,
      items: groups[d].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (a.time || '99:99').localeCompare(b.time || '99:99');
      })
    }));
  }, [filteredTodos]);

  // Shift day by offset
  const handleShiftDay = (offset: number) => {
    const current = activeDateTarget ? new Date(activeDateTarget) : new Date();
    current.setDate(current.getDate() + offset);
    const newDateStr = current.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    setDateFilter('custom');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header & Motivational Progress Card */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-sky-800/40 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Title & Today's Summary */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-sky-500/20 border border-sky-400/30 rounded-full text-[11px] font-semibold text-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
              <span>To Do List & Daily Planner</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight flex items-center gap-2">
              <span>สิ่งที่ต้องทำประจำวัน</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              วางแผนตารางทำการบ้าน นัดอ่านหนังสือสอบ และบันทึกกิจกรรมประจำวันอย่างเป็นระบบ
            </p>
          </div>

          {/* Today's Progress Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/15 flex items-center gap-4 shrink-0">
            <div className="text-left">
              <p className="text-[11px] font-medium text-sky-200 uppercase tracking-wider">
                ความสำเร็จวันนี้ ({formatThaiDate(todayStr)})
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black font-heading text-white">{todayCompletedCount}</span>
                <span className="text-xs text-slate-300">/ {todayTotalCount} รายการ</span>
                {todayTotalCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-lg text-xs font-bold">
                    {todayProgressPercent}%
                  </span>
                )}
              </div>
              <div className="w-36 sm:w-44 bg-slate-800/80 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${todayProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Action: Add Button */}
            <button
              id="todo-add-main-btn"
              onClick={() => handleOpenAdd('homework', activeDateTarget || todayStr)}
              className="px-3.5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl text-xs font-bold font-heading shadow-md shadow-sky-600/40 flex items-center space-x-1.5 cursor-pointer btn-interactive shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">เพิ่มสิ่งที่ต้องทำ</span>
              <span className="sm:hidden">เพิ่ม</span>
            </button>
          </div>
        </div>

        {/* 3 Quick Launch Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => handleOpenAdd('homework', activeDateTarget || todayStr)}
            className="flex items-center space-x-2.5 px-3 py-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/20 rounded-2xl text-xs font-semibold text-sky-100 transition-all cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-sky-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-sky-300" />
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate">+ แอดจากการบ้าน ({homeworks.filter(h => !h.completed).length})</p>
              <p className="text-[10px] text-sky-200/70 truncate">เลือกการบ้านมาจัดตารางส่ง</p>
            </div>
          </button>

          <button
            onClick={() => handleOpenAdd('exam', activeDateTarget || todayStr)}
            className="flex items-center space-x-2.5 px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/20 rounded-2xl text-xs font-semibold text-rose-100 transition-all cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-rose-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-rose-300" />
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate">+ แอดจากวิชาสอบ ({exams.length})</p>
              <p className="text-[10px] text-rose-200/70 truncate">วางแผนอ่านและทบทวนสอบ</p>
            </div>
          </button>

          <button
            onClick={() => handleOpenAdd('custom', activeDateTarget || todayStr)}
            className="flex items-center space-x-2.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/20 rounded-2xl text-xs font-semibold text-emerald-100 transition-all cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate">+ กิจกรรมอื่น (กรอกเอง)</p>
              <p className="text-[10px] text-emerald-200/70 truncate">ซื้อของ, นัดติว, ธุระส่วนตัว</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar & Date Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Top Filter Row: Search & Date Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสิ่งที่ต้องทำ, ชื่อวิชา, หัวข้อ..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Date Filter Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => {
                setDateFilter('today');
                setSelectedDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                dateFilter === 'today'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              วันนี้
            </button>

            <button
              onClick={() => {
                setDateFilter('tomorrow');
                setSelectedDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                dateFilter === 'tomorrow'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              พรุ่งนี้
            </button>

            <button
              onClick={() => {
                setDateFilter('week');
                setSelectedDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                dateFilter === 'week'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              7 วันข้างหน้า
            </button>

            <button
              onClick={() => {
                setDateFilter('all');
                setSelectedDate('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                dateFilter === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ทั้งหมด
            </button>

            {/* Specific Date Picker */}
            <div className="flex items-center space-x-1 pl-1 border-l border-slate-200 dark:border-slate-700">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (e.target.value) setDateFilter('custom');
                }}
                className={`px-2 py-1 bg-slate-100 dark:bg-slate-800 border rounded-xl text-xs font-medium cursor-pointer ${
                  dateFilter === 'custom'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title="เลือกดูวันเฉพาะเจาะจง"
              />
            </div>
          </div>
        </div>

        {/* Bottom Filter Row: Category Types, Status & Clean completed */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Type filters */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">ประเภท:</span>
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                typeFilter === 'all'
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              ทุกประเภท
            </button>
            <button
              onClick={() => setTypeFilter('homework')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center space-x-1 ${
                typeFilter === 'homework'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>การบ้าน</span>
            </button>
            <button
              onClick={() => setTypeFilter('exam')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center space-x-1 ${
                typeFilter === 'exam'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>วิชาสอบ</span>
            </button>
            <button
              onClick={() => setTypeFilter('custom')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center space-x-1 ${
                typeFilter === 'custom'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>กิจกรรมอื่น</span>
            </button>
          </div>

          {/* Status filters */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                สิ่งที่ต้องทำ ({totalPendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  statusFilter === 'completed'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                เสร็จแล้ว ({totalCompletedCount})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                ทั้งหมด ({todos.length})
              </button>
            </div>

            {/* Clear Completed Tasks Button */}
            {hasClearHandler && totalCompletedCount > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`ต้องการลบรายการที่ทำเสร็จแล้วทั้งหมด (${totalCompletedCount} รายการ) หรือไม่?`)) {
                    handleClearCompletedTasks();
                  }
                }}
                className="px-2 py-1 text-[11px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                title="ลบเฉพาะรายการที่ทำเสร็จแล้วเพื่อความสะอาดตา"
              >
                ล้างที่เสร็จแล้ว
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Tasks Content Area */}
      {filteredTodos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pop">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-3xl flex items-center justify-center mx-auto mb-3">
            <ListTodo className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100">
            {searchQuery 
              ? 'ไม่พบสิ่งที่ต้องทำตามคำค้นหา'
              : dateFilter === 'today'
              ? 'ไม่มีสิ่งที่ต้องทำสำหรับวันนี้'
              : dateFilter === 'tomorrow'
              ? 'ยังไม่มีรายการสำหรับวันพรุ่งนี้'
              : 'ยังไม่มีสิ่งที่ต้องทำในหมวดนี้'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {todos.length === 0
              ? 'เริ่มต้นวางแผนวันของคุณโดยกดเลือกการบ้าน หรือวิชาสอบเข้ามาจัดเวลาทำได้ทันที'
              : 'ลองปรับเปลี่ยนตัวกรองวันที่หรือเลือกเพิ่มรายการใหม่ลงในวันที่ต้องการ'}
          </p>

          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              onClick={() => handleOpenAdd('homework', activeDateTarget || todayStr)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-heading shadow-xs flex items-center space-x-1.5 cursor-pointer btn-interactive"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>เลือกการบ้าน</span>
            </button>
            <button
              onClick={() => handleOpenAdd('exam', activeDateTarget || todayStr)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-heading shadow-xs flex items-center space-x-1.5 cursor-pointer btn-interactive"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>เลือกวิชาสอบ</span>
            </button>
            <button
              onClick={() => handleOpenAdd('custom', activeDateTarget || todayStr)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-heading shadow-xs flex items-center space-x-1.5 cursor-pointer btn-interactive"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มกิจกรรมเอง</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDate.map((group) => {
            const isToday = group.date === todayStr;
            const isTomorrow = group.date === tomorrowStr;
            const isPast = group.date < todayStr;
            const groupCompletedCount = group.items.filter(i => i.completed).length;

            return (
              <div key={group.date} className="space-y-2.5">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      isToday ? 'bg-sky-500 animate-ping' : isPast ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    <h3 className="text-sm font-black font-heading text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{formatThaiDate(group.date)}</span>
                      {isToday && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                          วันนี้
                        </span>
                      )}
                      {isTomorrow && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          พรุ่งนี้
                        </span>
                      )}
                      {isPast && !group.items.every(i => i.completed) && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          งานค้าง
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-[11px] text-slate-400">
                      เสร็จ {groupCompletedCount}/{group.items.length}
                    </span>
                    <button
                      onClick={() => handleOpenAdd('homework', group.date)}
                      className="text-sky-600 dark:text-sky-400 hover:underline text-[11px] font-bold inline-flex items-center space-x-0.5 cursor-pointer"
                      title="เพิ่มสิ่งที่ต้องทำในวันนี้"
                    >
                      <Plus className="w-3 h-3" />
                      <span>เพิ่มในวันนี้</span>
                    </button>
                  </div>
                </div>

                {/* Items in this date */}
                <div className="space-y-2">
                  {group.items.map((item) => {
                    // Match full homework if available
                    const matchedHomework = item.referenceId ? homeworks.find(h => h.id === item.referenceId) : undefined;
                    const matchedExam = item.referenceId ? exams.find(e => e.id === item.referenceId) : undefined;
                    const isCompletingNow = completingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCompletingNow
                            ? 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                            : item.completed
                            ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-70'
                            : item.type === 'homework'
                            ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 shadow-xs'
                            : item.type === 'exam'
                            ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs'
                        }`}
                      >
                        {/* Left: Circular Checkbox + Content */}
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          {/* Circular Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleCheckClick(item)}
                            className={`w-6 h-6 mt-0.5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                              item.completed || isCompletingNow
                                ? 'bg-emerald-600 text-white shadow-xs scale-105 ring-2 ring-emerald-300 dark:ring-emerald-700'
                                : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 bg-white dark:bg-slate-800'
                            }`}
                            title={item.completed ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'กดเมื่อเสร็จแล้ว (รายการจะหายไปและเชื่อมโยงกับหน้าการบ้าน)'}
                          >
                            {(item.completed || isCompletingNow) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          {/* Details */}
                          <div className="min-w-0 flex-1 space-y-1">
                            {/* Badges row */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Type Badge */}
                              {item.type === 'homework' ? (
                                <span className="inline-flex items-center px-2 py-0.2 rounded-md text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                                  <BookOpen className="w-2.5 h-2.5 mr-1" />
                                  การบ้าน
                                </span>
                              ) : item.type === 'exam' ? (
                                <span className="inline-flex items-center px-2 py-0.2 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                  <GraduationCap className="w-2.5 h-2.5 mr-1" />
                                  วิชาสอบ
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.2 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  <FileText className="w-2.5 h-2.5 mr-1" />
                                  กิจกรรม
                                </span>
                              )}

                              {/* Subject Badge */}
                              {item.subject && (
                                <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {item.subject}
                                </span>
                              )}

                              {/* Priority Badge */}
                              {item.priority === 'ด่วนที่สุด' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                  ด่วนที่สุด
                                </span>
                              )}
                              {item.priority === 'สำคัญ' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                  สำคัญ
                                </span>
                              )}

                              {/* Time Chip */}
                              {item.time && (
                                <span className="inline-flex items-center px-2 py-0.2 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                  <Clock className="w-2.5 h-2.5 mr-1 text-indigo-500" />
                                  เวลา {item.time}{item.endTime ? ` - ${item.endTime}` : ''}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h4 className={`text-xs sm:text-sm font-bold font-heading text-slate-800 dark:text-slate-100 ${
                              item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}>
                              {item.title}
                            </h4>

                            {/* Description / Notes */}
                            {item.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            {/* Connected Homework metadata chip */}
                            {item.homeworkInfo && (
                              <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                                <span>กำหนดส่ง: {item.homeworkInfo.dueDate} {item.homeworkInfo.dueTime || ''}</span>
                                <span>•</span>
                                <span>ความคืบหน้าปัจจุบัน: {matchedHomework ? matchedHomework.progress : item.homeworkInfo.progress}%</span>
                                {matchedHomework && (onViewHomeworkDetail || onNavigateToHomework) && (
                                  <button
                                    onClick={() => {
                                      if (typeof onViewHomeworkDetail === 'function') {
                                        onViewHomeworkDetail(matchedHomework);
                                      } else if (typeof onNavigateToHomework === 'function') {
                                        onNavigateToHomework(matchedHomework.id);
                                      }
                                    }}
                                    className="text-sky-600 dark:text-sky-400 hover:underline font-bold inline-flex items-center"
                                  >
                                    <span>ดูรายละเอียดงาน</span>
                                    <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Connected Exam metadata chip */}
                            {item.examInfo && (
                              <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                  สอบวันที่: {item.examInfo.date} {item.examInfo.startTime ? `เวลา ${item.examInfo.startTime}` : ''}
                                </span>
                                {item.examInfo.room && <span>ห้อง: {item.examInfo.room}</span>}
                                {(onNavigateToExamTab || onNavigateToExam) && (
                                  <button
                                    onClick={() => {
                                      if (typeof onNavigateToExamTab === 'function') {
                                        onNavigateToExamTab();
                                      } else if (typeof onNavigateToExam === 'function') {
                                        onNavigateToExam();
                                      }
                                    }}
                                    className="text-rose-600 dark:text-rose-400 hover:underline font-bold inline-flex items-center"
                                  >
                                    <span>เปิดตารางสอบ</span>
                                    <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Quick Actions (Edit / Delete) */}
                        <div className="flex items-center space-x-1 sm:self-center shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => onEditTodo(item)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl transition-colors cursor-pointer"
                            title="แก้ไขสิ่งที่ต้องทำ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`ต้องการลบรายการ "${item.title}" ออกจากสิ่งที่ต้องทำหรือไม่?`)) {
                                onDeleteTodo(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
