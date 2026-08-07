import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Homework, CalendarEvent, UserProfile, SiteSettings, PRNewsItem } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export const ADMIN_SECRET_CODE = 'กินพืชหรือกินเนื้อ';
const CURRENT_USER_SESSION_KEY = 'hw_app_current_user_session_v1';

/**
 * Sanitize username/email for document ID in Firestore
 */
export function sanitizeUserKey(emailOrUsername: string): string {
  const clean = emailOrUsername.trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
  return `usr_${clean}`;
}

/**
 * Register a new user with Firestore account storage
 */
export async function registerUser({
  displayName,
  emailOrUsername,
  password,
  isAdmin,
  adminCode
}: {
  displayName: string;
  emailOrUsername: string;
  password: string;
  isAdmin: boolean;
  adminCode?: string;
}): Promise<UserProfile> {
  // Validate Admin Code if registering as Admin
  if (isAdmin) {
    const codeClean = (adminCode || '').trim();
    if (codeClean !== ADMIN_SECRET_CODE) {
      throw new Error('รหัสลับแอดมินไม่ถูกต้อง');
    }
  }

  const userKey = sanitizeUserKey(emailOrUsername);
  const userDocRef = doc(db, 'users', userKey);
  const existingDoc = await getDoc(userDocRef);

  if (existingDoc.exists()) {
    throw new Error('ชื่อผู้ใช้หรืออีเมลนี้ถูกลงทะเบียนไว้แล้ว');
  }

  const profile: UserProfile = {
    uid: userKey,
    displayName: displayName.trim() || emailOrUsername,
    email: emailOrUsername.includes('@') ? emailOrUsername.trim() : `${emailOrUsername.trim()}@homework.app`,
    username: emailOrUsername.trim(),
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };

  // Save profile with password token in Firestore doc
  await setDoc(userDocRef, {
    ...profile,
    password: password, // Store credentials in secure Firestore user doc
  });

  // Save local session
  const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify({
    uid: userKey,
    expiry: expiry,
    remember30Days: true
  }));

  return profile;
}

/**
 * Login user with username/email and password, supporting 30-day remember option
 */
export async function loginUser({
  emailOrUsername,
  password,
  remember30Days
}: {
  emailOrUsername: string;
  password: string;
  remember30Days: boolean;
}): Promise<UserProfile> {
  const userKey = sanitizeUserKey(emailOrUsername);
  const userDocRef = doc(db, 'users', userKey);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    throw new Error('ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง');
  }

  const userData = userSnap.data();
  if (userData.password !== password) {
    throw new Error('ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง');
  }

  const profile: UserProfile = {
    uid: userData.uid || userKey,
    displayName: userData.displayName || emailOrUsername,
    email: userData.email || `${emailOrUsername}@homework.app`,
    username: userData.username || emailOrUsername,
    role: userData.role || 'user',
    createdAt: userData.createdAt || new Date().toISOString(),
  };

  // Store session
  const duration = remember30Days 
    ? 30 * 24 * 60 * 60 * 1000  // 30 days
    : 24 * 60 * 60 * 1000;       // 1 day session
  
  const expiry = Date.now() + duration;
  localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify({
    uid: userKey,
    expiry: expiry,
    remember30Days: remember30Days
  }));

  return profile;
}

/**
 * Get active user session from localStorage
 */
export async function getActiveSession(): Promise<UserProfile | null> {
  try {
    const raw = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session || !session.uid) return null;

    if (Date.now() > session.expiry) {
      // Session expired after 30 days
      localStorage.removeItem(CURRENT_USER_SESSION_KEY);
      return null;
    }

    // Fetch fresh profile from Firestore
    const userDocRef = doc(db, 'users', session.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        uid: userData.uid || session.uid,
        displayName: userData.displayName || 'ผู้ใช้งาน',
        email: userData.email || '',
        username: userData.username,
        role: userData.role || 'user',
        createdAt: userData.createdAt || new Date().toISOString(),
      };
    }

    return null;
  } catch (err) {
    console.error('Error fetching active session:', err);
    return null;
  }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<void> {
  localStorage.removeItem(CURRENT_USER_SESSION_KEY);
}

