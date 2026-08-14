import React from 'react';
import { Homework, SiteSettings } from '../types';
import { CheckCircle2, Clock, AlertCircle, Percent, ArrowRight } from 'lucide-react';

interface StatsOverviewProps {
  homeworks: Homework[];
  siteSettings?: SiteSettings | null;
  onTabSelect: (tab: 'main' | 'completed' | 'overdue') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ homeworks, siteSettings, onTabSelect }) => {
  const total = homeworks.length;
  const completed = homeworks.filter(h => h.completed || h.progress === 100);
  
  const today = new Date().toISOString().split('T')[0];
  const overdue = homeworks.filter(h => !h.completed && h.progress < 100 && h.dueDate < today);
  const remaining = homeworks.filter(h => !h.completed && h.progress < 100 && h.dueDate >= today);

  const avgProgress = total > 0 
    ? Math.round(homeworks.reduce((acc, curr) => acc + (curr.completed ? 100 : curr.progress), 0) / total)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-5 sm:mb-6">
      {/* 1. Remaining / Pending Tasks */}
      <div 
        onClick={() => onTabSelect('main')}
        className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-sky-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {siteSettings?.statPendingLabel || 'การบ้านคงเหลือ'}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-xl sm:text-2xl font-bold font-heading text-slate-800">
              {remaining.length}
            </span>
            <span className="text-[11px] sm:text-xs font-normal text-slate-400">งาน</span>
          </div>
          <span className="text-[11px] text-sky-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
            <span className="hidden sm:inline mr-0.5">ดูรายการ</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 2. Completed Tasks */}
      <div 
        onClick={() => onTabSelect('completed')}
        className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {siteSettings?.navCompletedLabel || siteSettings?.statCompletedLabel || 'เสร็จสมบูรณ์'}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-xl sm:text-2xl font-bold font-heading text-slate-800">
              {completed.length}
            </span>
            <span className="text-[11px] sm:text-xs font-normal text-slate-400">งาน</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
            <span className="hidden sm:inline mr-0.5">ดูรายการ</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 3. Overdue Tasks */}
      <div 
        onClick={() => onTabSelect('overdue')}
        className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {siteSettings?.navOverdueLabel || siteSettings?.statOverdueLabel || 'เลยกำหนดส่ง'}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-xl sm:text-2xl font-bold font-heading text-slate-800">
              {overdue.length}
            </span>
            <span className="text-[11px] sm:text-xs font-normal text-slate-400">งาน</span>
          </div>
          <span className="text-[11px] text-rose-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
            <span className="hidden sm:inline mr-0.5">ดูรายการ</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 4. Overall Progress */}
      <div className="bg-sky-600 text-white rounded-2xl p-3 sm:p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-sky-100 uppercase tracking-wider truncate">
            ความคืบหน้ารวม
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-heading text-white">
              {avgProgress}%
            </span>
            <span className="text-[10px] sm:text-[11px] text-sky-100 font-normal truncate">
              {total} งานทั้งหมด
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-black/15 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-emerald-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
