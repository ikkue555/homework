import React, { useState } from 'react';
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
  Users
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
  completedCount: _completedCount,
  overdueCount: _overdueCount,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

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
          {/* Row 1: Brand Bar (Ultra Clean on Mobile: <= 52px height) */}
          <div className="h-12 sm:h-15 flex items-center justify-between gap-2">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div 
                onClick={() => handleTabClick('main')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shadow-xs shrink-0 font-heading cursor-pointer btn-interactive"
                title="หน้าหลัก"
              >
                <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 icon-hover-wiggle" />
              </div>
              
              <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
                <h1 
                  onClick={() => handleTabClick('main')}
                  className="text-sm sm:text-base md:text-lg font-bold font-heading text-slate-800 dark:text-slate-100 tracking-tight truncate flex items-center gap-1.5 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  <span className="truncate">{siteSettings?.appTitle || 'การบ้านทาซาน'}</span>
                </h1>

                {/* Live Sync Tag */}
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5 text-emerald-600 dark:text-emerald-400 animate-pulse" /> 
                  <span>ซิงค์สด</span>
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* PRIMARY "+ เพิ่มการบ้าน" BUTTON: Desktop only */}
              <button
                id="header-btn-add-homework-desktop"
                onClick={() => handleTabClick('add')}
                className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-heading cursor-pointer shadow-2xs btn-interactive shrink-0 ${
                  activeTab === 'add'
                    ? 'bg-sky-700 text-white ring-2 ring-sky-300 dark:ring-sky-600'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white'
                }`}
                title="เพิ่มการบ้านใหม่"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-xs">{siteSettings?.navAddLabel || '+ เพิ่มการบ้าน'}</span>
              </button>

              {/* Friends & Share Button: Accessible on all screen sizes */}
              {onOpenFriends && (
                <button
                  id="header-btn-friends"
                  onClick={onOpenFriends}
                  title="ระบบเพื่อน & แชร์การบ้าน"
                  className="relative flex items-center justify-center space-x-1 px-2.5 sm:px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl text-xs font-bold shadow-2xs btn-interactive cursor-pointer shrink-0 font-heading"
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden md:inline text-[11px]">เพื่อน</span>
                  {friendsCount > 0 && (
                    <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-200/80 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                      {friendsCount}
                    </span>
                  )}
                  {pendingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 sm:translate-x-1 sm:-translate-y-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-extrabold leading-tight shadow-xs ring-2 ring-white dark:ring-slate-900 animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              )}

              {/* PR Popup Announcement Button: Desktop / Tablet */}
              {onOpenPRPopup && siteSettings?.popupEnabled && (
                <button
                  id="header-btn-pr-popup"
                  onClick={onOpenPRPopup}
                  title="ดูประกาศประชาสัมพันธ์สำคัญ (Pop-up)"
                  className="hidden sm:flex items-center justify-center space-x-1 px-3 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-slate-700 rounded-2xl text-xs font-bold shadow-2xs btn-interactive cursor-pointer shrink-0"
                >
                  <Megaphone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 icon-hover-wiggle" />
                  <span className="hidden md:inline text-[11px]">ประกาศ</span>
                </button>
              )}

              {/* Notifications Bell Button: Accessible on all screen sizes */}
              {onOpenNotifications && (
                <button
                  id="header-btn-notifications"
                  onClick={onOpenNotifications}
                  title="ดูรายการแจ้งเตือนทั้งหมด"
                  className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold shadow-2xs btn-interactive cursor-pointer shrink-0"
                  aria-label="การแจ้งเตือน"
                >
                  <Bell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400 ${unreadNotificationsCount > 0 ? 'animate-bounce' : 'icon-hover-wiggle'}`} />
                  <span className="hidden md:inline ml-1.5 text-[11px]">แจ้งเตือน</span>
                  
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 sm:translate-x-1 sm:-translate-y-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-extrabold leading-tight shadow-xs ring-2 ring-white dark:ring-slate-900 animate-pulse">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Dark / Light Mode Toggle Button: Desktop / Tablet */}
              <button
                id="header-btn-dark-mode"
                onClick={onToggleThemeMode}
                title={themeMode === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold shadow-2xs btn-interactive cursor-pointer shrink-0"
                aria-label="Toggle theme mode"
              >
                {themeMode === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 icon-hover-spin" />
                    <span className="hidden md:inline text-[11px] font-semibold text-slate-200">สว่าง</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 icon-hover-wiggle" />
                    <span className="hidden md:inline text-[11px] font-semibold text-slate-700">มืด</span>
                  </>
                )}
              </button>

              {/* User Profile Card / Avatar */}
              {userProfile && (
                <div 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-250/80 dark:border-slate-700 px-2 sm:px-3 py-1.5 rounded-2xl cursor-pointer btn-interactive"
                  title={`เข้าสู่ระบบในชื่อ: ${userProfile.displayName || userProfile.email}`}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-sky-700 dark:bg-sky-600 text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0 shadow-2xs">
                    {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  
                  <div className="hidden sm:flex items-center space-x-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs max-w-[90px] md:max-w-[130px] truncate leading-tight">
                      {userProfile.displayName}
                    </span>
                    
                    {userProfile.role === 'admin' ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-700 dark:bg-sky-600 text-white shadow-2xs shrink-0">
                        <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> แอดมิน
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-700 shrink-0">
                        <User className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Logout Button: Desktop Only */}
              {onLogout && (
                <button
                  id="header-btn-logout-desktop"
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="hidden md:flex items-center justify-center space-x-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 active:bg-rose-200 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs font-bold btn-interactive cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400 icon-hover-wiggle" />
                  <span className="text-[11px]">ออก</span>
                </button>
              )}

              {/* Mobile Menu / Settings Toggle Button */}
              <button
                id="header-btn-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 btn-interactive cursor-pointer"
                title={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-4.5 h-4.5" />
                ) : (
                  <Menu className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Desktop Navigation Bar (ONLY on md+ screens) */}
          <nav className="hidden md:flex space-x-1.5 py-2 border-t border-slate-100 dark:border-slate-800 items-center overflow-x-auto no-scrollbar">
            {/* Tab: Main (Homework List) */}
            <button
              id="tab-main"
              onClick={() => handleTabClick('main')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 btn-interactive ${
                activeTab === 'main'
                  ? 'bg-sky-700 dark:bg-sky-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 icon-hover-wiggle" />
              <span>{siteSettings?.navMainLabel || 'หน้าหลัก (การบ้าน)'}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'main'
                    ? 'bg-white/25 text-white'
                    : 'bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300'
                }`}
              >
                {remainingCount}
              </span>
            </button>

            {/* Tab: PR News */}
            <button
              id="tab-news"
              onClick={() => handleTabClick('news')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 btn-interactive ${
                activeTab === 'news'
                  ? 'bg-sky-700 dark:bg-sky-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 icon-hover-wiggle" />
              <span>{siteSettings?.navNewsLabel || 'ข่าวประชาสัมพันธ์'}</span>
            </button>

            {/* Tab: Calendar & Events */}
            <button
              id="tab-calendar"
              onClick={() => handleTabClick('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 btn-interactive ${
                activeTab === 'calendar'
                  ? 'bg-blue-700 dark:bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 icon-hover-wiggle" />
              <span>{siteSettings?.navCalendarLabel || 'ปฏิทิน & กิจกรรม'}</span>
            </button>

            {/* Tab: Friends & Sharing Shortcut */}
            {onOpenFriends && (
              <button
                id="tab-friends"
                onClick={onOpenFriends}
                className="flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 btn-interactive text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 icon-hover-wiggle" />
                <span>ระบบเพื่อน & แชร์</span>
                {pendingRequestsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}

            {/* Tab: Admin Backoffice */}
            {userProfile?.role === 'admin' && (
              <button
                id="tab-admin"
                onClick={() => handleTabClick('admin')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 btn-interactive ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 dark:bg-amber-400 text-amber-300 dark:text-slate-900 shadow-xs ring-1 ring-amber-400'
                    : 'bg-slate-800 dark:bg-slate-800 text-white hover:bg-slate-900 dark:hover:bg-slate-750 border border-slate-700'
                }`}
                title="เข้าสู่ระบบจัดการหลังบ้าน"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400 dark:text-amber-300 icon-hover-spin" />
                <span className="tracking-wide">{siteSettings?.navAdminLabel || 'ระบบหลังบ้าน'}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 space-y-2.5 shadow-lg animate-fadeIn">
            {/* User Profile Overview */}
            {userProfile && (
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-sky-700 dark:bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{userProfile.displayName || userProfile.email}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">{userProfile.email}</p>
                  </div>
                </div>
                {userProfile.role === 'admin' && (
                  <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-lg shrink-0">
                    แอดมิน
                  </span>
                )}
              </div>
            )}

            {/* Quick Actions in Mobile Drawer */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onOpenFriends && (
                <button
                  onClick={() => {
                    onOpenFriends();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-1.5 p-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs font-bold btn-interactive"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>ระบบเพื่อน</span>
                  {friendsCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 rounded-full text-[9px] font-bold">
                      {friendsCount}
                    </span>
                  )}
                  {pendingRequestsCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold">
                      +{pendingRequestsCount}
                    </span>
                  )}
                </button>
              )}

              {onOpenNotifications && (
                <button
                  onClick={() => {
                    onOpenNotifications();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-1.5 p-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/50 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-2xl text-xs font-bold btn-interactive"
                >
                  <Bell className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>การแจ้งเตือน</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              )}

              {onOpenPRPopup && siteSettings?.popupEnabled && (
                <button
                  onClick={() => {
                    onOpenPRPopup();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-1.5 p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold btn-interactive"
                >
                  <Megaphone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>ประกาศ (Pop-up)</span>
                </button>
              )}

              <button
                onClick={() => {
                  onToggleThemeMode();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-amber-300 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold btn-interactive"
              >
                {themeMode === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>เปลี่ยนเป็นธีมสว่าง</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>เปลี่ยนเป็นธีมมืด</span>
                  </>
                )}
              </button>

              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="col-span-2 flex items-center justify-center space-x-1.5 p-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold btn-interactive"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                  <span>ออกจากระบบ</span>
                </button>
              )}
            </div>
          </div>
        )}
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

        {/* 2. PR News Tab */}
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
          <span className="text-[10px] mt-0.5">{siteSettings?.navAddLabel || 'เพิ่มการบ้าน'}</span>
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

        {/* 5. Backoffice Admin Tab (if admin) or Friends Shortcut */}
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
            onClick={onOpenFriends}
            className="flex-1 flex flex-col items-center justify-center py-1 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium btn-interactive relative"
            title="ระบบเพื่อน & แชร์การบ้าน"
          >
            <div className="relative">
              <Users className="w-4.5 h-4.5 text-indigo-500 icon-hover-wiggle" />
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-rose-500 text-white rounded-full text-[8px] font-bold leading-tight">
                  {pendingRequestsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">เพื่อน</span>
          </button>
        )}
      </nav>
    </>
  );
};
