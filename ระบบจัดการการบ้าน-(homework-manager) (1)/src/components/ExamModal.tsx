import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw
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
  const [notes, setNotes] = useState('');
  
  // Topics list state
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
      setNotes(editingExam.notes || '');
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
            setNotes(parsed.notes || '');
            setTopics(Array.isArray(parsed.topics) ? parsed.topics : []);
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
        setNotes('');
        setTopics([
          { id: 'top_' + Date.now() + '_1', title: 'บทที่ 1: เนื้อหาและทฤษฎีพื้นฐาน', completed: false }
        ]);
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
    if (!subject.trim() && !notes.trim() && !building.trim() && !room.trim() && topics.length <= 1) {
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
          notes,
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
  }, [subject, examType, date, startTime, endTime, building, room, seatNumber, notes, topics, isOpen, editingExam]);

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
    setNotes('');
    setTopics([{ id: 'top_' + Date.now() + '_1', title: 'บทที่ 1: เนื้อหาและทฤษฎีพื้นฐาน', completed: false }]);
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
        id: editingExam?.id || 'exam_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        subject: subject.trim(),
        examType,
        date,
        startTime,
        endTime,
        building: building.trim() || undefined,
        room: room.trim() || undefined,
        seatNumber: seatNumber.trim() || undefined,
        topics,
        notes: notes.trim() || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-500/10 via-transparent to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-heading text-slate-850 dark:text-slate-100">
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
                บันทึกวัน เวลา ห้องสอบ และหัวข้อขอบเขตเนื้อหาสำหรับทบทวน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Draft Restored Banner */}
        {isDraftRestored && !editingExam && (
          <div className="mx-5 mt-3 p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs flex items-center justify-between">
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
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Row 1: Subject Name & Exam Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
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

          {/* Row 4: Exam Scope / Topics with Interactive Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>ขอบเขตเนื้อหาที่สอบ (Exam Scope / Topics)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  {topics.length} หัวข้อ
                </span>
              </label>
              <span className="text-[10px] text-slate-400">
                (เพิ่มหัวข้อเพื่อติ๊กติดตามการอ่านหนังสือ)
              </span>
            </div>

            {/* Input to add topic */}
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
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>

            {/* Topics list */}
            {topics.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {topics.map((top, idx) => (
                  <div
                    key={top.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 group"
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
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
                      className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="ลบหัวข้อนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                ยังไม่มีการระบุหัวข้อสอบ (พิมพ์ด้านบนเพื่อเพิ่ม)
              </p>
            )}
          </div>

          {/* Row 5: Notes & Reminders */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              หมายเหตุ / สิ่งที่ต้องเตรียมเข้าห้องสอบ (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น อนุญาตให้นำดินสอ 2B เข้าห้องสอบ, เตรียมบัตรนักเรียน, ห้ามนำอุปกรณ์อิเล็กทรอนิกส์เข้า..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : (editingExam ? 'บันทึกการแก้ไข' : 'บันทึกวิชาสอบ')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
