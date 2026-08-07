export type WorkType = 'เดี่ยว' | 'กลุ่ม';

export type HomeworkType = 
  | 'แบบฝึกหัด/ใบงาน'
  | 'รายงาน'
  | 'งานนำเสนอ/พรีเซนต์'
  | 'โครงงาน/โปรเจกต์'
  | 'การบ้านทั่วไป'
  | 'เตรียมสอบ/ทบทวน'
  | 'อื่นๆ';

export type Priority = 'ปกติ' | 'สำคัญ' | 'ด่วนที่สุด';

export interface Homework {
  id: string;
  subject: string;           // วิชา
  dueDate: string;           // วันกำหนดส่ง (YYYY-MM-DD or ISO string)
  dueTime?: string;          // เวลาที่ต้องส่ง e.g., "23:59"
  type: HomeworkType;        // ประเภทงาน
  workType: WorkType;        // งานกลุ่ม หรือ งานเดี่ยว
  description: string;       // รายละเอียดของงาน
  progress: number;          // ความคืบหน้า (0 - 100%)
  completed: boolean;        // เสร็จสมบูรณ์แล้วหรือไม่
  completedAt?: string;      // วันเวลาที่ทำเสร็จ
  members?: string[];        // รายชื่อสมาชิกกลุ่ม (ถ้าเป็นงานกลุ่ม)
  priority: Priority;        // ความสำคัญ
  createdAt: string;
}

export type EventType = 'สอบ' | 'กิจกรรมโรงเรียน' | 'วันหยุด' | 'นัดหมายกลุ่ม' | 'อื่นๆ';

export interface CalendarEvent {
  id: string;
  title: string;             // ชื่อกิจกรรม
  date: string;              // YYYY-MM-DD
  time?: string;             // เวลา e.g., "09:00"
  type: EventType;           // ประเภทกิจกรรม
  description?: string;      // รายละเอียดเพิ่มเติม
  color?: string;            // สีประจำ Event
  location?: string;         // สถานที่
}

export type ActiveTab = 'main' | 'completed' | 'overdue' | 'add' | 'calendar' | 'news' | 'admin';

export interface PRNewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category?: string;
  pinned?: boolean;
  authorName: string;
  createdAt: string;
}

export interface SiteSettings {
  appTitle: string;
  appSubtitle: string;
  announcementBannerText?: string;
  showAnnouncementBanner?: boolean;
  
  // Custom Navigation Tab Labels
  navMainLabel?: string;
  navNewsLabel?: string;
  navCompletedLabel?: string;
  navOverdueLabel?: string;
  navCalendarLabel?: string;
  navAddLabel?: string;
  navAdminLabel?: string;

  // Custom Stats & Dashboard Labels
  statTotalLabel?: string;
  statPendingLabel?: string;
  statCompletedLabel?: string;
  statOverdueLabel?: string;

  // Quick Info & Empty States
  quickNoticeTitle?: string;
  quickNoticeText?: string;
  emptyHomeworkTitle?: string;
  emptyHomeworkMessage?: string;

  // Footer & Contact Info
  footerSchoolName?: string;
  footerContactText?: string;

  // Pop up PR Settings
  popupEnabled: boolean;
  popupDisplayMode?: 'image_only' | 'text_only' | 'both';
  popupTitle: string;
  popupMessage: string;
  popupImageUrl?: string;
  popupLinkUrl?: string;
  updatedAt?: string;
}

export interface HomeworkFilterState {
  searchQuery: string;
  subject: string;
  dueDateFilter: 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  type: string;
  workType: string; // 'all' | 'เดี่ยว' | 'กลุ่ม'
  sortBy: 'dueDate_asc' | 'dueDate_desc' | 'progress_asc' | 'progress_desc' | 'subject';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  username?: string;
  role: 'admin' | 'user';
  createdAt: string;
}
