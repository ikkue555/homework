import React from 'react';
import { Homework, SiteSettings } from '../types';
import { CheckCircle2, Clock, AlertCircle, Percent } from 'lucide-react';

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Active / Remaining */}
      <div 
        onClick={() => onTabSelect('main')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-sky-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {siteSettings?.statPendingLabel || 'การบ้านคงเหลือ'}
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800">
            {remaining.length} <span className="text-xs font-normal text-slate-400">งาน</span>
          </span>
          <span className="text-xs text-sky-600 font-medium group-hover:underline">ดูรายการ →</span>
        </div>
      </div>

      {/* Completed */}
      <div 
        onClick={() => onTabSelect('completed')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-emerald-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {siteSettings?.navCompletedLabel || siteSettings?.statCompletedLabel || 'เสร็จสมบูรณ์'}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800">
            {completed.length} <span className="text-xs font-normal text-slate-400">งาน</span>
          </span>
          <span className="text-xs text-emerald-600 font-medium group-hover:underline">ดูรายการ →</span>
        </div>
      </div>

      {/* Overdue */}
      <div 
        onClick={() => onTabSelect('overdue')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-rose-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {siteSettings?.navOverdueLabel || siteSettings?.statOverdueLabel || 'เลยกำหนดส่ง'}
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800">
            {overdue.length} <span className="text-xs font-normal text-slate-400">งาน</span>
          </span>
          <span className="text-xs text-rose-600 font-medium group-hover:underline">ดูรายการ →</span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-sky-600 text-white rounded-2xl p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-sky-100 uppercase tracking-wider">ความคืบหน้าภาพรวม</span>
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <Percent className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold text-white">
            {avgProgress}%
          </span>
          <span className="text-xs text-sky-100 font-normal">รวมทุกวิชา ({total} งาน)</span>
        </div>
        {/* Overall progress bar */}
        <div className="w-full bg-white/20 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-emerald-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

