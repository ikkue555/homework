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
  FileText
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

  const hasNoDueDate = !homework.dueDate || homework.dueDate === 'ไม่มีกำหนดส่ง' || homework.dueDate === 'no_due_date';
  const hasNoDueTime = !homework.dueTime || homework.dueTime === 'ไม่มีเวลากำหนด' || homework.dueTime === 'none';

  let formattedDueDate = 'ยังไม่มีกำหนดส่ง';
  if (!hasNoDueDate) {
    const due = new Date(homework.dueDate);
    if (!isNaN(due.getTime())) {
      formattedDueDate = due.toLocaleDateString('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-sky-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pr-8">
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-sky-100 text-sky-800 font-heading">
            {homework.subject}
          </span>
          {homework.type && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {homework.type}
            </span>
          )}
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {homework.workType === 'กลุ่ม' ? `👥 งานกลุ่ม (${homework.members?.length || 0} คน)` : '👤 งานเดี่ยว'}
          </span>
          {homework.priority === 'ด่วนที่สุด' && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
              🔥 ด่วนที่สุด
            </span>
          )}
        </div>

        {/* Title if present */}
        {homework.title && (
          <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 mb-2 leading-snug">
            {homework.title}
          </h3>
        )}

        {/* Formatted Description */}
        <div className="mb-5 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            รายละเอียดงาน:
          </span>
          <FormattedDescription text={homework.description} className="text-sm" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div className="flex items-center space-x-2 text-slate-700">
            <Calendar className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">วันกำหนดส่ง:</span>
              <strong className="text-slate-800">{formattedDueDate}</strong>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <Clock className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">เวลากำหนดส่ง:</span>
              <strong className="text-slate-800">
                {!hasNoDueTime && homework.dueTime ? `${homework.dueTime} น.` : 'ไม่มีเวลากำหนด'}
              </strong>
            </div>
          </div>
        </div>

        {/* Group Members List */}
        {homework.workType === 'กลุ่ม' && homework.members && homework.members.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <h4 className="text-xs font-bold text-purple-900 mb-2 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              <span>สมาชิกในกลุ่ม:</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {homework.members.map((m, idx) => (
                <span key={idx} className="text-xs font-medium bg-white px-2.5 py-1 rounded-lg text-purple-800 border border-purple-200">
                  {idx + 1}. {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Progress Slider */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>ความคืบหน้าการทำงานเรียลไทม์:</span>
            </span>
            <span className={`text-xs font-bold font-heading px-3 py-1 rounded-full ${
              homework.progress === 100
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-sky-100 text-sky-800'
            }`}>
              {homework.progress}%
            </span>
          </div>

          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-3">
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
            className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          <div className="flex justify-between items-center mt-3">
            {[0, 25, 50, 75, 100].map((step) => (
              <button
                key={step}
                onClick={() => onUpdateProgress(homework.id, step)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  homework.progress === step
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-sky-50'
                }`}
              >
                {step}%
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
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
              className="px-3 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไข</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(homework.id);
              }}
              className="px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium flex items-center space-x-1 cursor-pointer"
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
