import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Building, 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  AlertTriangle,
  Columns,
  Table as TableIcon,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Cloud,
  Save,
  Award,
  Eye,
  X
} from 'lucide-react';
import { ExamSchedule, ExamTopic, UserProfile } from '../types';
import { 
  getExamCountdown, 
  formatThaiExamDate, 
  getExamTypeBadgeProps, 
  getTopicsProgress 
} from '../lib/examUtils';
import { ExamModal } from './ExamModal';

interface ExamScheduleViewProps {
  exams: ExamSchedule[];
  userProfile: UserProfile | null;
  onSaveExam: (exam: ExamSchedule) => Promise<void>;
  onDeleteExam: (examId: string) => Promise<void>;
  onToggleTopic: (examId: string, topicId: string, completed: boolean) => Promise<void>;
  onClearAllExams?: () => Promise<void>;
  onNavigateToCalendar?: (date?: string) => void;
  isExternalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

type FilterType = 'all' | 'pending' | 'completed' | 'กลางภาค' | 'ปลายภาค' | 'เก็บคะแนน';
type DesktopViewMode = 'split' | 'table';

export const ExamScheduleView: React.FC<ExamScheduleViewProps> = ({
  exams,
  userProfile,
  onSaveExam,
  onDeleteExam,
  onToggleTopic,
  onClearAllExams,
  onNavigateToCalendar,
  isExternalAddOpen,
  onCloseExternalAdd,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [desktopViewMode, setDesktopViewMode] = useState<DesktopViewMode>('split');
  
  // Selected Exam for Split View & Detail Modal
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Mobile Exam Detail Modal State
  const [mobileDetailExamId, setMobileDetailExamId] = useState<string | null>(null);
  const [mobileQuickTopicText, setMobileQuickTopicText] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);

  // Delete Confirmation State (single exam)
  const [examToDelete, setExamToDelete] = useState<ExamSchedule | null>(null);

  // Clear All Confirmation State
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Auto-Save System State
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');

  // Mobile expanded cards state
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  // Quick Topic input in Detail Panel
  const [quickTopicText, setQuickTopicText] = useState('');

  // Sorted and Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Completed / Pending status filter
      if (selectedFilter === 'completed' && !exam.isCompleted) {
        return false;
      }
      if (selectedFilter === 'pending' && exam.isCompleted) {
        return false;
      }
      // Type filter
      if (
        selectedFilter !== 'all' && 
        selectedFilter !== 'completed' && 
        selectedFilter !== 'pending' && 
        !exam.examType?.includes(selectedFilter)
      ) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inSubject = exam.subject.toLowerCase().includes(q);
        const inRoom = exam.room?.toLowerCase().includes(q);
        const inBuilding = exam.building?.toLowerCase().includes(q);
        const inSeat = exam.seatNumber?.toLowerCase().includes(q);
        const inTopics = exam.topics?.some(t => t.title.toLowerCase().includes(q));
        return inSubject || inRoom || inBuilding || inSeat || inTopics;
      }
      return true;
    });
  }, [exams, selectedFilter, searchQuery]);

  // Default selected exam in split view
  const selectedExam = useMemo(() => {
    if (selectedExamId) {
      const found = exams.find(e => e.id === selectedExamId);
      if (found) return found;
    }
    return filteredExams.length > 0 ? filteredExams[0] : null;
  }, [selectedExamId, exams, filteredExams]);

  // Selected exam for Mobile Detail Modal
  const mobileDetailExam = useMemo(() => {
    if (!mobileDetailExamId) return null;
    return exams.find((e) => e.id === mobileDetailExamId) || null;
  }, [mobileDetailExamId, exams]);

  // Overall Statistics
  const stats = useMemo(() => {
    let upcomingCount = 0;
    let todayCount = 0;
    let completedExamsCount = 0;
    let totalTopics = 0;
    let completedTopics = 0;

    exams.forEach((exam) => {
      if (exam.isCompleted) {
        completedExamsCount++;
      }
      const countdown = getExamCountdown(exam.date, exam.isCompleted);
      if (!exam.isCompleted && countdown.status === 'today') todayCount++;
      if (!exam.isCompleted && (countdown.status === 'today' || countdown.status === 'tomorrow' || countdown.status === 'upcoming')) {
        upcomingCount++;
      }
      if (exam.topics) {
        totalTopics += exam.topics.length;
        completedTopics += exam.topics.filter(t => t.completed).length;
      }
    });

    const topicPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      total: exams.length,
      completedExams: completedExamsCount,
      pendingExams: exams.length - completedExamsCount,
      upcoming: upcomingCount,
      today: todayCount,
      topicPercent,
      completedTopics,
      totalTopics,
    };
  }, [exams]);

  const handleToggleExamCompleted = async (targetExam: ExamSchedule, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!targetExam) return;
    const newCompleted = !targetExam.isCompleted;
    const updatedExam: ExamSchedule = {
      ...targetExam,
      isCompleted: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    setAutoSaveStatus('saving');
    try {
      await onSaveExam(updatedExam);
      setAutoSaveStatus('saved');
      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaveTime(nowStr);
    } catch (err) {
      console.error('Failed to toggle exam completion:', err);
      setAutoSaveStatus('idle');
    }
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCardIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddModal = () => {
    setEditingExam(null);
    setIsModalOpen(true);
  };

  // Listen for external add exam trigger (e.g. from bottom-right FAB in App.tsx)
  useEffect(() => {
    if (isExternalAddOpen) {
      handleOpenAddModal();
      onCloseExternalAdd?.();
    }
  }, [isExternalAddOpen, onCloseExternalAdd]);

  const handleOpenEditModal = (exam: ExamSchedule, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    try {
      await onDeleteExam(examToDelete.id);
      if (selectedExamId === examToDelete.id) {
        setSelectedExamId(null);
      }
      setExamToDelete(null);
    } catch (err) {
      console.error('Failed to delete exam:', err);
    }
  };

  const handleToggleTopicWithAutoSave = async (examId: string, topicId: string, completed: boolean) => {
    setAutoSaveStatus('saving');
    try {
      await onToggleTopic(examId, topicId, completed);
      setAutoSaveStatus('saved');
      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaveTime(nowStr);
    } catch (err) {
      console.error('Error toggling topic:', err);
      setAutoSaveStatus('idle');
    }
  };

  const handleQuickAddTopic = async (targetExam: ExamSchedule, title: string) => {
    if (!targetExam || !title.trim()) return;

    setAutoSaveStatus('saving');
    const newTopic: ExamTopic = {
      id: 'top_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: title.trim(),
      completed: false,
    };

    const updatedExam: ExamSchedule = {
      ...targetExam,
      topics: [...(targetExam.topics || []), newTopic],
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveExam(updatedExam);
      setAutoSaveStatus('saved');
      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaveTime(nowStr);
    } catch (err) {
      console.error('Failed to add topic:', err);
      setAutoSaveStatus('idle');
    }
  };

  const handleRemoveTopic = async (targetExam: ExamSchedule, topicId: string) => {
    if (!targetExam) return;
    setAutoSaveStatus('saving');
    const updatedExam: ExamSchedule = {
      ...targetExam,
      topics: (targetExam.topics || []).filter(t => t.id !== topicId),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveExam(updatedExam);
      setAutoSaveStatus('saved');
      const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaveTime(nowStr);
    } catch (err) {
      console.error('Failed to remove topic:', err);
      setAutoSaveStatus('idle');
    }
  };

  const handleQuickAddTopicToSelected = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !quickTopicText.trim()) return;
    await handleQuickAddTopic(selectedExam, quickTopicText);
    setQuickTopicText('');
  };

  const handleRemoveTopicFromSelected = async (topicId: string) => {
    if (!selectedExam) return;
    await handleRemoveTopic(selectedExam, topicId);
  };

  const handleConfirmClearAll = async () => {
    if (!onClearAllExams) return;
    setIsClearingAll(true);
    try {
      await onClearAllExams();
      setSelectedExamId(null);
      setIsClearAllModalOpen(false);
    } catch (err) {
      console.error('Clear all error:', err);
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 print:p-0 print:m-0 print:space-y-3">
      {/* 1. Header Banner & Quick Actions (Hidden in Print) */}
      <div className="print:hidden relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ระบบตารางสอบอัจฉริยะ (Exam Schedule System)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight flex items-center gap-3">
              ตารางสอบ
              {stats.today > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30">
                  🚨 สอบวันนี้ {stats.today} วิชา!
                </span>
              )}
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Auto-Save System Status Badge */}
            <div 
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 border border-slate-700/80 transition-all flex items-center gap-1.5 shadow-xs"
              title="สถานะระบบบันทึกอัตโนมัติแบบเรียลไทม์ (Auto-Save Active)"
            >
              {autoSaveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  <span className="text-sky-300">กำลังบันทึกอัตโนมัติ...</span>
                </>
              ) : autoSaveStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">บันทึกอัตโนมัติแล้ว {lastAutoSaveTime ? `(${lastAutoSaveTime})` : ''}</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">บันทึกอัตโนมัติ: พร้อม</span>
                </>
              )}
            </div>

            {/* Clear All Exams Button */}
            {exams.length > 0 && onClearAllExams && (
              <button
                onClick={() => setIsClearAllModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 hover:border-rose-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="ลบข้อมูลตารางสอบทั้งหมดที่บันทึกไว้ในระบบ"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>ลบตารางสอบทั้งหมด</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มวิชาสอบ</span>
            </button>
          </div>
        </div>

        {/* Mini Stats Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">วิชาสอบทั้งหมด</span>
            <div className="text-lg font-black text-white mt-0.5">{stats.total} วิชา</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-semibold text-emerald-400">สอบเสร็จสิ้นแล้ว</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">
              {stats.completedExams} <span className="text-[11px] font-normal text-slate-400">/ {stats.total} วิชา</span>
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-semibold text-amber-400">ความคืบหน้าอ่านหนังสือ</span>
            <div className="text-lg font-black text-amber-400 mt-0.5">
              {stats.topicPercent}% <span className="text-[11px] font-normal text-slate-400">({stats.completedTopics}/{stats.totalTopics} หัวข้อ)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls, Search, Filters & Desktop View Switcher (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อวิชา, ห้องสอบ, อาคาร หรือเนื้อหา..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Type & Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'completed', 'กลางภาค', 'ปลายภาค', 'เก็บคะแนน'] as FilterType[]).map((filterVal) => {
            const isSelected = selectedFilter === filterVal;
            const labelMap: Record<FilterType, string> = {
              all: 'ทั้งหมด',
              pending: 'รอสอบ',
              completed: '✓ สอบเสร็จแล้ว',
              'กลางภาค': 'กลางภาค',
              'ปลายภาค': 'ปลายภาค',
              'เก็บคะแนน': 'เก็บคะแนน',
            };
            return (
              <button
                key={filterVal}
                onClick={() => setSelectedFilter(filterVal)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? filterVal === 'completed' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {labelMap[filterVal]}
              </button>
            );
          })}
        </div>

        {/* Desktop View Switcher (Split vs Table) */}
        <div className="hidden md:flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setDesktopViewMode('split')}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              desktopViewMode === 'split'
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="มุมมองแยกหน้าจอ (Split Overview + Detail)"
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDesktopViewMode('table')}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              desktopViewMode === 'table'
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="มุมมองตารางสรุป (Table Matrix)"
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Empty State When No Exams Match */}
      {filteredExams.length === 0 && (
        <div className="print:hidden p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">
            {exams.length === 0 ? 'ยังไม่มีข้อมูลตารางสอบ' : 'ไม่พบวิชาสอบตามเงื่อนไขที่ค้นหา'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {exams.length === 0
              ? 'คุณสามารถเริ่มต้นเพิ่มวิชาสอบ ระบุวัน เวลา ห้องสอบ และหัวข้อขอบเขตเนื้อหาได้เลย'
              : 'ลองปรับคำค้นหาหรือเปลี่ยนตัวกรองเพื่อดูรายการวิชาสอบทั้งหมด'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มวิชาสอบแรก</span>
          </button>
        </div>
      )}

      {/* 4. MOBILE VIEW: Vertical Card List (md:hidden) */}
      {filteredExams.length > 0 && (
        <div className="md:hidden space-y-3 print:hidden">
          {filteredExams.map((exam) => {
            const countdown = getExamCountdown(exam.date, exam.isCompleted);
            const badge = getExamTypeBadgeProps(exam.examType);
            const progress = getTopicsProgress(exam.topics);
            const isExpanded = Boolean(expandedCardIds[exam.id]);

            return (
              <div
                key={exam.id}
                onClick={() => setMobileDetailExamId(exam.id)}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer active:scale-[0.99] group ${
                  exam.isCompleted
                    ? 'border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-rose-500/50'
                }`}
              >
                {/* Top Row: Type Badge + Score Badge + Countdown Badge & View Indicator */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                    {exam.score && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>{exam.score}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${countdown.badgeClasses}`}>
                      {countdown.label}
                    </span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold hidden xs:inline-flex items-center gap-0.5">
                      ดูรายละเอียด <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Subject Name */}
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 group-hover:text-rose-600 transition-colors">
                    {exam.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{formatThaiExamDate(exam.date, 'full')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      เวลา {exam.startTime} - {exam.endTime} น.
                    </span>
                  </div>
                </div>

                {/* Venue Pills */}
                {(exam.building || exam.room || exam.seatNumber) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {exam.building && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {exam.building}
                      </span>
                    )}
                    {exam.room && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <MapPin className="w-3 h-3" />
                        {exam.room}
                      </span>
                    )}
                    {exam.seatNumber && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <UserCheck className="w-3 h-3" />
                        ที่นั่ง {exam.seatNumber}
                      </span>
                    )}
                  </div>
                )}

                {/* Reading Progress Bar */}
                {exam.topics && exam.topics.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-rose-500" />
                        ความคืบหน้าอ่านหนังสือ
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {progress.completed}/{progress.total} หัวข้อ ({progress.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          progress.percent === 100 ? 'bg-emerald-500' : 'bg-rose-600'
                        }`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Collapsible Topics Checklist (Optimized for thumb tap on mobile) */}
                {exam.topics && exam.topics.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCardExpansion(exam.id);
                      }}
                      className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
                    >
                      <span>ขอบเขตเนื้อหา ({exam.topics.length} หัวข้อ)</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 animate-fadeIn">
                        {exam.topics.map((t, idx) => (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTopicWithAutoSave(exam.id, t.id, !t.completed);
                            }}
                            className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer active:scale-[0.99] transition-transform"
                          >
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                              t.completed
                                ? 'bg-rose-600 border-rose-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-xs ${
                              t.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {idx + 1}. {t.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Score highlight */}
                {exam.score && (
                  <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>คะแนนที่สอบ:</span>
                    </div>
                    <span className="font-extrabold text-amber-700 dark:text-amber-300">
                      {exam.score}
                    </span>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => handleToggleExamCompleted(exam, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        exam.isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                      title={exam.isCompleted ? 'คลิกเพื่อยกเลิกสถานะเสร็จสิ้น' : 'ทำเครื่องหมายว่าสอบเสร็จสิ้นแล้ว'}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${exam.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-white'}`} />
                      <span>{exam.isCompleted ? '✓ สอบเสร็จแล้ว' : 'เสร็จสิ้นการสอบ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileDetailExamId(exam.id);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>รายละเอียด</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(exam, e)}
                      className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center cursor-pointer"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExamToDelete(exam);
                      }}
                      className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center cursor-pointer"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. TABLET & DESKTOP: SPLIT SCREEN VIEW (hidden md:grid) */}
      {filteredExams.length > 0 && desktopViewMode === 'split' && (
        <div className="hidden md:grid grid-cols-12 gap-5 print:hidden items-start">
          {/* Left Column: Exam List (7 cols) */}
          <div className="col-span-7 space-y-3">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
              <span>รายการวิชาสอบเรียงตามกำหนดสอบ ({filteredExams.length})</span>
              <span>คลิกวิชาเพื่อดูรายละเอียดขอบเขต</span>
            </div>

            {filteredExams.map((exam) => {
              const isSelected = selectedExam?.id === exam.id;
              const countdown = getExamCountdown(exam.date, exam.isCompleted);
              const badge = getExamTypeBadgeProps(exam.examType);
              const progress = getTopicsProgress(exam.topics);

              return (
                <div
                  key={exam.id}
                  onClick={() => setSelectedExamId(exam.id)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                      : exam.isCompleted
                        ? 'bg-white dark:bg-slate-900/90 border-emerald-300/70 dark:border-emerald-800/70 shadow-xs'
                        : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                        {exam.score && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Award className="w-3 h-3 text-amber-500" />
                            <span>{exam.score}</span>
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-500" />
                          {exam.startTime} - {exam.endTime} น.
                        </span>
                      </div>

                      <h4 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 truncate">
                        {exam.subject}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          {formatThaiExamDate(exam.date, 'short')}
                        </span>
                        {(exam.room || exam.building) && (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {exam.building ? `${exam.building} ` : ''}{exam.room || ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: Countdown & Action buttons */}
                    <div className="flex flex-col items-end space-y-2 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs ${countdown.badgeClasses}`}>
                        {countdown.label}
                      </span>

                      {exam.topics && exam.topics.length > 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          อ่านแล้ว {progress.completed}/{progress.total}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  {exam.topics && exam.topics.length > 0 && (
                    <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progress.percent === 100 ? 'bg-emerald-500' : 'bg-rose-600'
                        }`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Detail Panel (5 cols) */}
          <div className="col-span-5 sticky top-20 space-y-4">
            {selectedExam ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xl space-y-4">
                {/* Header with Countdown & Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getExamTypeBadgeProps(selectedExam.examType).bg} ${getExamTypeBadgeProps(selectedExam.examType).text} ${getExamTypeBadgeProps(selectedExam.examType).border}`}>
                        {selectedExam.examType}
                      </span>
                      {selectedExam.score && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{selectedExam.score}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleExamCompleted(selectedExam)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          selectedExam.isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                        title={selectedExam.isCompleted ? 'คลิกเพื่อยกเลิกสถานะเสร็จสิ้น' : 'ทำเครื่องหมายว่าสอบเสร็จสิ้นแล้ว'}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${selectedExam.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-white'}`} />
                        <span>{selectedExam.isCompleted ? '✓ สอบเสร็จแล้ว' : 'เสร็จสิ้นการสอบ'}</span>
                      </button>
                      <span className={`px-2.5 py-1 rounded-xl text-xs ${getExamCountdown(selectedExam.date, selectedExam.isCompleted).badgeClasses}`}>
                        {getExamCountdown(selectedExam.date, selectedExam.isCompleted).label}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100">
                    {selectedExam.subject}
                  </h3>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                      <CalendarIcon className="w-4 h-4 text-rose-500" />
                      <span>{formatThaiExamDate(selectedExam.date, 'full')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                      <Clock className="w-4 h-4 text-rose-500" />
                      <span>เวลา {selectedExam.startTime} - {selectedExam.endTime} น.</span>
                    </div>
                  </div>
                </div>

                {/* Venue Details Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">อาคาร</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {selectedExam.building || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">ห้องสอบ</span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 truncate block">
                      {selectedExam.room || '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">เลขที่นั่ง</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate block">
                      {selectedExam.seatNumber || '-'}
                    </span>
                  </div>
                </div>

                {/* Topics & Reading Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-rose-500" />
                      <span>ขอบเขตเนื้อหาที่สอบ</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      อ่านแล้ว {getTopicsProgress(selectedExam.topics).completed}/{getTopicsProgress(selectedExam.topics).total}
                    </span>
                  </div>

                  {/* Checklist items */}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {selectedExam.topics && selectedExam.topics.length > 0 ? (
                      selectedExam.topics.map((t, idx) => (
                        <div
                          key={t.id}
                          className="group flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-rose-300 transition-colors"
                        >
                          <div
                            onClick={() => handleToggleTopicWithAutoSave(selectedExam.id, t.id, !t.completed)}
                            className="flex items-center space-x-2 flex-1 cursor-pointer min-w-0"
                          >
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                              t.completed
                                ? 'bg-rose-600 border-rose-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-xs truncate ${
                              t.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {idx + 1}. {t.title}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTopicFromSelected(t.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-opacity cursor-pointer shrink-0"
                            title="ลบหัวข้อนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2 text-center">
                        ยังไม่มีหัวข้อเนื้อหา
                      </p>
                    )}
                  </div>

                  {/* Quick Add Topic Input */}
                  <form onSubmit={handleQuickAddTopicToSelected} className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      value={quickTopicText}
                      onChange={(e) => setQuickTopicText(e.target.value)}
                      placeholder="+ เพิ่มหัวข้อย่อย..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                    <button
                      type="submit"
                      disabled={!quickTopicText.trim()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      เพิ่ม
                    </button>
                  </form>
                </div>

                {/* คะแนนที่สอบ Card (แทนหมายเหตุเดิม) */}
                {selectedExam.score && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">คะแนนที่สอบ</span>
                        <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">เกณฑ์คะแนนสอบวิชานี้</span>
                      </div>
                    </div>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">
                      {selectedExam.score}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleExamCompleted(selectedExam)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        selectedExam.isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                      title={selectedExam.isCompleted ? 'คลิกเพื่อยกเลิกสถานะเสร็จสิ้น' : 'ทำเครื่องหมายว่าสอบเสร็จสิ้นแล้ว'}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${selectedExam.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-white'}`} />
                      <span>{selectedExam.isCompleted ? '✓ สอบเสร็จแล้ว' : 'เสร็จสิ้นการสอบ'}</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(selectedExam)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไขวิชานี้</span>
                    </button>
                    <button
                      onClick={() => setExamToDelete(selectedExam)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </div>

                  {onNavigateToCalendar && (
                    <button
                      onClick={() => onNavigateToCalendar(selectedExam.date)}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>ดูในปฏิทิน</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                เลือกวิชาสอบทางด้านซ้ายเพื่อดูรายละเอียด
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TABLET & DESKTOP: FULL TABLE MATRIX VIEW (hidden md:block when desktopViewMode === 'table') */}
      {filteredExams.length > 0 && desktopViewMode === 'table' && (
        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="py-3.5 px-4">วันที่สอบ</th>
                  <th className="py-3.5 px-4">เวลา</th>
                  <th className="py-3.5 px-4">วิชาสอบ</th>
                  <th className="py-3.5 px-4">ประเภท</th>
                  <th className="py-3.5 px-4">อาคาร / ห้อง / ที่นั่ง</th>
                  <th className="py-3.5 px-4">สถานะนับถอยหลัง</th>
                  <th className="py-3.5 px-4">ความคืบหน้าอ่าน</th>
                  <th className="py-3.5 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExams.map((exam) => {
                  const countdown = getExamCountdown(exam.date, exam.isCompleted);
                  const badge = getExamTypeBadgeProps(exam.examType);
                  const progress = getTopicsProgress(exam.topics);

                  return (
                    <tr 
                      key={exam.id} 
                      className={`transition-colors cursor-pointer ${
                        exam.isCompleted
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/50'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                      onClick={() => {
                        setSelectedExamId(exam.id);
                        setDesktopViewMode('split');
                      }}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {formatThaiExamDate(exam.date, 'short')}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {exam.startTime} - {exam.endTime}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-heading text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span>{exam.subject}</span>
                          {exam.score && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
                              <Award className="w-2.5 h-2.5 text-amber-500" />
                              <span>{exam.score}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {exam.building ? `${exam.building} ` : ''}
                        <strong className="text-rose-600 dark:text-rose-400">{exam.room || '-'}</strong>
                        {exam.seatNumber ? ` (ที่นั่ง ${exam.seatNumber})` : ''}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${countdown.badgeClasses}`}>
                          {countdown.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${progress.percent === 100 ? 'bg-emerald-500' : 'bg-rose-600'}`}
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500">{progress.percent}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleToggleExamCompleted(exam, e)}
                            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                              exam.isCompleted
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                            title={exam.isCompleted ? 'ยกเลิกสถานะเสร็จสิ้น' : 'ทำเครื่องหมายว่าสอบเสร็จสิ้นแล้ว'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(exam)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExamToDelete(exam)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. PRINT SHEET ONLY VIEW (Visible only during window.print()) */}
      <div className="hidden print:block text-black bg-white font-sans">
        <div className="border-b-2 border-black pb-3 mb-4 text-center">
          <h2 className="text-xl font-black">ตารางสอบประจำภาคเรียน</h2>
          <p className="text-sm">ระบบจัดการการบ้าน & ตารางสอบนักเรียน (การบ้านทาซาน)</p>
          <div className="text-xs mt-1 text-slate-700 flex justify-between">
            <span>ผู้ใช้งาน: {userProfile?.displayName || 'นักเรียน'} ({userProfile?.email || '-'})</span>
            <span>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</span>
          </div>
        </div>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-slate-200 border-b border-black">
              <th className="border border-black p-2 text-center">ลำดับ</th>
              <th className="border border-black p-2 text-left">วันที่สอบ</th>
              <th className="border border-black p-2 text-left">เวลาสอบ</th>
              <th className="border border-black p-2 text-left">ชื่อวิชา</th>
              <th className="border border-black p-2 text-center">ประเภท</th>
              <th className="border border-black p-2 text-left">สถานที่สอบ / ที่นั่ง</th>
              <th className="border border-black p-2 text-left">ขอบเขตเนื้อหาที่สอบ</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam, idx) => (
              <tr key={exam.id} className="border-b border-black">
                <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                <td className="border border-black p-2 font-semibold">{formatThaiExamDate(exam.date, 'short')}</td>
                <td className="border border-black p-2">{exam.startTime} - {exam.endTime} น.</td>
                <td className="border border-black p-2 font-bold">
                  {exam.subject}
                  {exam.score && (
                    <div className="text-[11px] font-normal text-amber-800">
                      คะแนน: {exam.score}
                    </div>
                  )}
                </td>
                <td className="border border-black p-2 text-center">{exam.examType}</td>
                <td className="border border-black p-2">
                  {exam.building ? `${exam.building} ` : ''}
                  {exam.room ? `ห้อง ${exam.room} ` : ''}
                  {exam.seatNumber ? `[ที่นั่ง ${exam.seatNumber}]` : ''}
                </td>
                <td className="border border-black p-2">
                  {exam.topics && exam.topics.length > 0 ? (
                    <ul className="list-disc list-inside space-y-0.5">
                      {exam.topics.map((t) => (
                        <li key={t.id} className={t.completed ? 'line-through text-slate-500' : ''}>
                          {t.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-xs text-slate-600 text-right">
          * ตรวจสอบความถูกต้องของตารางสอบและเตรียมอุปกรณ์การสอบให้พร้อมก่อนเริ่มสอบ 15 นาที
        </div>
      </div>

      {/* 7.5 Mobile Exam Detail Modal / Bottom Sheet */}
      {mobileDetailExam && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn print:hidden"
          onClick={() => setMobileDetailExamId(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] animate-scaleUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle for touch dragging on mobile */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      getExamTypeBadgeProps(mobileDetailExam.examType).bg
                    } ${getExamTypeBadgeProps(mobileDetailExam.examType).text} ${
                      getExamTypeBadgeProps(mobileDetailExam.examType).border
                    }`}
                  >
                    {getExamTypeBadgeProps(mobileDetailExam.examType).label}
                  </span>
                  {mobileDetailExam.score && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>{mobileDetailExam.score}</span>
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] ${
                      getExamCountdown(mobileDetailExam.date, mobileDetailExam.isCompleted).badgeClasses
                    }`}
                  >
                    {getExamCountdown(mobileDetailExam.date, mobileDetailExam.isCompleted).label}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-slate-100 break-words">
                  {mobileDetailExam.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileDetailExamId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                aria-label="ปิดหน้ารายละเอียด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Date & Time block */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                  <CalendarIcon className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formatThaiExamDate(mobileDetailExam.date, 'full')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                  <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>เวลา {mobileDetailExam.startTime} - {mobileDetailExam.endTime} น.</span>
                </div>
              </div>

              {/* Venue details grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-0.5">อาคาร</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {mobileDetailExam.building || '-'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-0.5">ห้องสอบ</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 truncate block">
                    {mobileDetailExam.room || '-'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-0.5">เลขที่นั่ง</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate block">
                    {mobileDetailExam.seatNumber || '-'}
                  </span>
                </div>
              </div>

              {/* Reading Progress */}
              {mobileDetailExam.topics && mobileDetailExam.topics.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-rose-500" />
                      ความคืบหน้าอ่านหนังสือ
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">
                      {getTopicsProgress(mobileDetailExam.topics).completed}/
                      {getTopicsProgress(mobileDetailExam.topics).total} หัวข้อ (
                      {getTopicsProgress(mobileDetailExam.topics).percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        getTopicsProgress(mobileDetailExam.topics).percent === 100
                          ? 'bg-emerald-500'
                          : 'bg-rose-600'
                      }`}
                      style={{ width: `${getTopicsProgress(mobileDetailExam.topics).percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Topics & Reading Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-rose-500" />
                    <span>ขอบเขตเนื้อหาที่สอบ ({mobileDetailExam.topics?.length || 0} หัวข้อ)</span>
                  </span>
                  {autoSaveStatus !== 'idle' && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      {autoSaveStatus === 'saving' ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-rose-500" />
                          <span>กำลังบันทึก...</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="w-3 h-3 text-emerald-500" />
                          <span>บันทึกแล้ว {lastAutoSaveTime}</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Topics list */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                  {mobileDetailExam.topics && mobileDetailExam.topics.length > 0 ? (
                    mobileDetailExam.topics.map((t, idx) => (
                      <div
                        key={t.id}
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 hover:border-rose-300 transition-colors"
                      >
                        <div
                          onClick={() =>
                            handleToggleTopicWithAutoSave(mobileDetailExam.id, t.id, !t.completed)
                          }
                          className="flex items-center space-x-2.5 flex-1 cursor-pointer min-w-0"
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                              t.completed
                                ? 'bg-rose-600 border-rose-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span
                            className={`text-xs break-words ${
                              t.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {idx + 1}. {t.title}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(mobileDetailExam, t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
                          title="ลบหัวข้อนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      ยังไม่มีหัวข้อเนื้อหา สามารถพิมพ์เพิ่มได้ที่ช่องด้านล่าง
                    </p>
                  )}
                </div>

                {/* Quick Add Topic form inside Mobile Detail */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!mobileQuickTopicText.trim()) return;
                    handleQuickAddTopic(mobileDetailExam, mobileQuickTopicText);
                    setMobileQuickTopicText('');
                  }}
                  className="flex gap-1.5 pt-1"
                >
                  <input
                    type="text"
                    value={mobileQuickTopicText}
                    onChange={(e) => setMobileQuickTopicText(e.target.value)}
                    placeholder="+ เพิ่มหัวข้อย่อยเนื้อหา..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={!mobileQuickTopicText.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    เพิ่ม
                  </button>
                </form>
              </div>

              {/* Score / Note */}
              {mobileDetailExam.score && (
                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-bold text-amber-900 dark:text-amber-200">คะแนนที่สอบ</span>
                  </div>
                  <span className="font-extrabold text-amber-700 dark:text-amber-300">
                    {mobileDetailExam.score}
                  </span>
                </div>
              )}

              {/* Calendar shortcut */}
              {onNavigateToCalendar && (
                <button
                  type="button"
                  onClick={() => {
                    const d = mobileDetailExam.date;
                    setMobileDetailExamId(null);
                    onNavigateToCalendar(d);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>ดูวิชานี้ในหน้าปฏิทิน</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => handleToggleExamCompleted(mobileDetailExam)}
                className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                  mobileDetailExam.isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title={mobileDetailExam.isCompleted ? 'คลิกเพื่อยกเลิกสถานะเสร็จสิ้น' : 'ทำเครื่องหมายว่าสอบเสร็จสิ้นแล้ว'}
              >
                <CheckCircle2 className={`w-4 h-4 ${mobileDetailExam.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-white'}`} />
                <span>{mobileDetailExam.isCompleted ? '✓ สอบเสร็จแล้ว' : 'เสร็จสิ้นการสอบ'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const examToEdit = mobileDetailExam;
                  setMobileDetailExamId(null);
                  handleOpenEditModal(examToEdit);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>แก้ไขข้อมูล</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const examDel = mobileDetailExam;
                  setMobileDetailExamId(null);
                  setExamToDelete(examDel);
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบ</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileDetailExamId(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Add / Edit Modal */}
      {isModalOpen && (
        <ExamModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExam(null);
          }}
          onSave={onSaveExam}
          editingExam={editingExam}
        />
      )}

      {/* 9. Delete Confirmation Dialog */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100">
                ยืนยันการลบวิชาสอบ?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                คุณกำลังจะลบรายการวิชาสอบ <strong className="text-slate-800 dark:text-slate-200">"{examToDelete.subject}"</strong> ออกจากระบบ การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Clear All Exams Confirmation Dialog */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100">
                ยืนยันลบข้อมูลตารางสอบทั้งหมด?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                คุณกำลังจะลบรายการวิชาสอบทั้งหมด <strong className="text-rose-600 dark:text-rose-400 font-bold">({exams.length} วิชา)</strong> ออกจากระบบคลาวด์อย่างถาวร การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>ข้อมูลตารางสอบและเช็กลิสต์ทั้งหมดจะถูกเคลียร์เป็นตารางว่างเปล่า</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                disabled={isClearingAll}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmClearAll}
                disabled={isClearingAll}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isClearingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังลบข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ยืนยันลบทั้งหมด</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
