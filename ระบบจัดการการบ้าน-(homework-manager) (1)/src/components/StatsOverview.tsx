import React, { useState } from 'react';
import { Homework, SiteSettings } from '../types';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, PieChart as PieChartIcon, Activity, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface StatsOverviewProps {
  homeworks: Homework[];
  siteSettings?: SiteSettings | null;
  onTabSelect: (tab: 'main' | 'completed' | 'overdue') => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      color: string;
      percent: number;
    };
  }>;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 text-xs animate-pop">
        <div className="flex items-center space-x-2 mb-1">
          <span
            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-bold font-heading text-slate-800 dark:text-slate-100">
            {data.name}
          </span>
        </div>
        <div className="flex items-baseline justify-between space-x-3 text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {data.value} งาน
          </span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
            ({data.payload.percent}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({ homeworks, siteSettings, onTabSelect }) => {
  const [showChart, setShowChart] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const safeHomeworks = (homeworks || []).filter(Boolean);
  const total = safeHomeworks.length;
  
  // Categorize by progress status
  const completedList = safeHomeworks.filter(h => h.completed || (h.progress || 0) === 100);
  const inProgressList = safeHomeworks.filter(h => !h.completed && (h.progress || 0) > 0 && (h.progress || 0) < 100);
  const notStartedList = safeHomeworks.filter(h => !h.completed && (!h.progress || h.progress === 0));

  const today = new Date().toISOString().split('T')[0];
  const overdue = safeHomeworks.filter(h => !h.completed && (h.progress || 0) < 100 && h.dueDate && h.dueDate < today && h.dueDate !== 'ไม่มีกำหนดส่ง');
  const remaining = safeHomeworks.filter(h => !h.completed && (h.progress || 0) < 100 && (!h.dueDate || h.dueDate >= today || h.dueDate === 'ไม่มีกำหนดส่ง'));

  // Calculate overall average progress
  const overallProgress = total > 0
    ? Math.round(
        safeHomeworks.reduce((acc, h) => acc + (h.completed ? 100 : (h.progress || 0)), 0) / total
      )
    : 0;

  // Chart data structure
  const chartData = [
    {
      name: 'เสร็จสมบูรณ์',
      value: completedList.length,
      color: '#10b981',
      darkColor: '#34d399',
      percent: total > 0 ? Math.round((completedList.length / total) * 100) : 0,
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/70',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800/80',
      dotColor: 'bg-emerald-500',
      tab: 'completed' as const,
    },
    {
      name: 'กำลังทำ',
      value: inProgressList.length,
      color: '#0284c7',
      darkColor: '#38bdf8',
      percent: total > 0 ? Math.round((inProgressList.length / total) * 100) : 0,
      badgeBg: 'bg-sky-50 dark:bg-sky-950/70',
      badgeText: 'text-sky-700 dark:text-sky-300',
      badgeBorder: 'border-sky-200 dark:border-sky-800/80',
      dotColor: 'bg-sky-500',
      tab: 'main' as const,
    },
    {
      name: 'ยังไม่เริ่ม',
      value: notStartedList.length,
      color: '#f59e0b',
      darkColor: '#fbbf24',
      percent: total > 0 ? Math.round((notStartedList.length / total) * 100) : 0,
      badgeBg: 'bg-amber-50 dark:bg-amber-950/70',
      badgeText: 'text-amber-700 dark:text-amber-300',
      badgeBorder: 'border-amber-200 dark:border-amber-800/80',
      dotColor: 'bg-amber-500',
      tab: 'main' as const,
    },
  ];

  // Only display slices with value > 0 in pie rendering
  const activeSlices = chartData.filter(d => d.value > 0);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* 1. Quick Stats 4-Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Remaining / Pending Tasks */}
        <div 
          onClick={() => onTabSelect('main')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs card-interactive cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate font-heading">
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
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">งาน</span>
            </div>
            <span className="text-xs text-sky-600 dark:text-sky-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
              <span className="hidden sm:inline mr-0.5 font-heading">ดูรายการ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div 
          onClick={() => onTabSelect('completed')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs card-interactive cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate font-heading">
              {siteSettings?.navCompletedLabel || siteSettings?.statCompletedLabel || 'เสร็จสมบูรณ์'}
            </span>
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0 border border-emerald-100 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 dark:text-slate-100">
                {completedList.length}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">งาน</span>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
              <span className="hidden sm:inline mr-0.5 font-heading">ดูรายการ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div 
          onClick={() => onTabSelect('overdue')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs card-interactive cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate font-heading">
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
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">งาน</span>
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
              <span className="hidden sm:inline mr-0.5 font-heading">ดูรายการ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Total Homeworks */}
        <div 
          onClick={() => onTabSelect('main')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs card-interactive cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate font-heading">
              {siteSettings?.statTotalLabel || 'การบ้านทั้งหมด'}
            </span>
            <div className="w-8 h-8 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0 border border-indigo-100 dark:border-indigo-800">
              <span className="font-heading font-black text-xs">ALL</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 dark:text-slate-100">
                {total}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">งาน</span>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
              <span className="hidden sm:inline mr-0.5 font-heading">ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 2. Recharts Progress Status Pie Chart Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-800 shrink-0">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-heading text-slate-800 dark:text-slate-100">
                สรุปสถานะความคืบหน้าการบ้าน (Progress Breakdown)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                แผนภูมิวงกลมจำแนกตามขั้นตอนการทำการบ้าน
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200/80 dark:border-slate-700 text-xs">
              <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="text-slate-500 dark:text-slate-400">ความคืบหน้าเฉลี่ย:</span>
              <strong className="font-heading text-slate-800 dark:text-slate-100 font-bold">
                {overallProgress}%
              </strong>
            </div>

            <button
              onClick={() => setShowChart(!showChart)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={showChart ? 'ซ่อนกราฟ' : 'แสดงกราฟ'}
            >
              {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showChart && (
          <div className="pt-4">
            {total === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 animate-float" />
                <p className="text-sm font-heading font-semibold text-slate-600 dark:text-slate-400">
                  ยังไม่มีข้อมูลการบ้านสำหรับแสดงผลกราฟ
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  เพิ่มการบ้านใหม่เพื่อเริ่มติดตามความคืบหน้าแบบเรียลไทม์
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Pie Chart Canvas with Center Donut Label */}
                <div className="md:col-span-6 lg:col-span-5 flex flex-col items-center justify-center relative min-h-[220px]">
                  <div className="w-full h-[210px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomChartTooltip />} />
                        <Pie
                          data={activeSlices.length > 0 ? activeSlices : [{ name: 'ไม่มีข้อมูล', value: 1, color: '#e2e8f0', darkColor: '#334155', percent: 100 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={activeSlices.length > 1 ? 4 : 0}
                          dataKey="value"
                          strokeWidth={2}
                          stroke="transparent"
                          onMouseEnter={(_, index) => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(null)}
                          animationDuration={800}
                        >
                          {activeSlices.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              className="transition-all duration-200 cursor-pointer hover:opacity-90"
                              style={{
                                transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                                transformOrigin: 'center center',
                              }}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-800 dark:text-slate-100 leading-none">
                        {overallProgress}%
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        สำเร็จเฉลี่ย
                      </span>
                    </div>
                  </div>
                  
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                    ชี้ที่กราฟเพื่อดูสัดส่วนแต่ละสถานะ
                  </span>
                </div>

                {/* Status Breakdown Legend & Interactive Cards */}
                <div className="md:col-span-6 lg:col-span-7 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2.5">
                    {chartData.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => onTabSelect(item.tab)}
                        onMouseEnter={() => {
                          const foundIndex = activeSlices.findIndex(s => s.name === item.name);
                          if (foundIndex !== -1) setActiveIndex(foundIndex);
                        }}
                        onMouseLeave={() => setActiveIndex(null)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          item.badgeBg
                        } ${item.badgeBorder} hover:shadow-xs ${
                          activeIndex === activeSlices.findIndex(s => s.name === item.name)
                            ? 'ring-2 ring-sky-500/50'
                            : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <span className="font-bold font-heading text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.name === 'เสร็จสมบูรณ์' && 'การบ้านที่ทำเสร็จ 100%'}
                              {item.name === 'กำลังทำ' && 'ความคืบหน้า 1-95%'}
                              {item.name === 'ยังไม่เริ่ม' && 'ความคืบหน้า 0%'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-base sm:text-lg font-black font-heading ${item.badgeText}`}>
                            {item.value} <span className="text-xs font-normal">งาน</span>
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                            {item.percent}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Bar */}
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                      <span>รวมทั้งหมด:</span>
                      <strong className="font-heading text-slate-800 dark:text-slate-100 font-bold">
                        {total} รายการ
                      </strong>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      เสร็จแล้ว <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{completedList.length}</strong> / คงเหลือ <strong className="text-sky-600 dark:text-sky-400 font-bold">{remaining.length}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

