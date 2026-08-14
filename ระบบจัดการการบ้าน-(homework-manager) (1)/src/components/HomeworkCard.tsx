import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Users, 
  User, 
  Tag, 
  Edit3, 
  Trash2, 
  Info, 
  ChevronRight,
  AlertCircle,
  Sparkles,
  Sliders
} from 'lucide-react';
import { Homework } from '../types';
import { FormattedDescription } from './FormattedDescription';

interface HomeworkCardProps {
  homework: Homework;
  onUpdateProgress: (id: string, newProgress: number) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
  onViewDetail: (homework: Homework) => void;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  onUpdateProgress,
  onToggleComplete,
  onEdit,
  onDelete,
  onViewDetail,
}) => {
  const [showProgressSlider, setShowProgressSlider] = useState(false);

  // Compute due date status and days remaining
  const hasNoDueDate = !homework.dueDate || homework.dueDate === 'ไม่มีกำหนดส่ง' || homework.dueDate === 'no_due_date';
  const hasNoDueTime = !homework.dueTime || homework.dueTime === 'ไม่มีเวลากำหนด' || homework.dueTime === 'none';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let isOverdue = false;
  let isDueToday = false;
  let diffDays = 0;
  let formattedDueDate = 'ยังไม่มีกำหนดส่ง';

  if (!hasNoDueDate) {
    const due = new Date(homework.dueDate);
    if (!isNaN(due.getTime())) {
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      isOverdue = !homework.completed && homework.progress < 100 && diffDays < 0;
      isDueToday = !homework.completed && diffDays === 0;

      formattedDueDate = due.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
      });
    }
  }

  return (
    <div 
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs card-interactive flex flex-col justify-between ${
        homework.completed
          ? 'border-emerald-200/90 bg-emerald-50/15'
          : isOverdue
          ? 'border-rose-200/90'
          : isDueToday
          ? 'border-amber-200/90'
          : 'border-slate-200/80 hover:border-sky-300'
      }`}
    >
      <div className="p-3.5 sm:p-4.5 flex-1 flex flex-col">
        {/* Top Badges & Quick Action Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Tags Group */}
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {/* Subject Tag */}
            <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-100/90 shrink-0">
              {homework.subject}
            </span>

            {/* Work Type Badge */}
            <span 
              className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center space-x-1 shrink-0 ${
                homework.workType === 'กลุ่ม'
                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              {homework.workType === 'กลุ่ม' ? (
                <>
                  <Users className="w-3 h-3 text-purple-600" />
                  <span>กลุ่ม ({homework.members?.length || 0})</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-slate-400" />
                  <span>เดี่ยว</span>
                </>
              )}
            </span>

            {/* Priority Badge */}
            {homework.priority === 'ด่วนที่สุด' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 shrink-0">
                🔥 ด่วนที่สุด
              </span>
            )}
          </div>

          {/* Quick Toggle Complete Button */}
          <button
            onClick={() => onToggleComplete(homework.id)}
            title={homework.completed ? 'ทำเป็นยังไม่เสร็จ' : 'กดว่าเสร็จสมบูรณ์'}
            className={`shrink-0 px-2 py-1 rounded-xl transition-all cursor-pointer flex items-center space-x-1 text-xs font-semibold ${
              homework.completed
                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              {homework.completed ? 'เสร็จ' : 'เสร็จแล้ว'}
            </span>
          </button>
        </div>

        {/* Task Title & Details */}
        <div className="mb-3 flex-1">
          {homework.title && (
            <h3 className="text-slate-900 text-sm sm:text-base font-bold font-heading leading-snug mb-1">
              {homework.title}
            </h3>
          )}
          <FormattedDescription text={homework.description} className="text-xs sm:text-sm text-slate-600" />
        </div>

        {/* Due Date & Countdown Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 py-2 px-2.5 bg-slate-50/90 rounded-xl border border-slate-100 text-xs mb-3">
          <div className="flex items-center space-x-1.5 text-slate-600 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="text-[11px] sm:text-xs truncate">
              ส่ง: <strong className="text-slate-800 font-semibold">{formattedDueDate}</strong>
            </span>
            {!hasNoDueTime && homework.dueTime && (
              <span className="text-slate-400 text-[10px] sm:text-[11px] shrink-0">({homework.dueTime})</span>
            )}
          </div>

          <div className="shrink-0">
            {homework.completed ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-emerald-100 text-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>เสร็จแล้ว</span>
              </span>
            ) : hasNoDueDate ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>ไม่มีกำหนดส่ง</span>
              </span>
            ) : isOverdue ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>เลยกำหนด {Math.abs(diffDays)} วัน!</span>
              </span>
            ) : isDueToday ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100 text-amber-900">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>ส่งวันนี้!</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-100">
                <Clock className="w-3 h-3 text-sky-600" />
                <span>อีก {diffDays} วัน</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Thumb-Friendly Quick Update Buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 text-[11px] font-normal">ความคืบหน้า:</span>
              <span className="font-bold text-slate-800 text-xs">
                {homework.progress}%
              </span>
            </div>

            <button
              onClick={() => setShowProgressSlider(!showProgressSlider)}
              className="text-[10px] sm:text-[11px] text-sky-600 hover:text-sky-700 font-semibold flex items-center space-x-1 cursor-pointer py-0.5"
            >
              <Sliders className="w-3 h-3" />
              <span>{showProgressSlider ? 'ซ่อนตัวเลื่อน' : 'เลื่อนแบบละเอียด'}</span>
            </button>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                homework.progress === 100
                  ? 'bg-emerald-500'
                  : homework.progress >= 50
                  ? 'bg-sky-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${homework.progress}%` }}
            />
          </div>

          {/* Quick % Buttons for Thumb Tapping (25%, 50%, 75%, 100%) */}
          {showProgressSlider ? (
            <div className="pt-1.5 space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={homework.progress}
                  onChange={(e) => onUpdateProgress(homework.id, parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <span className="text-xs font-bold text-slate-700 min-w-[32px] text-right">
                  {homework.progress}%
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[0, 25, 50, 75, 100].map((step) => (
                  <button
                    key={step}
                    onClick={() => onUpdateProgress(homework.id, step)}
                    className={`text-[10px] py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                      homework.progress === step
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    {step}%
                  </button>
                ))}
              </div>
            </div>
          ) : (
            !homework.completed && homework.progress < 100 && (
              <div className="pt-1">
                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => onUpdateProgress(homework.id, val)}
                      className={`py-1.5 text-xs rounded-xl font-bold font-heading border transition-all cursor-pointer flex items-center justify-center shadow-2xs ${
                        homework.progress === val
                          ? 'bg-sky-600 text-white border-sky-600'
                          : val === 100
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300'
                      }`}
                      title={`ตั้งค่าความคืบหน้าเป็น ${val}%`}
                    >
                      {val === 100 ? 'เสร็จ 100%' : `${val}%`}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer Actions (Details, Edit, Delete) */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => onViewDetail(homework)}
            className="text-xs text-slate-600 hover:text-sky-600 font-medium flex items-center space-x-1 cursor-pointer py-1"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>ดูรายละเอียด</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(homework)}
              title="แก้ไขข้อมูลการบ้าน"
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(homework.id)}
              title="ลบการบ้าน"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
