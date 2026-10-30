import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Check, 
  Sparkles, 
  AlertCircle,
  FileText,
  Tag,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { Homework, ExamSchedule, TodoItem, TodoItemType, Priority } from '../types';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTodo?: (todo: TodoItem) => Promise<void> | void;
  onSave?: (todo: TodoItem) => Promise<void> | void;
  homeworks: Homework[];
  exams: ExamSchedule[];
  initialDate?: string;
  initialType?: TodoItemType;
  preselectedHomework?: Homework | null;
  preselectedExam?: ExamSchedule | null;
  editingTodo?: TodoItem | null;
  prefill?: {
    type?: TodoItemType;
    relatedHomeworkId?: string;
    relatedExamId?: string;
    title?: string;
    date?: string;
    time?: string;
  } | null;
}

export const AddTodoModal: React.FC<AddTodoModalProps> = ({
  isOpen,
  onClose,
  onSaveTodo,
  onSave,
  homeworks,
  exams,
  initialDate,
  initialType = 'homework',
  preselectedHomework,
  preselectedExam,
  editingTodo,
  prefill,
}) => {
  // Active Tab: 'homework' | 'exam' | 'custom'
  const [activeTab, setActiveTab] = useState<TodoItemType>(initialType);

  // Homework Selection State
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string>('');
  const [homeworkSearch, setHomeworkSearch] = useState<string>('');

  // Exam Selection State
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [examSearch, setExamSearch] = useState<string>('');
  const [selectedTopicTitles, setSelectedTopicTitles] = useState<string[]>([]);

  // Common Date & Time State
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('ปกติ');
  const [notes, setNotes] = useState<string>('');

  // Custom Event State
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('กิจกรรมทั่วไป');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Reset and initialize when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setIsSubmitting(false);

      const todayStr = new Date().toISOString().split('T')[0];

      if (editingTodo) {
        setActiveTab(editingTodo.type);
        setDate(editingTodo.date || todayStr);
        setTime(editingTodo.time || '');
        setEndTime(editingTodo.endTime || '');
        setPriority(editingTodo.priority || 'ปกติ');
        setNotes(editingTodo.description || '');

        if (editingTodo.type === 'homework') {
          setSelectedHomeworkId(editingTodo.referenceId || '');
        } else if (editingTodo.type === 'exam') {
          setSelectedExamId(editingTodo.referenceId || '');
        } else {
          setCustomTitle(editingTodo.title || '');
          setCustomCategory(editingTodo.subject || 'กิจกรรมทั่วไป');
        }
      } else {
        // Defaults for new item
        const targetDate = initialDate || todayStr;
        setDate(targetDate);
        setTime('16:30');
        setEndTime('');
        setPriority('ปกติ');
        setNotes('');
        setCustomTitle('');
        setCustomCategory('กิจกรรมทั่วไป');
        setSelectedTopicTitles([]);

        if (prefill) {
          if (prefill.type) setActiveTab(prefill.type);
          if (prefill.date) setDate(prefill.date);
          if (prefill.time) setTime(prefill.time);
          if (prefill.title) setCustomTitle(prefill.title);
          if (prefill.relatedHomeworkId) {
            setActiveTab('homework');
            setSelectedHomeworkId(prefill.relatedHomeworkId);
          }
          if (prefill.relatedExamId) {
            setActiveTab('exam');
            setSelectedExamId(prefill.relatedExamId);
          }
        } else if (preselectedHomework) {
          setActiveTab('homework');
          setSelectedHomeworkId(preselectedHomework.id);
        } else if (preselectedExam) {
          setActiveTab('exam');
          setSelectedExamId(preselectedExam.id);
        } else {
          setActiveTab(initialType);
          // Auto select first available incomplete homework if on homework tab
          const uncompletedHw = homeworks.filter(h => !h.completed && (h.progress === undefined || h.progress < 100));
          if (uncompletedHw.length > 0) {
            setSelectedHomeworkId(uncompletedHw[0].id);
          } else {
            setSelectedHomeworkId('');
          }
          const uncompletedEx = exams.filter(e => !e.isCompleted && (e.topics.length === 0 || e.topics.some(t => !t.completed)));
          if (uncompletedEx.length > 0) {
            setSelectedExamId(uncompletedEx[0].id);
          } else {
            setSelectedExamId('');
          }
        }
      }
    }
  }, [isOpen, initialDate, initialType, preselectedHomework, preselectedExam, editingTodo, prefill, homeworks, exams]);

  // User request: Show ONLY incomplete/unread homework and exams in Add To Do modal
  const incompleteHomeworks = useMemo(() => {
    return homeworks.filter(h => {
      if (editingTodo && editingTodo.referenceId === h.id) return true;
      return !h.completed && (h.progress === undefined || h.progress < 100);
    });
  }, [homeworks, editingTodo]);

  const incompleteExams = useMemo(() => {
    return exams.filter(e => {
      if (editingTodo && editingTodo.referenceId === e.id) return true;
      const isExamDone = Boolean(e.isCompleted || (e.topics && e.topics.length > 0 && e.topics.every(t => t.completed)));
      return !isExamDone;
    });
  }, [exams, editingTodo]);

  // Filtered Homeworks (Only incomplete homework)
  const filteredHomeworks = useMemo(() => {
    return incompleteHomeworks.filter(h => {
      const q = homeworkSearch.trim().toLowerCase();
      if (!q) return true;
      return (h.subject && h.subject.toLowerCase().includes(q)) || 
             (h.title && h.title.toLowerCase().includes(q)) ||
             (h.type && h.type.toLowerCase().includes(q));
    });
  }, [incompleteHomeworks, homeworkSearch]);

  // Filtered Exams (Only incomplete/unread exams)
  const filteredExams = useMemo(() => {
    return incompleteExams.filter(e => {
      const q = examSearch.trim().toLowerCase();
      if (!q) return true;
      return (e.subject && e.subject.toLowerCase().includes(q)) ||
             (e.examType && e.examType.toLowerCase().includes(q)) ||
             (e.room && e.room.toLowerCase().includes(q));
    });
  }, [incompleteExams, examSearch]);

  if (!isOpen) return null;

  // Selected entities
  const currentSelectedHomework = homeworks.find(h => h.id === selectedHomeworkId);
  const currentSelectedExam = exams.find(e => e.id === selectedExamId);

  // Quick Date Helpers
  const setQuickDate = (type: 'today' | 'tomorrow' | 'day_before_due' | 'weekend') => {
    const today = new Date();
    if (type === 'today') {
      setDate(today.toISOString().split('T')[0]);
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
    } else if (type === 'day_before_due') {
      if (activeTab === 'homework' && currentSelectedHomework?.dueDate && currentSelectedHomework.dueDate !== 'ไม่มีกำหนดส่ง') {
        const dueDateObj = new Date(currentSelectedHomework.dueDate);
        dueDateObj.setDate(dueDateObj.getDate() - 1);
        setDate(dueDateObj.toISOString().split('T')[0]);
      } else if (activeTab === 'exam' && currentSelectedExam?.date) {
        const examDateObj = new Date(currentSelectedExam.date);
        examDateObj.setDate(examDateObj.getDate() - 1);
        setDate(examDateObj.toISOString().split('T')[0]);
      }
    } else if (type === 'weekend') {
      const d = new Date(today);
      const day = d.getDay();
      const diffToSaturday = (6 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diffToSaturday);
      setDate(d.toISOString().split('T')[0]);
    }
  };

  // Quick Time Presets
  const quickTimePresets = [
    { label: 'เช้า 09:00', val: '09:00', endVal: '11:30' },
    { label: 'บ่าย 13:30', val: '13:30', endVal: '15:30' },
    { label: 'หลังเลิกเรียน 16:30', val: '16:30', endVal: '18:00' },
    { label: 'ค่ำ 19:30', val: '19:30', endVal: '21:00' },
    { label: 'ดึก 21:00', val: '21:00', endVal: '22:30' },
  ];

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!date) {
      setErrorMsg('กรุณาระบุวันที่ต้องทำ');
      return;
    }

    let finalTitle = '';
    let finalSubject = '';
    let finalDescription = notes.trim();
    let homeworkInfo = undefined;
    let examInfo = undefined;
    let referenceId = undefined;

    if (activeTab === 'homework') {
      if (!currentSelectedHomework) {
        setErrorMsg('กรุณาเลือกการ์ดการบ้านที่ต้องการกำหนดเวลาทำ');
        return;
      }
      referenceId = currentSelectedHomework.id;
      finalSubject = currentSelectedHomework.subject;
      finalTitle = `ทำการบ้าน: ${currentSelectedHomework.subject}${currentSelectedHomework.title ? ` - ${currentSelectedHomework.title}` : ''}`;
      
      homeworkInfo = {
        homeworkId: currentSelectedHomework.id,
        subject: currentSelectedHomework.subject,
        title: currentSelectedHomework.title,
        dueDate: currentSelectedHomework.dueDate,
        dueTime: currentSelectedHomework.dueTime,
        progress: currentSelectedHomework.progress,
        completed: currentSelectedHomework.completed,
        workType: currentSelectedHomework.workType,
      };

      if (!finalDescription && currentSelectedHomework.description) {
        finalDescription = currentSelectedHomework.description.slice(0, 150);
      }
    } else if (activeTab === 'exam') {
      if (!currentSelectedExam) {
        setErrorMsg('กรุณาเลือกการ์ดวิชาสอบที่ต้องการวางแผนอ่านทบทวน');
        return;
      }
      referenceId = currentSelectedExam.id;
      finalSubject = currentSelectedExam.subject;
      finalTitle = `อ่านทบทวนสอบ: ${currentSelectedExam.subject} (${currentSelectedExam.examType})`;

      examInfo = {
        examId: currentSelectedExam.id,
        subject: currentSelectedExam.subject,
        examType: currentSelectedExam.examType,
        date: currentSelectedExam.date,
        startTime: currentSelectedExam.startTime,
        endTime: currentSelectedExam.endTime,
        room: currentSelectedExam.room,
        building: currentSelectedExam.building,
        topicsCount: currentSelectedExam.topics?.length || 0,
        isCompleted: currentSelectedExam.isCompleted,
      };

      if (selectedTopicTitles.length > 0) {
        const topicsStr = `เน้นหัวข้อ: ${selectedTopicTitles.join(', ')}`;
        finalDescription = finalDescription ? `${finalDescription}\n${topicsStr}` : topicsStr;
      }
    } else {
      // Custom task / event
      if (!customTitle.trim()) {
        setErrorMsg('กรุณากรอกชื่อสิ่งที่ต้องทำ');
        return;
      }
      finalTitle = customTitle.trim();
      finalSubject = customCategory.trim();
    }

    const todoPayload: TodoItem = {
      id: editingTodo?.id || ('todo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
      title: finalTitle,
      date,
      time: time.trim() || undefined,
      endTime: endTime.trim() || undefined,
      type: activeTab,
      referenceId,
      subject: finalSubject || undefined,
      description: finalDescription || undefined,
      priority,
      completed: editingTodo ? editingTodo.completed : false,
      completedAt: editingTodo ? editingTodo.completedAt : undefined,
      createdAt: editingTodo ? editingTodo.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      homeworkInfo,
      examInfo,
    };

    try {
      setIsSubmitting(true);
      const saveHandler = onSaveTodo || onSave;
      if (typeof saveHandler === 'function') {
        await saveHandler(todoPayload);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving todo item:', err);
      setErrorMsg(err.message || 'ไม่สามารถบันทึกสิ่งที่ต้องทำได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-50/50 to-indigo-50/30 dark:from-slate-800/80 dark:to-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>{editingTodo ? 'แก้ไขสิ่งที่ต้องทำ' : 'เพิ่มสิ่งที่ต้องทำ (To Do List)'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เลือกการบ้าน วิชาสอบ หรือกิจกรรมอื่นเพื่อจัดตารางเวลาลงในแต่ละวัน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Choice Tabs (การบ้าน / วิชาสอบ / อื่นๆ ที่กรอกเอง) */}
        {!editingTodo && (
          <div className="px-4 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
            <div className="grid grid-cols-3 gap-2">
              {/* Tab 1: การบ้าน */}
              <button
                type="button"
                onClick={() => setActiveTab('homework')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'homework'
                    ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/30 ring-2 ring-sky-300 dark:ring-sky-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="truncate">1. เลือกการบ้าน ({incompleteHomeworks.length})</span>
              </button>

              {/* Tab 2: วิชาสอบ */}
              <button
                type="button"
                onClick={() => setActiveTab('exam')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'exam'
                    ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30 ring-2 ring-rose-300 dark:ring-rose-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0 text-inherit" />
                <span className="truncate">2. เลือกวิชาสอบ ({incompleteExams.length})</span>
              </button>

              {/* Tab 3: Event อื่นๆ กรอกเอง */}
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30 ring-2 ring-emerald-300 dark:ring-emerald-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">3. กิจกรรมอื่น (กรอกเอง)</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: SELECTION BASED ON ACTIVE TAB */}

          {/* TAB 1: เลือกการบ้าน (Card Picker) */}
          {activeTab === 'homework' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>กดเลือกการ์ดการบ้านที่ต้องการทำ:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {currentSelectedHomework ? `เลือกแล้ว: ${currentSelectedHomework.subject}` : 'ยังไม่ได้เลือก'}
                </span>
              </div>

              {/* Homework Search Bar */}
              {homeworks.length > 4 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={homeworkSearch}
                    onChange={(e) => setHomeworkSearch(e.target.value)}
                    placeholder="พิมพ์ค้นหาวิชาหรือหัวข้องาน..."
                    className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              )}

              {/* Homework Cards Grid */}
              {filteredHomeworks.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  {incompleteHomeworks.length === 0 ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        ไม่มีการบ้านที่ค้างอยู่ 🎉
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        การบ้านทั้งหมดทำเสร็จครบ 100% แล้ว (สามารถเลือกแท็บ "กิจกรรมอื่น" เพื่อเพิ่มรายการเองได้)
                      </p>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ไม่พบการบ้านที่ค้นหา
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {filteredHomeworks.map((hw) => {
                    const isSelected = selectedHomeworkId === hw.id;
                    return (
                      <div
                        key={hw.id}
                        onClick={() => setSelectedHomeworkId(hw.id)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all relative ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 dark:border-sky-500 shadow-xs ring-2 ring-sky-300 dark:ring-sky-700'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                                {hw.subject}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                                hw.workType === 'กลุ่ม'
                                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}>
                                {hw.workType}
                              </span>
                              {hw.completed && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  เสร็จแล้ว
                                </span>
                              )}
                            </div>
                            {hw.title && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                                {hw.title}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3 text-sky-600" />
                                ส่ง: {hw.dueDate}
                              </span>
                              <span>•</span>
                              <span>คืบหน้า: {hw.progress}%</span>
                            </div>
                          </div>

                          {/* Selection Check Indicator */}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'border border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: เลือกวิชาสอบ (Card Picker) */}
          {activeTab === 'exam' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                  <GraduationCap className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>กดเลือกการ์ดวิชาสอบที่ต้องการวางแผนอ่าน:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {currentSelectedExam ? `เลือกแล้ว: ${currentSelectedExam.subject}` : 'ยังไม่ได้เลือก'}
                </span>
              </div>

              {/* Exam Search Bar */}
              {exams.length > 4 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="พิมพ์ค้นหาวิชาสอบ..."
                    className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              {/* Exam Cards Grid */}
              {filteredExams.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  {incompleteExams.length === 0 ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        ไม่มีวิชาสอบที่ค้างอ่าน 🎉
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        อ่านครบและเสร็จสิ้นทุกวิชาแล้ว (สามารถเลือกแท็บ "กิจกรรมอื่น" เพื่อเพิ่มรายการเองได้)
                      </p>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ไม่พบวิชาสอบที่ค้นหา
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {filteredExams.map((ex) => {
                    const isSelected = selectedExamId === ex.id;
                    return (
                      <div
                        key={ex.id}
                        onClick={() => setSelectedExamId(ex.id)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all relative ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 dark:border-rose-500 shadow-xs ring-2 ring-rose-300 dark:ring-rose-700'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                                {ex.subject}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                {ex.examType}
                              </span>
                              {ex.isCompleted && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  สอบเสร็จแล้ว
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-rose-500" />
                                สอบวันที่ {ex.date}
                              </span>
                              {ex.startTime && (
                                <span>เวลา {ex.startTime}</span>
                              )}
                            </div>
                            {(ex.room || ex.building) && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                                ห้อง {ex.room || '-'} {ex.building ? `(${ex.building})` : ''}
                              </p>
                            )}
                          </div>

                          {/* Selection Check Indicator */}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'border border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Optional: Checkbox for topics of selected exam */}
              {currentSelectedExam && currentSelectedExam.topics && currentSelectedExam.topics.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>เลือกหัวข้อขอบเขตที่ต้องการเน้นอ่านในรอบนี้ (ไม่บังคับ):</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar">
                    {currentSelectedExam.topics.map((tp) => {
                      const isChecked = selectedTopicTitles.includes(tp.title);
                      return (
                        <button
                          key={tp.id}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setSelectedTopicTitles(selectedTopicTitles.filter(t => t !== tp.title));
                            } else {
                              setSelectedTopicTitles([...selectedTopicTitles, tp.title]);
                            }
                          }}
                          className={`px-2 py-1 rounded-xl text-[10px] font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                            isChecked
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {isChecked ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
                          <span>{tp.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Event อื่นๆ กรอกเอง (Custom Event) */}
          {activeTab === 'custom' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  ชื่อสิ่งที่ต้องทำ / กิจกรรม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="เช่น ซื้อสมุดรายงาน, ติวกลุ่มกับเพื่อน, ท่องศัพท์อังกฤษ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  หมวดหมู่ / ประเภท
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['กิจกรรมทั่วไป', 'อ่านหนังสือ', 'ติวหนังสือ', 'นัดหมายกลุ่ม', 'ซื้ออุปกรณ์', 'กิจกรรมโรงเรียน', 'เรื่องส่วนตัว'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCustomCategory(cat)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                        customCategory === cat
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="หรือพิมพ์ชื่อหมวดหมู่เอง..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* SECTION 2: SCHEDULE (DATE & TIME) - Core Requirement */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>กำหนดว่าต้องทำวันไหน & เวลาไหน:</span>
                <span className="text-rose-500">*</span>
              </label>

              {/* Quick Date Chips */}
              <div className="flex items-center space-x-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('tomorrow')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  พรุ่งนี้
                </button>
                {(activeTab === 'homework' || activeTab === 'exam') && (
                  <button
                    type="button"
                    onClick={() => setQuickDate('day_before_due')}
                    className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg cursor-pointer"
                  >
                    ก่อนวัน{activeTab === 'exam' ? 'สอบ' : 'ส่ง'} 1 วัน
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date Input */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  วันที่ (วัน/เดือน/ปี) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              {/* Start Time Input */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  เวลาเริ่มทำ
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-8.5 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* End Time Input */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  เวลาสิ้นสุด (ไม่บังคับ)
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-8.5 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Time Presets Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              <span className="text-slate-400 text-[10px] shrink-0">เวลาแนะนำ:</span>
              {quickTimePresets.map((qt) => (
                <button
                  key={qt.val}
                  type="button"
                  onClick={() => {
                    setTime(qt.val);
                    setEndTime(qt.endVal);
                  }}
                  className={`px-2 py-1 rounded-xl shrink-0 cursor-pointer transition-all ${
                    time === qt.val
                      ? 'bg-sky-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: PRIORITY & NOTES */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Priority */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>ระดับความสำคัญ:</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['ปกติ', 'สำคัญ', 'ด่วนที่สุด'] as Priority[]).map((p) => {
                    const isSelected = priority === p;
                    let colorClasses = '';
                    if (p === 'ปกติ') colorClasses = isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
                    if (p === 'สำคัญ') colorClasses = isSelected ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300';
                    if (p === 'ด่วนที่สุด') colorClasses = isSelected ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300';

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${colorClasses}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  โน้ต / เป้าหมายในรอบนี้ (ไม่บังคับ):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เช่น ทำข้อ 1-10, สรุปบทที่ 2..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/25 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 btn-interactive"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'กำลังบันทึก...' : (editingTodo ? 'บันทึกการแก้ไข' : 'บันทึกลงสิ่งที่ต้องทำ')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