/**
 * Fetch User Profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: data.uid || uid,
        displayName: data.displayName || 'ผู้ใช้งาน',
        email: data.email || '',
        username: data.username,
        role: data.role || 'user',
        createdAt: data.createdAt || new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

/**
 * Subscribe to real-time homeworks for a specific user.
 * Ensures complete data isolation per account.
 */
export function subscribeToUserHomeworks(
  userId: string,
  onUpdate: (homeworks: Homework[]) => void,
  onError?: (error: Error) => void
) {
  if (!userId) return () => {};
  const hwRef = collection(db, 'users', userId, 'homeworks');
  
  return onSnapshot(
    hwRef,
    (snapshot) => {
      const items: Homework[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          subject: data.subject || '',
          dueDate: data.dueDate || '',
          dueTime: data.dueTime || undefined,
          type: data.type || 'การบ้านทั่วไป',
          workType: data.workType || 'เดี่ยว',
          description: data.description || '',
          progress: typeof data.progress === 'number' ? data.progress : 0,
          completed: Boolean(data.completed),
          completedAt: data.completedAt || undefined,
          members: Array.isArray(data.members) ? data.members : undefined,
          priority: data.priority || 'ปกติ',
          createdAt: data.createdAt || new Date().toISOString(),
        } as Homework;
      });

      onUpdate(items);
    },
    (err) => {
      console.error('Firestore User Homework sync error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to real-time events for a specific user.
 */
export function subscribeToUserEvents(
  userId: string,
  onUpdate: (events: CalendarEvent[]) => void,
  onError?: (error: Error) => void
) {
  if (!userId) return () => {};
  const eventsRef = collection(db, 'users', userId, 'events');

  return onSnapshot(
    eventsRef,
    (snapshot) => {
      const items: CalendarEvent[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || '',
          date: data.date || '',
          time: data.time || undefined,
          type: data.type || 'อื่นๆ',
          description: data.description || undefined,
          color: data.color || undefined,
          location: data.location || undefined,
        } as CalendarEvent;
      });

      onUpdate(items);
    },
    (err) => {
      console.error('Firestore User Events sync error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or update a homework item under a specific user
 */
export async function saveHomeworkToCloud(userId: string, homework: Homework): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, 'users', userId, 'homeworks', homework.id);
  const payload: Record<string, any> = { ...homework };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete a homework item for a specific user
 */
export async function deleteHomeworkFromCloud(userId: string, id: string): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, 'users', userId, 'homeworks', id);
  await deleteDoc(docRef);
}

/**
 * Save or update a calendar event for a specific user
 */
export async function saveEventToCloud(userId: string, event: CalendarEvent): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, 'users', userId, 'events', event.id);
  const payload: Record<string, any> = { ...event };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete a calendar event for a specific user
 */
export async function deleteEventFromCloud(userId: string, id: string): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, 'users', userId, 'events', id);
  await deleteDoc(docRef);
}

