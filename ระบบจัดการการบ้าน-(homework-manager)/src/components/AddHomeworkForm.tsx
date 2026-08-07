import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  BookOpen, 
  Calendar, 
  Clock, 
  Tag, 
  Users, 
  User, 
  FileText, 
  Sliders, 
  AlertCircle,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { Homework, HomeworkType, WorkType, Priority } from '../types';
import { SUBJECT_PRESETS } from '../data/mockData';

interface AddHomeworkFormProps {
  onSave: (homework: Omit<Homework, 'id' | 'createdAt'>, existingId?: string) => void;
  onCancel?: () => void;
  editingHomework?: Homework | null;
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

export const AddHomeworkForm: React.FC<AddHomeworkFormProps> = ({
  onSave,
  onCancel,
  editingHomework,
}) => {
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [type, setType] = useState<HomeworkType>('แบบฝึกหัด/ใบงาน');
  const [workType, setWorkType] = useState<WorkType>('เดี่ยว');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [priority, setPriority] = useState<Priority>('ปกติ');
  
  // Member names for group work
  const [members, setMembers] = useState<string[]>(['']);

  // Populate form if editing
  useEffect(() => {
    if (editingHomework) {
      if (SUBJECT_PRESETS.includes(editingHomework.subject)) {
        setSubject(editingHomework.subject);
        setCustomSubject('');
      } else {
        setSubject('อื่นๆ');
        setCustomSubject(editingHomework.subject);
      }
      setDueDate(editingHomework.dueDate);
      setDueTime(editingHomework.dueTime || '23:59');
      setType(editingHomework.type);
      setWorkType(editingHomework.workType);
      setDescription(editingHomework.description);
      setProgress(editingHomework.progress);
      setPriority(editingHomework.priority);
      setMembers(editingHomework.members && editingHomework.members.length > 0 ? editingHomework.members : ['']);
    } else {
      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
      setSubject(SUBJECT_PRESETS[0]);
    }
  }, [editingHomework]);

  const handleAddMember = () => {
    setMembers(prev => [...prev, '']);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, value: string) => {
    setMembers(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalSubject = subject === 'อื่นๆ' ? customSubject.trim() : subject.trim();

    if (!finalSubject) {
      alert('กรุณาระบุชื่อวิชา');
      return;
    }

    if (!dueDate) {
      alert('กรุณาเลือกวันกำหนดส่ง');
      return;
    }

    if (!description.trim()) {
      alert('กรุณากรอกรายละเอียดของงาน');
      return;
    }

    const filteredMembers = workType === 'กลุ่ม' 
      ? members.map(m => m.trim()).filter(Boolean)
      : undefined;

    const completed = progress === 100;

    onSave(
      {
        subject: finalSubject,
        dueDate,
        dueTime,
        type,
        workType,
        description: description.trim(),
        progress,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
        members: filteredMembers,
        priority,
      },
      editingHomework?.id
    );
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-sky-100 shadow-md max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-800">
              {editingHomework ? 'แก้ไขข้อมูลการบ้าน' : 'เพิ่มการบ้านใหม่'}
            </h2>
            <p className="text-xs text-slate-500">
              กรอกข้อมูลการบ้าน วิชา กำหนดส่ง และประเภทงานเพื่อให้ระบบช่วยติดตาม
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject (วิชา) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>วิชา <span className="text-rose-500">*</span></span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            >
              {SUBJECT_PRESETS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
              <option value="อื่นๆ">➕ วิชาอื่นๆ (กรอกเอง)</option>
            </select>

            {subject === 'อื่นๆ' && (
              <input
                type="text"
                placeholder="พิมพ์ชื่อวิชา..."
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                required
              />
            )}
          </div>
        </div>

        {/* Due Date & Time (วันกำหนดส่ง) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>วันกำหนดส่ง <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>เวลากำหนดส่ง</span>
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Assignment Type & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
              <Tag className="w-4 h-4 text-sky-600" />
              <span>ประเภทงาน</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as HomeworkType)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            >
              {HOMEWORK_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-sky-600" />
              <span>ระดับความสำคัญ</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            >
              <option value="ปกติ">🟢 ปกติ</option>
              <option value="สำคัญ">🟡 สำคัญ</option>
              <option value="ด่วนที่สุด">🔴 ด่วนที่สุด</option>
            </select>
          </div>
        </div>

        {/* Work Mode (งานกลุ่ม หรือ งานเดี่ยว) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-sky-600" />
            <span>รูปแบบงาน</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWorkType('เดี่ยว')}
              className={`p-3 rounded-2xl border text-sm font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                workType === 'เดี่ยว'
                  ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4 text-sky-600" />
              <span>งานเดี่ยว</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkType('กลุ่ม')}
              className={`p-3 rounded-2xl border text-sm font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                workType === 'กลุ่ม'
                  ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>งานกลุ่ม</span>
            </button>
          </div>
        </div>

        {/* Members input if Group Work */}
        {workType === 'กลุ่ม' && (
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
            <label className="block text-xs font-bold text-purple-900 mb-2 flex items-center justify-between">
              <span>รายชื่อสมาชิกในกลุ่ม (ไม่บังคับ)</span>
              <button
                type="button"
                onClick={handleAddMember}
                className="text-xs text-purple-700 hover:text-purple-900 flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มสมาชิก</span>
              </button>
            </label>

            <div className="space-y-2">
              {members.map((member, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`สมาชิกคนที่ ${idx + 1}...`}
                    value={member}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    className="flex-1 bg-white border border-purple-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description (รายละเอียดของงาน) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>รายละเอียดของงาน <span className="text-rose-500">*</span></span>
          </label>
          <textarea
            rows={4}
            placeholder="อธิบายรายละเอียดการบ้าน ข้อที่ต้องทำ หน้าของหนังสือ ลิ้งก์อ้างอิง หรือคำสั่งครู..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            required
          />
        </div>

        {/* Initial Progress Slider */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>ความคืบหน้าเริ่มต้น:</span>
            </label>
            <span className="text-sm font-bold font-heading text-sky-700 px-2.5 py-0.5 rounded-full bg-sky-100">
              {progress}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          <div className="flex justify-between items-center mt-2">
            {[0, 25, 50, 75, 100].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setProgress(step)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  progress === step
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-sky-50'
                }`}
              >
                {step}%
              </button>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold font-heading text-sm shadow-md shadow-sky-600/30 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{editingHomework ? 'บันทึกการแก้ไข' : 'บันทึกการบ้านใหม่'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
