import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  Calendar, 
  Sparkles,
  LogOut,
  ShieldCheck,
  User,
  Megaphone,
  Sliders
} from 'lucide-react';
import { ActiveTab, UserProfile, SiteSettings } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  remainingCount: number;
  completedCount: number;
  overdueCount: number;
  userProfile?: UserProfile | null;
  siteSettings?: SiteSettings | null;
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
  onLogout,
}) => {
  const todayFormatted = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      {/* Top Announcement Banner if enabled */}
      {siteSettings?.showAnnouncementBanner && siteSettings.announcementBannerText && (
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center space-x-2 shadow-inner">
          <Megaphone className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span className="truncate">{siteSettings.announcementBannerText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Brand Bar */}
        <div className="py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 ring-4 ring-sky-50">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-800 tracking-tight">
                  {siteSettings?.appTitle || 'ระบบจัดการการบ้าน'}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200/80">
                  <Sparkles className="w-3 h-3 mr-1 text-sky-600" /> ซิงค์สดทุกอุปกรณ์
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {siteSettings?.appSubtitle || 'วางแผน ติดตามความคืบหน้า และบันทึกข้อมูลแบบเรียลไทม์ ซิงค์ตรงกันทุกบราวเซอร์'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start md:self-auto">
            {/* User Profile Badge */}
            {userProfile && (
              <div className="flex items-center space-x-2 bg-sky-50/80 border border-sky-200/80 px-3 py-1.5 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                  {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 flex items-center space-x-1">
                    <span>{userProfile.displayName}</span>
                    {userProfile.role === 'admin' ? (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-600 text-white ml-1">
                        <ShieldCheck className="w-3 h-3 mr-0.5" /> แอดมิน
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700 ml-1">
                        <User className="w-2.5 h-2.5 mr-0.5" /> สมาชิก
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {userProfile.email}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">วันนี้: {todayFormatted}</span>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-main"
            onClick={() => setActiveTab('main')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'main'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30 font-semibold'
                : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{siteSettings?.navMainLabel || 'หน้าหลัก (การบ้าน)'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
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
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'news'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30 font-semibold'
                : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/80'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>{siteSettings?.navNewsLabel || 'ข่าวประชาสัมพันธ์'}</span>
          </button>

          <button
            id="tab-completed"
            onClick={() => setActiveTab('completed')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{siteSettings?.navCompletedLabel || 'เสร็จสมบูรณ์'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'completed'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {completedCount}
            </span>
          </button>

          <button
            id="tab-overdue"
            onClick={() => setActiveTab('overdue')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30 font-semibold'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/80'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{siteSettings?.navOverdueLabel || 'เลยกำหนดส่ง'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'overdue'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {overdueCount}
            </span>
          </button>

          <button
            id="tab-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/80'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{siteSettings?.navCalendarLabel || 'ปฏิทิน & กิจกรรม'}</span>
          </button>

          {/* Admin Backoffice Tab (Only for Admin users) */}
          {userProfile?.role === 'admin' && (
            <button
              id="tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/30'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>{siteSettings?.navAdminLabel || 'ระบบหลังบ้าน'}</span>
            </button>
          )}

          <button
            id="tab-add"
            onClick={() => setActiveTab('add')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ml-auto ${
              activeTab === 'add'
                ? 'bg-sky-500 text-white ring-2 ring-sky-300 font-semibold'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/70'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-sky-600" />
            <span className="font-heading">{siteSettings?.navAddLabel || 'เพิ่มการบ้าน'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};


