import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  FileText, 
  Sliders, 
  AlertCircle,
  Save,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
  XCircle
} from 'lucide-react';
import { Homework, WorkType, Priority, SiteSettings } from '../types';
import { FormattedDescription } from './FormattedDescription';

interface AddHomeworkFormProps {
  onSave: (homework: Omit<Homework, 'id' | 'createdAt'>, existingId?: string) => void;
  onCancel?: () => void;
  editingHomework?: Homework | null;
  siteSettings?: SiteSettings | null;
}

// Client-side image compression to optimize Firestore storage & speed
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)'));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('ขนาดไฟล์ต้นฉบับเกิน 15MB กรุณาเลือกรูปขนาดเล็กลง'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์รูป'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'));
      img.onload = () => {
        try {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const isTransparentPng = file.type === 'image/png';
          const dataUrl = canvas.toDataURL(isTransparentPng ? 'image/png' : 'image/jpeg', 0.82);

          // If transparent PNG became too large, compress as JPEG
          if (dataUrl.length > 650000 && isTransparentPng) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(dataUrl);
          }
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const AddHomeworkForm: React.FC<AddHomeworkFormProps> = ({
  onSave,
  onCancel,
  editingHomework,
  siteSettings,
}) => {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [hasNoDueDate, setHasNoDueDate] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [hasNoDueTime, setHasNoDueTime] = useState(false);
  const [dueTime, setDueTime] = useState('23:59');
  
  const [workType, setWorkType] = useState<WorkType>('เดี่ยว');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [priority, setPriority] = useState<Priority>('ปกติ');
  
  // Member names for group work
  const [members, setMembers] = useState<string[]>(['']);

  // Populate form if editing
  useEffect(() => {
    if (editingHomework) {
      setSubject(editingHomework.subject || '');
      setTitle(editingHomework.title || '');

      if (!editingHomework.dueDate || editingHomework.dueDate === 'ไม่มีกำหนดส่ง' || editingHomework.dueDate === 'no_due_date') {
        setHasNoDueDate(true);
        setDueDate('');
      } else {
        setHasNoDueDate(false);
        setDueDate(editingHomework.dueDate);
      }

      if (!editingHomework.dueTime || editingHomework.dueTime === 'ไม่มีเวลากำหนด' || editingHomework.dueTime === 'none') {
        setHasNoDueTime(true);
        setDueTime('');
      } else {
        setHasNoDueTime(false);
        setDueTime(editingHomework.dueTime || '23:59');
      }

      setWorkType(editingHomework.workType || 'เดี่ยว');
      setDescription(editingHomework.description || '');
      setImageUrl(editingHomework.imageUrl || '');
      setImageError('');
      setProgress(editingHomework.progress || 0);
      setPriority(editingHomework.priority || 'ปกติ');
      setMembers(editingHomework.members && editingHomework.members.length > 0 ? editingHomework.members : ['']);
    } else {
      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
      setHasNoDueDate(false);
      setHasNoDueTime(false);
      setDueTime('23:59');
      setTitle('');
      setImageUrl('');
      setImageError('');
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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setImageError('');
      const compressed = await compressImageFile(file);
      setImageUrl(compressed);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setImageError(err.message || 'ไม่สามารถโหลดรูปภาพได้');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalSubject = subject.trim();
    if (!finalSubject) {
      alert('กรุณากรอกชื่อวิชา');
      return;
    }

    const finalTitle = title.trim();
    if (!finalTitle) {
      alert('กรุณากรอกหัวข้องาน');
      return;
    }

    if (!hasNoDueDate && !dueDate) {
      alert('กรุณาเลือกวันกำหนดส่ง หรือเลือก "ยังไม่มีกำหนดส่ง"');
      return;
    }

    if (!description.trim()) {
      alert('กรุณากรอกรายละเอียดของงาน');
      return;
    }

    const finalDueDate = hasNoDueDate ? 'ไม่มีกำหนดส่ง' : dueDate;
    const finalDueTime = (hasNoDueDate || hasNoDueTime) ? 'ไม่มีเวลากำหนด' : dueTime;

    const filteredMembers = workType === 'กลุ่ม' 
      ? members.map(m => m.trim()).filter(Boolean)
      : undefined;

    const completed = progress === 100;

    onSave(
      {
        subject: finalSubject,
        title: finalTitle,
        dueDate: finalDueDate,
        dueTime: finalDueTime,
        workType,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-sky-100 dark:border-slate-800 shadow-md max-w-3xl mx-auto transition-colors animate-slideUpFade">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-200 dark:border-sky-800">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-800 dark:text-slate-100">
              {editingHomework 
                ? (siteSettings?.formEditTitle || 'แก้ไขข้อมูลการบ้าน') 
                : (siteSettings?.formAddTitle || 'เพิ่มการบ้านใหม่')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              กรอกข้อมูลวิชา รายละเอียด และกำหนดส่งการบ้าน
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject (วิชา - กรอกเองเท่านั้น) & Title (หัวข้องาน - กรอกเอง) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{siteSettings?.formSubjectLabel || 'วิชา'} <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              placeholder="กรอกชื่อวิชา (เช่น คณิตศาสตร์, ภาษาไทย)..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-colors"
              required
            />
          </div>

          {/* Title (หัวข้องาน - กรอกเอง) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{siteSettings?.formTitleLabel || 'หัวข้องาน'} <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              placeholder="กรอกหัวข้องาน (เช่น แบบฝึกหัดบทที่ 3, รายงานเรื่องประวัติศาสตร์)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Due Date & Time (วันกำหนดส่ง & เวลากำหนดส่ง) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due Date */}
          <div className="bg-slate-50/80 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700 space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>{siteSettings?.formDueDateLabel || 'วันกำหนดส่ง'}</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-sky-700 dark:hover:text-sky-400">
                <input
                  type="checkbox"
                  checked={hasNoDueDate}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasNoDueDate(checked);
                    if (checked) {
                      setHasNoDueTime(true);
                    }
                  }}
                  className="rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 dark:bg-slate-700 cursor-pointer"
                />
                <span>{siteSettings?.formNoDueDateCheckbox || 'ยังไม่มีกำหนดส่ง'}</span>
              </label>
            </div>

            <input
              type="date"
              value={dueDate}
              disabled={hasNoDueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full text-sm rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-colors ${
                hasNoDueDate 
                  ? 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-sky-500'
              }`}
              required={!hasNoDueDate}
            />
          </div>

          {/* Due Time */}
          <div className="bg-slate-50/80 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700 space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>เวลากำหนดส่ง</span>
              </label>

              <label className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-sky-700 dark:hover:text-sky-400">
                <input
                  type="checkbox"
                  checked={hasNoDueTime || hasNoDueDate}
                  disabled={hasNoDueDate}
                  onChange={(e) => setHasNoDueTime(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 dark:bg-slate-700 cursor-pointer"
                />
                <span>ไม่มีเวลากำหนด</span>
              </label>
            </div>

            <input
              type="time"
              value={dueTime}
              disabled={hasNoDueTime || hasNoDueDate}
              onChange={(e) => setDueTime(e.target.value)}
              className={`w-full text-sm rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-colors ${
                (hasNoDueTime || hasNoDueDate)
                  ? 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-sky-500'
              }`}
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>{siteSettings?.formPriorityLabel || 'ระดับความสำคัญ'}</span>
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
          >
            <option value="ปกติ" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">🟢 ปกติ</option>
            <option value="สำคัญ" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">🟡 สำคัญ</option>
            <option value="ด่วนที่สุด" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">🔴 ด่วนที่สุด</option>
          </select>
        </div>

        {/* Work Mode (งานกลุ่ม หรือ งานเดี่ยว) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>{siteSettings?.formWorkTypeLabel || 'รูปแบบงาน'}</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWorkType('เดี่ยว')}
              className={`p-3 rounded-2xl border text-sm font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                workType === 'เดี่ยว'
                  ? 'bg-sky-50 dark:bg-sky-950/80 border-sky-500 dark:border-sky-500 text-sky-800 dark:text-sky-200 ring-2 ring-sky-200 dark:ring-sky-800'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>งานเดี่ยว</span>
            </button>

            <button
              type="button"
              onClick={() => setWorkType('กลุ่ม')}
              className={`p-3 rounded-2xl border text-sm font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                workType === 'กลุ่ม'
                  ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-500 dark:border-purple-500 text-purple-800 dark:text-purple-200 ring-2 ring-purple-200 dark:ring-purple-800'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>งานกลุ่ม</span>
            </button>
          </div>
        </div>

        {/* Members input if Group Work */}
        {workType === 'กลุ่ม' && (
          <div className="bg-purple-50/50 dark:bg-purple-950/30 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/60">
            <label className="block text-xs font-bold text-purple-900 dark:text-purple-200 mb-2 flex items-center justify-between">
              <span>รายชื่อสมาชิกในกลุ่ม (ไม่บังคับ)</span>
              <button
                type="button"
                onClick={handleAddMember}
                className="text-xs text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 flex items-center space-x-1 font-semibold cursor-pointer"
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
                    className="flex-1 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-slate-800 dark:text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
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
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>{siteSettings?.formDescriptionLabel || 'รายละเอียดของงาน'} <span className="text-rose-500">*</span></span>
          </label>

          <textarea
            rows={5}
            placeholder={`อธิบายรายละเอียดการบ้าน...
• ทำแบบฝึกหัดข้อ 1-5
• หน้า 42 ในหนังสือเรียน
• สรุปสูตรใส่กระดาษ A4`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 font-sans"
            required
          />

          {/* Live Preview Box if there is description */}
          {description.trim() && (
            <div className="mt-3 p-3.5 bg-slate-50/90 dark:bg-slate-850 rounded-2xl border border-sky-100 dark:border-slate-800 text-xs">
              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider block mb-1.5">
                👁️ ตัวอย่างการแสดงผล:
              </span>
              <FormattedDescription text={description} className="text-xs text-slate-700 dark:text-slate-200" />
            </div>
          )}
        </div>

        {/* Homework Image Attachment (รูปภาพประกอบจากเครื่อง - ไม่บังคับ) */}
        <div className="bg-slate-50/90 dark:bg-slate-850 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>รูปภาพประกอบการบ้าน <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(ไม่บังคับ)</span></span>
            </label>
            {imageUrl && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                <span>✓ แนบรูปภาพแล้ว</span>
              </span>
            )}
          </div>

          {imageError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}

          {!imageUrl ? (
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-slate-800/60 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={isProcessingImage}
                className="hidden"
              />
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-950/80 text-slate-400 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 shadow-2xs flex items-center justify-center transition-colors mb-2 border border-slate-200 dark:border-slate-700">
                {isProcessingImage ? (
                  <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                {isProcessingImage ? 'กำลังประมวลผลรูปภาพ...' : 'คลิกเพื่ออัปโหลดรูปประกอบจากเครื่อง'}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 text-center">
                รองรับไฟล์ภาพใบงาน โจทย์ หรือรูปประกอบ (JPG, PNG, WebP)
              </span>
            </label>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-3">
              <div className="relative group max-h-72 rounded-xl overflow-hidden bg-slate-900/5 dark:bg-slate-950/40 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                <img
                  src={imageUrl}
                  alt="รูปภาพประกอบการบ้าน"
                  className="max-h-72 w-full object-contain rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">
                  รูปภาพประกอบการบ้าน
                </span>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors flex items-center space-x-1 border border-slate-200/80 dark:border-slate-700">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={isProcessingImage}
                      className="hidden"
                    />
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>เปลี่ยนรูป</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors flex items-center space-x-1 cursor-pointer border border-rose-200 dark:border-rose-900/70"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบรูป</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Initial Progress Slider */}
        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{siteSettings?.formProgressLabel || 'ความคืบหน้าเริ่มต้น:'}</span>
            </label>
            <span className="text-sm font-bold font-heading text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800">
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
            className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />

          <div className="flex justify-between items-center mt-2">
            {[0, 25, 50, 75, 100].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setProgress(step)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  progress === step
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700'
                }`}
              >
                {step}%
              </button>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors cursor-pointer"
            >
              {siteSettings?.formCancelButton || 'ยกเลิก'}
            </button>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold font-heading text-sm shadow-md shadow-sky-600/30 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{editingHomework ? (siteSettings?.formSaveButton || 'บันทึกการแก้ไข') : (siteSettings?.formSaveButton || 'บันทึกการบ้านใหม่')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

