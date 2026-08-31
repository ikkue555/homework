import React from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Tag, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  AlertCircle,
  Sliders,
  FileText,
  Sparkles
} from 'lucide-react';
import { Homework } from '../types';
import { FormattedDescription } from './FormattedDescription';

interface HomeworkDetailModalProps {
  homework: Homework | null;
  onClose: () => void;
  onUpdateProgress: (id: string, newProgress: number) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
}

export const HomeworkDetailModal: React.FC<HomeworkDetailModalProps> = ({
  homework,
  onClose,
  onUpdateProgress,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  if (!homework) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasNoDueDate = !homework.dueDate || homework.dueDate === 'ไม่มีกำหนดส่ง' || homework.dueDate === 'no_due_date';
  const hasNoDueTime = !homework.dueTime || homework.dueTime === 'ไม่มีเวลากำหนด' || homework.dueTime === 'none';

  let formattedDueDate = 'ยังไม่มีกำหนดส่ง';
  let isOverdue = false;
  let isDueToday = false;
  let diffDays = 0;

  if (!hasNoDueDate) {
    const due = new Date(homework.dueDate);
    if (!isNaN(due.getTime())) {
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isOverdue = !homework.completed && homework.progress < 100 && diffDays < 0;
      isDueToday = !homework.completed && diffDays === 0;

      formattedDueDate = due.toLocaleDateString('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-sky-100 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prominent Subject Header & Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pr-8">
          <span className="inline-flex items-center space-x-2 text-sm sm:text-base font-bold px-3.5 py-1.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-100 border border-sky-300 dark:border-sky-700 font-heading shadow-xs">
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>{homework.subject}</span>
          </span>

          {homework.type && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {homework.type}
            </span>
          )}
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {homework.workType === 'กลุ่ม' ? `👥 งานกลุ่ม (${homework.members?.length || 0} คน)` : '👤 งานเดี่ยว'}
          </span>
          {homework.priority === 'ด่วนที่สุด' && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              🔥 ด่วนที่สุด
            </span>
          )}
        </div>

        {/* Title if present */}
        {homework.title && (
          <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-slate-100 mb-2 leading-snug">
            {homework.title}
          </h3>
        )}

        {/* Prominent Due Date Banner Card */}
        <div className={`p-4 rounded-2xl border mb-4 transition-colors ${
          homework.completed
            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            : isOverdue
            ? 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 ring-1 ring-rose-300 dark:ring-rose-800'
            : isDueToday
            ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 ring-1 ring-amber-300 dark:ring-amber-800'
            : 'bg-sky-50/70 dark:bg-slate-800/90 border-sky-200/80 dark:border-slate-700'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isOverdue
                  ? 'bg-rose-600 text-white'
                  : isDueToday
                  ? 'bg-amber-500 text-white'
                  : 'bg-sky-600 text-white'
              }`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  วันและเวลากำหนดส่ง
                </span>
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <strong className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-slate-100">
                    {formattedDueDate}
                  </strong>
                  {!hasNoDueTime && homework.dueTime && (
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                      (เวลา {homework.dueTime} น.)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 self-start sm:self-auto">
              {homework.completed ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold font-heading bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>เสร็จสมบูรณ์แล้ว</span>
                </span>
              ) : hasNoDueDate ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>ไม่มีกำหนดส่ง</span>
                </span>
              ) : isOverdue ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold font-heading bg-rose-600 text-white shadow-xs animate-pulse">
                  <AlertCircle className="w-4 h-4 text-white" />
                  <span>เลยกำหนดส่ง {Math.abs(diffDays)} วัน</span>
                </span>
              ) : isDueToday ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold font-heading bg-amber-500 text-white shadow-xs">
                  <Clock className="w-4 h-4 text-white" />
                  <span>ต้องส่งวันนี้!</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold font-heading bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>เหลืออีก {diffDays} วัน</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Formatted Description */}
        <div className="mb-5 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
            รายละเอียดงาน:
          </span>
          <FormattedDescription text={homework.description} className="text-sm" />
        </div>

        {/* Group Members List */}
        {homework.workType === 'กลุ่ม' && homework.members && homework.members.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/60">
            <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>สมาชิกในกลุ่ม:</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {homework.members.map((m, idx) => (
                <span key={idx} className="text-xs font-medium bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {idx + 1}. {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Progress Slider */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>ความคืบหน้าการทำงานเรียลไทม์:</span>
            </span>
            <span className={`text-xs font-bold font-heading px-3 py-1 rounded-full border ${
              homework.progress === 100
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
            }`}>
              {homework.progress}%
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-750 h-3 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                homework.progress === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600'
              }`}
              style={{ width: `${homework.progress}%` }}
            />
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={homework.progress}
            onChange={(e) => onUpdateProgress(homework.id, parseInt(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />

          <div className="flex justify-between items-center mt-3">
            {[0, 25, 50, 75, 100].map((step) => (
              <button
                key={step}
                onClick={() => onUpdateProgress(homework.id, step)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  homework.progress === step
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-750'
                }`}
              >
                {step}%
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onToggleComplete(homework.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-heading flex items-center space-x-1.5 transition-colors cursor-pointer ${
              homework.completed
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-md'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{homework.completed ? 'เสร็จสมบูรณ์แล้ว' : 'กดว่าเสร็จสมบูรณ์'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(homework);
              }}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไข</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(homework.id);
              }}
              className="px-3 py-2 border border-rose-200 dark:border-rose-900/70 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-medium flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
