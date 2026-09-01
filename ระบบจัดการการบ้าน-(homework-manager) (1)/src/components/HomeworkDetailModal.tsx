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
  Sparkles,
  Share2
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
  onShare?: (homework: Homework) => void;
}

export const HomeworkDetailModal: React.FC<HomeworkDetailModalProps> = ({
  homework,
  onClose,
  onUpdateProgress,
  onToggleComplete,
  onEdit,
  onDelete,
  onShare,
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
        <div className="flex flex-wrap items-center gap-2 mb-3 pr-8">
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

        {/* Shared By Banner (Requirement: "และให้ขึ้นด้วยว่า แชร์โดย...") */}
        {homework.sharedBy && (
          <div className="mb-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center space-x-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold block font-heading">
                แชร์โดย: {homework.sharedBy.displayName || homework.sharedBy.username || homework.sharedBy.email}
              </span>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300 opacity-80">
                (การบ้านชิ้นนี้ถูกแชร์มาให้คุณ ความคืบหน้าจะบันทึกแยกอิสระ)
              </span>
            </div>
          </div>
        )}

        {/* Title / หัวข้องาน */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1 font-heading">
            หัวข้องาน:
          </span>
          <h3 className="text-lg sm:text-2xl font-black font-heading text-slate-900 dark:text-slate-100 leading-snug">
            {homework.title || homework.subject}
          </h3>
        </div>

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

        {/* Interactive Progress Slider (Fine-grained adjustment only) */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-2 font-heading">
              <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>ปรับความคืบหน้า (ปรับละเอียด 0 - 100%):</span>
            </span>
            <span className={`text-sm sm:text-base font-black font-heading px-3.5 py-1 rounded-xl border shadow-xs ${
              homework.progress === 100
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
            }`}>
              {homework.progress}%
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-750 h-3 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                homework.progress === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600'
              }`}
              style={{ width: `${homework.progress}%` }}
            />
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={homework.progress}
              onChange={(e) => onUpdateProgress(homework.id, parseInt(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1">
              <span>0% (ยังไม่เริ่ม)</span>
              <span>50% (ครึ่งทาง)</span>
              <span>100% (เสร็จสมบูรณ์)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions with Visual Hierarchy */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Share to Friends */}
            {onShare && (
              <button
                onClick={() => {
                  onClose();
                  onShare(homework);
                }}
                className="px-3.5 py-2.5 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all font-heading"
              >
                <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>แชร์ให้เพื่อน</span>
              </button>
            )}

            {/* Edit */}
            <button
              onClick={() => {
                onClose();
                onEdit(homework);
              }}
              className="px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Edit3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>แก้ไข</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                onClose();
                onDelete(homework.id);
              }}
              className="px-3 py-2.5 border border-rose-200 dark:border-rose-900/70 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 cursor-pointer transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>ลบ</span>
            </button>
          </div>

          {/* Primary Action: Toggle Complete */}
          <button
            onClick={() => {
              onToggleComplete(homework.id);
            }}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold font-heading flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md hover:shadow-lg ${
              homework.completed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40'
                : 'bg-sky-600 hover:bg-sky-700 text-white ring-2 ring-sky-400/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{homework.completed ? 'ทำเครื่องหมาย: เสร็จแล้ว ✓' : 'กดว่าเสร็จสมบูรณ์'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
