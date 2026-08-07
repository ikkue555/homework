import React, { useState } from 'react';
import { Homework } from '../types';
import { HomeworkCard } from './HomeworkCard';
import { HomeworkFilters } from './HomeworkFilters';
import { CheckCircle2, Sparkles, Award, ArrowLeft } from 'lucide-react';

interface CompletedHomeworkViewProps {
  homeworks: Homework[];
  onUpdateProgress: (id: string, newProgress: number) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (homework: Homework) => void;
  onDelete: (id: string) => void;
  onViewDetail: (homework: Homework) => void;
  onBackToMain: () => void;
}

export const CompletedHomeworkView: React.FC<CompletedHomeworkViewProps> = ({
  homeworks,
  onUpdateProgress,
  onToggleComplete,
  onEdit,
  onDelete,
  onViewDetail,
  onBackToMain,
}) => {
  const completedHomeworks = homeworks.filter(h => h.completed || h.progress === 100);

  const [filters, setFilters] = useState({
    searchQuery: '',
    subject: '',
    dueDateFilter: 'all' as const,
    type: '',
    workType: 'all',
    sortBy: 'dueDate_desc' as const,
  });

  const availableSubjects = Array.from(new Set(completedHomeworks.map(h => h.subject)));

  // Filter & Sort
  const filtered = completedHomeworks.filter((hw) => {
    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchSubject = hw.subject.toLowerCase().includes(q);
      const matchDesc = hw.description.toLowerCase().includes(q);
      if (!matchSubject && !matchDesc) return false;
    }

    // Subject
    if (filters.subject && hw.subject !== filters.subject) return false;

    // Type
    if (filters.type && hw.type !== filters.type) return false;

    // WorkType
    if (filters.workType !== 'all' && hw.workType !== filters.workType) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 pointer-events-none">
          <Award className="w-64 h-64" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ความสำเร็จของคุณ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
              การบ้านที่เสร็จสมบูรณ์แล้ว
            </h2>
            <p className="text-sm text-emerald-100 mt-1 max-w-xl">
              ยินดีด้วย! คุณทำการบ้านเสร็จไปแล้วทั้งหมด <strong className="text-white text-base">{completedHomeworks.length}</strong> รายการ
            </p>
          </div>

          <button
            onClick={onBackToMain}
            className="self-start sm:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 font-medium text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าหลัก</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <HomeworkFilters
        filters={filters}
        setFilters={setFilters}
        availableSubjects={availableSubjects}
        totalResults={filtered.length}
      />

      {/* Grid List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 my-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-heading text-slate-800">
            {completedHomeworks.length === 0
              ? 'ยังไม่มีการบ้านที่ทำเสร็จแล้ว'
              : 'ไม่พบรายการตามตัวกรองที่เลือก'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {completedHomeworks.length === 0
              ? 'เมื่อทำการบ้านเสร็จและกดปุ่มเสร็จสมบูรณ์ รายการจะมาปรากฏที่นี่'
              : 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูรายการทั้งหมด'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((hw) => (
            <HomeworkCard
              key={hw.id}
              homework={hw}
              onUpdateProgress={onUpdateProgress}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};
