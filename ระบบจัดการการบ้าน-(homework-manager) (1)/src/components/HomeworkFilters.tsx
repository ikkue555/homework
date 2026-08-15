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
  onAddNewHomework?: () => void;
}

export const HomeworkFilters: React.FC<HomeworkFiltersProps> = ({
  filters,
  setFilters,
  availableSubjects,
  totalResults,
  onAddNewHomework: _onAddNewHomework,
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-2.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-4 sm:mb-6 space-y-2.5 transition-colors">
      {/* Clean Single-Row Layout: Search input + Filter button + Sort Dropdown */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Search Input with integrated count and clear button */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="ค้นหาการบ้าน หรือวิชา..."
            className="w-full pl-10 pr-16 sm:pr-24 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-500 transition-all font-medium"
          />
          
          {/* Integrated Count & Clear inside Search Input */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors btn-interactive cursor-pointer"
                title="ล้างข้อความค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-lg whitespace-nowrap">
              {totalResults}
            </span>
          </div>
        </div>

        {/* Filter Trigger Button */}
        <button
          onClick={() => setIsOpen(true)}
          className={`px-3 sm:px-3.5 py-2.5 rounded-2xl text-xs font-bold font-heading flex items-center space-x-1.5 border cursor-pointer shrink-0 shadow-2xs btn-interactive ${
            activeFiltersCount > 0
              ? 'bg-sky-600 text-white border-sky-600 shadow-sky-600/25'
              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title="เปิดตัวกรองการบ้าน"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 icon-hover-spin" />
          <span className="hidden sm:inline">ตัวกรอง</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-sky-700 text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Compact Sort Selector */}
        <div className="relative shrink-0">
          <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-2.5 sm:px-3 py-2.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="dueDate_asc" className="dark:bg-slate-800">ส่งเร็วสุด</option>
              <option value="dueDate_desc" className="dark:bg-slate-800">ส่งช้าสุด</option>
              <option value="progress_desc" className="dark:bg-slate-800">% มากสุด</option>
              <option value="progress_asc" className="dark:bg-slate-800">% น้อยสุด</option>
              <option value="subject" className="dark:bg-slate-800">วิชา A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips & Reset */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-[11px] font-medium">ตัวกรอง:</span>
            {filters.subject && (
              <span className="bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium inline-flex items-center space-x-1">
                <span>วิชา: {filters.subject}</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, subject: '' }))}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.dueDateFilter !== 'all' && (
              <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium inline-flex items-center space-x-1">
                <span>วันส่ง: {
                  filters.dueDateFilter === 'today' ? 'วันนี้' :
                  filters.dueDateFilter === 'this_week' ? 'สัปดาห์นี้' : 'เดือนนี้'
                }</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, dueDateFilter: 'all' }))}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.workType !== 'all' && (
              <span className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium inline-flex items-center space-x-1">
                <span>{filters.workType}</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, workType: 'all' }))}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1 text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold cursor-pointer py-1 px-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 btn-interactive shrink-0"
          >
            <RotateCcw className="w-3 h-3 icon-hover-spin" />
            <span>ล้างตัวกรอง</span>
          </button>
        </div>
      )}

      {/* FLOATING FILTER MODAL */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-sky-100 dark:border-slate-800 max-w-md w-full overflow-hidden relative flex flex-col max-h-[85vh] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold font-heading text-sm sm:text-base">ตัวกรองการบ้านละเอียด</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-700 btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Due Date Filter */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>กำหนดส่ง</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'today', label: 'ส่งวันนี้' },
                    { id: 'this_week', label: 'ภายในสัปดาห์นี้' },
                    { id: 'this_month', label: 'ภายในเดือนนี้' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setFilters(prev => ({ ...prev, dueDateFilter: option.id as any }))}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between btn-interactive cursor-pointer ${
                        filters.dueDateFilter === option.id
                          ? 'bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-700 dark:text-sky-300 shadow-2xs font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{option.label}</span>
                      {filters.dueDateFilter === option.id && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Type (Individual vs Group) */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-2">
                  <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>ประเภทงาน</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'งานเดี่ยว', label: 'งานเดี่ยว' },
                    { id: 'งานกลุ่ม', label: 'งานกลุ่ม' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFilters(prev => ({ ...prev, workType: type.id as any }))}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1 btn-interactive cursor-pointer ${
                        filters.workType === type.id
                          ? 'bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-700 dark:text-sky-300 shadow-2xs font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Select */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-2">
                  <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>วิชา ({availableSubjects.length} วิชา)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-750">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, subject: '' }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer btn-interactive ${
                      filters.subject === ''
                        ? 'bg-sky-600 text-white font-bold shadow-2xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    ทุกวิชา
                  </button>
                  {(availableSubjects || []).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setFilters(prev => ({ ...prev, subject: sub }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer btn-interactive ${
                        filters.subject === sub
                          ? 'bg-sky-600 text-white font-bold shadow-2xs'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl btn-interactive cursor-pointer flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตตัวกรอง</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/20 btn-interactive cursor-pointer"
              >
                ดูผลลัพธ์ ({totalResults} งาน)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
