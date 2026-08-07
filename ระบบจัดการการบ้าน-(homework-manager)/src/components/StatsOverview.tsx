import React from 'react';
import { Homework } from '../types';
import { CheckCircle2, Clock, AlertCircle, Percent, CalendarCheck } from 'lucide-react';

interface StatsOverviewProps {
  homeworks: Homework[];
  onTabSelect: (tab: 'main' | 'completed' | 'overdue') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ homeworks, onTabSelect }) => {
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
        className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">การบ้านคงเหลือ</span>
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800">
            {remaining.length} <span className="text-xs font-normal text-slate-500">งาน</span>
          </span>
          <span className="text-xs text-sky-600 font-medium group-hover:underline">ดูรายการ →</span>
        </div>
      </div>

      {/* Completed */}
      <div 
        onClick={() => onTabSelect('completed')}
        className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">เสร็จสมบูรณ์</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800">
            {completed.length} <span className="text-xs font-normal text-slate-500">งาน</span>
          </span>
          <span className="text-xs text-emerald-600 font-medium group-hover:underline">ดูรายการ →</span>
        </div>
      </div>

      {/* Overdue */}
      <div 
        onClick={() => onTabSelect('overdue')}
        className="bg-white rounded-2xl p-4 border border-rose-100 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">เลยกำหนดส่ง</span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800">
            {overdue.length} <span className="text-xs font-normal text-slate-500">งาน</span>
          </span>
          <span className="text-xs text-rose-600 font-medium group-hover:underline">ดูรายการ →</span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-sky-100 uppercase tracking-wider">ความคืบหน้าภาพรวม</span>
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Percent className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            {avgProgress}%
          </span>
          <span className="text-xs text-sky-100 font-medium">รวมทุกวิชา ({total} งาน)</span>
        </div>
        {/* Overall progress bar */}
        <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
