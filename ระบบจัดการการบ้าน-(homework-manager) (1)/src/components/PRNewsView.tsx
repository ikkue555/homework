import React, { useState } from 'react';
import { PRNewsItem, UserProfile } from '../types';
import { 
  Megaphone, 
  PlusCircle, 
  Trash2, 
  Pin, 
  Calendar, 
  Search, 
  User as UserIcon, 
  Tag, 
  X, 
  Plus, 
  ImageIcon,
  Sparkles,
  Upload
} from 'lucide-react';
import { compressImageFile } from '../lib/imageUtils';

interface PRNewsViewProps {
  newsList: PRNewsItem[];
  userProfile: UserProfile | null;
  onAddNews: (news: Omit<PRNewsItem, 'id' | 'createdAt' | 'authorName'>) => Promise<void>;
  onDeleteNews: (id: string) => Promise<void>;
}

export const PRNewsView: React.FC<PRNewsViewProps> = ({
  newsList,
  userProfile,
  onAddNews,
  onDeleteNews
}) => {
  const isAdmin = userProfile?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New item form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('ประกาศสำคัญ');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = ['ทั้งหมด', 'ประกาศสำคัญ', 'กิจกรรมโรงเรียน', 'การเรียนการสอน', 'ทั่วไป'];

  const filteredNews = newsList.filter((item) => {
    if (selectedCategory !== 'ทั้งหมด' && item.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchContent = item.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    return true;
  });

  const handleNewsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file, 1200, 1200, 0.82);
      setImageUrl(dataUrl);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถอัพโหลดรูปภาพได้');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmitNewNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await onAddNews({
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        category: category,
        pinned: pinned,
      });

      // Reset form
      setTitle('');
      setContent('');
      setImageUrl('');
      setCategory('ประกาศสำคัญ');
      setPinned(false);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to post news:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข่าวประชาสัมพันธ์');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-xs">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-800">
                ข่าวประชาสัมพันธ์ & ประกาศ
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                {newsList.length} รายการ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ติดตามข้อมูลข่าวสาร กิจกรรม และประกาศสำคัญจากโรงเรียน/อาจารย์
            </p>
          </div>
        </div>

        {/* Admin Action Button */}
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold font-heading text-xs shadow-md shadow-sky-600/20 inline-flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ เพิ่มข่าวประชาสัมพันธ์ (แอดมิน)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาหัวข้อข่าว หรือเนื้อหา..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Badges */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Cards Grid */}
      {filteredNews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold font-heading text-slate-700">
            ยังไม่มีข่าวประชาสัมพันธ์
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery || selectedCategory !== 'ทั้งหมด'
              ? 'ไม่พบข้อมูลตรงกับคำค้นหา ลองเปลี่ยนตัวกรอง'
              : 'ยังไม่มีการโพสต์ข่าวใหม่ในขณะนี้'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                item.pinned 
                  ? 'border-sky-300 ring-2 ring-sky-400/20' 
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Image if provided */}
                {item.imageUrl ? (
                  <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {item.pinned && (
                      <span className="absolute top-3 left-3 bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>ปักหมุด</span>
                      </span>
                    )}
                  </div>
                ) : (
                  item.pinned && (
                    <div className="px-5 pt-4">
                      <span className="inline-flex items-center space-x-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>ประกาศปักหมุด</span>
                      </span>
                    </div>
                  )
                )}

                {/* Body Content */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-medium">
                      <Tag className="w-3 h-3" />
                      <span>{item.category || 'ทั่วไป'}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString('th-TH')}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-heading text-slate-800 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
                    {item.content}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>โพสต์โดย: <strong>{item.authorName}</strong></span>
                </span>

                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm('คุณต้องการลบข่าวประชาสัมพันธ์นี้ใช่หรือไม่?')) {
                        onDeleteNews(item.id);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="ลบข่าวนี้ (แอดมิน)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Add PR News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold font-heading text-slate-800">
                  เพิ่มข่าวประชาสัมพันธ์ใหม่ (แอดมิน)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewNews} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หัวข้อข่าว/ประกาศ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น กำหนดการสอบกลางภาค 1/2569"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมวดหมู่ข่าว
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  <option value="ประกาศสำคัญ">ประกาศสำคัญ</option>
                  <option value="กิจกรรมโรงเรียน">กิจกรรมโรงเรียน</option>
                  <option value="การเรียนการสอน">การเรียนการสอน</option>
                  <option value="ทั่วไป">ทั่วไป</option>
                </select>
              </div>

              {/* Image Input with Device Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    รูปภาพประกอบข่าว (Optional)
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[11px] font-bold text-rose-600 hover:underline flex items-center space-x-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ลบรูป</span>
                    </button>
                  )}
                </div>

                {/* Upload Button */}
                <div className="bg-slate-50 border border-dashed border-sky-200 rounded-2xl p-3 text-center hover:bg-sky-50/50 transition-colors">
                  <input
                    type="file"
                    id="newsImageUploadInput"
                    accept="image/*"
                    onChange={handleNewsImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="newsImageUploadInput"
                    className="cursor-pointer flex items-center justify-center space-x-2 py-1 text-sky-700 text-xs font-bold"
                  >
                    <Upload className="w-4 h-4 text-sky-600" />
                    <span>{uploadingImage ? 'กำลังประมวลผล...' : 'อัพโหลดรูปภาพจากอุปกรณ์'}</span>
                  </label>
                </div>

                {/* URL Input fallback */}
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="หรือวางลิงก์รูปภาพ (URL)"
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="h-28 w-full object-cover rounded-xl border border-slate-200" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รายละเอียดข่าว/ประกาศ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="กรอกรายละเอียดข่าวสาร..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheckbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="pinCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  ปักหมุดข่าวนี้ไว้อันดับแรก
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/20 cursor-pointer transition-all"
                >
                  {submitting ? 'กำลังบันทึก...' : 'เผยแพร่ข่าวสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
