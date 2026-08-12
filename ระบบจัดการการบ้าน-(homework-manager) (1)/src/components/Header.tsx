import React from 'react';
import { 
  BookOpen, 
  PlusCircle,
  Calendar, 
  Sparkles,
  LogOut,
  ShieldCheck,
  User,
  Megaphone,
  Sliders,
  Palette
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
  completedCount,
  overdueCount,
  userProfile,
  siteSettings,
  currentTheme,
  onOpenThemeSwitcher,
  onLogout,
}) => {
  const activeThemeConfig = getThemeConfig(currentTheme);

  const todayFormatted = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Announcement Banner if enabled */}
      {siteSettings?.showAnnouncementBanner && siteSettings.announcementBannerText && (
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs py-2 px-4 text-center font-normal flex items-center justify-center space-x-2">
          <Megaphone className="w-3.5 h-3.5 shrink-0 opacity-90" />
          <span className="truncate">{siteSettings.announcementBannerText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand Bar */}
        <div className="py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <span>{siteSettings?.appTitle || 'ระบบจัดการการบ้าน'}</span>
                  <span className="inline-flex items-center justify-center text-xl bg-slate-100/80 px-2 py-0.5 rounded-xl border border-slate-200/80 shadow-2xs group-hover:scale-110 transition-transform" title={`ธีมปัจจุบัน: ${activeThemeConfig.name}`}>
                    {activeThemeConfig.symbol}
                  </span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-sky-50 text-sky-700 border border-sky-100">
                  <Sparkles className="w-3 h-3 mr-1 text-sky-500" /> ซิงค์สดทุกอุปกรณ์
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                {siteSettings?.appSubtitle || 'วางแผน ติดตามความคืบหน้า และบันทึกข้อมูลแบบเรียลไทม์ ซิงค์ตรงกันทุกบราวเซอร์'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* User Profile Badge */}
            {userProfile && (
              <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl header-pill">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 flex items-center space-x-1">
                    <span>{userProfile.displayName}</span>
                    {userProfile.role === 'admin' ? (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sky-600 text-white ml-1">
                        <ShieldCheck className="w-3 h-3 mr-0.5" /> แอดมิน
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-normal bg-slate-200 text-slate-700 ml-1">
                        <User className="w-2.5 h-2.5 mr-0.5" /> สมาชิก
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {userProfile.email}
                  </div>
                </div>
              </div>
            )}

            {/* Theme Switcher Button */}
            <button
              onClick={onOpenThemeSwitcher}
              title="ตั้งค่าเลือกธีม"
              className="flex items-center space-x-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer group header-pill"
            >
              <Palette className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform" />
              <span className="text-sm leading-none">{activeThemeConfig.symbol}</span>
              <span className="hidden sm:inline font-bold">ธีม: {activeThemeConfig.name.split(' ')[0]}</span>
            </button>

            <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 header-pill">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">{todayFormatted}</span>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-medium transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 py-2.5 overflow-x-auto no-scrollbar items-center">
          <button
            id="tab-main"
            onClick={() => setActiveTab('main')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'main'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-sky-600 hover:bg-slate-100/80'
            }`}
          >
            <span className="text-sm">{activeThemeConfig.symbol}</span>
            <BookOpen className="w-4 h-4" />
            <span>{siteSettings?.navMainLabel || 'หน้าหลัก (การบ้าน)'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === 'main'
                  ? 'bg-white/20 text-white'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {remainingCount}
            </span>
          </button>

          <button
            id="tab-news"
            onClick={() => setActiveTab('news')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'news'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-sky-600 hover:bg-slate-100/80'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>{siteSettings?.navNewsLabel || 'ข่าวประชาสัมพันธ์'}</span>
          </button>

          <button
            id="tab-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/80'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{siteSettings?.navCalendarLabel || 'ปฏิทิน & กิจกรรม'}</span>
            <span className="text-sm ml-0.5">{activeThemeConfig.symbol}</span>
          </button>

          {/* Admin Backoffice Tab (Only for Admin users) */}
          {userProfile?.role === 'admin' && (
            <button
              id="tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>{siteSettings?.navAdminLabel || 'ระบบหลังบ้าน'}</span>
            </button>
          )}

          <button
            id="tab-add"
            onClick={() => setActiveTab('add')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ml-auto shadow-2xs hover:scale-105 active:scale-95 ${
              activeTab === 'add'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/70'
            }`}
          >
            <span className="text-base leading-none">{activeThemeConfig.symbol}</span>
            <PlusCircle className="w-4 h-4 text-sky-600" />
            <span>{siteSettings?.navAddLabel || 'เพิ่มการบ้าน'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};



