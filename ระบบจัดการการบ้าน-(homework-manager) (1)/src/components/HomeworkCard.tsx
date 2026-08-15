import React, { useState } from 'react';
import { Homework } from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Users, 
  User, 
  Info, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  AlertCircle, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { FormattedDescription } from './FormattedDescription';

interface HomeworkCardProps {
  homework: Homework;
  onToggleComplete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onViewDetail: (homework: Homework) => void;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  onToggleComplete,
  onUpdateProgress,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const [showProgressSlider, setShowProgressSlider] = useState(false);

  // Parse due date status & days remaining
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasNoDueDate = !homework.dueDate || typeof homework.dueDate !== 'string' || homework.dueDate.trim() === '' || homework.dueDate === 'ไม่มีกำหนดส่ง';
  const hasNoDueTime = !homework.dueTime || typeof homework.dueTime !== 'string' || homework.dueTime.trim() === '' || homework.dueTime === 'ไม่มีเวลากำหนด';

  let diffDays = 0;
  let isOverdue = false;
  let isDueToday = false;
  let formattedDueDate = 'ไม่มีกำหนดส่ง';

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
      className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs card-interactive flex flex-col justify-between ${
        homework.completed
          ? 'border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/15 dark:bg-emerald-950/20'
          : isOverdue
          ? 'border-rose-200/90 dark:border-rose-800/80 bg-rose-50/10 dark:bg-rose-950/10'
          : isDueToday
          ? 'border-amber-200/90 dark:border-amber-800/80 bg-amber-50/10 dark:bg-amber-950/10'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
      }`}
    >
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col">
        {/* Top Badges & Quick Action Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Tags Group */}
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {/* Subject Tag */}
            <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 shrink-0">
              {homework.subject}
            </span>

            {/* Work Type Badge */}
            <span 
              className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center space-x-1 shrink-0 ${
                homework.workType === 'กลุ่ม'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {homework.workType === 'กลุ่ม' ? (
                <>
                  <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 shrink-0 animate-pulse">
                🔥 ด่วน
              </span>
            )}
          </div>

          {/* Quick Toggle Complete Button with Spring Bounce */}
          <button
            onClick={() => onToggleComplete(homework.id)}
            title={homework.completed ? 'ทำเป็นยังไม่เสร็จ' : 'กดว่าเสร็จสมบูรณ์'}
            className={`shrink-0 px-2.5 py-1 rounded-xl cursor-pointer flex items-center space-x-1 text-xs font-semibold btn-interactive ${
              homework.completed
                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 icon-hover-wiggle" />
            <span className="text-[11px]">
              {homework.completed ? 'เสร็จ' : 'เสร็จแล้ว'}
            </span>
          </button>
        </div>

        {/* Task Title & Details */}
        <div className="mb-3 flex-1">
          {homework.title && (
            <h3 className="text-slate-900 dark:text-slate-100 text-sm sm:text-base font-bold font-heading leading-snug mb-1">
              {homework.title}
            </h3>
          )}
          <FormattedDescription text={homework.description} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300" />
        </div>

        {/* Due Date & Countdown Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 py-1.5 px-3 bg-slate-50/90 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-750 text-xs mb-3">
          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-[11px] sm:text-xs truncate">
              ส่ง: <strong className="text-slate-800 dark:text-slate-100 font-semibold">{formattedDueDate}</strong>
            </span>
            {!hasNoDueTime && homework.dueTime && (
              <span className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-[11px] shrink-0">({homework.dueTime})</span>
            )}
          </div>

          <div className="shrink-0">
            {homework.completed ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>เสร็จแล้ว</span>
              </span>
            ) : hasNoDueDate ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>ไม่มีกำหนด</span>
              </span>
            ) : isOverdue ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
                <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                <span>เลยกำหนด {Math.abs(diffDays)} วัน</span>
              </span>
            ) : isDueToday ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>ส่งวันนี้!</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800">
                <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span>อีก {diffDays} วัน</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Quick Update Buttons with Interactive micro-animations */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">ความคืบหน้า:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                {homework.progress}%
              </span>
            </div>

            <button
              onClick={() => setShowProgressSlider(!showProgressSlider)}
              className="text-[10px] sm:text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold flex items-center space-x-1 cursor-pointer py-0.5 btn-interactive-subtle"
            >
              <Sliders className="w-3 h-3" />
              <span>{showProgressSlider ? 'ซ่อน' : 'ปรับละเอียด'}</span>
            </button>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                homework.progress === 100
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : homework.progress >= 50
                  ? 'bg-sky-500 shadow-sm shadow-sky-500/50'
                  : 'bg-amber-500 shadow-sm shadow-amber-500/50'
              }`}
              style={{ width: `${homework.progress}%` }}
            />
          </div>

          {/* Quick % Buttons (25%, 50%, 75%, 100%) */}
          {showProgressSlider ? (
            <div className="pt-2 space-y-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700 animate-fadeIn">
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={homework.progress}
                  onChange={(e) => onUpdateProgress(homework.id, parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[32px] text-right">
                  {homework.progress}%
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[0, 25, 50, 75, 100].map((step) => (
                  <button
                    key={step}
                    onClick={() => onUpdateProgress(homework.id, step)}
                    className={`text-[10px] py-1 rounded-xl font-bold cursor-pointer text-center btn-interactive ${
                      homework.progress === step
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-600'
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
                      className={`w-full py-1.5 text-xs rounded-xl font-bold font-heading border cursor-pointer flex items-center justify-center shadow-2xs btn-interactive ${
                        homework.progress === val
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sky-600/30'
                          : val === 100
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-750 hover:text-sky-700 dark:hover:text-sky-300 hover:border-sky-300'
                      }`}
                      title={`ตั้งค่าความคืบหน้าเป็น ${val}%`}
                    >
                      {val === 100 ? '100%' : `${val}%`}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer Actions (Details, Edit, Delete) */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onViewDetail(homework)}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 font-medium flex items-center space-x-1 cursor-pointer py-0.5 btn-interactive-subtle group"
          >
            <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-sky-600" />
            <span>ดูรายละเอียด</span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(homework)}
              title="แก้ไขข้อมูลการบ้าน"
              className="p-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl btn-interactive cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 icon-hover-wiggle" />
            </button>
            <button
              onClick={() => onDelete(homework.id)}
              title="ลบการบ้าน"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl btn-interactive cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 icon-hover-wiggle" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
