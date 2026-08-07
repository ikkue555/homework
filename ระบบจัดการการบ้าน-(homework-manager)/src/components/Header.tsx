import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  Calendar, 
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  remainingCount: number;
  completedCount: number;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  remainingCount,
  completedCount,
  overdueCount,
}) => {
  const todayFormatted = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs">
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
                  ระบบจัดการการบ้าน
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200/80">
                  <Sparkles className="w-3 h-3 mr-1 text-sky-600" /> ซิงค์สดทุกอุปกรณ์
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                  เชื่อมต่อเซิร์ฟเวอร์คลาวด์แล้ว
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                วางแผน ติดตามความคืบหน้า และบันทึกข้อมูลแบบเรียลไทม์ ซิงค์ตรงกันทุกบราวเซอร์
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 self-start md:self-auto">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>วันนี้: {todayFormatted}</span>
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
            <span>หน้าหลัก (การบ้านคงเหลือ)</span>
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
            id="tab-completed"
            onClick={() => setActiveTab('completed')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>เสร็จสมบูรณ์</span>
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
            <span>เลยกำหนดส่ง</span>
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
            <span>ปฏิทิน 12 เดือน & กิจกรรม</span>
          </button>

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
            <span className="font-heading">เพิ่มการบ้าน</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
