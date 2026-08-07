import React, { useState, useEffect } from 'react';
import { Homework, CalendarEvent, ActiveTab, HomeworkFilterState } from './types';
import { 
  loadStoredHomeworks, 
  saveStoredHomeworks, 
  loadStoredEvents, 
  saveStoredEvents 
} from './data/mockData';
import { 
  subscribeToHomeworks, 
  subscribeToEvents, 
  saveHomeworkToCloud, 
  deleteHomeworkFromCloud, 
  saveEventToCloud, 
  deleteEventFromCloud 
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
import { BookOpen, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [homeworks, setHomeworks] = useState<Homework[]>(loadStoredHomeworks);
  const [events, setEvents] = useState<CalendarEvent[]>(loadStoredEvents);
  const [activeTab, setActiveTab] = useState<ActiveTab>('main');

  // Modals & detail selection
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [selectedDetailHomework, setSelectedDetailHomework] = useState<Homework | null>(null);
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventInitialDate, setEventInitialDate] = useState<string | undefined>(undefined);

  // Filters for main view
  const [filters, setFilters] = useState<HomeworkFilterState>({
    searchQuery: '',
    subject: '',
    dueDateFilter: 'all',
    type: '',
    workType: 'all',
    sortBy: 'dueDate_asc',
  });

  // Subscribe to Firestore real-time sync across all devices
  useEffect(() => {
    const unsubscribeHomeworks = subscribeToHomeworks((items) => {
      setHomeworks(items);
      saveStoredHomeworks(items);
    });

    const unsubscribeEvents = subscribeToEvents((itemEvents) => {
      setEvents(itemEvents);
      saveStoredEvents(itemEvents);
    });

    return () => {
      unsubscribeHomeworks();
      unsubscribeEvents();
    };
  }, []);

  // Counts for tabs
  const todayStr = new Date().toISOString().split('T')[0];

  const completedList = homeworks.filter(h => h.completed || h.progress === 100);
  const overdueList = homeworks.filter(h => !h.completed && h.progress < 100 && h.dueDate < todayStr);
  const mainRemainingList = homeworks.filter(h => !h.completed && h.progress < 100 && h.dueDate >= todayStr);

  // Subject options
  const availableSubjects = Array.from(new Set(homeworks.map(h => h.subject)));

  // Filter & Sort for Main View
  const filteredMainHomeworks = mainRemainingList.filter((hw) => {
    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchSubject = hw.subject.toLowerCase().includes(q);
      const matchDesc = hw.description.toLowerCase().includes(q);
      if (!matchSubject && !matchDesc) return false;
    }

    // Subject
    if (filters.subject && hw.subject !== filters.subject) return false;

    // Type
    if (filters.type && hw.type !== filters.type) return false;

    // WorkType
    if (filters.workType !== 'all' && hw.workType !== filters.workType) return false;

    // Due Date filter
    if (filters.dueDateFilter !== 'all') {
      const hwDate = new Date(hw.dueDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      if (filters.dueDateFilter === 'today') {
        const isToday = hwDate.toDateString() === todayDate.toDateString();
        if (!isToday) return false;
      } else if (filters.dueDateFilter === 'this_week') {
        const endOfWeek = new Date(todayDate);
        endOfWeek.setDate(todayDate.getDate() + 7);
        if (hwDate < todayDate || hwDate > endOfWeek) return false;
      } else if (filters.dueDateFilter === 'this_month') {
        if (hwDate.getMonth() !== todayDate.getMonth() || hwDate.getFullYear() !== todayDate.getFullYear()) {
          return false;
        }
      }
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'dueDate_asc') {
      return a.dueDate.localeCompare(b.dueDate);
    } else if (filters.sortBy === 'dueDate_desc') {
      return b.dueDate.localeCompare(a.dueDate);
    } else if (filters.sortBy === 'progress_desc') {
      return b.progress - a.progress;
    } else if (filters.sortBy === 'progress_asc') {
      return a.progress - b.progress;
    } else if (filters.sortBy === 'subject') {
      return a.subject.localeCompare(b.subject, 'th');
    }
    return 0;
  });

  // Handlers
  const handleUpdateProgress = async (id: string, newProgress: number) => {
    const isDone = newProgress === 100;
    const target = homeworks.find(h => h.id === id);
    if (!target) return;

    const updated: Homework = {
      ...target,
      progress: newProgress,
      completed: isDone,
      completedAt: isDone ? new Date().toISOString() : undefined,
    };

    setHomeworks(prev => prev.map(hw => (hw.id === id ? updated : hw)));

    if (selectedDetailHomework && selectedDetailHomework.id === id) {
      setSelectedDetailHomework(updated);
    }

    try {
      await saveHomeworkToCloud(updated);
    } catch (err) {
      console.error('Error saving progress to cloud:', err);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const target = homeworks.find(h => h.id === id);
    if (!target) return;

    const willComplete = !target.completed;
    const updated: Homework = {
      ...target,
      completed: willComplete,
      progress: willComplete ? 100 : (target.progress === 100 ? 50 : target.progress),
      completedAt: willComplete ? new Date().toISOString() : undefined,
    };

    setHomeworks(prev => prev.map(hw => (hw.id === id ? updated : hw)));

    if (selectedDetailHomework && selectedDetailHomework.id === id) {
      setSelectedDetailHomework(updated);
    }

    try {
      await saveHomeworkToCloud(updated);
    } catch (err) {
      console.error('Error toggling complete in cloud:', err);
    }
  };

  const handleSaveHomework = async (data: Omit<Homework, 'id' | 'createdAt'>, existingId?: string) => {
    let savedHomework: Homework;

    if (existingId) {
      const existing = homeworks.find(h => h.id === existingId);
      savedHomework = {
        ...data,
        id: existingId,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
      };
      setHomeworks(prev => prev.map(hw => (hw.id === existingId ? savedHomework : hw)));
    } else {
      savedHomework = {
        ...data,
        id: `hw-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setHomeworks(prev => [savedHomework, ...prev]);
    }

    setEditingHomework(null);
    setActiveTab('main');

    try {
      await saveHomeworkToCloud(savedHomework);
    } catch (err) {
      console.error('Error saving homework to cloud:', err);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (confirm('คุณต้องการลบการบ้านรายการนี้ใช่หรือไม่?')) {
      setHomeworks(prev => prev.filter(hw => hw.id !== id));
      if (selectedDetailHomework?.id === id) {
        setSelectedDetailHomework(null);
      }

      try {
        await deleteHomeworkFromCloud(id);
      } catch (err) {
        console.error('Error deleting homework from cloud:', err);
      }
    }
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };
    setEvents(prev => [...prev, newEvent]);

    try {
      await saveEventToCloud(newEvent);
    } catch (err) {
      console.error('Error saving event to cloud:', err);
    }
  };

  const handleOpenAddEventModal = (dateStr?: string) => {
    setEventInitialDate(dateStr);
    setIsAddEventOpen(true);
  };

  const handleEditHomeworkClick = (homework: Homework) => {
    setEditingHomework(homework);
    setActiveTab('add');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-sky-500 selection:text-white pb-10">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'add') setEditingHomework(null);
          setActiveTab(tab);
        }}
        remainingCount={mainRemainingList.length}
        completedCount={completedList.length}
        overdueCount={overdueList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Tab Views */}
        {activeTab === 'main' && (
          <div className="space-y-6">
            {/* Stats Summary Bar */}
            <StatsOverview
              homeworks={homeworks}
              onTabSelect={(tab) => setActiveTab(tab)}
            />

            {/* Filters */}
            <HomeworkFilters
              filters={filters}
              setFilters={setFilters}
              availableSubjects={availableSubjects}
              totalResults={filteredMainHomeworks.length}
            />

            {/* Cards Grid */}
            {filteredMainHomeworks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 my-8 shadow-xs">
                <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-800">
                  {homeworks.length === 0
                    ? 'ยังไม่มีการบ้านในระบบ'
                    : mainRemainingList.length === 0
                    ? 'ไม่มีการบ้านค้างอยู่แล้ว!'
                    : 'ไม่พบการบ้านตรงตามตัวกรอง'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {homeworks.length === 0
                    ? 'กดปุ่มเพิ่มการบ้านใหม่ด้านล่างเพื่อเริ่มบันทึกการบ้านของคุณ ข้อมูลจะถูกซิงค์ให้อัตโนมัติทุกอุปกรณ์'
                    : mainRemainingList.length === 0
                    ? 'ยินดีด้วย! คุณทำการบ้านครบทุกรายการแล้ว หรือกดเพิ่มการบ้านใหม่ได้ทันที'
                    : 'ลองปรับเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูรายการทั้งหมด'}
                </p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="mt-5 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold font-heading text-xs shadow-md shadow-sky-600/20 inline-flex items-center space-x-2 cursor-pointer transition-all"
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

        {/* Tab: Completed Homework */}
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

        {/* Tab: Overdue Homework */}
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
          />
        )}
      </main>

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

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onSaveEvent={handleSaveEvent}
        initialDate={eventInitialDate}
      />
    </div>
  );
}
