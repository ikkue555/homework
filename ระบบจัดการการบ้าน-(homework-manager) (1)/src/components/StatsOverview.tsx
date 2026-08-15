import React from 'react';
import { Homework, SiteSettings } from '../types';
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface StatsOverviewProps {
  homeworks: Homework[];
  siteSettings?: SiteSettings | null;
  onTabSelect: (tab: 'main' | 'completed' | 'overdue') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ homeworks, siteSettings, onTabSelect }) => {
  const safeHomeworks = (homeworks || []).filter(Boolean);
  const completed = safeHomeworks.filter(h => h.completed || h.progress === 100);
  
  const today = new Date().toISOString().split('T')[0];
  const overdue = safeHomeworks.filter(h => !h.completed && (h.progress || 0) < 100 && h.dueDate && h.dueDate < today && h.dueDate !== 'ไม่มีกำหนดส่ง');
  const remaining = safeHomeworks.filter(h => !h.completed && (h.progress || 0) < 100 && (!h.dueDate || h.dueDate >= today || h.dueDate === 'ไม่มีกำหนดส่ง'));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-5 sm:mb-6">
      {/* 1. Remaining / Pending Tasks */}
      <div 
        onClick={() => onTabSelect('main')}
        className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs card-interactive cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {siteSettings?.statPendingLabel || 'การบ้านคงเหลือ'}
          </span>
          <div className="w-8 h-8 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0 border border-sky-100 dark:border-sky-800">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 dark:text-slate-100">
              {remaining.length}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">งาน</span>
          </div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
            <span className="hidden sm:inline mr-0.5">ดูรายการ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 2. Completed Tasks */}
      <div 
        onClick={() => onTabSelect('completed')}
        className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs card-interactive cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {siteSettings?.navCompletedLabel || siteSettings?.statCompletedLabel || 'เสร็จสมบูรณ์'}
          </span>
          <div className="w-8 h-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0 border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 dark:text-slate-100">
              {completed.length}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">งาน</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
            <span className="hidden sm:inline mr-0.5">ดูรายการ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 3. Overdue Tasks */}
      <div 
        onClick={() => onTabSelect('overdue')}
        className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs card-interactive cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {siteSettings?.navOverdueLabel || siteSettings?.statOverdueLabel || 'เลยกำหนดส่ง'}
          </span>
          <div className="w-8 h-8 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0 border border-rose-100 dark:border-rose-800">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 dark:text-slate-100">
              {overdue.length}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">งาน</span>
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
            <span className="hidden sm:inline mr-0.5">ดูรายการ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 4. Total Homeworks */}
      <div 
        onClick={() => onTabSelect('main')}
        className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs card-interactive cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {siteSettings?.statTotalLabel || 'การบ้านทั้งหมด'}
          </span>
          <div className="w-8 h-8 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0 border border-indigo-100 dark:border-indigo-800">
            <span className="font-heading font-black text-xs">ALL</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 dark:text-slate-100">
              {safeHomeworks.length}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">งาน</span>
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
            <span className="hidden sm:inline mr-0.5">ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
