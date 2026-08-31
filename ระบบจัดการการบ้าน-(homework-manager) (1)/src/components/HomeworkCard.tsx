import React, { useState, useMemo } from 'react';
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
  Sliders,
  BookOpen
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

// Preset color palettes for subjects with rich vibrant themes
const SUBJECT_PALETTES = [
  {
    name: 'blue',
    gradient: 'from-blue-500 via-indigo-500 to-cyan-400',
    cardBg: 'bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-white dark:from-blue-950/30 dark:via-slate-900/90 dark:to-slate-900',
    cardBorder: 'border-blue-200/90 dark:border-blue-800/70 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10',
    badge: 'bg-blue-100/90 text-blue-800 border-blue-300/80 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700',
    iconColor: 'text-blue-600 dark:text-blue-400',
    dueBox: 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/70',
    dueIconBox: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs',
    dueCountdown: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs',
    progressBg: 'from-blue-500 via-indigo-500 to-cyan-400',
    sliderAccent: 'accent-blue-600',
  },
  {
    name: 'emerald',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-400',
    cardBg: 'bg-gradient-to-b from-emerald-50/70 via-teal-50/20 to-white dark:from-emerald-950/30 dark:via-slate-900/90 dark:to-slate-900',
    cardBorder: 'border-emerald-200/90 dark:border-emerald-800/70 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/10',
    badge: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    dueBox: 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/70',
    dueIconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs',
    dueCountdown: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs',
    progressBg: 'from-emerald-500 via-teal-500 to-cyan-400',
    sliderAccent: 'accent-emerald-600',
  },
  {
    name: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-rose-400',
    cardBg: 'bg-gradient-to-b from-amber-50/70 via-orange-50/20 to-white dark:from-amber-950/30 dark:via-slate-900/90 dark:to-slate-900',
    cardBorder: 'border-amber-200/90 dark:border-amber-800/70 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/10',
    badge: 'bg-amber-100/90 text-amber-900 border-amber-300/80 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700',
    iconColor: 'text-amber-600 dark:text-amber-400',
    dueBox: 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/70',
    dueIconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs',
    dueCountdown: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs',
    progressBg: 'from-amber-500 via-orange-500 to-rose-400',
    sliderAccent: 'accent-amber-600',
  },
  {
    name: 'violet',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-400',
    cardBg: 'bg-gradient-to-b from-violet-50/70 via-purple-50/20 to-white dark:from-violet-950/30 dark:via-slate-900/90 dark:to-slate-900',
    cardBorder: 'border-violet-200/90 dark:border-violet-800/70 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md hover:shadow-violet-500/10',
    badge: 'bg-violet-100/90 text-violet-900 border-violet-300/80 dark:bg-violet-950 dark:text-violet-200 dark:border-violet-700',
    iconColor: 'text-violet-600 dark:text-violet-400',
    dueBox: 'bg-violet-50/90 dark:bg-violet-950/40 border-violet-200/80 dark:border-violet-800/70',
    dueIconBox: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xs',
    dueCountdown: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xs',
    progressBg: 'from-violet-500 via-purple-500 to-fuchsia-400',
    sliderAccent: 'accent-violet-600',
  },
  {
    name: 'rose',
    gradient: 'from-rose-500 via-pink-500 to-amber-400',
    cardBg: 'bg-gradient-to-b from-rose-50/70 via-pink-50/20 to-white dark:from-rose-950/30 dark:via-slate-900/90 dark:to-slate-900',
    cardBorder: 'border-rose-200/90 dark:border-rose-800/70 hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-md hover:shadow-rose-500/10',
    badge: 'bg-rose-100/90 text-rose-900 border-rose-300/80 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700',
    iconColor: 'text-rose-600 dark:text-rose-400',
    dueBox: 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/70',
    dueIconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xs',
    dueCountdown: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs',
    progressBg: 'from-rose-500 via-pink-500 to-amber-400',
    sliderAccent: 'accent-rose-600',
  },
  {
    name: 'cyan',
    gradient: 'from-cyan-500 via-sky-500 to-blue-500',
    cardBg: 'bg-gradient-to-b from-cyan-50/70 via-sky-50/20 to-white dark:from-cyan-950/30 dark:via-slate-900/90 dark:to-slate-900',
    cardBorder: 'border-cyan-200/90 dark:border-cyan-800/70 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-md hover:shadow-cyan-500/10',
    badge: 'bg-cyan-100/90 text-cyan-900 border-cyan-300/80 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-700',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    dueBox: 'bg-cyan-50/90 dark:bg-cyan-950/40 border-cyan-200/80 dark:border-cyan-800/70',
    dueIconBox: 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-xs',
    dueCountdown: 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-xs',
    progressBg: 'from-cyan-500 via-sky-500 to-blue-500',
    sliderAccent: 'accent-cyan-600',
  },
  {
    name: 'fuchsia',
    gradient: 'from-fuchsia-500 via-pink-500 to-purple-500',
    cardBg: 'bg-gradient-to-b from-fuchsia-50/70 via-pink-50/20 to-white dark:from-fuchsia-950/30 dark:via-slate-900/90 dark:to-slate-900',
    cardBorder: 'border-fuchsia-200/90 dark:border-fuchsia-800/70 hover:border-fuchsia-400 dark:hover:border-fuchsia-500 hover:shadow-md hover:shadow-fuchsia-500/10',
    badge: 'bg-fuchsia-100/90 text-fuchsia-900 border-fuchsia-300/80 dark:bg-fuchsia-950 dark:text-fuchsia-200 dark:border-fuchsia-700',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    dueBox: 'bg-fuchsia-50/90 dark:bg-fuchsia-950/40 border-fuchsia-200/80 dark:border-fuchsia-800/70',
    dueIconBox: 'bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-xs',
    dueCountdown: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-xs',
    progressBg: 'from-fuchsia-500 via-pink-500 to-purple-500',
    sliderAccent: 'accent-fuchsia-600',
  },
];

