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
  Palette,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { ActiveTab, UserProfile, SiteSettings, ThemeId } from '../types';
import { getThemeConfig } from '../lib/themes';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  remainingCount: number;
  completedCount: number;
  overdueCount: number;
  userProfile?: UserProfile | null;
  siteSettings?: SiteSettings | null;
  currentTheme: ThemeId;
  onOpenThemeSwitcher: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  remainingCount,
  completedCount: _completedCount,
  overdueCount: _overdueCount,
  userProfile,
  siteSettings,
  currentTheme,
  onOpenThemeSwitcher,
  onLogout,
}) => {
  const activeThemeConfig = getThemeConfig(currentTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
        {/* Top Announcement Banner if enabled */}
        {siteSettings?.showAnnouncementBanner && siteSettings.announcementBannerText && (
          <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium flex items-center justify-center space-x-2 shadow-inner">
            <Megaphone className="w-3.5 h-3.5 shrink-0 opacity-90 animate-pulse" />
            <span className="truncate max-w-xl">{siteSettings.announcementBannerText}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Row 1: Brand Bar (Desktop & Mobile Unified with max 56px-64px height) */}
          <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left: Brand Identity (Logo + Name + Sync Badge) */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0 font-heading">
                <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              
              <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold font-heading text-slate-850 tracking-tight truncate flex items-center gap-1.5">
                  <span className="truncate">{siteSettings?.appTitle || 'การบ้านทาซาน'}</span>
                  <span 
                    className="inline-flex items-center justify-center text-sm sm:text-base leading-none shrink-0" 
                    title={`ธีมปัจจุบัน: ${activeThemeConfig.name}`}
                  >
                    {activeThemeConfig.symbol}
                  </span>
                </h1>

                {/* Live Sync Tag */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5 text-emerald-600" /> 
                  <span>ซิงค์สด</span>
                </span>
              </div>
            </div>

            {/* Right: Actions (Single "+ เพิ่มการบ้าน", Profile, Theme, Logout & Mobile Hamburger) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* PRIMARY & ONLY TOP "+ เพิ่มการบ้าน" BUTTON */}
              <button
                id="header-btn-add-homework"
                onClick={() => handleTabClick('add')}
                className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold font-heading transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-95 shrink-0 ${
                  activeTab === 'add'
                    ? 'bg-sky-700 text-white ring-2 ring-sky-300'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white'
                }`}
                title="เพิ่มการบ้านใหม่"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="text-[11px] sm:text-xs tracking-wide">{siteSettings?.navAddLabel || '+ เพิ่มการบ้าน'}</span>
              </button>

              {/* User Profile Card (High contrast, clearly visible) */}
              {userProfile && (
                <div 
                  className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-100/90 border border-slate-250/80 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl header-pill"
                  title={`เข้าสู่ระบบในชื่อ: ${userProfile.displayName || userProfile.email}`}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0 shadow-2xs">
                    {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  
                  <div className="hidden sm:flex items-center space-x-1">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm max-w-[90px] md:max-w-[130px] truncate leading-tight">
                      {userProfile.displayName}
                    </span>
                    
                    {userProfile.role === 'admin' ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-700 text-white shadow-2xs shrink-0">
                        <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> แอดมิน
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] text-slate-600 bg-slate-200/80 shrink-0">
                        <User className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Theme Switcher Button */}
              <button
                id="header-btn-theme"
                onClick={onOpenThemeSwitcher}
                title={`เปลี่ยนธีม (ปัจจุบัน: ${activeThemeConfig.name})`}
                className="flex items-center justify-center space-x-1 px-2 sm:px-2.5 py-1.5 sm:py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer group shrink-0"
              >
                <Palette className="w-3.5 h-3.5 text-amber-700 group-hover:rotate-12 transition-transform" />
                <span className="text-xs leading-none">{activeThemeConfig.symbol}</span>
                <span className="hidden md:inline text-[11px] font-bold text-amber-900">ธีม</span>
              </button>

              {/* Logout Button (High contrast, clearly visible on all screens) */}
              {onLogout && (
                <button
                  id="header-btn-logout"
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="flex items-center justify-center space-x-1 px-2 sm:px-2.5 py-1.5 sm:py-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-700" />
                  <span className="hidden md:inline text-[11px]">ออก</span>
                </button>
              )}

              {/* Mobile Hamburger Toggle Button (Shown on mobile & tablet < md) */}
              <button
                id="header-btn-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Desktop Navigation Bar (Only on md+ screens, with crystal-clear contrast) */}
          <nav className="hidden md:flex space-x-1.5 py-2 border-t border-slate-100 items-center overflow-x-auto no-scrollbar">
            {/* Tab: Main (Homework List) */}
            <button
              id="tab-main"
              onClick={() => handleTabClick('main')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'main'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{siteSettings?.navMainLabel || 'หน้าหลัก (การบ้าน)'}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'main'
                    ? 'bg-white/25 text-white'
                    : 'bg-sky-100 text-sky-900'
                }`}
              >
                {remainingCount}
              </span>
            </button>

            {/* Tab: PR News */}
            <button
              id="tab-news"
              onClick={() => handleTabClick('news')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'news'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-slate-100'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>{siteSettings?.navNewsLabel || 'ข่าวประชาสัมพันธ์'}</span>
            </button>

            {/* Tab: Calendar & Events */}
            <button
              id="tab-calendar"
              onClick={() => handleTabClick('calendar')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'calendar'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{siteSettings?.navCalendarLabel || 'ปฏิทิน & กิจกรรม'}</span>
            </button>

            {/* Tab: Admin Backoffice (Distinct, high-contrast dark badge for Admin only) */}
            {userProfile?.role === 'admin' && (
              <button
                id="tab-admin"
                onClick={() => handleTabClick('admin')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-amber-300 shadow-xs ring-1 ring-amber-400'
                    : 'bg-slate-800 text-white hover:bg-slate-900 border border-slate-700'
                }`}
                title="เข้าสู่ระบบจัดการหลังบ้าน"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="tracking-wide">{siteSettings?.navAdminLabel || 'ระบบหลังบ้าน'}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Dropdown Menu (Opened via Hamburger button on Mobile/Tablet) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-3 py-2 space-y-1 shadow-lg animate-in fade-in duration-150">
            <button
              onClick={() => handleTabClick('main')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'main'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>{siteSettings?.navMainLabel || 'หน้าหลัก (การบ้าน)'}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'main' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
              }`}>
                {remainingCount} งาน
              </span>
            </button>

            <button
              onClick={() => handleTabClick('news')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>{siteSettings?.navNewsLabel || 'ข่าวประชาสัมพันธ์'}</span>
            </button>

            <button
              onClick={() => handleTabClick('calendar')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{siteSettings?.navCalendarLabel || 'ปฏิทิน & กิจกรรม'}</span>
            </button>

            {userProfile?.role === 'admin' && (
              <button
                onClick={() => handleTabClick('admin')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-amber-300 ring-1 ring-amber-400'
                    : 'bg-slate-800 text-white hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>{siteSettings?.navAdminLabel || 'ระบบหลังบ้าน (Admin)'}</span>
              </button>
            )}

            {/* User Details in Mobile Drawer */}
            {userProfile && (
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="truncate">ผู้ใช้: <b className="text-slate-800">{userProfile.displayName || userProfile.email}</b></span>
                {userProfile.role === 'admin' && (
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100">
                    แอดมิน
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Thumb-friendly & 100% Responsive) */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around"
      >
        <button
          onClick={() => handleTabClick('main')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'main'
              ? 'text-sky-700 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-4 h-4" />
            {remainingCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 py-0.1 bg-rose-500 text-white rounded-full text-[9px] font-bold leading-tight">
                {remainingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">หน้าหลัก</span>
        </button>

        <button
          onClick={() => handleTabClick('news')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'news'
              ? 'text-sky-700 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">ข่าวสาร</span>
        </button>

        <button
          onClick={() => handleTabClick('calendar')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'text-blue-700 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">ปฏิทิน</span>
        </button>

        {userProfile?.role === 'admin' && (
          <button
            onClick={() => handleTabClick('admin')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'text-amber-600 font-extrabold scale-105'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] mt-0.5">หลังบ้าน</span>
          </button>
        )}
      </nav>
    </>
  );
};
