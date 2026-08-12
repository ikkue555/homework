import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, FileText, MapPin, Save, PlusCircle, Edit3 } from 'lucide-react';
import { CalendarEvent, EventType } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (event: Omit<CalendarEvent, 'id'>, existingId?: string) => void;
  initialDate?: string;
  editingEvent?: CalendarEvent | null;
}

const PRESET_EVENT_TYPES: { type: EventType; color: string; label: string }[] = [
  { type: 'สอบ', color: '#ef4444', label: '📝 สอบ / สอบกลางภาค-ปลายภาค' },
  { type: 'กิจกรรมโรงเรียน', color: '#8b5cf6', label: '🏫 กิจกรรมโรงเรียน / กีฬาสี' },
  { type: 'วันหยุด', color: '#10b981', label: '🌴 วันหยุด / วันหยุดนักขัตฤกษ์' },
  { type: 'นัดหมายกลุ่ม', color: '#0284c7', label: '👥 นัดหมายทำงานกลุ่ม / ติวหนังสือ' },
  { type: 'อื่นๆ', color: '#64748b', label: '📌 อื่นๆ (กรอกประเภทเอง)' },
];

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSaveEvent,
  initialDate,
  editingEvent,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<EventType>('กิจกรรมโรงเรียน');
  const [customType, setCustomType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (editingEvent) {
      setTitle(editingEvent.title || '');
      setDate(editingEvent.date || initialDate || new Date().toISOString().split('T')[0]);
      setTime(editingEvent.time || '09:00');
      setDescription(editingEvent.description || '');
      setLocation(editingEvent.location || '');

      const isPreset = PRESET_EVENT_TYPES.some(p => p.type === editingEvent.type && p.type !== 'อื่นๆ');
      if (isPreset) {
        setType(editingEvent.type);
        setCustomType('');
      } else {
        setType('อื่นๆ');
        setCustomType(editingEvent.type === 'อื่นๆ' ? '' : editingEvent.type);
      }
    } else {
      setTitle('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setType('กิจกรรมโรงเรียน');
      setCustomType('');
      setDescription('');
      setLocation('');
    }
  }, [isOpen, editingEvent, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกชื่อกิจกรรม');
      return;
    }

    let finalType: string = type;
    if (type === 'อื่นๆ') {
      finalType = customType.trim() || 'อื่นๆ';
    }

    const selectedPresetObj = PRESET_EVENT_TYPES.find(t => t.type === type);

    onSaveEvent(
      {
        title: title.trim(),
        date,
        time,
        type: finalType,
        description: description.trim(),
        location: location.trim(),
        color: selectedPresetObj?.color || '#0284c7',
      },
      editingEvent?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            {editingEvent ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {editingEvent ? 'แก้ไข Event / กิจกรรม' : 'เพิ่ม Event / กิจกรรมใหม่'}
            </h3>
            <p className="text-xs text-slate-500">
              {editingEvent ? 'ปรับปรุงรายละเอียดของกิจกรรมในปฏิทิน' : 'ลงวันสอบ กิจกรรม นัดหมายติว หรือวันหยุดในปฏิทิน'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-normal text-slate-600 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>ชื่อกิจกรรม <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              placeholder="เช่น สอบกลางภาควิชาฟิสิกส์, วันสถาปนาโรงเรียน..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-normal text-slate-600 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>วันที่</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-normal text-slate-600 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>เวลา (ถ้ามี)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-normal text-slate-600 mb-1 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-sky-600" />
              <span>ประเภทกิจกรรม</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white font-normal transition-all"
            >
              {PRESET_EVENT_TYPES.map((t) => (
                <option key={t.type} value={t.type}>{t.label}</option>
              ))}
            </select>

            {/* Custom Event Type Input when "อื่นๆ" is selected */}
            {type === 'อื่นๆ' && (
              <div className="mt-2.5 p-3 bg-sky-50/60 rounded-xl border border-sky-100 space-y-1.5 animate-fadeIn">
                <label className="block text-[11px] font-medium text-sky-800">
                  ระบุประเภทกิจกรรมเอง (Custom Event Type) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น แข่งกีฬา, ซ้อมดนตรี, วันเกิด, อบรมวิชาการ..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full bg-white border border-sky-200 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-normal text-slate-600 mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>สถานที่ (ถ้ามี)</span>
            </label>
            <input
              type="text"
              placeholder="เช่น ห้อง 421, หอสมุดกลาง..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-normal text-slate-600 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>รายละเอียดเพิ่มเติม</span>
            </label>
            <textarea
              rows={3}
              placeholder="หมายเหตุเพิ่มเติม..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-normal hover:bg-slate-100 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-medium shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{editingEvent ? 'บันทึกการแก้ไข' : 'บันทึก Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
