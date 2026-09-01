export type ThemeMode = 'light' | 'dark';

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

export interface SharedByInfo {
  uid: string;
  displayName: string;
  username?: string;
  email?: string;
  sharedAt: string;
}

export interface Homework {
  id: string;
  subject: string;           // วิชา (กรอกเอง)
  title?: string;            // หัวข้องาน (กรอกเอง)
  dueDate: string;           // วันกำหนดส่ง (YYYY-MM-DD or 'ไม่มีกำหนดส่ง')
  dueTime?: string;          // เวลาที่ต้องส่ง e.g., "23:59"
  type?: HomeworkType;       // ประเภทงาน (Optional)
  workType: WorkType;        // งานกลุ่ม หรือ งานเดี่ยว
  description: string;       // รายละเอียดของงาน (รองรับ Bullet)
  progress: number;          // ความคืบหน้า (0 - 100%)
  completed: boolean;        // เสร็จสมบูรณ์แล้วหรือไม่
  completedAt?: string;      // วันเวลาที่ทำเสร็จ
  members?: string[];        // รายชื่อสมาชิกกลุ่ม (ถ้าเป็นงานกลุ่ม)
  priority: Priority;        // ความสำคัญ
  createdAt: string;
  sharedBy?: SharedByInfo;   // ข้อมูลผู้แชร์การบ้านมา (ถ้ามี)
  originalHomeworkId?: string; // ID ต้นทางของการบ้านที่ถูกแชร์
}

export interface Friend {
  uid: string;
  displayName: string;
  email: string;
  username?: string;
  addedAt: string;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromDisplayName: string;
  fromEmail: string;
  fromUsername?: string;
  toUid: string;
  toDisplayName?: string;
  toEmail?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export type EventType = 'สอบ' | 'กิจกรรมโรงเรียน' | 'วันหยุด' | 'นัดหมายกลุ่ม' | 'อื่นๆ' | string;

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
  // Brand & Header
  appTitle: string;
  appSubtitle: string;
  announcementBannerText?: string;
  showAnnouncementBanner?: boolean;
  liveSyncBadgeText?: string;
  
  // Custom Navigation Tab Labels
  navMainLabel?: string;
  navNewsLabel?: string;
  navCompletedLabel?: string;
  navOverdueLabel?: string;
  navCalendarLabel?: string;
  navFriendsLabel?: string;
  navAddLabel?: string;
  navAdminLabel?: string;

  // Custom Stats & Dashboard Labels
  statTotalLabel?: string;
  statPendingLabel?: string;
  statCompletedLabel?: string;
  statOverdueLabel?: string;
  statProgressChartTitle?: string;
  statProgressChartSubtitle?: string;
  statAvgProgressLabel?: string;
  statAverageProgressLabel?: string;

  // Quick Info & Empty States
  quickNoticeTitle?: string;
  quickNoticeText?: string;
  emptyHomeworkTitle?: string;
  emptyHomeworkMessage?: string;
  emptyCompletedTitle?: string;
  emptyCompletedMessage?: string;
  emptyOverdueTitle?: string;
  emptyOverdueMessage?: string;
  emptyNewsTitle?: string;
  emptyNewsMessage?: string;

  // Homework Cards & Details
  cardDuePrefix?: string;
  cardNoDueDate?: string;
  cardNoDueDateText?: string;
  cardNoDueTimeText?: string;
  cardDueTodayBadge?: string;
  cardOverdueBadge?: string;
  cardOverdueBadgePrefix?: string;
  cardCompletedBadge?: string;
  cardDaysLeftPrefix?: string;
  cardDaysUnit?: string;
  cardWorkTypePrefix?: string;
  cardMarkDoneText?: string;
  cardMarkUndoneText?: string;
  cardViewDetailButton?: string;
  cardCompletedButton?: string;
  cardMarkDoneButton?: string;
  cardSharedByPrefix?: string;

  // Form Labels & Inputs
  formAddTitle?: string;
  formEditTitle?: string;
  formSubjectLabel?: string;
  formTitleLabel?: string;
  formDueDateLabel?: string;
  formDueTimeLabel?: string;
  formNoDueDateOption?: string;
  formNoDueTimeOption?: string;
  formWorkTypeLabel?: string;
  formWorkTypeSingle?: string;
  formWorkTypeGroup?: string;
  formDescriptionLabel?: string;
  formPriorityLabel?: string;
  formProgressLabel?: string;
  formInitialProgressLabel?: string;
  formSubmitAdd?: string;
  formSubmitEdit?: string;
  formSubmitAddButton?: string;
  formSubmitEditButton?: string;
  formCancelButton?: string;
  formSaveButton?: string;

  // Friends & Card Sharing
  friendsModalTitle?: string;
  friendsModalSubtitle?: string;
  friendsStep1Title?: string;
  friendsStep2Title?: string;
  friendsTabShare?: string;
  friendsTabMyFriends?: string;
  friendsTabAddFriend?: string;
  friendsTabRequests?: string;
  friendsTabList?: string;
  friendsTabAdd?: string;
  friendsSelectAllButton?: string;
  friendsDeselectAllButton?: string;
  friendsNextStepButton?: string;
  friendsConfirmShareButton?: string;
  friendsShareButton?: string;
  friendsBtnNextSelectFriends?: string;

  // Footer & System Info
  footerSchoolName?: string;
  footerContactText?: string;
  footerLiveSyncText?: string;
  footerDevCredit?: string;

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

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string; // ISO string
  read: boolean;
  actionTab?: ActiveTab;
  homeworkId?: string;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number; // ms, default 5000ms
  createdAt: number;
}
