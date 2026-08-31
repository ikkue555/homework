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
  onOpenPRPopup?: () => void;
}

export const PRNewsView: React.FC<PRNewsViewProps> = ({
  newsList,
  userProfile,
  onAddNews,
  onDeleteNews,
  onOpenPRPopup,
}) => {
  const isAdmin = userProfile?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // New item form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('ประกาศสำคัญ');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = ['ทั้งหมด', 'ประกาศสำคัญ', 'กิจกรรมโรงเรียน', 'การเรียนการสอน', 'ทั่วไป'];

  const filteredNews = (newsList || []).filter((item) => {
    if (!item) return false;
    if (selectedCategory !== 'ทั้งหมด' && item.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchContent = (item.content || '').toLowerCase().includes(q);
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-800 shadow-xs shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                ข่าวประชาสัมพันธ์ & ประกาศ
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100/80 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {newsList.length} รายการ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ติดตามข้อมูลข่าวสาร กิจกรรม และประกาศสำคัญจากโรงเรียน/อาจารย์
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {onOpenPRPopup && (
            <button
              onClick={onOpenPRPopup}
              className="flex-1 md:flex-initial px-3.5 py-2 bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-slate-700 rounded-2xl font-bold text-xs shadow-2xs inline-flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              title="เปิดดูหน้าต่างประชาสัมพันธ์แบบ Pop-up"
            >
              <Megaphone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>เปิดดูประกาศ (Pop-up)</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-initial px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-medium text-xs shadow-xs inline-flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ เพิ่มข่าว (แอดมิน)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาหัวข้อข่าว หรือเนื้อหา..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>

          {/* Category Badges */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-normal whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white font-medium shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 my-4 transition-colors">
          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100 dark:border-slate-700">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
            ยังไม่มีข่าวประชาสัมพันธ์
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
              className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-sm ${
                item.pinned 
                  ? 'border-sky-300 dark:border-sky-700 ring-2 ring-sky-400/20 dark:ring-sky-500/20' 
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Image if provided - Full size uncropped */}
                {item.imageUrl ? (
                  <div 
                    className="relative w-full bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center cursor-pointer group"
                    onClick={() => setLightboxImage({ url: item.imageUrl!, title: item.title })}
                    title="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-auto max-h-[500px] object-contain block mx-auto transition-transform duration-200 group-hover:scale-[1.01]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {item.pinned && (
                      <span className="absolute top-3 left-3 bg-sky-600 text-white text-[10px] font-medium px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1 z-10">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>ปักหมุด</span>
                      </span>
                    )}
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 backdrop-blur-xs">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>คลิกเพื่อดูรูปภาพเต็มจอ</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  item.pinned && (
                    <div className="px-5 pt-4">
                      <span className="inline-flex items-center space-x-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-medium px-2.5 py-1 rounded-full border border-sky-200/60 dark:border-sky-800">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>ประกาศปักหมุด</span>
                      </span>
                    </div>
                  )
                )}

                {/* Body Content */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="inline-flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md font-normal border border-slate-200/60 dark:border-slate-700">
                      <Tag className="w-3 h-3" />
                      <span>{item.category || 'ทั่วไป'}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400 dark:text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString('th-TH')}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                    {item.content}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>โพสต์โดย: <strong className="font-medium text-slate-700 dark:text-slate-200">{item.authorName}</strong></span>
                </span>

                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm('คุณต้องการลบข่าวประชาสัมพันธ์นี้ใช่หรือไม่?')) {
                        onDeleteNews(item.id);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  เพิ่มข่าวประชาสัมพันธ์ใหม่ (แอดมิน)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewNews} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  หัวข้อข่าว/ประกาศ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น กำหนดการสอบกลางภาค 1/2569"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  หมวดหมู่ข่าว
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-slate-800"
                >
                  <option value="ประกาศสำคัญ" className="dark:bg-slate-800">ประกาศสำคัญ</option>
                  <option value="กิจกรรมโรงเรียน" className="dark:bg-slate-800">กิจกรรมโรงเรียน</option>
                  <option value="การเรียนการสอน" className="dark:bg-slate-800">การเรียนการสอน</option>
                  <option value="ทั่วไป" className="dark:bg-slate-800">ทั่วไป</option>
                </select>
              </div>

              {/* Image Input with Device Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    รูปภาพประกอบข่าว (Optional)
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ลบรูป</span>
                    </button>
                  )}
                </div>

                {/* Upload Button */}
                <div className="bg-slate-50 dark:bg-slate-800 border border-dashed border-sky-200 dark:border-sky-800 rounded-2xl p-3 text-center hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-colors">
                  <input
                    type="file"
                    id="newsImageUploadInput"
                    accept="image/*"
                    onChange={handleNewsImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="newsImageUploadInput"
                    className="cursor-pointer flex items-center justify-center space-x-2 py-1 text-sky-700 dark:text-sky-300 text-xs font-medium"
                  >
                    <Upload className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>{uploadingImage ? 'กำลังประมวลผล...' : 'อัพโหลดรูปภาพจากอุปกรณ์'}</span>
                  </label>
                </div>

                {/* URL Input fallback */}
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="หรือวางลิงก์รูปภาพ (URL)"
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="h-28 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  รายละเอียดข่าว/ประกาศ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="กรอกรายละเอียดข่าวสาร..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheckbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-600 focus:ring-sky-500"
                />
                <label htmlFor="pinCheckbox" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  ปักหมุดข่าวนี้ไว้อันดับแรก
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-medium cursor-pointer transition-all"
                >
                  {submitting ? 'กำลังบันทึก...' : 'เผยแพร่ข่าวสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Fullscreen Lightbox Modal for PR News Image */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between bg-slate-900/90 text-white px-5 py-3 rounded-t-2xl border-b border-white/10">
              <span className="text-xs font-bold truncate pr-4 text-slate-200">
                {lightboxImage.title}
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image display */}
            <div className="w-full bg-black/90 p-2 rounded-b-2xl flex items-center justify-center overflow-auto max-h-[82vh]">
              <img 
                src={lightboxImage.url} 
                alt={lightboxImage.title}
                className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl block mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

