import { ExamSchedule, ExamTopic } from '../types';

export interface ExamCountdownInfo {
  status: 'past' | 'today' | 'tomorrow' | 'upcoming';
  label: string;
  diffDays: number;
  badgeClasses: string;
  urgent: boolean;
}

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_DAYS = [
  'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
];

/**
 * Calculate countdown status and days remaining
 */
export function getExamCountdown(dateStr: string): ExamCountdownInfo {
  if (!dateStr) {
    return {
      status: 'upcoming',
      label: 'ยังไม่กำหนดวัน',
      diffDays: 999,
      badgeClasses: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      urgent: false,
    };
  }

  const now = new Date();
  const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const [y, m, d] = dateStr.split('-').map(Number);
  const examDateZero = new Date(y, m - 1, d).getTime();

  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((examDateZero - todayZero) / oneDayMs);

  if (diffDays < 0) {
    return {
      status: 'past',
      label: 'สอบผ่านไปแล้ว',
      diffDays,
      badgeClasses: 'bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
      urgent: false,
    };
  }

  if (diffDays === 0) {
    return {
      status: 'today',
      label: '🚨 สอบวันนี้!',
      diffDays,
      badgeClasses: 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-300 dark:ring-rose-800 font-black animate-pulse',
      urgent: true,
    };
  }

  if (diffDays === 1) {
    return {
      status: 'tomorrow',
      label: '⚡ สอบพรุ่งนี้!',
      diffDays,
      badgeClasses: 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-black',
      urgent: true,
    };
  }

  if (diffDays <= 7) {
    return {
      status: 'upcoming',
      label: `อีก ${diffDays} วัน`,
      diffDays,
      badgeClasses: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold',
      urgent: false,
    };
  }

  return {
    status: 'upcoming',
    label: `อีก ${diffDays} วัน`,
    diffDays,
    badgeClasses: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold',
    urgent: false,
  };
}

/**
 * Format date string into Thai format (Full or Short)
 */
export function formatThaiExamDate(dateStr: string, format: 'full' | 'short' = 'short'): string {
  if (!dateStr) return 'ไม่ระบุวันที่';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = THAI_DAYS[dateObj.getDay()];
    const buddhistYear = y + 543;

    if (format === 'full') {
      return `วัน${dayName}ที่ ${d} ${THAI_MONTHS_FULL[m - 1]} พ.ศ. ${buddhistYear}`;
    }
    return `${d} ${THAI_MONTHS_SHORT[m - 1]} ${buddhistYear}`;
  } catch {
    return dateStr;
  }
}

/**
 * Return style classes according to exam type
 */
export function getExamTypeBadgeProps(examType: string): { bg: string; text: string; border: string; label: string } {
  const norm = (examType || '').trim();
  if (norm.includes('กลางภาค')) {
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/70',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      label: 'สอบกลางภาค'
    };
  }
  if (norm.includes('ปลายภาค')) {
    return {
      bg: 'bg-red-100 dark:bg-red-950/90',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-300 dark:border-red-700',
      label: 'สอบปลายภาค'
    };
  }
  if (norm.includes('เก็บคะแนน')) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/70',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      label: 'สอบเก็บคะแนน'
    };
  }
  if (norm.includes('ย่อย') || norm.includes('Quiz')) {
    return {
      bg: 'bg-sky-50 dark:bg-sky-950/70',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-800',
      label: 'สอบย่อย'
    };
  }
  return {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    label: norm || 'การสอบ'
  };
}

/**
 * Calculate reading progress of topics
 */
export function getTopicsProgress(topics: ExamTopic[] = []): { completed: number; total: number; percent: number } {
  if (!topics || topics.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }
  const completed = topics.filter(t => t.completed).length;
  const total = topics.length;
  const percent = Math.round((completed / total) * 100);
  return { completed, total, percent };
}
