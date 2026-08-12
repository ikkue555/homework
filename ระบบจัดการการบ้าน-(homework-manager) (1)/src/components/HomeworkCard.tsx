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

  // Compute status and days remaining
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(homework.dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = !homework.completed && homework.progress < 100 && diffDays < 0;
  const isDueToday = !homework.completed && diffDays === 0;

  // Due date badge formatting
  const formattedDueDate = new Date(homework.dueDate).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });

  return (
    <div 
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs card-interactive ${
        homework.completed
          ? 'border-emerald-200/80 bg-emerald-50/10'
          : isOverdue
          ? 'border-rose-200/80'
          : isDueToday
          ? 'border-amber-200/80'
          : 'border-slate-200/80 hover:border-sky-300'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header Badges & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Subject Tag */}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
              {homework.subject}
            </span>

            {/* Work Type Badge */}
            <span 
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                homework.workType === 'กลุ่ม'
                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/70'
              }`}
            >
              {homework.workType === 'กลุ่ม' ? (
                <>
                  <Users className="w-3 h-3 text-purple-600" />
                  <span>งานกลุ่ม ({homework.members?.length || 0} คน)</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-slate-400" />
                  <span>งานเดี่ยว</span>
                </>
              )}
            </span>

            {/* Assignment Type */}
            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>{homework.type}</span>
            </span>

            {/* Priority Badge */}
            {homework.priority === 'ด่วนที่สุด' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
                🔥 ด่วนที่สุด
              </span>
            )}
          </div>

          {/* Quick Complete Button */}
          <button
            onClick={() => onToggleComplete(homework.id)}
            title={homework.completed ? 'ทำเป็นยังไม่เสร็จ' : 'กดว่าเสร็จสมบูรณ์'}
            className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 text-xs ${
              homework.completed
                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 font-medium'
                : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {homework.completed ? 'เสร็จแล้ว' : 'ทำเสร็จแล้ว'}
            </span>
          </button>
        </div>

        {/* Task Title & Details Preview */}
        <h3 className="text-slate-800 text-sm sm:text-base font-semibold leading-relaxed mb-3">
          {homework.description}
        </h3>

        {/* Due Date & Countdown Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>กำหนดส่ง: <strong className="text-slate-800 font-medium">{formattedDueDate}</strong></span>
            {homework.dueTime && (
              <span className="text-slate-400">({homework.dueTime} น.)</span>
            )}
          </div>

          <div>
            {homework.completed ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100/80 text-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>เสร็จสมบูรณ์แล้ว</span>
              </span>
            ) : isOverdue ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100/80 text-rose-800">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>เลยกำหนด {Math.abs(diffDays)} วัน!</span>
              </span>
            ) : isDueToday ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100/80 text-amber-800">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>ส่งวันนี้!</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-100">
                <Clock className="w-3 h-3 text-sky-600" />
                <span>เหลืออีก {diffDays} วัน</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-normal">ความคืบหน้า:</span>
              <span className="font-semibold text-slate-800">
                {homework.progress}%
              </span>
            </div>

            <button
              onClick={() => setShowProgressSlider(!showProgressSlider)}
              className="text-[11px] text-sky-600 hover:text-sky-700 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>{showProgressSlider ? 'ซ่อนตัวปรับ' : 'ปรับ %'}</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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

          {/* Slider or Quick Buttons */}
          {showProgressSlider ? (
            <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
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
                <span className="text-xs font-semibold text-slate-700 min-w-[30px] text-right">
                  {homework.progress}%
                </span>
              </div>
              <div className="flex justify-between items-center gap-1">
                {[0, 25, 50, 75, 100].map((step) => (
                  <button
                    key={step}
                    onClick={() => onUpdateProgress(homework.id, step)}
                    className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
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
          ) : (
            !homework.completed && homework.progress < 100 && (
              <div className="flex items-center space-x-1 mt-1.5">
                <span className="text-[10px] text-slate-400 mr-1">อัปเดต:</span>
                {[25, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => onUpdateProgress(homework.id, val)}
                    className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 hover:border-sky-400 hover:text-sky-600 rounded font-medium transition-colors cursor-pointer"
                  >
                    {val}%
                  </button>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
          <button
            onClick={() => onViewDetail(homework)}
            className="text-xs text-slate-600 hover:text-sky-600 font-medium flex items-center space-x-1 cursor-pointer py-0.5"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>รายละเอียด</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(homework)}
              title="แก้ไขข้อมูล"
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

