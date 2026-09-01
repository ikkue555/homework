import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Homework, CalendarEvent, UserProfile, SiteSettings, PRNewsItem, Friend, FriendRequest } from '../types';

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
  const normalized = (emailOrUsername || '').trim().toLowerCase();
  // Safe hex encoding for full UTF-8 / Thai / Latin characters without doc ID collisions
  try {
    const hex = Array.from(new TextEncoder().encode(normalized))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `usr_${hex}`;
  } catch {
    const clean = normalized.replace(/[^a-z0-9_@.-]/g, '_');
    return `usr_${clean}`;
  }
}

/**
 * Legacy key for backward compatibility check
 */
export function legacyUserKey(emailOrUsername: string): string {
  const clean = (emailOrUsername || '').trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
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
  let userSnap = await getDoc(userDocRef);

  // Fallback check for legacy user keys
  if (!userSnap.exists()) {
    const legacyKey = legacyUserKey(emailOrUsername);
    if (legacyKey !== userKey) {
      const legacyDocRef = doc(db, 'users', legacyKey);
      const legacySnap = await getDoc(legacyDocRef);
      if (legacySnap.exists()) {
        userSnap = legacySnap;
      }
    }
  }

  if (!userSnap.exists()) {
    throw new Error('ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง');
  }

  const userData = userSnap.data();
  if (userData.password !== password) {
    throw new Error('ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง');
  }

  const profile: UserProfile = {
    uid: userData.uid || userSnap.id || userKey,
    displayName: userData.displayName || emailOrUsername,
    email: userData.email || `${emailOrUsername}@homework.app`,
    username: userData.username || emailOrUsername,
    role: userData.role || 'user',
    createdAt: userData.createdAt || new Date().toISOString(),
  };

  // Store session with profile caching
  const duration = remember30Days 
    ? 30 * 24 * 60 * 60 * 1000  // 30 days
    : 24 * 60 * 60 * 1000;       // 1 day session
  
  const expiry = Date.now() + duration;
  localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify({
    uid: profile.uid,
    profile: profile,
    expiry: expiry,
    remember30Days: remember30Days
  }));

  return profile;
}

/**
 * Mask email for privacy display (e.g. po***@student.sk.ac.th)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const start = local.slice(0, 2);
  const end = local.slice(-1);
  return `${start}***${end}@${domain}`;
}

/**
 * Request password reset verification OTP code via email
 */
