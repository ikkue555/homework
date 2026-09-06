import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Sparkles, 
  LogOut, 
  ShieldCheck, 
  User, 
  Megaphone, 
  Sliders, 
  Sun, 
  Moon, 
  Plus, 
  Menu, 
  X,
  Bell,
  Users,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ActiveTab, UserProfile, SiteSettings, ThemeMode } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  remainingCount: number;
  completedCount: number;
  overdueCount: number;
  userProfile?: UserProfile | null;
  siteSettings?: SiteSettings | null;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
  onOpenPRPopup?: () => void;
  onLogout?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  friendsCount?: number;
  pendingRequestsCount?: number;
  onOpenFriends?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  remainingCount,
  completedCount,
  overdueCount,
  userProfile,
  siteSettings,
  themeMode,
  onToggleThemeMode,
  onOpenPRPopup,
  onLogout,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  friendsCount = 0,
  pendingRequestsCount = 0,
  onOpenFriends,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  // Close menu on click outside or Esc key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Calculate total alert badges for the hamburger button
  const totalAlertBadge = unreadNotificationsCount + pendingRequestsCount;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        {/* Top Announcement Banner if enabled */}
        {siteSettings?.showAnnouncementBanner && siteSettings.announcementBannerText && (
          <div 
            onClick={onOpenPRPopup}
            className={`bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-700 dark:to-blue-800 text-white text-[11px] sm:text-xs py-1 px-3 sm:px-4 text-center font-medium flex items-center justify-center space-x-2 shadow-inner ${
              onOpenPRPopup ? 'cursor-pointer hover:brightness-110 transition-all' : ''
            }`}
            title="คลิกเพื่อดูประกาศฉบับเต็ม"
          >
            <Megaphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-90 animate-pulse" />
            <span className="truncate max-w-xl">{siteSettings.announcementBannerText}</span>
            {onOpenPRPopup && <span className="underline opacity-80 text-[10px] hidden sm:inline">(ดูประกาศ)</span>}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Brand Bar with 3-line Hamburger Menu on the far right */}
          <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
            
            {/* Left: Brand Identity */}
            <div 
              onClick={() => handleTabClick('main')}
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none group min-w-0"
              title="หน้าหลัก"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 dark:from-sky-500 dark:to-blue-500 text-white flex items-center justify-center shadow-sm shrink-0 font-heading group-hover:scale-105 transition-transform">
                <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5 icon-hover-wiggle" />
              </div>
              
              <div className="min-w-0 flex items-center gap-2">
                <div>
                  <h1 className="text-base sm:text-lg font-bold font-heading text-slate-800 dark:text-slate-100 tracking-tight truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                    <span>{siteSettings?.appTitle || 'การบ้านทาซาน'}</span>
                  </h1>
                  {siteSettings?.appSubtitle && (
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                      {siteSettings.appSubtitle}
                    </p>
                  )}
                </div>

                {/* Live Sync Tag */}
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-600 dark:text-emerald-400 animate-pulse" /> 
                  <span>ซิงค์สด</span>
                </span>
              </div>
            </div>

            {/* Right: Hamburger Menu (ปุ่มขีด 3 ขีด) */}
            <div className="relative flex items-center gap-2 shrink-0">
              {/* User Avatar Chip next to menu button for quick identification */}
              {userProfile && (
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="hidden sm:flex items-center space-x-2 bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-750/90 border border-slate-200/80 dark:border-slate-700 px-2.5 py-1.5 rounded-2xl cursor-pointer btn-interactive text-left"
                  title="เปิดเมนูการใช้งาน"
                >
                  <div className="w-6 h-6 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs max-w-[100px] truncate leading-tight">
                    {userProfile.displayName || userProfile.email}
                  </span>
                  {userProfile.role === 'admin' && (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                </button>
              )}

              {/* The 3-Line Hamburger Menu Button (ปุ่มขีด 3 ขีด) */}
              <button
                id="header-hamburger-menu-btn"
                ref={menuBtnRef}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="เมนูหลัก (3 ขีด)"
                aria-expanded={menuOpen}
                className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border cursor-pointer btn-interactive transition-all ${
                  menuOpen
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-250/90 dark:border-slate-700 shadow-2xs'
                }`}
                title={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู (ปุ่มขีด 3 ขีด)'}
              >
                {menuOpen ? (
                  <X className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                )}

                {/* Combined Alert Badge on Hamburger Button */}
                {!menuOpen && totalAlertBadge > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-extrabold leading-tight shadow-xs ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {totalAlertBadge > 99 ? '99+' : totalAlertBadge}
                  </span>
                )}
              </button>

              {/* Floating Dropdown Drawer (เปิดจากปุ่มขีด 3 ขีด มุมขวาบน) */}
              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-12 sm:top-14 w-[310px] sm:w-[350px] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 space-y-3 z-50 animate-pop no-scrollbar"
                  style={{ transformOrigin: 'top right' }}
                >
                  {/* User Profile Card */}
                  {userProfile && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-sky-100 dark:border-slate-700/80">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
                          {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {userProfile.displayName || userProfile.email}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                            {userProfile.email}
                          </p>
                        </div>
                      </div>
                      {userProfile.role === 'admin' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                          <ShieldCheck className="w-3 h-3 mr-1 text-amber-500" /> แอดมิน
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-700 shrink-0 border border-slate-200/60 dark:border-slate-600">
                          <User className="w-3 h-3 mr-1 text-slate-500" /> สมาชิก
                        </span>
                      )}
                    </div>
                  )}

                  {/* Primary Quick Action: + เพิ่มการบ้านใหม่ */}
                  <button
                    id="menu-btn-add-homework"
                    onClick={() => handleTabClick('add')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold font-heading shadow-xs cursor-pointer btn-interactive ${
                      activeTab === 'add'
                        ? 'bg-sky-700 text-white ring-2 ring-sky-300 dark:ring-sky-600'
                        : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span>{siteSettings?.navAddLabel || '+ เพิ่มการบ้านใหม่'}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-80" />
                  </button>

                  {/* Category 1: หน้าหลักและมุมมองงาน */}
                  <div>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-400 px-1 mb-1.5">
                      เมนูหน้าเว็บ
                    </p>
                    <div className="space-y-1">
                      {/* Tab: Main Homework */}
                      <button
                        id="menu-tab-main"
                        onClick={() => handleTabClick('main')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-interactive ${
                          activeTab === 'main'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <BookOpen className={`w-4 h-4 ${activeTab === 'main' ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
                          <span>{siteSettings?.navMainLabel || 'หน้าหลัก (การบ้าน)'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          activeTab === 'main'
                            ? 'bg-white/25 text-white'
                            : 'bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300'
                        }`}>
                          {remainingCount}
                        </span>
                      </button>

                      {/* Tab: Exam Schedule */}
                      <button
                        id="menu-tab-exam"
                        onClick={() => handleTabClick('exam')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-interactive ${
                          activeTab === 'exam'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <GraduationCap className={`w-4 h-4 ${activeTab === 'exam' ? 'text-white' : 'text-rose-500'}`} />
                          <span>{siteSettings?.navExamLabel || 'ตารางสอบ & ขอบเขต'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          activeTab === 'exam' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}>
                          สอบ
                        </span>
                      </button>

                      {/* Tab: Calendar & Events */}
                      <button
                        id="menu-tab-calendar"
                        onClick={() => handleTabClick('calendar')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-interactive ${
                          activeTab === 'calendar'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Calendar className={`w-4 h-4 ${activeTab === 'calendar' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                          <span>{siteSettings?.navCalendarLabel || 'ปฏิทิน & กิจกรรม'}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>

                      {/* Tab: PR News */}
                      <button
                        id="menu-tab-news"
                        onClick={() => handleTabClick('news')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-interactive ${
                          activeTab === 'news'
                            ? 'bg-sky-700 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Megaphone className={`w-4 h-4 ${activeTab === 'news' ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
                          <span>{siteSettings?.navNewsLabel || 'ข่าวประชาสัมพันธ์'}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>

                      {/* Tab: Completed Homework List */}
                      <button
                        id="menu-tab-completed"
                        onClick={() => handleTabClick('completed')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-interactive ${
                          activeTab === 'completed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <CheckCircle2 className={`w-4 h-4 ${activeTab === 'completed' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                          <span>การบ้านที่ทำเสร็จแล้ว</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {completedCount}
                        </span>
                      </button>

                      {/* Tab: Overdue Homework List */}
                      <button
                        id="menu-tab-overdue"
                        onClick={() => handleTabClick('overdue')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-interactive ${
                          activeTab === 'overdue'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Clock className={`w-4 h-4 ${activeTab === 'overdue' ? 'text-white' : 'text-amber-500'}`} />
                          <span>การบ้านที่เลยกำหนด</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          activeTab === 'overdue' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {overdueCount}
                        </span>
                      </button>

                      {/* Tab: Admin Backoffice (if role === admin) */}
                      {userProfile?.role === 'admin' && (
                        <button
                          id="menu-tab-admin"
                          onClick={() => handleTabClick('admin')}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold cursor-pointer btn-interactive ${
                            activeTab === 'admin'
                              ? 'bg-slate-900 text-amber-300 ring-1 ring-amber-400 shadow-xs'
                              : 'bg-slate-800 text-amber-300 hover:bg-slate-750'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Sliders className="w-4 h-4 text-amber-400 icon-hover-spin" />
                            <span>{siteSettings?.navAdminLabel || 'ระบบหลังบ้าน (แอดมิน)'}</span>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300">
                            ADMIN
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category 2: ระบบเชื่อมต่อและเครื่องมือ */}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-400 px-1 mb-1.5">
                      เครื่องมือ & ฟีเจอร์
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {/* Friends & Sharing Button */}
                      {onOpenFriends && (
                        <button
                          id="menu-btn-friends"
                          onClick={() => {
                            onOpenFriends();
                            setMenuOpen(false);
                          }}
                          className="flex items-center justify-between px-3 py-2 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs font-bold btn-interactive border border-indigo-100 dark:border-indigo-900/60"
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>ระบบเพื่อน & แชร์</span>
                          </div>
                          {pendingRequestsCount > 0 ? (
                            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black animate-pulse">
                              +{pendingRequestsCount}
                            </span>
                          ) : friendsCount > 0 ? (
                            <span className="px-1.5 py-0.2 bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 rounded-full text-[9px] font-bold">
                              {friendsCount}
                            </span>
                          ) : null}
                        </button>
                      )}

                      {/* Notifications Button */}
                      {onOpenNotifications && (
                        <button
                          id="menu-btn-notifications"
                          onClick={() => {
                            onOpenNotifications();
                            setMenuOpen(false);
                          }}
                          className="flex items-center justify-between px-3 py-2 bg-sky-50/80 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-2xl text-xs font-bold btn-interactive border border-sky-100 dark:border-sky-900/60"
                        >
                          <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                            <span>การแจ้งเตือน</span>
                          </div>
                          {unreadNotificationsCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black animate-bounce">
                              {unreadNotificationsCount}
                            </span>
                          )}
                        </button>
                      )}

                      {/* PR Popup Announcement Button */}
                      {onOpenPRPopup && siteSettings?.popupEnabled && (
                        <button
                          id="menu-btn-pr-popup"
                          onClick={() => {
                            onOpenPRPopup();
                            setMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold btn-interactive border border-slate-200/80 dark:border-slate-700"
                        >
                          <Megaphone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          <span>ประกาศสำคัญ</span>
                        </button>
                      )}

                      {/* Dark/Light Mode Toggle */}
                      <button
                        id="menu-btn-toggle-theme"
                        onClick={onToggleThemeMode}
                        className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-amber-300 rounded-2xl text-xs font-bold btn-interactive border border-slate-200/80 dark:border-slate-700"
                      >
                        {themeMode === 'dark' ? (
                          <>
                            <Sun className="w-4 h-4 text-amber-400" />
                            <span>สลับธีมสว่าง</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            <span>สลับธีมมืด</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Logout Button */}
                  {onLogout && (
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        id="menu-btn-logout"
                        onClick={() => {
                          onLogout();
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 p-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold btn-interactive border border-rose-200 dark:border-rose-900"
                      >
                        <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-xl px-2 py-1.5 flex items-center justify-around"
      >
        {/* 1. Main Homework Tab */}
        <button
          onClick={() => handleTabClick('main')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl btn-interactive ${
            activeTab === 'main'
              ? 'text-sky-700 dark:text-sky-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-4.5 h-4.5 icon-hover-wiggle" />
            {remainingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold leading-tight shadow-xs">
                {remainingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{siteSettings?.navMainLabel || 'หน้าหลัก'}</span>
        </button>

        {/* 2. Exam Schedule Tab */}
        <button
          id="mobile-bottom-nav-exam"
          onClick={() => handleTabClick('exam')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl btn-interactive ${
            activeTab === 'exam'
              ? 'text-rose-600 dark:text-rose-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <GraduationCap className="w-4.5 h-4.5 icon-hover-wiggle text-rose-500" />
          <span className="text-[10px] mt-0.5">{siteSettings?.navExamLabel || 'ตารางสอบ'}</span>
        </button>

        {/* 3. Center Add Button */}
        <button
          onClick={() => handleTabClick('add')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl btn-interactive ${
            activeTab === 'add'
              ? 'text-sky-700 dark:text-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
          title="เพิ่มการบ้านใหม่"
        >
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
            activeTab === 'add'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-slate-700'
          }`}>
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[10px] mt-0.5">{siteSettings?.navAddLabel || 'เพิ่มงาน'}</span>
        </button>

        {/* 4. Calendar Tab */}
        <button
          onClick={() => handleTabClick('calendar')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl btn-interactive ${
            activeTab === 'calendar'
              ? 'text-blue-700 dark:text-blue-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Calendar className="w-4.5 h-4.5 icon-hover-wiggle" />
          <span className="text-[10px] mt-0.5">{siteSettings?.navCalendarLabel || 'ปฏิทิน'}</span>
        </button>

        {/* 5. PR News Tab or Admin Tab */}
        {userProfile?.role === 'admin' ? (
          <button
            onClick={() => handleTabClick('admin')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl btn-interactive ${
              activeTab === 'admin'
                ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Sliders className="w-4.5 h-4.5 text-amber-500 icon-hover-spin" />
            <span className="text-[10px] mt-0.5">{siteSettings?.navAdminLabel || 'หลังบ้าน'}</span>
          </button>
        ) : (
          <button
            onClick={() => handleTabClick('news')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl btn-interactive ${
              activeTab === 'news'
                ? 'text-sky-700 dark:text-sky-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Megaphone className="w-4.5 h-4.5 icon-hover-wiggle" />
            <span className="text-[10px] mt-0.5">{siteSettings?.navNewsLabel || 'ข่าวสาร'}</span>
          </button>
        )}
      </nav>
    </>
  );
};
