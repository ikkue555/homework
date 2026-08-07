import { Homework, CalendarEvent } from '../types';

// Helper to get formatted date string offset from today
const getDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_HOMEWORKS: Homework[] = [];
export const INITIAL_EVENTS: CalendarEvent[] = [];

export const STORAGE_KEY_HOMEWORKS = 'homework_app_items_v2';
export const STORAGE_KEY_EVENTS = 'homework_app_events_v2';

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