// Helper to determine subject theme
function getSubjectTheme(subject: string) {
  const s = subject.toLowerCase().trim();
  if (s.includes('คณิต') || s.includes('math') || s.includes('สถิติ') || s.includes('พีชคณิต') || s.includes('เรขาคณิต')) {
    return SUBJECT_PALETTES[0]; // Blue/Indigo
  }
  if (s.includes('วิทย์') || s.includes('science') || s.includes('ฟิสิกส์') || s.includes('เคมี') || s.includes('ชีว') || s.includes('ดาราศาสตร์')) {
    return SUBJECT_PALETTES[1]; // Emerald/Teal
  }
  if (s.includes('ไทย') || s.includes('วรรณคดี') || s.includes('หลักภาษา')) {
    return SUBJECT_PALETTES[2]; // Amber/Orange
  }
  if (s.includes('อังกฤษ') || s.includes('english') || s.includes('จีน') || s.includes('ญี่ปุ่น') || s.includes('ฝรั่งเศส') || s.includes('เกาหลี') || s.includes('เยอรมัน')) {
    return SUBJECT_PALETTES[3]; // Purple/Violet
  }
  if (s.includes('สังคม') || s.includes('ประวัติ') || s.includes('ภูมิศาสตร์') || s.includes('หน้าที่') || s.includes('ศาสนา')) {
    return SUBJECT_PALETTES[4]; // Rose/Pink
  }
  if (s.includes('คอม') || s.includes('เทคโน') || s.includes('เขียนโปรแกรม') || s.includes('โค้ด') || s.includes('วิทยการคำนวณ')) {
    return SUBJECT_PALETTES[5]; // Cyan/Sky
  }
  if (s.includes('ศิลปะ') || s.includes('ดนตรี') || s.includes('นาฏศิลป์') || s.includes('ทัศนศิลป์') || s.includes('การงาน')) {
    return SUBJECT_PALETTES[6]; // Fuchsia/Pink
  }
  
  // Fallback hash based on subject string
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SUBJECT_PALETTES.length;
  return SUBJECT_PALETTES[index];
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

  // Subject aesthetic theme
  const theme = useMemo(() => getSubjectTheme(homework.subject || ''), [homework.subject]);

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
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-lg card-interactive flex flex-col justify-between ${
        homework.completed
          ? 'border-emerald-300/90 dark:border-emerald-700/80 bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 shadow-emerald-500/5'
          : isOverdue
          ? 'border-rose-300 dark:border-rose-700/90 bg-gradient-to-b from-rose-50/80 via-rose-50/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 shadow-rose-500/5'
          : isDueToday
          ? 'border-amber-300 dark:border-amber-700/90 bg-gradient-to-b from-amber-50/80 via-amber-50/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 shadow-amber-500/5'
          : `${theme.cardBorder} ${theme.cardBg}`
      }`}
    >
      {/* Top Accent Gradient Bar */}
      <div 
        className={`h-2 w-full transition-all duration-300 ${
          homework.completed 
            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600' 
            : isOverdue
            ? 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500'
            : isDueToday
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500'
            : `bg-gradient-to-r ${theme.gradient}`
        }`} 
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Badges & Quick Action Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Subject Badge & Tags */}
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {/* Colorful Subject Badge */}
              <span className={`inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold font-heading px-3 py-1 rounded-xl border shadow-xs shrink-0 ${theme.badge}`}>
                <BookOpen className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{homework.subject}</span>
              </span>

              {/* Work Type Badge */}
              <span 
                className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center space-x-1 shrink-0 ${
                  homework.workType === 'กลุ่ม'
                    ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs'
                    : 'bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {homework.workType === 'กลุ่ม' ? (
                  <>
                    <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>กลุ่ม ({homework.members?.length || 0})</span>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <span>เดี่ยว</span>
                  </>
                )}
              </span>

              {/* Priority Badge */}
              {homework.priority === 'ด่วนที่สุด' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-xs shrink-0 animate-pulse flex items-center space-x-0.5">
                  <span>🔥 ด่วน</span>
                </span>
              )}
            </div>

            {/* Quick Toggle Complete Button */}
            <button
              onClick={() => onToggleComplete(homework.id)}
              title={homework.completed ? 'ทำเป็นยังไม่เสร็จ' : 'กดว่าเสร็จสมบูรณ์'}
              className={`shrink-0 px-3 py-1 rounded-xl cursor-pointer flex items-center space-x-1.5 text-xs font-bold font-heading transition-all ${
                homework.completed
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs hover:from-emerald-700 hover:to-teal-700'
                  : 'bg-white/90 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/70 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-2xs'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${homework.completed ? 'text-white' : 'text-emerald-500'}`} />
              <span>{homework.completed ? 'เสร็จแล้ว' : 'เสร็จ'}</span>
            </button>
          </div>

          {/* Task Title & Description */}
          <div className="mb-3.5 space-y-1.5">
            <h3 className="text-slate-900 dark:text-slate-100 text-sm sm:text-base font-bold font-heading leading-snug">
              {homework.title || homework.subject || 'ไม่มีหัวข้องาน'}
            </h3>
            {homework.description && (
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                <FormattedDescription text={homework.description} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Due Date Banner & Progress */}
        <div className="space-y-3 pt-1">
          {/* Highlighted Due Date & Countdown Box */}
          <div 
            className={`flex flex-wrap items-center justify-between gap-2 p-2.5 sm:px-3 sm:py-2.5 rounded-xl border text-xs transition-colors shadow-2xs ${
              homework.completed
                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
                : isOverdue
                ? 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800'
                : isDueToday
                ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
                : theme.dueBox
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                homework.completed
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isOverdue
                  ? 'bg-rose-600 text-white shadow-xs'
                  : isDueToday
                  ? 'bg-amber-500 text-white shadow-xs'
                  : theme.dueIconBox
              }`}>
                <Calendar className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block leading-tight">
                  กำหนดส่ง:
                </span>
                <div className="flex items-baseline space-x-1 truncate">
                  <strong className={`font-heading font-bold text-xs sm:text-sm ${
                    homework.completed
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : isOverdue 
                      ? 'text-rose-700 dark:text-rose-300' 
                      : isDueToday 
                      ? 'text-amber-800 dark:text-amber-300' 
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {formattedDueDate}
                  </strong>
                  {!hasNoDueTime && homework.dueTime && (
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium shrink-0">
                      ({homework.dueTime} น.)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {homework.completed ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold font-heading bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>เสร็จแล้ว</span>
                </span>
              ) : hasNoDueDate ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>ไม่มีกำหนด</span>
                </span>
              ) : isOverdue ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold font-heading bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xs animate-pulse">
                  <AlertCircle className="w-3 h-3 text-white" />
                  <span>เลยกำหนด {Math.abs(diffDays)} วัน</span>
                </span>
              ) : isDueToday ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold font-heading bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                  <Clock className="w-3 h-3 text-white" />
                  <span>ส่งวันนี้!</span>
                </span>
              ) : (
                <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold font-heading ${theme.dueCountdown}`}>
                  <Clock className="w-3 h-3 text-white" />
                  <span>อีก {diffDays} วัน</span>
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar & Fine Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">ความคืบหน้า:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-xs font-heading">
                  {homework.progress}%
                </span>
              </div>

              {!homework.completed && (
                <button
                  onClick={() => setShowProgressSlider(!showProgressSlider)}
                  className={`text-[10px] sm:text-[11px] ${theme.iconColor} hover:opacity-80 font-bold flex items-center space-x-1 cursor-pointer py-0.5 transition-colors`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>{showProgressSlider ? 'ปิดการปรับ' : 'ปรับความคืบหน้า'}</span>
                </button>
              )}
            </div>

            {/* Visual Progress Bar with Dynamic Theme Gradient */}
            <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out shadow-xs ${
                  homework.progress === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : `bg-gradient-to-r ${theme.progressBg}`
                }`}
                style={{ width: `${homework.progress}%` }}
              />
            </div>

            {/* Fine-Grained Slider */}
            {showProgressSlider && !homework.completed && (
              <div className="pt-2 space-y-1.5 bg-white/80 dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={homework.progress}
                    onChange={(e) => onUpdateProgress(homework.id, parseInt(e.target.value))}
                    className={`w-full ${theme.sliderAccent} cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg`}
                  />
                  <span className="text-xs font-bold font-heading text-slate-800 dark:text-slate-200 min-w-[36px] text-right">
                    {homework.progress}%
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 px-0.5 font-medium">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions (Details, Edit, Delete) */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => onViewDetail(homework)}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold flex items-center space-x-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 transition-all group"
            >
              <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover:text-sky-600 transition-colors" />
              <span>ดูรายละเอียด</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => onEdit(homework)}
                title="แก้ไขข้อมูลการบ้าน"
                className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white/80 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(homework.id)}
                title="ลบการบ้าน"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