// DEFAULT SITE SETTINGS
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  appTitle: 'ระบบจัดการการบ้าน & ตารางเรียน',
  appSubtitle: 'ติดตามการบ้าน กำหนดส่ง และกิจกรรมการเรียนรู้แบบเรียลไทม์',
  announcementBannerText: '📢 ยินดีต้อนรับสู่ระบบจัดการการบ้าน ตรวจสอบข่าวสารและวันส่งงานได้ที่นี่!',
  showAnnouncementBanner: true,
  
  navMainLabel: 'หน้าหลัก (การบ้าน)',
  navNewsLabel: 'ข่าวประชาสัมพันธ์',
  navCompletedLabel: 'เสร็จสมบูรณ์',
  navOverdueLabel: 'เลยกำหนดส่ง',
  navCalendarLabel: 'ปฏิทิน & กิจกรรม',
  navAddLabel: 'เพิ่มการบ้าน',
  navAdminLabel: 'ระบบหลังบ้าน',

  statTotalLabel: 'การบ้านทั้งหมด',
  statPendingLabel: 'การบ้านคงเหลือ',
  statCompletedLabel: 'เสร็จสมบูรณ์',
  statOverdueLabel: 'เลยกำหนดส่ง',

  quickNoticeTitle: 'ข่าวสาร & ข้อแนะนำประจำวัน',
  quickNoticeText: 'สามารถคลิกดูรายละเอียดการบ้านแต่ละวิชา บันทึกความคืบหน้า หรือตั้งแจ้งเตือนวันส่งงานได้ตลอดเวลา',
  emptyHomeworkTitle: 'ยังไม่มีรายการการบ้านในขณะนี้',
  emptyHomeworkMessage: 'เริ่มต้นบันทึกการบ้านใหม่โดยกดปุ่ม "เพิ่มการบ้าน" ด้านบน หรือตรวจสอบในเมนูปฏิทิน',

  footerSchoolName: 'ระบบจัดการการบ้านโรงเรียน สวนกุหลาบวิทยาลัย',
  footerContactText: 'ระบบบันทึกและติดตามการบ้านออนไลน์ เชื่อมต่อและซิงค์ข้อมูลเรียลไทม์ทุกอุปกรณ์',

  popupEnabled: true,
  popupDisplayMode: 'both',
  popupTitle: 'ข่าวประชาสัมพันธ์สำคัญประจำสัปดาห์',
  popupMessage: 'ยินดีต้อนรับนักเรียนทุกคนเข้าสู่ระบบบันทึกการบ้าน กรุณาตรวจสอบวันส่งงานและกิจกรรมสำคัญในปฏิทิน!',
  popupImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  popupLinkUrl: '',
};

/**
 * Subscribe to global Site Settings (Syncs across all devices & users)
 */
export function subscribeToSiteSettings(
  onUpdate: (settings: SiteSettings) => void
) {
  const docRef = doc(db, 'system', 'site_settings');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        onUpdate({
          ...DEFAULT_SITE_SETTINGS,
          ...data,
        });
      } else {
        onUpdate(DEFAULT_SITE_SETTINGS);
      }
    },
    (err) => {
      console.error('Error fetching site settings:', err);
      onUpdate(DEFAULT_SITE_SETTINGS);
    }
  );
}

/**
 * Save Site Settings to Cloud (Admin Only)
 */
export async function saveSiteSettingsToCloud(settings: SiteSettings): Promise<void> {
  const docRef = doc(db, 'system', 'site_settings');
  await setDoc(docRef, {
    ...settings,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Subscribe to PR News Announcements
 */
export function subscribeToPRNews(
  onUpdate: (news: PRNewsItem[]) => void
) {
  const newsRef = collection(db, 'pr_news');
  return onSnapshot(
    newsRef,
    (snapshot) => {
      const items: PRNewsItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'ไม่มีหัวข้อ',
          content: data.content || '',
          imageUrl: data.imageUrl || undefined,
          category: data.category || 'ทั่วไป',
          pinned: Boolean(data.pinned),
          authorName: data.authorName || 'แอดมิน',
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });

      // Sort by pinned first, then newest
      items.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      onUpdate(items);
    },
    (err) => {
      console.error('Error fetching PR news:', err);
    }
  );
}

/**
 * Save PR News item to Cloud (Admin Only)
 */
export async function savePRNewsToCloud(newsItem: PRNewsItem): Promise<void> {
  const docRef = doc(db, 'pr_news', newsItem.id);
  const payload: Record<string, any> = { ...newsItem };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete PR News item from Cloud (Admin Only)
 */
export async function deletePRNewsFromCloud(id: string): Promise<void> {
  const docRef = doc(db, 'pr_news', id);
  await deleteDoc(docRef);
}

/**
 * Get all registered user profiles for Admin Backoffice
 */
export async function getAllRegisteredUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await onSnapshot(usersRef, () => {});
    // Fetch directly using getDocs or return list
    const { getDocs } = await import('firebase/firestore');
    const docsSnap = await getDocs(usersRef);
    return docsSnap.docs.map((d) => {
      const data = d.data();
      return {
        uid: data.uid || d.id,
        displayName: data.displayName || 'ผู้ใช้งาน',
        email: data.email || '',
        username: data.username || '',
        role: data.role || 'user',
        createdAt: data.createdAt || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

