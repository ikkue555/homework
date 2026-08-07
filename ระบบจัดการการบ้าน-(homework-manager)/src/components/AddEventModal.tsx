import React, { useState } from 'react';
import { X, Calendar, Clock, Tag, FileText, MapPin, Save, PlusCircle } from 'lucide-react';
import { CalendarEvent, EventType } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate?: string;
}

const EVENT_TYPES: { type: EventType; color: string; label: string }[] = [
  { type: 'สอบ', color: '#ef4444', label: '📝 สอบ / สอบกลางภาค-ปลายภาค' },
  { type: 'กิจกรรมโรงเรียน', color: '#8b5cf6', label: '🏫 กิจกรรมโรงเรียน / กีฬาสี' },
  { type: 'วันหยุด', color: '#10b981', label: '🌴 วันหยุด / วันหยุดนักขัตฤกษ์' },
  { type: 'นัดหมายกลุ่ม', color: '#0284c7', label: '👥 นัดหมายทำงานกลุ่ม / ติวหนังสือ' },
  { type: 'อื่นๆ', color: '#64748b', label: '📌 อื่นๆ' },
];

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSaveEvent,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<EventType>('กิจกรรมโรงเรียน');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกชื่อกิจกรรม');
      return;
    }

    const selectedTypeObj = EVENT_TYPES.find(t => t.type === type);

    onSaveEvent({
      title: title.trim(),
      date,
      time,
      type,
      description: description.trim(),
      location: location.trim(),
      color: selectedTypeObj?.color || '#0284c7',
    });

    // Reset
    setTitle('');
    setDescription('');
    setLocation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-sky-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-slate-800">
              เพิ่ม Event / กิจกรรมใหม่
            </h3>
            <p className="text-xs text-slate-500">
              ลงวันสอบ กิจกรรม นัดหมายติว หรือวันหยุดในปฏิทิน
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>ชื่อกิจกรรม <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              placeholder="เช่น สอบกลางภาควิชาฟิสิกส์, วันสถาปนาโรงเรียน..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>วันที่</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>เวลา (ถ้ามี)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-sky-600" />
              <span>ประเภทกิจกรรม</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.type} value={t.type}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>สถานที่ (ถ้ามี)</span>
            </label>
            <input
              type="text"
              placeholder="เช่น ห้อง 421, หอสมุดกลาง..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>รายละเอียดเพิ่มเติม</span>
            </label>
            <textarea
              rows={3}
              placeholder="หมายเหตุเพิ่มเติม..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-100 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-heading shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึก Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
