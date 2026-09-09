import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Building, 
  UserCheck, 
  FileText,
  AlertCircle,
  Cloud,
  RotateCcw,
  Award
} from 'lucide-react';
import { ExamSchedule, ExamTopic, ExamType } from '../types';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: ExamSchedule) => Promise<void>;
  editingExam?: ExamSchedule | null;
}

const DRAFT_STORAGE_KEY = 'homework_exam_draft_v1';

const EXAM_TYPE_OPTIONS: { value: ExamType; label: string; desc: string }[] = [
  { value: 'กลางภาค', label: 'สอบกลางภาค (Midterm)', desc: 'การสอบวัดผลกลางภาคเรียน' },
  { value: 'ปลายภาค', label: 'สอบปลายภาค (Final)', desc: 'การสอบวัดผลประมวลความรู้ปลายภาค' },
  { value: 'เก็บคะแนน', label: 'สอบเก็บคะแนน / ทดสอบย่อย', desc: 'การสอบเก็บคะแนนระหว่างเรียน' },
  { value: 'อื่นๆ', label: 'การสอบอื่นๆ', desc: 'การสอบวัดระดับ, โอลิมปิกวิชาการ ฯลฯ' },
];

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExam,
}) => {
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState<ExamType>('กลางภาค');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('10:30');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [score, setScore] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Topics list state - starts completely empty
  const [topics, setTopics] = useState<ExamTopic[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  // Initialize form or restore draft
  useEffect(() => {
    if (editingExam) {
      setSubject(editingExam.subject || '');
      setExamType((editingExam.examType as ExamType) || 'กลางภาค');
      setDate(editingExam.date || '');
      setStartTime(editingExam.startTime || '08:30');
      setEndTime(editingExam.endTime || '10:30');
      setBuilding(editingExam.building || '');
      setRoom(editingExam.room || '');
      setSeatNumber(editingExam.seatNumber || '');
      setScore(editingExam.score || '');
      setIsCompleted(Boolean(editingExam.isCompleted));
      setTopics(editingExam.topics ? [...editingExam.topics] : []);
      setIsDraftRestored(false);
      setDraftSavedAt(null);
    } else {
      // Check if draft exists in localStorage
      let hasDraft = false;
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && parsed.subject) {
            setSubject(parsed.subject || '');
            setExamType(parsed.examType || 'กลางภาค');
            setDate(parsed.date || new Date().toISOString().split('T')[0]);
            setStartTime(parsed.startTime || '08:30');
            setEndTime(parsed.endTime || '10:30');
            setBuilding(parsed.building || '');
            setRoom(parsed.room || '');
            setSeatNumber(parsed.seatNumber || '');
            setScore(parsed.score || '');
            setIsCompleted(Boolean(parsed.isCompleted));
            // Filter out old placeholder topic if it was stored
            const cleanedTopics = Array.isArray(parsed.topics) 
              ? parsed.topics.filter((t: any) => t.title !== 'บทที่ 1: เนื้อหาและทฤษฎีพื้นฐาน')
              : [];
            setTopics(cleanedTopics);
            setIsDraftRestored(true);
            setDraftSavedAt(parsed.savedAt || null);
            hasDraft = true;
          }
        }
      } catch (e) {
        console.warn('Could not read draft:', e);
      }

      if (!hasDraft) {
        // Default to today
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0];
        setSubject('');
        setExamType('กลางภาค');
        setDate(defaultDate);
        setStartTime('08:30');
        setEndTime('10:30');
        setBuilding('');
        setRoom('');
        setSeatNumber('');
        setScore('');
        setIsCompleted(false);
        setTopics([]); // No default topics
        setIsDraftRestored(false);
        setDraftSavedAt(null);
      }
    }
    setNewTopicTitle('');
    setErrorMessage('');
  }, [editingExam, isOpen]);

  // Auto-save draft on changes when creating new exam
  useEffect(() => {
    if (!isOpen || editingExam) return;
    if (!subject.trim() && !score.trim() && !building.trim() && !room.trim() && topics.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const draftData = {
          subject,
          examType,
          date,
          startTime,
          endTime,
          building,
          room,
          seatNumber,
          score,
          isCompleted,
          topics,
          savedAt: nowStr
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
        setDraftSavedAt(nowStr);
      } catch (e) {
        console.warn('Auto-save draft failed:', e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [subject, examType, date, startTime, endTime, building, room, seatNumber, score, isCompleted, topics, isOpen, editingExam]);

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    setSubject('');
    setExamType('กลางภาค');
    setDate(today);
    setStartTime('08:30');
    setEndTime('10:30');
    setBuilding('');
    setRoom('');
    setSeatNumber('');
    setScore('');
    setIsCompleted(false);
    setTopics([]);
    setIsDraftRestored(false);
    setDraftSavedAt(null);
  };

  if (!isOpen) return null;

  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) return;
    const newTopic: ExamTopic = {
      id: 'top_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: newTopicTitle.trim(),
      completed: false,
    };
    setTopics(prev => [...prev, newTopic]);
    setNewTopicTitle('');
  };

  const handleRemoveTopic = (topicId: string) => {
    setTopics(prev => prev.filter(t => t.id !== topicId));
  };

  const handleToggleTopic = (topicId: string) => {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMessage('กรุณากรอกชื่อวิชาที่สอบ');
      return;
    }
    if (!date) {
      setErrorMessage('กรุณาระบุวันที่สอบ');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMessage('กรุณาระบุเวลาเริ่มและเวลาสิ้นสุดการสอบ');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const examData: ExamSchedule = {
        id: editingExam?.id || ('exam_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
        subject: subject.trim(),
        examType,
        date,
        startTime,
        endTime,
        building: building.trim() || undefined,
        room: room.trim() || undefined,
        seatNumber: seatNumber.trim() || undefined,
        score: score.trim() || undefined,
        isCompleted,
        completedAt: isCompleted ? (editingExam?.completedAt || new Date().toISOString()) : undefined,
        topics: (topics || []).map((t) => ({
          id: t.id || ('top_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
          title: t.title.trim(),
          completed: Boolean(t.completed),
          ...(t.notes && t.notes.trim() ? { notes: t.notes.trim() } : {}),
        })),
        createdAt: editingExam?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(examData);
      if (!editingExam) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving exam:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลตารางสอบ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col overflow-hidden animate-fadeIn">
      <div 
        className="w-full h-full bg-white dark:bg-slate-900 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-850 dark:text-slate-100">
                  {editingExam ? 'แก้ไขข้อมูลการสอบ' : 'เพิ่มวิชาสอบใหม่'}
                </h3>
                {!editingExam && draftSavedAt && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Cloud className="w-2.5 h-2.5 text-emerald-500" />
                    <span>บันทึกร่างอัตโนมัติ</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                กำหนดวัน เวลา สถานที่สอบ คะแนนที่สอบ และขอบเขตเนื้อหา
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Draft Restored Banner */}
        {isDraftRestored && !editingExam && (
          <div className="mx-5 sm:mx-8 mt-3 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-500 shrink-0" />
              <span>กู้คืนข้อมูลร่างที่ระบบบันทึกอัตโนมัติไว้ {draftSavedAt ? `(${draftSavedAt})` : ''}</span>
            </div>
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างร่าง</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 sm:mx-8 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body without unnecessary white void */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
            {/* Row 1: Subject Name & Exam Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>ชื่อวิชาสอบ <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="เช่น คณิตศาสตร์เพิ่มเติม, ฟิสิกส์, เคมี"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>ประเภทการสอบ <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  {EXAM_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Date and Time Range */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>วันที่สอบ <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>เวลาเริ่มสอบ</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>เวลาสิ้นสุดสอบ</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Row 3: Venue details (Building, Room, Seat Number) */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" /> สถานที่สอบและที่นั่ง (ถ้ามี)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3" /> อาคาร
                  </label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder="เช่น อาคาร 4, ตึกเฉลิมพระเกียรติ"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> ห้องสอบ
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="เช่น ห้อง 432, Hall 1"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> เลขที่นั่งสอบ
                  </label>
                  <input
                    type="text"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    placeholder="เช่น A15, 24"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: คะแนนที่สอบ (แทนหมายเหตุเดิม) */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-1.5">
              <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>คะแนนที่สอบ</span>
              </label>
              <input
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="เช่น 20 คะแนน, 30 คะแนน หรือ 100"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-800/80 text-slate-850 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                คะแนนเต็มหรือสัดส่วนคะแนนของการสอบนี้ จะแสดงบนหน้าการ์ดวิชาสอบเพื่อให้เห็นได้ชัดเจน
              </p>
            </div>

            {/* Row 5: Exam Scope / Topics with Interactive Checklist */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>ขอบเขตเนื้อหาที่สอบ (Exam Scope / Topics)</span>
                  {topics.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                      {topics.length} หัวข้อ
                    </span>
                  )}
                </label>
                <span className="text-[11px] text-slate-400">
                  (เพิ่มหัวข้อเพื่อติ๊กติดตามการอ่านหนังสือ)
                </span>
              </div>

              {/* Add Topic Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTopic();
                    }
                  }}
                  placeholder="พิมพ์หัวข้อเนื้อหา แล้วกดเพิ่ม..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่ม</span>
                </button>
              </div>

              {/* Topics list */}
              {topics.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {topics.map((top, idx) => (
                    <div
                      key={top.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 group"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleTopic(top.id)}
                          className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                            top.completed
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-rose-400'
                          }`}
                          title={top.completed ? 'ทำเครื่องหมายว่ายังไม่ได้อ่าน' : 'ทำเครื่องหมายว่าอ่านจบแล้ว'}
                        >
                          {top.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <span className={`text-xs truncate ${
                          top.completed 
                            ? 'line-through text-slate-400 dark:text-slate-500' 
                            : 'text-slate-800 dark:text-slate-200 font-medium'
                        }`}>
                          {idx + 1}. {top.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(top.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="ลบหัวข้อนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  ยังไม่มีการระบุหัวข้อสอบ (พิมพ์ด้านบนเพื่อเพิ่ม)
                </p>
              )}
            </div>

            {/* สถานะเสร็จสิ้นการสอบ */}
            <div
              onClick={() => setIsCompleted(!isCompleted)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    เสร็จสิ้นการสอบแล้ว
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    ทำเครื่องหมายเมื่อสอบวิชานี้เสร็จสิ้นแล้ว
                  </span>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-colors ${
                isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {isCompleted ? '✓ สอบเสร็จแล้ว' : 'ยังไม่สอบ'}
              </span>
            </div>

            {/* Action Buttons directly after the form fields */}
            <div className="pt-4 pb-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'กำลังบันทึก...' : (editingExam ? 'บันทึกการแก้ไข' : 'บันทึกวิชาสอบ')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
