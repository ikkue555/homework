import React, { useState, useEffect } from 'react';
import { Homework, CalendarEvent, ActiveTab, HomeworkFilterState, UserProfile, SiteSettings, PRNewsItem, ThemeId } from './types';
import { getStoredTheme, applyTheme } from './lib/themes';
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
import { ThemeSwitcherModal } from './components/ThemeSwitcherModal';
import { ThemeBackgroundDecoration } from './components/ThemeBackgroundDecoration';
import { Footer } from './components/Footer';
import { PlusCircle, CheckCircle2, Loader2, Plus } from 'lucide-react';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Homeworks state - populated from Firebase
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isHomeworksLoading, setIsHomeworksLoading] = useState<boolean>(true);

  // Calendar Events state - populated from Firebase
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // PR News state - populated from Firebase
  const [newsList, setNewsList] = useState<PRNewsItem[]>([]);

  // Site Settings state - populated from Firebase
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => getStoredTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [showFloatingIcons, setShowFloatingIcons] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme_floating_icons');
    return saved !== null ? saved === 'true' : true;
  });

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

  // Apply Theme on load & change
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const handleSelectTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
  };

  const handleToggleFloatingIcons = (show: boolean) => {
    setShowFloatingIcons(show);
    localStorage.setItem('theme_floating_icons', String(show));
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

  // Handle Logout
  const handleLogout = async () => {
    await logoutUser();
    setUserProfile(null);
    setActiveTab('main');
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
  };

  const handleDeletePRNews = async (id: string) => {
    await deletePRNewsFromCloud(id);
  };

  // Handle Site settings save
  const handleSaveSiteSettings = async (settings: SiteSettings) => {
    if (!userProfile || userProfile.role !== 'admin') return;
    await saveSiteSettingsToCloud(settings);
  };

  // Homework CRUD Handlers
  const handleSaveHomework = async (savedHw: Homework) => {
    if (!userProfile) return;
    await saveHomeworkToCloud(userProfile.uid, savedHw);
    setEditingHomework(null);
    setActiveTab('main');
  };

  const handleDeleteHomework = async (id: string) => {
    if (!userProfile) return;
    if (confirm('คุณต้องการลบการบ้านนี้ใช่หรือไม่?')) {
      await deleteHomeworkFromCloud(userProfile.uid, id);
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
  };

  const handleDeleteEvent = async (id: string) => {
    if (!userProfile) return;
    if (confirm('คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?')) {
      await deleteEventFromCloud(userProfile.uid, id);
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

  const mainRemainingList = homeworks.filter(h => !h.completed && h.progress < 100);
  const completedList = homeworks.filter(h => h.completed || h.progress === 100);
  const overdueList = homeworks.filter(h => !h.completed && h.progress < 100 && h.dueDate < today);

  // Available subjects for filtering
  const availableSubjects = Array.from(new Set(homeworks.map(h => h.subject))).filter(Boolean);

  // Filtered and Sorted Main list
  const filteredMainHomeworks = mainRemainingList.filter(hw => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchSubject = hw.subject.toLowerCase().includes(q);
      const matchDesc = hw.description.toLowerCase().includes(q);
      const matchTitle = hw.title ? hw.title.toLowerCase().includes(q) : false;
      if (!matchSubject && !matchDesc && !matchTitle) return false;
    }

    if (filters.subject && hw.subject !== filters.subject) return false;
    if (filters.workType !== 'all' && hw.workType !== filters.workType) return false;

    if (filters.dueDateFilter !== 'all') {
      const hwDue = hw.dueDate;
      const now = new Date();
      if (filters.dueDateFilter === 'today') {
        if (hwDue !== today) return false;
      } else if (filters.dueDateFilter === 'this_week') {
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (hwDue < today || hwDue > next7Days) return false;
      } else if (filters.dueDateFilter === 'this_month') {
        const currentMonth = now.toISOString().slice(0, 7);
        if (!hwDue.startsWith(currentMonth)) return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'dueDate_asc') {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (filters.sortBy === 'dueDate_desc') {
      return b.dueDate.localeCompare(a.dueDate);
    }
    if (filters.sortBy === 'progress_asc') {
      return a.progress - b.progress;
    }
    if (filters.sortBy === 'progress_desc') {
      return b.progress - a.progress;
    }
    if (filters.sortBy === 'subject') {
      return a.subject.localeCompare(b.subject);
    }
    return 0;
  });

  // Auth checking screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-sky-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600 font-heading">
            กำลังโหลดข้อมูลระบบ...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Authentication Screen
  if (!userProfile) {
    return (
      <div className="relative min-h-screen bg-slate-50">
        <ThemeBackgroundDecoration 
          currentTheme={currentTheme} 
          showFloatingIcons={showFloatingIcons} 
        />
        <AuthScreen 
          onSuccess={(profile) => setUserProfile(profile)} 
          siteSettings={siteSettings}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 transition-colors relative selection:bg-sky-500 selection:text-white">
      {/* Background Floating/Theme Animation Particles */}
      <ThemeBackgroundDecoration 
        currentTheme={currentTheme} 
        showFloatingIcons={showFloatingIcons} 
      />

      {/* Global PR Popup Modal (Configured from Admin settings) */}
      <PRPopupModal siteSettings={siteSettings} />

      {/* Global Application Header */}
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
        currentTheme={currentTheme}
        onOpenThemeSwitcher={() => setIsThemeModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Tab: Main View */}
        {activeTab === 'main' && (
          <div className="space-y-6">
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
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 my-8 shadow-xs">
                <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-800">
                  {homeworks.length === 0
                    ? (siteSettings?.emptyHomeworkTitle || 'ยังไม่มีรายการการบ้านในขณะนี้')
                    : mainRemainingList.length === 0
                    ? 'ไม่มีการบ้านค้างอยู่แล้ว!'
                    : 'ไม่พบการบ้านตรงตามตัวกรอง'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
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
                  className="mt-5 px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl font-bold font-heading text-xs shadow-md shadow-sky-600/20 inline-flex items-center space-x-2 cursor-pointer transition-all hover:scale-105"
                >
                  <PlusCircle className="w-4 h-4" />
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
          <PRNewsView
            newsList={newsList}
            userProfile={userProfile}
            onAddNews={handleAddNews}
            onDeleteNews={handleDeletePRNews}
          />
        )}

        {/* Tab: Admin Backoffice */}
        {activeTab === 'admin' && userProfile?.role === 'admin' && (
          <AdminBackofficeView
            userProfile={userProfile}
            siteSettings={siteSettings}
            onSaveSettings={handleSaveSiteSettings}
            newsList={newsList}
            onAddNews={handleAddNews}
            onDeleteNews={handleDeletePRNews}
          />
        )}

        {/* Tab: Completed Homework List */}
        {activeTab === 'completed' && (
          <CompletedHomeworkView
            homeworks={homeworks}
            onUpdateProgress={handleUpdateProgress}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditHomeworkClick}
            onDelete={handleDeleteHomework}
            onViewDetail={setSelectedDetailHomework}
            onBackToMain={() => setActiveTab('main')}
          />
        )}

        {/* Tab: Overdue Homework List */}
        {activeTab === 'overdue' && (
          <OverdueHomeworkView
            homeworks={homeworks}
            onUpdateProgress={handleUpdateProgress}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditHomeworkClick}
            onDelete={handleDeleteHomework}
            onViewDetail={setSelectedDetailHomework}
            onBackToMain={() => setActiveTab('main')}
          />
        )}

        {/* Tab: Add or Edit Homework Form */}
        {activeTab === 'add' && (
          <AddHomeworkForm
            onSave={handleSaveHomework}
            onCancel={() => {
              setEditingHomework(null);
              setActiveTab('main');
            }}
            editingHomework={editingHomework}
          />
        )}

        {/* Tab: Calendar & Events */}
        {activeTab === 'calendar' && (
          <CalendarView
            homeworks={homeworks}
            events={events}
            onAddEventClick={handleOpenAddEventModal}
            onHomeworkClick={setSelectedDetailHomework}
            onEditEvent={handleEditEventClick}
            onDeleteEvent={handleDeleteEvent}
            currentTheme={currentTheme}
          />
        )}
      </main>

      {/* Global Floating Action Button (FAB) for Instant Access to Add Homework on all devices */}
      {activeTab !== 'add' && (
        <button
          onClick={() => {
            setEditingHomework(null);
            setActiveTab('add');
          }}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-xl shadow-sky-600/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer font-heading font-bold text-xs sm:text-sm border border-white/20"
          title="เพิ่มการบ้านใหม่"
        >
          <Plus className="w-5 h-5" />
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
      {/* Theme Switcher Modal */}
      <ThemeSwitcherModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        showFloatingIcons={showFloatingIcons}
        onToggleFloatingIcons={handleToggleFloatingIcons}
      />
    </div>
  );
}
