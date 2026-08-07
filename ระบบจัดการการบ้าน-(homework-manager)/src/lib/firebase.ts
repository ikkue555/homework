import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Homework, CalendarEvent } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with specific database ID from config if present
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || '(default)'
);

const HOMEWORKS_COLLECTION = 'homeworks';
const EVENTS_COLLECTION = 'events';

/**
 * Subscribe to real-time changes in the 'homeworks' collection.
 * Automatically syncs changes across all browsers and devices in real-time.
 */
export function subscribeToHomeworks(
  onUpdate: (homeworks: Homework[]) => void,
  onError?: (error: Error) => void
) {
  const hwRef = collection(db, HOMEWORKS_COLLECTION);
  
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
      console.error('Firestore Homework sync error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to real-time changes in the 'events' collection.
 */
export function subscribeToEvents(
  onUpdate: (events: CalendarEvent[]) => void,
  onError?: (error: Error) => void
) {
  const eventsRef = collection(db, EVENTS_COLLECTION);

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
      console.error('Firestore Events sync error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or update a homework item in Firestore
 */
export async function saveHomeworkToCloud(homework: Homework): Promise<void> {
  const docRef = doc(db, HOMEWORKS_COLLECTION, homework.id);
  // Clean undefined properties before saving to Firestore
  const payload: Record<string, any> = { ...homework };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete a homework item from Firestore
 */
export async function deleteHomeworkFromCloud(id: string): Promise<void> {
  const docRef = doc(db, HOMEWORKS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Save or update a calendar event in Firestore
 */
export async function saveEventToCloud(event: CalendarEvent): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, event.id);
  const payload: Record<string, any> = { ...event };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete a calendar event from Firestore
 */
export async function deleteEventFromCloud(id: string): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  await deleteDoc(docRef);
}
