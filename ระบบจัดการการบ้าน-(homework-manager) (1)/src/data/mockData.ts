import { Homework, CalendarEvent, ExamSchedule } from '../types';

// Helper to get formatted date string offset from today
const getDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_HOMEWORKS: Homework[] = [];
export const INITIAL_EVENTS: CalendarEvent[] = [];
export const INITIAL_EXAMS: ExamSchedule[] = [];

export const STORAGE_KEY_HOMEWORKS = 'homework_app_items_v2';
export const STORAGE_KEY_EVENTS = 'homework_app_events_v2';
export const STORAGE_KEY_EXAMS = 'homework_app_exams_v2';

export const loadStoredHomeworks = (): Homework[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOMEWORKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredHomeworks = (homeworks: Homework[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_HOMEWORKS, JSON.stringify(homeworks));
  } catch (err) {
    console.error('Failed to save homeworks to localStorage', err);
  }
};

export const loadStoredEvents = (): CalendarEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredEvents = (events: CalendarEvent[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage', err);
  }
};

export const loadStoredExams = (userId?: string): ExamSchedule[] => {
  try {
    // 1. Check user-specific key
    if (userId) {
      const userKey = `${STORAGE_KEY_EXAMS}_${userId}`;
      const rawUser = localStorage.getItem(userKey);
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }

    // 2. Check global legacy key
    const rawGlobal = localStorage.getItem(STORAGE_KEY_EXAMS);
    if (rawGlobal) {
      const parsed = JSON.parse(rawGlobal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (userId) saveStoredExams(userId, parsed);
        return parsed;
      }
    }

    // 3. Scan all keys starting with STORAGE_KEY_EXAMS as emergency fallback
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_KEY_EXAMS)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (userId) saveStoredExams(userId, parsed);
            return parsed;
          }
        }
      }
    }

    return [];
  } catch {
    return [];
  }
};

export const saveStoredExams = (userId: string, exams: ExamSchedule[]) => {
  try {
    const key = `${STORAGE_KEY_EXAMS}_${userId}`;
    localStorage.setItem(key, JSON.stringify(exams));
  } catch (err) {
    console.error('Failed to save exams to localStorage', err);
  }
};

export const SUBJECT_PRESETS = [
  'คณิตศาสตร์พื้นฐาน',
  'คณิตศาสตร์เพิ่มเติม',
  'วิทยาศาสตร์และฟิสิกส์',
  'เคมี',
  'ชีววิทยา',
  'ภาษาไทย',
  'ภาษาอังกฤษเพื่อการสื่อสาร',
  'สังคมศึกษา',
  'ประวัติศาสตร์',
  'เทคโนโลยี (วิทยาการคำนวณ)',
  'ศิลปะและดนตรี',
  'สุขศึกษาและพลศึกษา',
  'วิชาเลือกเสรี'
];
