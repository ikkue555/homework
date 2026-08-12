import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  Calendar, 
  BookOpen, 
  Users, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';
import { HomeworkFilterState } from '../types';

interface HomeworkFiltersProps {
  filters: HomeworkFilterState;
  setFilters: React.Dispatch<React.SetStateAction<HomeworkFilterState>>;
  availableSubjects: string[];
  totalResults: number;
}

export const HomeworkFilters: React.FC<HomeworkFiltersProps> = ({
  filters,
  setFilters,
  availableSubjects,
  totalResults,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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

  // Count active filter conditions (excluding searchQuery and sortBy)
  const activeFiltersCount = [
    Boolean(filters.subject),
    filters.dueDateFilter !== 'all',
    filters.workType !== 'all',
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0 || Boolean(filters.searchQuery);

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs mb-6 space-y-3">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="ค้นหาชื่อวิชา หรือ รายละเอียดการบ้าน..."
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-500 transition-all font-medium"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/60"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Filter Trigger Button & Sort & Counter */}
        <div className="flex items-center space-x-2 justify-between sm:justify-end">
          {/* FLOATING MODAL TRIGGER BUTTON */}
          <button
            onClick={() => setIsOpen(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-heading flex items-center space-x-2 border transition-all cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>ตัวกรองการบ้าน</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-sky-700 text-[11px] font-extrabold flex items-center justify-center shadow-xs">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="dueDate_asc">วันส่งเร็วที่สุด</option>
              <option value="dueDate_desc">วันส่งช้าที่สุด</option>
              <option value="progress_desc">ความคืบหน้ามากที่สุด</option>
              <option value="progress_asc">ความคืบหน้าน้อยที่สุด</option>
              <option value="subject">ชื่อวิชา (A-Z)</option>
            </select>
          </div>

          {/* Results Count Badge */}
          <span className="text-xs font-bold px-2.5 py-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200/60 whitespace-nowrap">
            พบ {totalResults}
          </span>
        </div>
      </div>

      {/* Active Filter Chips & Reset */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">ตัวกรองที่เลือก:</span>
            {filters.subject && (
              <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center space-x-1">
                <span>วิชา: {filters.subject}</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, subject: '' }))}
                  className="hover:text-rose-600 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.dueDateFilter !== 'all' && (
              <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center space-x-1">
                <span>วันส่ง: {
                  filters.dueDateFilter === 'today' ? 'วันนี้' :
                  filters.dueDateFilter === 'this_week' ? 'สัปดาห์นี้' : 'เดือนนี้'
                }</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, dueDateFilter: 'all' }))}
                  className="hover:text-rose-600 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.workType !== 'all' && (
              <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center space-x-1">
                <span>รูปแบบ: {filters.workType}</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, workType: 'all' }))}
                  className="hover:text-rose-600 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างทั้งหมด</span>
          </button>
        </div>
      )}

      {/* FLOATING FILTER MODAL (หน้าต่างลอยตัวกรองการบ้าน) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-sky-100 max-w-lg w-full overflow-hidden relative flex flex-col max-h-[90vh] animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600/90 flex items-center justify-center text-white shadow-md">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-heading text-white">
                    ตัวกรองการบ้าน
                  </h3>
                  <p className="text-xs text-slate-300">
                    ปรับแต่งการแสดงผลและค้นหาการบ้านตามเงื่อนไข
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Search input in modal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <Search className="w-4 h-4 text-sky-600" />
                  <span>ค้นหาข้อความ</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    placeholder="พิมพ์ชื่อวิชา หรือรายละเอียดงาน..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-3.5 pr-8 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>กรองตามวิชา</span>
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="">ทุกวิชา</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Due Date Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>กรองตามวันกำหนดส่ง</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'today', label: 'ส่งภายในวันนี้' },
                    { id: 'this_week', label: 'ส่งภายในสัปดาห์นี้' },
                    { id: 'this_month', label: 'ส่งภายในเดือนนี้' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, dueDateFilter: option.id as any }))}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between cursor-pointer transition-all ${
                        filters.dueDateFilter === option.id
                          ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{option.label}</span>
                      {filters.dueDateFilter === option.id && (
                        <Check className="w-3.5 h-3.5 text-sky-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Type Filter (Group vs Individual) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>กรองตามรูปแบบงาน</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'เดี่ยว', label: '👤 งานเดี่ยว' },
                    { id: 'กลุ่ม', label: '👥 งานกลุ่ม' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, workType: option.id }))}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center cursor-pointer transition-all ${
                        filters.workType === option.id
                          ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                  <ArrowUpDown className="w-4 h-4 text-sky-600" />
                  <span>จัดเรียงรายการ</span>
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="dueDate_asc">วันกำหนดส่ง (ส่งเร็วที่สุดขึ้นก่อน)</option>
                  <option value="dueDate_desc">วันกำหนดส่ง (ส่งช้าที่สุดขึ้นก่อน)</option>
                  <option value="progress_desc">ความคืบหน้า (มากไปน้อย)</option>
                  <option value="progress_asc">ความคืบหน้า (น้อยไปมาก)</option>
                  <option value="subject">ชื่อวิชา (ตามตัวอักษร A-Z)</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ล้างตัวกรอง</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/20 transition-all cursor-pointer"
              >
                ดูผลลัพธ์ ({totalResults} รายการ)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