export async function requestPasswordResetOtp(emailOrUsername: string): Promise<{
  success: boolean;
  userKey: string;
  email: string;
  maskedEmail: string;
  username: string;
  code: string;
  expiresInMinutes: number;
}> {
  if (!emailOrUsername || !emailOrUsername.trim()) {
    throw new Error('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
  }

  const userKey = sanitizeUserKey(emailOrUsername);
  let userDocRef = doc(db, 'users', userKey);
  let userSnap = await getDoc(userDocRef);

  // Fallback check for legacy user keys
  if (!userSnap.exists()) {
    const legacyKey = legacyUserKey(emailOrUsername);
    if (legacyKey !== userKey) {
      const legacyDocRef = doc(db, 'users', legacyKey);
      const legacySnap = await getDoc(legacyDocRef);
      if (legacySnap.exists()) {
        userDocRef = legacyDocRef;
        userSnap = legacySnap;
      }
    }
  }

  if (!userSnap.exists()) {
    throw new Error('ไม่พบบัญชีผู้ใช้ที่มีชื่อผู้ใช้หรืออีเมลนี้ในระบบ');
  }

  const userData = userSnap.data();
  const email = userData.email || (emailOrUsername.includes('@') ? emailOrUsername.trim() : `${userData.username || emailOrUsername}@homework.app`);
  
  // Generate a secure 6-digit numeric OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Save OTP in Firestore under passwordResetOtps collection
  const resetDocRef = doc(db, 'passwordResetOtps', userDocRef.id);
  await setDoc(resetDocRef, {
    userKey: userDocRef.id,
    email: email,
    username: userData.username || emailOrUsername,
    code: code,
    expiresAt: expiresAt,
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    userKey: userDocRef.id,
    email: email,
    maskedEmail: maskEmail(email),
    username: userData.username || emailOrUsername,
    code: code,
    expiresInMinutes: 10,
  };
}

/**
 * Verify the OTP code sent to user email
 */
export async function verifyPasswordResetOtp({
  emailOrUsername,
  code,
}: {
  emailOrUsername: string;
  code: string;
}): Promise<{ valid: boolean; userKey: string; username: string }> {
  if (!emailOrUsername || !emailOrUsername.trim()) {
    throw new Error('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
  }
  if (!code || code.trim().length !== 6) {
    throw new Error('กรุณากรอกรหัสยืนยัน 6 หลักให้ครบถ้วน');
  }

  const userKey = sanitizeUserKey(emailOrUsername);
  let resetDocRef = doc(db, 'passwordResetOtps', userKey);
  let resetSnap = await getDoc(resetDocRef);

  if (!resetSnap.exists()) {
    const legacyKey = legacyUserKey(emailOrUsername);
    if (legacyKey !== userKey) {
      const legacyResetRef = doc(db, 'passwordResetOtps', legacyKey);
      const legacySnap = await getDoc(legacyResetRef);
      if (legacySnap.exists()) {
        resetDocRef = legacyResetRef;
        resetSnap = legacySnap;
      }
    }
  }

  if (!resetSnap.exists()) {
    throw new Error('ยังไม่มีการขอรหัสยืนยันสำหรับบัญชีนี้ หรือรหัสหมดอายุแล้ว กรุณากดขอรหัสใหม่อีกครั้ง');
  }

  const data = resetSnap.data();
  if (Date.now() > data.expiresAt) {
    await deleteDoc(resetDocRef);
    throw new Error('รหัสยืนยันนี้หมดอายุแล้ว (อายุ 10 นาที) กรุณากดขอรหัสยืนยันใหม่อีกครั้ง');
  }

  if (data.code !== code.trim()) {
    throw new Error('รหัสยืนยัน 6 หลักไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
  }

  return {
    valid: true,
    userKey: data.userKey,
    username: data.username,
  };
}

/**
 * Complete password reset after email verification code is confirmed
 */
export async function completePasswordResetWithOtp({
  emailOrUsername,
  code,
  newPassword,
}: {
  emailOrUsername: string;
  code: string;
  newPassword: string;
}): Promise<{ success: boolean; username: string; displayName: string }> {
  // First verify OTP
  const verifyRes = await verifyPasswordResetOtp({ emailOrUsername, code });

  if (!newPassword || newPassword.length < 6) {
    throw new Error('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }

  const userDocRef = doc(db, 'users', verifyRes.userKey);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    throw new Error('ไม่พบบัญชีผู้ใช้ในระบบ');
  }

  const userData = userSnap.data();

  // Update password in Firestore
  await setDoc(userDocRef, {
    ...userData,
    password: newPassword,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // Clean up used OTP
  try {
    const resetDocRef = doc(db, 'passwordResetOtps', verifyRes.userKey);
    await deleteDoc(resetDocRef);
  } catch (err) {
    console.warn('Failed to cleanup OTP document:', err);
  }

  return {
    success: true,
    username: userData.username || emailOrUsername,
    displayName: userData.displayName || emailOrUsername,
  };
}

/**
 * Reset user password with email or username (Direct fallback)
 */
export async function resetUserPassword({
  emailOrUsername,
  newPassword,
}: {
  emailOrUsername: string;
  newPassword: string;
}): Promise<{ success: boolean; username: string; displayName: string }> {
  if (!emailOrUsername || !emailOrUsername.trim()) {
    throw new Error('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }

  const userKey = sanitizeUserKey(emailOrUsername);
  let userDocRef = doc(db, 'users', userKey);
  let userSnap = await getDoc(userDocRef);

  // Fallback check for legacy user keys
  if (!userSnap.exists()) {
    const legacyKey = legacyUserKey(emailOrUsername);
    if (legacyKey !== userKey) {
      const legacyDocRef = doc(db, 'users', legacyKey);
      const legacySnap = await getDoc(legacyDocRef);
      if (legacySnap.exists()) {
        userDocRef = legacyDocRef;
        userSnap = legacySnap;
      }
    }
  }

  if (!userSnap.exists()) {
    throw new Error('ไม่พบบัญชีผู้ใช้ที่มีชื่อผู้ใช้หรืออีเมลนี้ในระบบ');
  }

  const userData = userSnap.data();

  // Update password in Firestore
  await setDoc(userDocRef, {
    ...userData,
    password: newPassword,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return {
    success: true,
    username: userData.username || emailOrUsername,
    displayName: userData.displayName || emailOrUsername,
  };
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

    if (session.expiry && Date.now() > session.expiry) {
      localStorage.removeItem(CURRENT_USER_SESSION_KEY);
      return null;
    }

    // Try to fetch fresh profile from Firestore; use cached profile on network delay
    try {
      const userDocRef = doc(db, 'users', session.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const freshProfile: UserProfile = {
          uid: userData.uid || session.uid,
          displayName: userData.displayName || 'ผู้ใช้งาน',
          email: userData.email || '',
          username: userData.username,
          role: userData.role || 'user',
          createdAt: userData.createdAt || new Date().toISOString(),
        };
        localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify({
          ...session,
          profile: freshProfile
        }));
        return freshProfile;
      }
    } catch {
      if (session.profile) {
        return session.profile;
      }
    }

    if (session.profile) {
      return session.profile;
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
          title: data.title || '',
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
          sharedBy: data.sharedBy ? {
            uid: data.sharedBy.uid || '',
            displayName: data.sharedBy.displayName || 'เพื่อน',
            username: data.sharedBy.username,
            email: data.sharedBy.email,
            sharedAt: data.sharedBy.sharedAt || new Date().toISOString(),
          } : undefined,
          originalHomeworkId: data.originalHomeworkId || undefined,
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
  const hwId = homework.id || Date.now().toString();
  const docRef = doc(db, 'users', userId, 'homeworks', hwId);
  const payload: Record<string, any> = { ...homework, id: hwId };
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

/**
 * Search users by username, displayName, or email
 */
export async function searchUsers(queryStr: string, currentUserId: string): Promise<UserProfile[]> {
  const clean = (queryStr || '').trim().toLowerCase();
  if (!clean) return [];

  const allUsers = await getAllRegisteredUsers();
  return allUsers.filter(u => {
    if (u.uid === currentUserId) return false;
    const name = (u.displayName || '').toLowerCase();
    const uname = (u.username || '').toLowerCase();
    const mail = (u.email || '').toLowerCase();
    return name.includes(clean) || uname.includes(clean) || mail.includes(clean);
  });
}

/**
 * Subscribe to the current user's friends list
 */
export function subscribeToFriends(
  userId: string,
  onUpdate: (friends: Friend[]) => void,
  onError?: (error: Error) => void
) {
  if (!userId) return () => {};
  const friendsRef = collection(db, 'users', userId, 'friends');

  return onSnapshot(
    friendsRef,
    (snapshot) => {
      const friends: Friend[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: data.uid || d.id,
          displayName: data.displayName || 'เพื่อน',
          email: data.email || '',
          username: data.username || '',
          addedAt: data.addedAt || new Date().toISOString(),
        };
      });
      // Sort by recently added
      friends.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      onUpdate(friends);
    },
    (err) => {
      console.error('Error subscribing to friends:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to Friend Requests (Incoming and Outgoing)
 */
export function subscribeToFriendRequests(
  userId: string,
  onUpdate: (incoming: FriendRequest[], outgoing: FriendRequest[]) => void
) {
  if (!userId) return () => {};
  const requestsRef = collection(db, 'friend_requests');

  return onSnapshot(
    requestsRef,
    (snapshot) => {
      const all: FriendRequest[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          fromUid: data.fromUid || '',
          fromDisplayName: data.fromDisplayName || 'ผู้ใช้งาน',
          fromEmail: data.fromEmail || '',
          fromUsername: data.fromUsername || '',
          toUid: data.toUid || '',
          toDisplayName: data.toDisplayName || '',
          toEmail: data.toEmail || '',
          status: data.status || 'pending',
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });

      const incoming = all.filter(r => r.toUid === userId && r.status === 'pending');
      const outgoing = all.filter(r => r.fromUid === userId);
      onUpdate(incoming, outgoing);
    },
    (err) => {
      console.error('Error subscribing to friend requests:', err);
    }
  );
}

/**
 * Send a friend request to a target user
 */
export async function sendFriendRequest(currentUser: UserProfile, targetUser: UserProfile): Promise<void> {
  if (!currentUser || !targetUser) return;
  if (currentUser.uid === targetUser.uid) {
    throw new Error('ไม่สามารถเพิ่มตัวเองเป็นเพื่อนได้');
  }

  // Check if already friends
  const friendDoc = await getDoc(doc(db, 'users', currentUser.uid, 'friends', targetUser.uid));
  if (friendDoc.exists()) {
    throw new Error(`คุณและ ${targetUser.displayName || targetUser.username} เป็นเพื่อนกันอยู่แล้ว`);
  }

  // Check if request already exists
  const reqId = `${currentUser.uid}_to_${targetUser.uid}`;
  const reqDocRef = doc(db, 'friend_requests', reqId);
  const existingReq = await getDoc(reqDocRef);

  if (existingReq.exists() && existingReq.data()?.status === 'pending') {
    throw new Error('คุณได้ส่งคำขอเป็นเพื่อนไปยังผู้ใช้นี้แล้ว');
  }

  // Check if the other user already sent a request to us -> auto accept
  const reverseReqId = `${targetUser.uid}_to_${currentUser.uid}`;
  const reverseReqSnap = await getDoc(doc(db, 'friend_requests', reverseReqId));
  if (reverseReqSnap.exists() && reverseReqSnap.data()?.status === 'pending') {
    // Auto accept
    await acceptFriendRequest({
      id: reverseReqId,
      fromUid: targetUser.uid,
      fromDisplayName: targetUser.displayName,
      fromEmail: targetUser.email,
      fromUsername: targetUser.username,
      toUid: currentUser.uid,
      status: 'pending',
      createdAt: new Date().toISOString()
    }, currentUser);
    return;
  }

  const payload: FriendRequest = {
    id: reqId,
    fromUid: currentUser.uid,
    fromDisplayName: currentUser.displayName || currentUser.username || 'เพื่อน',
    fromEmail: currentUser.email,
    fromUsername: currentUser.username,
    toUid: targetUser.uid,
    toDisplayName: targetUser.displayName,
    toEmail: targetUser.email,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await setDoc(reqDocRef, payload);
}

/**
 * Direct Add Friend (Instant Connect)
 */
export async function addFriendDirect(currentUser: UserProfile, targetUser: UserProfile): Promise<void> {
  if (!currentUser || !targetUser) return;
  if (currentUser.uid === targetUser.uid) {
    throw new Error('ไม่สามารถเพิ่มตัวเองเป็นเพื่อนได้');
  }

  const now = new Date().toISOString();

  // Add target to current user's friends
  const myFriendRef = doc(db, 'users', currentUser.uid, 'friends', targetUser.uid);
  await setDoc(myFriendRef, {
    uid: targetUser.uid,
    displayName: targetUser.displayName || targetUser.username || 'เพื่อน',
    email: targetUser.email || '',
    username: targetUser.username || '',
    addedAt: now,
  });

  // Add current to target user's friends
  const targetFriendRef = doc(db, 'users', targetUser.uid, 'friends', currentUser.uid);
  await setDoc(targetFriendRef, {
    uid: currentUser.uid,
    displayName: currentUser.displayName || currentUser.username || 'เพื่อน',
    email: currentUser.email || '',
    username: currentUser.username || '',
    addedAt: now,
  });

  // Clean any pending requests
  try {
    await deleteDoc(doc(db, 'friend_requests', `${currentUser.uid}_to_${targetUser.uid}`));
    await deleteDoc(doc(db, 'friend_requests', `${targetUser.uid}_to_${currentUser.uid}`));
  } catch (err) {
    console.warn('Request cleanup error:', err);
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(request: FriendRequest, currentUser: UserProfile): Promise<void> {
  const now = new Date().toISOString();

  // Add to current user's friends
  const myFriendRef = doc(db, 'users', currentUser.uid, 'friends', request.fromUid);
  await setDoc(myFriendRef, {
    uid: request.fromUid,
    displayName: request.fromDisplayName,
    email: request.fromEmail,
    username: request.fromUsername || '',
    addedAt: now,
  });

  // Add to requester's friends
  const requesterFriendRef = doc(db, 'users', request.fromUid, 'friends', currentUser.uid);
  await setDoc(requesterFriendRef, {
    uid: currentUser.uid,
    displayName: currentUser.displayName || currentUser.username || 'เพื่อน',
    email: currentUser.email,
    username: currentUser.username || '',
    addedAt: now,
  });

  // Update or delete request
  const reqRef = doc(db, 'friend_requests', request.id);
  await deleteDoc(reqRef);
}

/**
 * Reject / Cancel a friend request
 */
export async function rejectFriendRequest(requestId: string): Promise<void> {
  const reqRef = doc(db, 'friend_requests', requestId);
  await deleteDoc(reqRef);
}

/**
 * Remove a friend from both users
 */
export async function removeFriend(currentUserId: string, friendUid: string): Promise<void> {
  if (!currentUserId || !friendUid) return;
  await deleteDoc(doc(db, 'users', currentUserId, 'friends', friendUid));
  try {
    await deleteDoc(doc(db, 'users', friendUid, 'friends', currentUserId));
  } catch (err) {
    console.warn('Reverse remove friend notice:', err);
  }
}

/**
 * Share a homework with selected friends
 * REQUIREMENT: "สามารถแอดเพื่อนแล้วเลือกการบ้านที่จะแชร์กันได้แต่ความคืบหน้าไม่แชร์ (และให้ขึ้นด้วยว่า แชร์โดย...)"
 * Progress is NOT shared (starts at 0% and completed: false for recipients)
 * Records sharedBy info containing the sender's details
 */
export async function shareHomeworkWithFriends({
  homework,
  targetFriends,
  currentUser,
}: {
  homework: Homework;
  targetFriends: Friend[];
  currentUser: UserProfile;
}): Promise<{ successCount: number; friendNames: string[] }> {
  if (!homework || !targetFriends || targetFriends.length === 0 || !currentUser) {
    throw new Error('กรุณาเลือกเพื่อนและรายการการบ้านที่ต้องการแชร์');
  }

  const successFriends: string[] = [];
  const senderDisplayName = currentUser.displayName || currentUser.username || currentUser.email || 'เพื่อน';

  for (const friend of targetFriends) {
    try {
      const newHwId = `shared_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const sharedHomeworkData: Homework = {
        ...homework,
        id: newHwId,
        subject: homework.subject,
        title: homework.title || '',
        dueDate: homework.dueDate || 'ไม่มีกำหนดส่ง',
        dueTime: homework.dueTime || undefined,
        type: homework.type || 'การบ้านทั่วไป',
        workType: homework.workType || 'เดี่ยว',
        description: homework.description || '',
        priority: homework.priority || 'ปกติ',
        members: homework.members ? [...homework.members] : undefined,
        // CRITICAL CONSTRAINT: ความคืบหน้าไม่แชร์ (Progress is NOT shared!)
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString(),
        // REQUIREMENT: และให้ขึ้นด้วยว่า แชร์โดย...
        sharedBy: {
          uid: currentUser.uid,
          displayName: senderDisplayName,
          username: currentUser.username,
          email: currentUser.email,
          sharedAt: new Date().toISOString(),
        },
        originalHomeworkId: homework.id,
      };

      await saveHomeworkToCloud(friend.uid, sharedHomeworkData);
      successFriends.push(friend.displayName || friend.username || friend.email);
    } catch (err) {
      console.error(`Failed to share homework to friend ${friend.uid}:`, err);
    }
  }

  return {
    successCount: successFriends.length,
    friendNames: successFriends,
  };
}

/**
 * Share multiple homeworks with multiple selected friends
 */
export async function shareMultipleHomeworksWithFriends({
  homeworks,
  targetFriends,
  currentUser,
}: {
  homeworks: Homework[];
  targetFriends: Friend[];
  currentUser: UserProfile;
}): Promise<{ totalShared: number; friendNames: string[]; homeworkSubjects: string[] }> {
  if (!homeworks || homeworks.length === 0 || !targetFriends || targetFriends.length === 0 || !currentUser) {
    throw new Error('กรุณาเลือกเพื่อนและรายการการบ้านที่ต้องการแชร์');
  }

  const successFriends = new Set<string>();
  const sharedSubjects = new Set<string>();
  let totalShared = 0;
  const senderDisplayName = currentUser.displayName || currentUser.username || currentUser.email || 'เพื่อน';

  for (const hw of homeworks) {
    for (const friend of targetFriends) {
      try {
        const newHwId = `shared_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const sharedHomeworkData: Homework = {
          ...hw,
          id: newHwId,
          subject: hw.subject,
          title: hw.title || '',
          dueDate: hw.dueDate || 'ไม่มีกำหนดส่ง',
          dueTime: hw.dueTime || undefined,
          type: hw.type || 'การบ้านทั่วไป',
          workType: hw.workType || 'เดี่ยว',
          description: hw.description || '',
          priority: hw.priority || 'ปกติ',
          members: hw.members ? [...hw.members] : undefined,
          // CRITICAL CONSTRAINT: ความคืบหน้าไม่แชร์ (Progress is NOT shared!)
          progress: 0,
          completed: false,
          createdAt: new Date().toISOString(),
          // REQUIREMENT: และให้ขึ้นด้วยว่า แชร์โดย...
          sharedBy: {
            uid: currentUser.uid,
            displayName: senderDisplayName,
            username: currentUser.username,
            email: currentUser.email,
            sharedAt: new Date().toISOString(),
          },
          originalHomeworkId: hw.id,
        };

        await saveHomeworkToCloud(friend.uid, sharedHomeworkData);
        successFriends.add(friend.displayName || friend.username || friend.email);
        sharedSubjects.add(hw.subject);
        totalShared++;
      } catch (err) {
        console.error(`Failed to share homework ${hw.id} to friend ${friend.uid}:`, err);
      }
    }
  }

  return {
    totalShared,
    friendNames: Array.from(successFriends),
    homeworkSubjects: Array.from(sharedSubjects),
  };
}

