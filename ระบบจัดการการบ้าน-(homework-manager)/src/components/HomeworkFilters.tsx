import React from 'react';
import { Search, Filter, RotateCcw, Calendar, BookOpen, Users, Tag } from 'lucide-react';
import { HomeworkFilterState, HomeworkType } from '../types';

interface HomeworkFiltersProps {
  filters: HomeworkFilterState;
  setFilters: React.Dispatch<React.SetStateAction<HomeworkFilterState>>;
  availableSubjects: string[];
  totalResults: number;
}

const HOMEWORK_TYPES: HomeworkType[] = [
  'แบบฝึกหัด/ใบงาน',
  'รายงาน',
  'งานนำเสนอ/พรีเซนต์',
  'โครงงาน/โปรเจกต์',
  'การบ้านทั่วไป',
  'เตรียมสอบ/ทบทวน',
  'อื่นๆ',
];

export const HomeworkFilters: React.FC<HomeworkFiltersProps> = ({
  filters,
  setFilters,
  availableSubjects,
  totalResults,
}) => {
  const handleReset = () => {
    setFilters({
      searchQuery: '',
      subject: '',
      dueDateFilter: 'all',
      type: '',
      workType: 'all',
      sortBy: 'dueDate_asc',
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.subject !== '' ||
    filters.dueDateFilter !== 'all' ||
    filters.type !== '' ||
    filters.workType !== 'all';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-xs mb-6">
      {/* Search & Top Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="ค้นหาชื่อวิชา หรือ รายละเอียดการบ้าน..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold px-1 py-0.5 rounded bg-slate-200/60"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Sort & Counter */}
        <div className="flex items-center space-x-3 justify-between md:justify-end">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>จัดเรียงตาม:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="dueDate_asc">วันส่งเร็วที่สุด</option>
              <option value="dueDate_desc">วันส่งช้าที่สุด</option>
              <option value="progress_desc">ความคืบหน้ามากที่สุด</option>
              <option value="progress_asc">ความคืบหน้าน้อยที่สุด</option>
              <option value="subject">ชื่อวิชา (A-Z)</option>
            </select>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg border border-sky-100 whitespace-nowrap">
            พบ {totalResults} รายการ
          </span>
        </div>
      </div>

      {/* Detailed Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
        {/* Filter by Subject */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>วิชา</span>
          </label>
          <select
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="">ทุกวิชา</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Filter by Due Date */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>วันกำหนดส่ง</span>
          </label>
          <select
            value={filters.dueDateFilter}
            onChange={(e) => setFilters(prev => ({ ...prev, dueDateFilter: e.target.value as any }))}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="all">ทั้งหมด</option>
            <option value="today">ส่งภายในวันนี้</option>
            <option value="this_week">ส่งภายในสัปดาห์นี้</option>
            <option value="this_month">ส่งภายในเดือนนี้</option>
          </select>
        </div>

        {/* Filter by Assignment Type */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center space-x-1">
            <Tag className="w-3.5 h-3.5 text-sky-600" />
            <span>ประเภทงาน</span>
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="">ทุกประเภทงาน</option>
            {HOMEWORK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Filter by Group / Individual */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>รูปแบบงาน</span>
          </label>
          <select
            value={filters.workType}
            onChange={(e) => setFilters(prev => ({ ...prev, workType: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="all">ทั้งหมด (เดี่ยว & กลุ่ม)</option>
            <option value="เดี่ยว">👤 งานเดี่ยว</option>
            <option value="กลุ่ม">👥 งานกลุ่ม</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips & Reset */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">ตัวกรองที่เลือก:</span>
            {filters.subject && (
              <span className="bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-medium">
                วิชา: {filters.subject}
              </span>
            )}
            {filters.dueDateFilter !== 'all' && (
              <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-medium">
                วันส่ง: {
                  filters.dueDateFilter === 'today' ? 'วันนี้' :
                  filters.dueDateFilter === 'this_week' ? 'สัปดาห์นี้' : 'เดือนนี้'
                }
              </span>
            )}
            {filters.type && (
              <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                ประเภท: {filters.type}
              </span>
            )}
            {filters.workType !== 'all' && (
              <span className="bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-medium">
                รูปแบบ: {filters.workType}
              </span>
            )}
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer py-1 px-2.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        </div>
      )}
    </div>
  );
};
