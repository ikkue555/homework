import React, { useState, useEffect, useCallback } from 'react';
import { 
  Homework, 
  CalendarEvent, 
  ActiveTab, 
  HomeworkFilterState, 
  UserProfile, 
  SiteSettings, 
  PRNewsItem, 
  ThemeMode,
  AppNotification,
  ToastItem,
  NotificationType
} from './types';
import { getInitialThemeMode, applyThemeMode } from './lib/theme';
import { 
  getActiveSession, 
  logoutUser, 
  subscribeToUserHomeworks, 
  subscribeToUserEvents, 
  saveHomeworkToCloud, 
  deleteHomeworkFromCloud, 
  saveEventToCloud, 
  deleteEventFromCloud,
  DEFAULT_SITE_SETTINGS,
  subscribeToSiteSettings,
  saveSiteSettingsToCloud,
  subscribeToPRNews,
  savePRNewsToCloud,
  deletePRNewsFromCloud
} from './lib/firebase';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { HomeworkFilters } from './components/HomeworkFilters';
import { HomeworkCard } from './components/HomeworkCard';
import { AddHomeworkForm } from './components/AddHomeworkForm';
import { CompletedHomeworkView } from './components/CompletedHomeworkView';
import { OverdueHomeworkView } from './components/OverdueHomeworkView';
import { CalendarView } from './components/CalendarView';
import { AddEventModal } from './components/AddEventModal';
import { HomeworkDetailModal } from './components/HomeworkDetailModal';
import { AuthScreen } from './components/AuthScreen';
import { PRNewsView } from './components/PRNewsView';
import { AdminBackofficeView } from './components/AdminBackofficeView';
import { PRPopupModal } from './components/PRPopupModal';
import { Footer } from './components/Footer';
import { ScrollInteractiveHelper } from './components/ScrollInteractiveHelper';
import { ToastContainer } from './components/ToastContainer';
import { NotificationBellModal } from './components/NotificationBellModal';
import { PlusCircle, CheckCircle2, Loader2, Plus } from 'lucide-react';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Homeworks state - populated from Firebase
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [, setIsHomeworksLoading] = useState<boolean>(true);

  // Calendar Events state - populated from Firebase
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // PR News state - populated from Firebase
  const [newsList, setNewsList] = useState<PRNewsItem[]>([]);

  // Site Settings state - populated from Firebase
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // PR Popup Modal State & Auto-open upon entering website
  const [isPRPopupOpen, setIsPRPopupOpen] = useState(false);
  const [hasCheckedPopup, setHasCheckedPopup] = useState(false);

  // Notification Bell and Toasts State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('homework_app_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Theme mode state (Light / Dark)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialThemeMode());

  const [activeTab, setActiveTab] = useState<ActiveTab>('main');
  const [selectedDetailHomework, setSelectedDetailHomework] = useState<Homework | null>(null);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);

  // Add Event Modal
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventInitialDate, setEventInitialDate] = useState<string | undefined>();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Filter State
  const [filters, setFilters] = useState<HomeworkFilterState>({
    searchQuery: '',
    subject: '',
    dueDateFilter: 'all',
    type: '',
    workType: 'all',
    sortBy: 'dueDate_asc',
  });

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('homework_app_notifications', JSON.stringify(notifications.slice(0, 100)));
    } catch (err) {
      console.error('Failed to cache notifications:', err);
    }
  }, [notifications]);

  // Toast & Notification Dispatch Helper
  const addToast = useCallback((
    title: string, 
    message: string, 
    type: NotificationType = 'success', 
    options?: { duration?: number; actionTab?: ActiveTab; homeworkId?: string; recordNotification?: boolean }
  ) => {
    const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7);
    const duration = options?.duration ?? 5000;
    
    const newToast: ToastItem = {
      id,
      title,
      message,
      type,
      duration,
      createdAt: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    // Save to persistent notification inbox unless explicitly excluded
    if (options?.recordNotification !== false) {
      const newNotif: AppNotification = {
        id,
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        actionTab: options?.actionTab,
        homeworkId: options?.homeworkId,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Apply Theme Mode on load & change
  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  const handleToggleThemeMode = () => {
    setThemeMode((prev) => {
      const nextMode = prev === 'dark' ? 'light' : 'dark';
      addToast(
        'เปลี่ยนธีมสำเร็จ ✨',
        nextMode === 'dark' ? 'สลับเข้าสู่โหมดมืด (Dark Mode) เรียบร้อย' : 'สลับเข้าสู่โหมดสว่าง (Light Mode) เรียบร้อย',
        'info',
        { recordNotification: false }
      );
      return nextMode;
    });
  };

  // Check auth session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getActiveSession();
        setUserProfile(session);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  // Subscribe to site settings
  useEffect(() => {
    const unsubscribe = subscribeToSiteSettings((settings) => {
      setSiteSettings(settings);
    });
    return () => unsubscribe();
  }, []);

  // Auto-open PR Popup upon entering website if enabled
  useEffect(() => {
    if (siteSettings && siteSettings.popupEnabled && !hasCheckedPopup) {
      const isDismissed = sessionStorage.getItem('pr_popup_dismissed_session');
      if (!isDismissed) {
        // Small delay for smooth mounting
        const timer = setTimeout(() => {
          setIsPRPopupOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
      setHasCheckedPopup(true);
    }
  }, [siteSettings, hasCheckedPopup]);

  const handleClosePRPopup = () => {
    setIsPRPopupOpen(false);
    sessionStorage.setItem('pr_popup_dismissed_session', 'true');
    setHasCheckedPopup(true);
  };

  // Subscribe to PR News
  useEffect(() => {
    const unsubscribe = subscribeToPRNews((news) => {
      setNewsList(news);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Homeworks & Events when user is logged in
  useEffect(() => {
    if (!userProfile) {
      setHomeworks([]);
      setEvents([]);
      setIsHomeworksLoading(false);
      return;
    }

    setIsHomeworksLoading(true);

    const unsubHomeworks = subscribeToUserHomeworks(
      userProfile.uid,
      (data) => {
        setHomeworks(data);
        setIsHomeworksLoading(false);
      },
      (error) => {
        console.error("Homeworks subscription error:", error);
        setIsHomeworksLoading(false);
      }
    );

    const unsubEvents = subscribeToUserEvents(
      userProfile.uid,
      (data) => {
        setEvents(data);
      },
      (error) => {
        console.error("Events subscription error:", error);
      }
    );

    return () => {
      unsubHomeworks();
      unsubEvents();
    };
  }, [userProfile]);

  // Automatic Due Today & Overdue alert on entry
  useEffect(() => {
    if (isAuthChecking || !userProfile || homeworks.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const sessionAlertKey = `hw_entry_alert_${userProfile.uid}_${todayStr}`;
    const alreadyAlerted = sessionStorage.getItem(sessionAlertKey);

    if (!alreadyAlerted) {
      const remaining = homeworks.filter(h => !h.completed && (h.progress || 0) < 100);
      const overdue = remaining.filter(h => h.dueDate && h.dueDate < todayStr && h.dueDate !== 'ไม่มีกำหนดส่ง');
      const dueToday = remaining.filter(h => h.dueDate === todayStr);

      if (overdue.length > 0) {
        setTimeout(() => {
          addToast(
            '⚠️ มีการบ้านเลยกำหนดส่ง!',
            `มีงานค้างที่เลยกำหนด ${overdue.length} วิชา (${overdue.map(h => h.subject).slice(0, 2).join(', ')}${overdue.length > 2 ? '...' : ''}) กรุณาตรวจสอบและส่งงาน`,
            'error',
            { actionTab: 'overdue', duration: 7000 }
          );
        }, 800);
      }

      if (dueToday.length > 0) {
        setTimeout(() => {
          addToast(
            '📅 มีการบ้านต้องส่งวันนี้!',
            `คุณมีการบ้านต้องส่งวันนี้ ${dueToday.length} วิชา: ${dueToday.map(h => h.subject).slice(0, 3).join(', ')}${dueToday.length > 3 ? '...' : ''}`,
            'warning',
            { actionTab: 'main', duration: 7000 }
          );
        }, overdue.length > 0 ? 2000 : 800);
      }

      sessionStorage.setItem(sessionAlertKey, 'true');
    }
  }, [homeworks, userProfile, isAuthChecking, addToast]);

  // Handle Logout
  const handleLogout = async () => {
    await logoutUser();
    setUserProfile(null);
    setActiveTab('main');
    addToast('ออกจากระบบเรียบร้อย', 'คุณได้ออกจากระบบเรียบร้อยแล้ว', 'info', { recordNotification: false });
  };

  // Handle PR news actions
  const handleAddNews = async (item: Omit<PRNewsItem, 'id' | 'createdAt' | 'authorName'>) => {
    if (!userProfile) return;
    const newItem: PRNewsItem = {
      ...item,
      id: Date.now().toString(),
      authorName: userProfile.displayName || 'แอดมิน',
      createdAt: new Date().toISOString(),
    };
    await savePRNewsToCloud(newItem);
    addToast(
      'เผยแพร่ข่าวประชาสัมพันธ์สำเร็จ 📢',
      `ข่าวเรื่อง "${newItem.title}" ถูกเผยแพร่ลงในระบบเรียบร้อยแล้ว`,
      'success',
      { actionTab: 'news' }
    );
  };

  const handleDeletePRNews = async (id: string) => {
    await deletePRNewsFromCloud(id);
    addToast('ลบข่าวประชาสัมพันธ์เรียบร้อย', 'ลบข่าวประชาสัมพันธ์ออกจากระบบแล้ว', 'info', { actionTab: 'news' });
  };

  // Handle Site settings save
  const handleSaveSiteSettings = async (settings: SiteSettings) => {
    if (!userProfile || userProfile.role !== 'admin') return;
    await saveSiteSettingsToCloud(settings);
    addToast(
      'บันทึกการตั้งค่าระบบสำเร็จ! ⚙️',
      'การตั้งค่าระบบหลังบ้านและชื่อระบบได้รับการอัปเดตเรียบร้อยแล้ว',
      'success',
      { actionTab: 'admin' }
    );
  };

  // Homework CRUD Handlers
  const handleSaveHomework = async (savedHw: Omit<Homework, 'id' | 'createdAt'> & { id?: string; createdAt?: string }, existingId?: string) => {
    if (!userProfile) return;
    const finalHw: Homework = {
      ...savedHw,
      id: existingId || savedHw.id || Date.now().toString(),
      createdAt: savedHw.createdAt || new Date().toISOString(),
    };
    await saveHomeworkToCloud(userProfile.uid, finalHw);
    setEditingHomework(null);
    setActiveTab('main');

    if (existingId) {
      addToast(
        'แก้ไขการบ้านสำเร็จ ✨',
        `บันทึกข้อมูลวิชา ${finalHw.subject} เรียบร้อยแล้ว`,
        'success',
        { actionTab: 'main', homeworkId: finalHw.id }
      );
    } else {
      addToast(
        'เพิ่มการบ้านใหม่สำเร็จ! 📚',
        `เพิ่มวิชา ${finalHw.subject} ${finalHw.dueDate ? `(กำหนดส่ง ${finalHw.dueDate})` : ''} เข้าระบบเรียบร้อย`,
        'success',
        { actionTab: 'main', homeworkId: finalHw.id }
      );
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (!userProfile) return;
    const target = homeworks.find(h => h.id === id);
    if (confirm('คุณต้องการลบการบ้านนี้ใช่หรือไม่?')) {
      await deleteHomeworkFromCloud(userProfile.uid, id);
      addToast(
        'ลบการบ้านเรียบร้อย',
        `ลบข้อมูลวิชา ${target?.subject || 'การบ้าน'} ออกจากระบบแล้ว`,
        'info',
        { actionTab: 'main' }
      );
    }
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
    if (!userProfile) return;
    const target = homeworks.find(h => h.id === id);
    if (!target) return;

    const updated: Homework = {
      ...target,
      progress: newProgress,
      completed: newProgress === 100 ? true : (newProgress < 100 && target.completed ? false : target.completed),
    };

    await saveHomeworkToCloud(userProfile.uid, updated);

    if (newProgress === 100) {
      addToast(
        'การบ้านเสร็จสมบูรณ์ 100%! 🎉',
        `วิชา ${target.subject} ทำเสร็จเรียบร้อยและย้ายไปแท็บเสร็จแล้ว`,
        'success',
        { actionTab: 'completed', homeworkId: target.id }
      );
    } else {
      addToast(
        'อัปเดตความคืบหน้า',
        `วิชา ${target.subject} ความคืบหน้าอยู่ที่ ${newProgress}%`,
        'info',
        { recordNotification: false }
      );
    }
  };

  const handleToggleComplete = async (id: string) => {
    if (!userProfile) return;
    const target = homeworks.find(h => h.id === id);
    if (!target) return;

    const newCompleted = !target.completed;
    const updated: Homework = {
      ...target,
      completed: newCompleted,
      progress: newCompleted ? 100 : (target.progress === 100 ? 0 : target.progress),
    };

    await saveHomeworkToCloud(userProfile.uid, updated);

    if (newCompleted) {
      addToast(
        'ทำงานเสร็จสมบูรณ์แล้ว! 🎉',
        `วิชา ${target.subject} ${target.title ? `(${target.title})` : ''} ถูกบันทึกว่าทำเสร็จแล้ว`,
        'success',
        { actionTab: 'completed', homeworkId: target.id }
      );
    } else {
      addToast(
        'เปลี่ยนสถานะการบ้าน',
        `ย้ายวิชา ${target.subject} กลับมาเป็นกำลังดำเนินการ`,
        'info',
        { actionTab: 'main', homeworkId: target.id }
      );
    }
  };

  const handleEditHomeworkClick = (hw: Homework) => {
    setEditingHomework(hw);
    setActiveTab('add');
  };

  // Event Handlers
  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id'>, id?: string) => {
    if (!userProfile) return;
    const eventItem: CalendarEvent = {
      ...eventData,
      id: id || Date.now().toString(),
    };
    await saveEventToCloud(userProfile.uid, eventItem);
    setIsAddEventOpen(false);
    setEditingEvent(null);

    if (id) {
      addToast(
        'แก้ไขกิจกรรมสำเร็จ 📅',
        `บันทึกกิจกรรม "${eventItem.title}" เรียบร้อยแล้ว`,
        'success',
        { actionTab: 'calendar' }
      );
    } else {
      addToast(
        'เพิ่มกิจกรรมลงปฏิทินสำเร็จ! 📅',
        `เพิ่มกิจกรรม "${eventItem.title}" (วันที่ ${eventItem.date}) เข้าระบบเรียบร้อย`,
        'success',
        { actionTab: 'calendar' }
      );
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!userProfile) return;
    if (confirm('คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?')) {
      await deleteEventFromCloud(userProfile.uid, id);
      addToast('ลบกิจกรรมเรียบร้อย', 'ลบกิจกรรมออกจากปฏิทินแล้ว', 'info', { actionTab: 'calendar' });
    }
  };

  const handleOpenAddEventModal = (dateStr?: string) => {
    setEventInitialDate(dateStr);
    setEditingEvent(null);
    setIsAddEventOpen(true);
  };

  const handleEditEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventInitialDate(event.date);
    setIsAddEventOpen(true);
  };

  // List calculations
  const today = new Date().toISOString().split('T')[0];

  const safeHomeworks = (homeworks || []).filter(Boolean);
  const mainRemainingList = safeHomeworks.filter(h => !h.completed && (h.progress || 0) < 100);
  const completedList = safeHomeworks.filter(h => h.completed || h.progress === 100);
  const overdueList = safeHomeworks.filter(h => !h.completed && (h.progress || 0) < 100 && h.dueDate && h.dueDate < today && h.dueDate !== 'ไม่มีกำหนดส่ง');

  // Available subjects for filtering
  const availableSubjects = Array.from(new Set(safeHomeworks.map(h => h.subject).filter(Boolean))) as string[];

  // Filtered and Sorted Main list
  const filteredMainHomeworks = mainRemainingList.filter(hw => {
    if (!hw) return false;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchSubject = (hw.subject || '').toLowerCase().includes(q);
      const matchDesc = (hw.description || '').toLowerCase().includes(q);
      const matchTitle = (hw.title || '').toLowerCase().includes(q);
      if (!matchSubject && !matchDesc && !matchTitle) return false;
    }

    if (filters.subject && hw.subject !== filters.subject) return false;
    if (filters.workType !== 'all' && hw.workType !== filters.workType) return false;

    if (filters.dueDateFilter !== 'all') {
      const hwDue = hw.dueDate || '';
      const now = new Date();
      if (filters.dueDateFilter === 'today') {
        if (hwDue !== today) return false;
      } else if (filters.dueDateFilter === 'this_week') {
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (!hwDue || hwDue < today || hwDue > next7Days || hwDue === 'ไม่มีกำหนดส่ง') return false;
      } else if (filters.dueDateFilter === 'this_month') {
        const currentMonth = now.toISOString().slice(0, 7);
        if (!hwDue || !hwDue.startsWith(currentMonth)) return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'dueDate_asc') {
      return (a.dueDate || '').localeCompare(b.dueDate || '');
    }
    if (filters.sortBy === 'dueDate_desc') {
      return (b.dueDate || '').localeCompare(a.dueDate || '');
    }
    if (filters.sortBy === 'progress_asc') {
      return (a.progress || 0) - (b.progress || 0);
    }
    if (filters.sortBy === 'progress_desc') {
      return (b.progress || 0) - (a.progress || 0);
    }
    if (filters.sortBy === 'subject') {
      return (a.subject || '').localeCompare(b.subject || '');
    }
    return 0;
  });

  // Auth checking screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative transition-colors">
        <div className="text-center space-y-3 relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg animate-pop">
          <Loader2 className="w-10 h-10 text-sky-600 dark:text-sky-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 font-heading">
            กำลังโหลดข้อมูลระบบ...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Authentication Screen
  if (!userProfile) {
    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <ScrollInteractiveHelper />

        {/* Global Toast Notifications (Top Right) */}
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

        {/* Global PR Popup Modal upon entering website */}
        <PRPopupModal 
          isOpen={isPRPopupOpen} 
          onClose={handleClosePRPopup} 
          siteSettings={siteSettings} 
        />
        <AuthScreen 
          onSuccess={(profile) => setUserProfile(profile)} 
          siteSettings={siteSettings}
          themeMode={themeMode}
          onToggleThemeMode={handleToggleThemeMode}
        />
      </div>
    );
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative selection:bg-sky-500 selection:text-white">
      {/* Scroll Helpers (Top Progress Bar & Smooth Scroll-To-Top) */}
      <ScrollInteractiveHelper />

      {/* Global Toast Notifications (Top Right - auto dismiss in 5s) */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Global Notifications History Modal Window */}
      <NotificationBellModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onMarkAsRead={handleMarkNotificationAsRead}
        onClearAll={handleClearAllNotifications}
        onDeleteNotification={handleDeleteNotification}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Global PR Popup Modal (Configured from Admin settings) */}
      <PRPopupModal 
        isOpen={isPRPopupOpen} 
        onClose={handleClosePRPopup} 
        siteSettings={siteSettings} 
      />

      {/* Global Application Header with Theme Mode toggle & Notifications */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'add') setEditingHomework(null);
          setActiveTab(tab);
        }}
        remainingCount={mainRemainingList.length}
        completedCount={completedList.length}
        overdueCount={overdueList.length}
        userProfile={userProfile}
        siteSettings={siteSettings}
        themeMode={themeMode}
        onToggleThemeMode={handleToggleThemeMode}
        onOpenPRPopup={() => setIsPRPopupOpen(true)}
        onLogout={handleLogout}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {/* Tab: Main View */}
        {activeTab === 'main' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Summary Bar */}
            <StatsOverview
              homeworks={homeworks}
              siteSettings={siteSettings}
              onTabSelect={(tab) => setActiveTab(tab)}
            />

            {/* Filters & Quick Add */}
            <HomeworkFilters
              filters={filters}
              setFilters={setFilters}
              availableSubjects={availableSubjects}
              totalResults={filteredMainHomeworks.length}
              onAddNewHomework={() => {
                setEditingHomework(null);
                setActiveTab('add');
              }}
            />

            {/* Cards Grid */}
            {filteredMainHomeworks.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 my-8 shadow-xs transition-colors animate-pop">
                <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-3xl flex items-center justify-center mx-auto mb-3 animate-float">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100">
                  {homeworks.length === 0
                    ? (siteSettings?.emptyHomeworkTitle || 'ยังไม่มีรายการการบ้านในขณะนี้')
                    : mainRemainingList.length === 0
                    ? 'ไม่มีการบ้านค้างอยู่แล้ว!'
                    : 'ไม่พบการบ้านตรงตามตัวกรอง'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  {homeworks.length === 0
                    ? (siteSettings?.emptyHomeworkMessage || 'กดปุ่มเพิ่มการบ้านใหม่ด้านล่างเพื่อเริ่มบันทึกการบ้านประจำตัวของคุณ ข้อมูลจะถูกบันทึกแยกต่างหากเฉพาะบัญชีนี้')
                    : mainRemainingList.length === 0
                    ? 'ยินดีด้วย! คุณทำการบ้านครบทุกรายการแล้ว หรือกดเพิ่มการบ้านใหม่ได้ทันที'
                    : 'ลองปรับเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูรายการทั้งหมด'}
                </p>
                <button
                  onClick={() => {
                    setEditingHomework(null);
                    setActiveTab('add');
                  }}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl font-semibold font-heading text-xs shadow-sm inline-flex items-center space-x-1.5 cursor-pointer btn-interactive"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ เพิ่มการบ้านใหม่</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {filteredMainHomeworks.map((hw) => (
                  <HomeworkCard
                    key={hw.id}
                    homework={hw}
                    onUpdateProgress={handleUpdateProgress}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditHomeworkClick}
                    onDelete={handleDeleteHomework}
                    onViewDetail={setSelectedDetailHomework}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: PR News View */}
        {activeTab === 'news' && (
          <div className="animate-fadeIn">
            <PRNewsView
              newsList={newsList}
              userProfile={userProfile}
              onAddNews={handleAddNews}
              onDeleteNews={handleDeletePRNews}
              onOpenPRPopup={() => setIsPRPopupOpen(true)}
            />
          </div>
        )}

        {/* Tab: Admin Backoffice */}
        {activeTab === 'admin' && userProfile?.role === 'admin' && (
          <div className="animate-fadeIn">
            <AdminBackofficeView
              userProfile={userProfile}
              siteSettings={siteSettings}
              onSaveSettings={handleSaveSiteSettings}
              newsList={newsList}
              onAddNews={handleAddNews}
              onDeleteNews={handleDeletePRNews}
            />
          </div>
        )}

        {/* Tab: Completed Homework List */}
        {activeTab === 'completed' && (
          <div className="animate-fadeIn">
            <CompletedHomeworkView
              homeworks={homeworks}
              onUpdateProgress={handleUpdateProgress}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditHomeworkClick}
              onDelete={handleDeleteHomework}
              onViewDetail={setSelectedDetailHomework}
              onBackToMain={() => setActiveTab('main')}
            />
          </div>
        )}

        {/* Tab: Overdue Homework List */}
        {activeTab === 'overdue' && (
          <div className="animate-fadeIn">
            <OverdueHomeworkView
              homeworks={homeworks}
              onUpdateProgress={handleUpdateProgress}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditHomeworkClick}
              onDelete={handleDeleteHomework}
              onViewDetail={setSelectedDetailHomework}
              onBackToMain={() => setActiveTab('main')}
            />
          </div>
        )}

        {/* Tab: Add or Edit Homework Form */}
        {activeTab === 'add' && (
          <div className="animate-fadeIn">
            <AddHomeworkForm
              onSave={handleSaveHomework}
              onCancel={() => {
                setEditingHomework(null);
                setActiveTab('main');
              }}
              editingHomework={editingHomework}
            />
          </div>
        )}

        {/* Tab: Calendar & Events */}
        {activeTab === 'calendar' && (
          <div className="animate-fadeIn">
            <CalendarView
              homeworks={homeworks}
              events={events}
              onAddEventClick={handleOpenAddEventModal}
              onHomeworkClick={setSelectedDetailHomework}
              onEditEvent={handleEditEventClick}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        )}
      </main>

      {/* Global Floating Action Button (FAB) for Desktop / Tablet - Compact & Clean */}
      {activeTab !== 'add' && (
        <button
          onClick={() => {
            setEditingHomework(null);
            setActiveTab('add');
          }}
          className="hidden md:flex fixed bottom-5 right-5 z-40 items-center space-x-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-3.5 py-2 rounded-xl shadow-md cursor-pointer font-heading font-semibold text-xs border border-white/10 btn-interactive"
          title="เพิ่มการบ้านใหม่"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="tracking-wide">เพิ่มการบ้าน</span>
        </button>
      )}

      {/* Global Site Footer */}
      <Footer siteSettings={siteSettings} />

      {/* Detail Modal */}
      <HomeworkDetailModal
        homework={selectedDetailHomework}
        onClose={() => setSelectedDetailHomework(null)}
        onUpdateProgress={handleUpdateProgress}
        onToggleComplete={handleToggleComplete}
        onEdit={(hw) => {
          setSelectedDetailHomework(null);
          handleEditHomeworkClick(hw);
        }}
        onDelete={(id) => {
          handleDeleteHomework(id);
          setSelectedDetailHomework(null);
        }}
      />

      {/* Add or Edit Event Modal */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => {
          setIsAddEventOpen(false);
          setEditingEvent(null);
        }}
        onSaveEvent={handleSaveEvent}
        initialDate={eventInitialDate}
        editingEvent={editingEvent}
      />
    </div>
  );
}
