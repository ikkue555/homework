import React, { useState, useEffect } from 'react';
import { SiteSettings, UserProfile, PRNewsItem } from '../types';
import { 
  ShieldCheck, 
  Settings, 
  Layers, 
  Image as ImageIcon, 
  Save, 
  CheckCircle2, 
  Users, 
  Megaphone, 
  Bell, 
  Layout, 
  ExternalLink,
  PlusCircle,
  Trash2,
  RefreshCw,
  Sparkles,
  Upload,
  X,
  FileText,
  Eye,
  Search,
  RotateCcw,
  CheckSquare,
  Share2,
  Sliders,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { getAllRegisteredUsers, DEFAULT_SITE_SETTINGS } from '../lib/firebase';
import { compressImageFile } from '../lib/imageUtils';
import { PRPopupModal } from './PRPopupModal';

interface AdminBackofficeViewProps {
  userProfile: UserProfile;
  siteSettings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
  newsList: PRNewsItem[];
  onAddNews: (news: Omit<PRNewsItem, 'id' | 'createdAt' | 'authorName'>) => Promise<void>;
  onDeleteNews: (id: string) => Promise<void>;
}

export const AdminBackofficeView: React.FC<AdminBackofficeViewProps> = ({
  userProfile,
  siteSettings,
  onSaveSettings,
  newsList,
  onAddNews,
  onDeleteNews
}) => {
  // Local settings state for editing
  const [formData, setFormData] = useState<SiteSettings>(siteSettings);
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'popup' | 'news' | 'users'>('content');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPreviewPopupOpen, setIsPreviewPopupOpen] = useState(false);

  // Content Text Editor Category & Search Filters
  const [textCategory, setTextCategory] = useState<'all' | 'header' | 'nav' | 'stats' | 'empty' | 'cards' | 'form' | 'friends' | 'footer'>('all');
  const [textSearch, setTextSearch] = useState('');

  // User list state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Keep form updated with cloud settings
  useEffect(() => {
    setFormData(siteSettings);
  }, [siteSettings]);

  // Load user list when users subtab is clicked
  useEffect(() => {
    if (activeSubTab === 'users') {
      fetchUsers();
    }
  }, [activeSubTab]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    const users = await getAllRegisteredUsers();
    setUsersList(users);
    setUsersLoading(false);
  };

  const handleFormChange = (key: keyof SiteSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Upload image from user device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file, 1200, 1200, 0.82);
      handleFormChange('popupImageUrl', dataUrl);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถอัพโหลดรูปภาพได้');
    } finally {
      setUploadingImage(false);
      // Reset input value so same file can be reselected if needed
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลระบบ');
    } finally {
      setSaving(false);
    }
  };

  const presetImages = [
    {
      label: 'บรรยากาศโรงเรียน',
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      label: 'การเรียนและสมุดบันทึก',
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'
    },
    {
      label: 'ตารางเรียนและนาฬิกา',
      url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80'
    },
    {
      label: 'โน้ตบุ๊กและวิชาการ',
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-sky-500/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center backdrop-blur-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading">
                  ระบบหลังบ้าน (Admin Control Panel)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/30 text-sky-300 border border-sky-400/30">
                  สิทธิ์สูงสุด
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                จัดการข้อความ ป๊อปอัพประชาสัมพันธ์ ข่าวสาร และผู้ใช้งาน ระบบจะซิงค์ข้อมูลเรียลไทม์ไปยังทุกอุปกรณ์
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>เข้าสู่ระบบในชื่อ: <strong>{userProfile.displayName}</strong></span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveSubTab('content')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold font-heading transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'content'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>ข้อความส่วนหัว & แถบประกาศ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('popup')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold font-heading transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'popup'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Pop up ประชาสัมพันธ์เมื่อเข้าเว็บ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('news')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold font-heading transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'news'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>ข่าวประชาสัมพันธ์ ({newsList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold font-heading transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>บัญชีสมาชิกทั้งหมด</span>
        </button>
      </div>

      {/* SUBTAB 1: Text Content & Navigation Settings */}
      {activeSubTab === 'content' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-800 flex items-center space-x-2">
                <Layout className="w-5 h-5 text-sky-600" />
                <span>ตัวแก้ไขข้อความทั้งหมดในระบบ (Universal Text Backoffice)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                แก้ไขข้อความได้ทุกจุดในแอปพลิเคชัน บันทึกแล้วระบบจะซิงค์ Firestore เรียลไทม์ไปยังทุกเครื่องทันที
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('คุณต้องการรีเซ็ตข้อความทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
                    setFormData(prev => ({
                      ...prev,
                      ...DEFAULT_SITE_SETTINGS
                    }));
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold font-heading inline-flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="คืนค่าข้อความเริ่มต้น"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>คืนค่าเริ่มต้น</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/20 inline-flex items-center space-x-1.5 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'กำลังบันทึก...' : 'บันทึกและซิงค์ทันที'}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>บันทึกและซิงค์การตั้งค่าข้อความขึ้น Cloud Firestore เรียบร้อยแล้ว! ทุกอุปกรณ์จะเห็นการเปลี่ยนแปลงทันที</span>
            </div>
          )}

          {/* Search & Category Filter Bar */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                placeholder="ค้นหาข้อความหรือจุดที่ต้องการแก้ไข เช่น 'การบ้าน', 'ปุ่ม', 'เพื่อน', 'เลยกำหนด'..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
              {textSearch && (
                <button
                  type="button"
                  onClick={() => setTextSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'header', label: '1. ชื่อระบบ & ส่วนหัว' },
                { id: 'nav', label: '2. เมนูนำทาง' },
                { id: 'stats', label: '3. สถิติ & กราฟ' },
                { id: 'empty', label: '4. ข้อความแจ้งเตือน' },
                { id: 'cards', label: '5. การ์ดการบ้าน & ปุ่ม' },
                { id: 'form', label: '6. ฟอร์มเพิ่ม/แก้ไข' },
                { id: 'friends', label: '7. ระบบเพื่อน & แชร์' },
                { id: 'footer', label: '8. ท้ายเว็บ & เครดิต' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTextCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-heading font-semibold shrink-0 cursor-pointer transition-all ${
                    textCategory === cat.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: HEADER & BRANDING */}
          {(textCategory === 'all' || textCategory === 'header') && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold font-heading text-sky-900 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>1. ชื่อระบบ & แถบประกาศส่วนหัว (Header & Branding)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อระบบ / ชื่อเว็บ (App Title)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.appTitle}
                    onChange={(e) => handleFormChange('appTitle', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คำขวัญ / คำอธิบายใต้ชื่อระบบ (App Subtitle)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.appSubtitle}
                    onChange={(e) => handleFormChange('appSubtitle', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800">
                      แสดงแถบประกาศด่วนด้านบนสุด (Top Announcement Banner)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      เปิด/ปิด แถบข้อความวิ่งแจ้งเตือนสีฟ้าบนหัวเว็บ
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showAnnouncementBanner}
                    onChange={(e) => handleFormChange('showAnnouncementBanner', e.target.checked)}
                    className="w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                {formData.showAnnouncementBanner && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ข้อความแถบประกาศด่วน
                    </label>
                    <input
                      type="text"
                      value={formData.announcementBannerText || ''}
                      onChange={(e) => handleFormChange('announcementBannerText', e.target.value)}
                      placeholder="เช่น 📢 แจ้งหยุดเรียนเนื่องในวันสำคัญ หรือ ประกาศกำหนดการสอบ"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: NAVIGATION TAB LABELS */}
          {(textCategory === 'all' || textCategory === 'nav') && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold font-heading text-sky-900 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5">
                <Layout className="w-3.5 h-3.5 text-sky-600" />
                <span>2. ข้อความปุ่มและแถบเมนูนำทาง (Navigation Tab Labels)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อเมนู: หน้าหลัก (การบ้านคงเหลือ)
                  </label>
                  <input
                    type="text"
                    value={formData.navMainLabel || ''}
                    onChange={(e) => handleFormChange('navMainLabel', e.target.value)}
                    placeholder="หน้าหลัก (การบ้าน)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อเมนู: ข่าวประชาสัมพันธ์
                  </label>
                  <input
                    type="text"
                    value={formData.navNewsLabel || ''}
                    onChange={(e) => handleFormChange('navNewsLabel', e.target.value)}
                    placeholder="ข่าวประชาสัมพันธ์"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อเมนู: เสร็จสมบูรณ์
                  </label>
                  <input
                    type="text"
                    value={formData.navCompletedLabel || ''}
                    onChange={(e) => handleFormChange('navCompletedLabel', e.target.value)}
                    placeholder="เสร็จสมบูรณ์"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อเมนู: เลยกำหนดส่ง
                  </label>
                  <input
                    type="text"
                    value={formData.navOverdueLabel || ''}
                    onChange={(e) => handleFormChange('navOverdueLabel', e.target.value)}
                    placeholder="เลยกำหนดส่ง"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อเมนู: ปฏิทิน & กิจกรรม
                  </label>
                  <input
                    type="text"
                    value={formData.navCalendarLabel || ''}
                    onChange={(e) => handleFormChange('navCalendarLabel', e.target.value)}
                    placeholder="ปฏิทิน & กิจกรรม"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อเมนู: ระบบหลังบ้าน
                  </label>
                  <input
                    type="text"
                    value={formData.navAdminLabel || ''}
                    onChange={(e) => handleFormChange('navAdminLabel', e.target.value)}
                    placeholder="ระบบหลังบ้าน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อปุ่ม: เพิ่มการบ้านใหม่
                  </label>
                  <input
                    type="text"
                    value={formData.navAddLabel || ''}
                    onChange={(e) => handleFormChange('navAddLabel', e.target.value)}
                    placeholder="เพิ่มการบ้าน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อปุ่ม: ระบบเพื่อน
                  </label>
                  <input
                    type="text"
                    value={formData.navFriendsLabel || ''}
                    onChange={(e) => handleFormChange('navFriendsLabel', e.target.value)}
                    placeholder="เพื่อน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: DASHBOARD STATS & PROGRESS LABELS */}
          {(textCategory === 'all' || textCategory === 'stats') && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold font-heading text-sky-900 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-600" />
                <span>3. ข้อความกล่องสถิติ & กราฟภาพรวม (Dashboard Stats & Progress Chart)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    กล่อง 1: การบ้านคงเหลือ
                  </label>
                  <input
                    type="text"
                    value={formData.statPendingLabel || ''}
                    onChange={(e) => handleFormChange('statPendingLabel', e.target.value)}
                    placeholder="การบ้านคงเหลือ"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    กล่อง 2: เสร็จสมบูรณ์
                  </label>
                  <input
                    type="text"
                    value={formData.statCompletedLabel || ''}
                    onChange={(e) => handleFormChange('statCompletedLabel', e.target.value)}
                    placeholder="เสร็จสมบูรณ์"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    กล่อง 3: เลยกำหนดส่ง
                  </label>
                  <input
                    type="text"
                    value={formData.statOverdueLabel || ''}
                    onChange={(e) => handleFormChange('statOverdueLabel', e.target.value)}
                    placeholder="เลยกำหนดส่ง"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    กล่อง 4: การบ้านทั้งหมด
                  </label>
                  <input
                    type="text"
                    value={formData.statTotalLabel || ''}
                    onChange={(e) => handleFormChange('statTotalLabel', e.target.value)}
                    placeholder="การบ้านทั้งหมด"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    หัวข้อแผนภูมิความคืบหน้า
                  </label>
                  <input
                    type="text"
                    value={formData.statProgressChartTitle || ''}
                    onChange={(e) => handleFormChange('statProgressChartTitle', e.target.value)}
                    placeholder="สรุปสถานะความคืบหน้าการบ้าน (Progress Breakdown)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    คำอธิบายแผนภูมิความคืบหน้า
                  </label>
                  <input
                    type="text"
                    value={formData.statProgressChartSubtitle || ''}
                    onChange={(e) => handleFormChange('statProgressChartSubtitle', e.target.value)}
                    placeholder="แผนภูมิวงกลมจำแนกตามขั้นตอนการทำการบ้าน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายความคืบหน้าเฉลี่ย
                  </label>
                  <input
                    type="text"
                    value={formData.statAverageProgressLabel || ''}
                    onChange={(e) => handleFormChange('statAverageProgressLabel', e.target.value)}
                    placeholder="ความคืบหน้าเฉลี่ย:"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: EMPTY STATE NOTICES */}
          {(textCategory === 'all' || textCategory === 'empty') && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold font-heading text-sky-900 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>4. ข้อความแจ้งเตือนเมื่อไม่มีข้อมูล (Empty State Notices)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    หัวข้อ: หน้าหลักยังไม่มีการบ้าน
                  </label>
                  <input
                    type="text"
                    value={formData.emptyHomeworkTitle || ''}
                    onChange={(e) => handleFormChange('emptyHomeworkTitle', e.target.value)}
                    placeholder="ยังไม่มีรายการการบ้านในขณะนี้"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    คำอธิบาย: หน้าหลักยังไม่มีการบ้าน
                  </label>
                  <input
                    type="text"
                    value={formData.emptyHomeworkMessage || ''}
                    onChange={(e) => handleFormChange('emptyHomeworkMessage', e.target.value)}
                    placeholder="กดปุ่มเพิ่มการบ้านใหม่ด้านล่างเพื่อเริ่มบันทึก..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    หัวข้อ: ยังไม่มีการบ้านที่เสร็จสมบูรณ์
                  </label>
                  <input
                    type="text"
                    value={formData.emptyCompletedTitle || ''}
                    onChange={(e) => handleFormChange('emptyCompletedTitle', e.target.value)}
                    placeholder="ยังไม่มีการบ้านที่ทำเสร็จสมบูรณ์"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    คำอธิบาย: ยังไม่มีการบ้านที่เสร็จสมบูรณ์
                  </label>
                  <input
                    type="text"
                    value={formData.emptyCompletedMessage || ''}
                    onChange={(e) => handleFormChange('emptyCompletedMessage', e.target.value)}
                    placeholder="เมื่อคุณทำเครื่องหมายว่าทำการบ้านเสร็จแล้ว 100% รายการจะมาแสดงที่นี่"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    หัวข้อ: ไม่มีการบ้านที่เลยกำหนดส่ง
                  </label>
                  <input
                    type="text"
                    value={formData.emptyOverdueTitle || ''}
                    onChange={(e) => handleFormChange('emptyOverdueTitle', e.target.value)}
                    placeholder="ยอดเยี่ยม! ไม่มีการบ้านที่เลยกำหนดส่ง"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    คำอธิบาย: ไม่มีการบ้านที่เลยกำหนดส่ง
                  </label>
                  <input
                    type="text"
                    value={formData.emptyOverdueMessage || ''}
                    onChange={(e) => handleFormChange('emptyOverdueMessage', e.target.value)}
                    placeholder="คุณทำการบ้านส่งตรงเวลาทั้งหมด รักษาความสม่ำเสมอนี้ไว้นะครับ"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: HOMEWORK CARDS & ACTION BUTTONS */}
          {(textCategory === 'all' || textCategory === 'cards') && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold font-heading text-sky-900 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>5. ข้อความบนการ์ดการบ้าน & ปุ่มสถานะ (Homework Cards & Action Buttons)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    คำนำหน้ากำหนดส่ง (Due Prefix)
                  </label>
                  <input
                    type="text"
                    value={formData.cardDuePrefix || ''}
                    onChange={(e) => handleFormChange('cardDuePrefix', e.target.value)}
                    placeholder="ส่ง:"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ข้อความเมื่อไม่มีกำหนดส่ง
                  </label>
                  <input
                    type="text"
                    value={formData.cardNoDueDate || ''}
                    onChange={(e) => handleFormChange('cardNoDueDate', e.target.value)}
                    placeholder="ไม่มีกำหนดส่ง"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    คำนำหน้าประเภทงาน
                  </label>
                  <input
                    type="text"
                    value={formData.cardWorkTypePrefix || ''}
                    onChange={(e) => handleFormChange('cardWorkTypePrefix', e.target.value)}
                    placeholder="งาน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ข้อความปุ่ม: เสร็จแล้ว (Completed)
                  </label>
                  <input
                    type="text"
                    value={formData.cardMarkDoneText || ''}
                    onChange={(e) => handleFormChange('cardMarkDoneText', e.target.value)}
                    placeholder="เสร็จแล้ว"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ข้อความปุ่ม: ยังไม่เสร็จ (Incomplete)
                  </label>
                  <input
                    type="text"
                    value={formData.cardMarkUndoneText || ''}
                    onChange={(e) => handleFormChange('cardMarkUndoneText', e.target.value)}
                    placeholder="ยังไม่เสร็จ"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายสถานะ: เลยกำหนดส่ง
                  </label>
                  <input
                    type="text"
                    value={formData.cardOverdueBadge || ''}
                    onChange={(e) => handleFormChange('cardOverdueBadge', e.target.value)}
                    placeholder="เลยกำหนดส่ง"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายสถานะ: เสร็จสมบูรณ์
                  </label>
                  <input
                    type="text"
                    value={formData.cardCompletedBadge || ''}
                    onChange={(e) => handleFormChange('cardCompletedBadge', e.target.value)}
                    placeholder="เสร็จสมบูรณ์"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: ADD & EDIT HOMEWORK FORM LABELS */}
          {(textCategory === 'all' || textCategory === 'form') && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold font-heading text-sky-900 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-sky-600" />
                <span>6. ข้อความฟอร์มเพิ่ม/แก้ไขการบ้าน (Add/Edit Form Labels)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    หัวข้อหน้า: เพิ่มการบ้านใหม่
                  </label>
                  <input
                    type="text"
                    value={formData.formAddTitle || ''}
                    onChange={(e) => handleFormChange('formAddTitle', e.target.value)}
                    placeholder="เพิ่มการบ้านใหม่"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    หัวข้อหน้า: แก้ไขข้อมูลการบ้าน
                  </label>
                  <input
                    type="text"
                    value={formData.formEditTitle || ''}
                    onChange={(e) => handleFormChange('formEditTitle', e.target.value)}
                    placeholder="แก้ไขข้อมูลการบ้าน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายชื่อวิชา (Subject Label)
                  </label>
                  <input
                    type="text"
                    value={formData.formSubjectLabel || ''}
                    onChange={(e) => handleFormChange('formSubjectLabel', e.target.value)}
                    placeholder="ชื่อวิชา"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายหัวข้อเรื่อง / หัวข้องาน (Topic Label)
                  </label>
                  <input
                    type="text"
                    value={formData.formTitleLabel || ''}
                    onChange={(e) => handleFormChange('formTitleLabel', e.target.value)}
                    placeholder="หัวข้องาน / เรื่อง"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายกำหนดส่ง (Due Date Label)
                  </label>
                  <input
                    type="text"
                    value={formData.formDueDateLabel || ''}
                    onChange={(e) => handleFormChange('formDueDateLabel', e.target.value)}
                    placeholder="กำหนดส่ง"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายเวลากำหนดส่ง (Due Time Label)
                  </label>
                  <input
                    type="text"
                    value={formData.formDueTimeLabel || ''}
                    onChange={(e) => handleFormChange('formDueTimeLabel', e.target.value)}
                    placeholder="เวลาส่ง"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายประเภทงาน (เดี่ยว/กลุ่ม)
                  </label>
                  <input
                    type="text"
                    value={formData.formWorkTypeLabel || ''}
                    onChange={(e) => handleFormChange('formWorkTypeLabel', e.target.value)}
                    placeholder="ประเภทงาน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายรายละเอียดงาน (Description Label)
                  </label>
                  <input
                    type="text"
                    value={formData.formDescriptionLabel || ''}
                    onChange={(e) => handleFormChange('formDescriptionLabel', e.target.value)}
                    placeholder="รายละเอียดงาน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ป้ายระดับความสำคัญ (Priority Label)
                  </label>
                  <input
                    type="text"
                    value={formData.formPriorityLabel || ''}
                    onChange={(e) => handleFormChange('formPriorityLabel', e.target.value)}
                    placeholder="ระดับความสำคัญ"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ปุ่มบันทึก: เพิ่มการบ้าน
                  </label>
                  <input
                    type="text"
                    value={formData.formSubmitAdd || ''}
                    onChange={(e) => handleFormChange('formSubmitAdd', e.target.value)}
                    placeholder="บันทึกการบ้านใหม่"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ปุ่มบันทึก: แก้ไขการบ้าน
                  </label>
                  <input
                    type="text"
                    value={formData.formSubmitEdit || ''}
                    onChange={(e) => handleFormChange('formSubmitEdit', e.target.value)}
                    placeholder="บันทึกการแก้ไข"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ปุ่มยกเลิก (Cancel Button)
                  </label>
                  <input
                    type="text"
                    value={formData.formCancelButton || ''}
                    onChange={(e) => handleFormChange('formCancelButton', e.target.value)}
                    placeholder="ยกเลิก"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: FRIENDS SYSTEM & TCG SHARING LABELS */}
          {(textCategory === 'all' || textCategory === 'friends') && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold font-heading text-sky-900 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5">
                <Share2 className="w-3.5 h-3.5 text-sky-600" />
                <span>7. ข้อความระบบเพื่อน & การ์ดแชร์ 3D TCG (Friends & Card Sharing)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    หัวข้อหน้าต่างเพื่อน (Friends Modal Title)
                  </label>
                  <input
                    type="text"
                    value={formData.friendsModalTitle || ''}
                    onChange={(e) => handleFormChange('friendsModalTitle', e.target.value)}
                    placeholder="ระบบเพื่อนและการแชร์การบ้าน (Friends & Cards)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อแท็บ: รายชื่อเพื่อน (Friends Tab)
                  </label>
                  <input
                    type="text"
                    value={formData.friendsTabList || ''}
                    onChange={(e) => handleFormChange('friendsTabList', e.target.value)}
                    placeholder="เพื่อนของฉัน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อแท็บ: ค้นหา/เพิ่มเพื่อน (Add Friend Tab)
                  </label>
                  <input
                    type="text"
                    value={formData.friendsTabAdd || ''}
                    onChange={(e) => handleFormChange('friendsTabAdd', e.target.value)}
                    placeholder="เพิ่มเพื่อนใหม่"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อแท็บ: คำขอเป็นเพื่อน (Requests Tab)
                  </label>
                  <input
                    type="text"
                    value={formData.friendsTabRequests || ''}
                    onChange={(e) => handleFormChange('friendsTabRequests', e.target.value)}
                    placeholder="คำขอเป็นเพื่อน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อแท็บ: แชร์การบ้าน 3D TCG (Share Tab)
                  </label>
                  <input
                    type="text"
                    value={formData.friendsTabShare || ''}
                    onChange={(e) => handleFormChange('friendsTabShare', e.target.value)}
                    placeholder="แชร์การบ้าน 3D TCG"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ข้อความปุ่มแชร์ไปยังเพื่อน
                  </label>
                  <input
                    type="text"
                    value={formData.friendsShareButton || ''}
                    onChange={(e) => handleFormChange('friendsShareButton', e.target.value)}
                    placeholder="ส่งการ์ดการบ้านไปยังเพื่อน"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: FOOTER & CONTACT INFO */}
          {(textCategory === 'all' || textCategory === 'footer') && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold font-heading text-sky-900 uppercase tracking-wider bg-sky-50 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>8. ข้อมูลส่วนท้ายเว็บ & การติดต่อโรงเรียน (Footer & Support Info)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อโรงเรียน / สถาบัน ด้านล่างสุด (Footer School Name)
                  </label>
                  <input
                    type="text"
                    value={formData.footerSchoolName || ''}
                    onChange={(e) => handleFormChange('footerSchoolName', e.target.value)}
                    placeholder="ระบบจัดการการบ้านโรงเรียน สวนกุหลาบวิทยาลัย"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    รายละเอียดช่วยเหลือ / การติดต่อ (Footer Contact & Support Text)
                  </label>
                  <input
                    type="text"
                    value={formData.footerContactText || ''}
                    onChange={(e) => handleFormChange('footerContactText', e.target.value)}
                    placeholder="ระบบบันทึกและติดตามการบ้านออนไลน์..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-5 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              * ข้อมูลที่แก้ไขจะถูกบันทึกและซิงค์ไปยังสมาชิกทุกคนแบบเรียลไทม์
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/20 inline-flex items-center space-x-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกและซิงค์ข้อความทั้งหมด'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 2: Pop-up Settings */}
      {activeSubTab === 'popup' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-800 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-sky-600" />
                <span>ตั้งค่า Pop up รูปภาพประชาสัมพันธ์เมื่อเข้าสู่เว็บไซต์</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                จัดการปุ่มเปิด/ปิด รูปภาพ และเลือกรูปแบบการแสดงผล (รูปภาพอย่างเดียว / ข้อความอย่างเดียว / ทั้งหมด)
              </p>
            </div>
            {saveSuccess && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>บันทึก Pop up เรียบร้อยแล้ว!</span>
              </span>
            )}
          </div>

          {/* 1. Toggle Enable Popup */}
          <div className="flex items-center justify-between bg-sky-50/60 p-4 rounded-2xl border border-sky-100">
            <div>
              <label className="text-xs font-bold text-sky-900 block">
                ปุ่มเปิด/ปิด การแสดงผล Pop up ด่วนเมื่อเข้าเว็บ
              </label>
              <p className="text-[11px] text-sky-700">
                {formData.popupEnabled ? '🟢 กำลังเปิดใช้งาน (Pop up จะแสดงเมื่อผู้ใช้เข้าเว็บ)' : '🔴 ปิดใช้งานอยู่ (จะไม่แสดง Pop up ตอนเข้าเว็บ)'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.popupEnabled} 
                onChange={(e) => handleFormChange('popupEnabled', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* 2. Choose Display Mode */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              รูปแบบการแสดงผล Pop up (Display Mode)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleFormChange('popupDisplayMode', 'both')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  (formData.popupDisplayMode || 'both') === 'both'
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sky-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold">แสดงทั้ง รูปภาพ + ข้อความ</span>
                  </div>
                  {(formData.popupDisplayMode || 'both') === 'both' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  แสดงรูปภาพปกด้านบน พร้อมหัวข้อและเนื้อหาข้อความรายละเอียด
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleFormChange('popupDisplayMode', 'image_only')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formData.popupDisplayMode === 'image_only'
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sky-600">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">รูปภาพอย่างเดียว</span>
                  </div>
                  {formData.popupDisplayMode === 'image_only' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  แสดงเฉพาะรูปภาพโปสเตอร์/โบรชัวร์ประชาสัมพันธ์เต็มๆ และปุ่มปิด
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleFormChange('popupDisplayMode', 'text_only')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formData.popupDisplayMode === 'text_only'
                    ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sky-600">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-bold">ข้อความอย่างเดียว</span>
                  </div>
                  {formData.popupDisplayMode === 'text_only' && (
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  ซ่อนรูปภาพ แสดงเฉพาะหัวข้อ ประกาศ และรายละเอียดข้อความ
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                หัวข้อ Pop up ประชาสัมพันธ์
              </label>
              <input
                type="text"
                value={formData.popupTitle}
                onChange={(e) => handleFormChange('popupTitle', e.target.value)}
                placeholder="เช่น ข่าวประชาสัมพันธ์สำคัญประจำสัปดาห์"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ลิงก์ภายนอกเพิ่มเติม (Optional)
              </label>
              <input
                type="url"
                value={formData.popupLinkUrl || ''}
                onChange={(e) => handleFormChange('popupLinkUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              รายละเอียด/ข้อความแจ้งเตือนใน Pop up
            </label>
            <textarea
              rows={3}
              value={formData.popupMessage}
              onChange={(e) => handleFormChange('popupMessage', e.target.value)}
              placeholder="กรอกข้อความที่ต้องการสื่อสารถึงผู้เรียน..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white resize-none"
            />
          </div>

          {/* 3. Image Section: Direct Local Device Upload + URL + Presets */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                รูปภาพ Pop up ประชาสัมพันธ์
              </label>
              {formData.popupImageUrl && (
                <button
                  type="button"
                  onClick={() => handleFormChange('popupImageUrl', '')}
                  className="text-[11px] font-bold text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ลบรูปภาพออก</span>
                </button>
              )}
            </div>

            {/* Upload Button from Device */}
            <div className="bg-slate-50 border-2 border-dashed border-sky-200 rounded-2xl p-4 text-center hover:bg-sky-50/50 transition-colors">
              <input
                type="file"
                id="popupImageUploadInput"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="popupImageUploadInput"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-sky-700 block">
                    {uploadingImage ? 'กำลังประมวลผลรูปภาพ...' : 'คลิกเพื่อเลือกอัพโหลดรูปภาพจากเครื่องมือถือ / คอมพิวเตอร์'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    รองรับไฟล์ JPG, PNG, WEBP (ระบบจะย่อขนาดให้อัตโนมัติ ไม่ต้องใส่ลิงค์)
                  </span>
                </div>
              </label>
            </div>

            {/* Optional URL input */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1">
                หรือ วางลิงก์รูปภาพ (Image URL):
              </span>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={formData.popupImageUrl || ''}
                  onChange={(e) => handleFormChange('popupImageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                หรือ เลือกรูปภาพแม่แบบสำเร็จรูป:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presetImages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleFormChange('popupImageUrl', preset.url)}
                    className="p-2 border border-slate-200 rounded-xl text-left hover:border-sky-500 hover:bg-sky-50 transition-all cursor-pointer group"
                  >
                    <img 
                      src={preset.url} 
                      alt={preset.label} 
                      className="w-full h-16 object-cover rounded-lg mb-1 group-hover:scale-105 transition-transform" 
                    />
                    <span className="text-[10px] font-bold text-slate-700 block truncate">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Card */}
            {formData.popupImageUrl && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  ตัวอย่างรูปภาพที่จะใช้แสดงใน Pop up:
                </span>
                <img 
                  src={formData.popupImageUrl} 
                  alt="Preview" 
                  className="max-h-48 w-full object-contain bg-slate-900 rounded-xl border border-slate-200"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPreviewPopupOpen(true)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold font-heading inline-flex items-center justify-center space-x-2 cursor-pointer transition-all border border-slate-300"
            >
              <Eye className="w-4 h-4 text-sky-600" />
              <span>ทดสอบดูตัวอย่าง Pop up (Live Preview)</span>
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/20 inline-flex items-center justify-center space-x-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึก Pop up และซิงค์ทุกเครื่อง'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 3: News Quick Manage */}
      {activeSubTab === 'news' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold font-heading text-slate-800 flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-sky-600" />
              <span>จัดการรายการข่าวประชาสัมพันธ์ ({newsList.length})</span>
            </h2>
          </div>

          {newsList.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              ยังไม่มีข่าวประชาสัมพันธ์ สามารถไปที่เมนู "ข่าวประชาสัมพันธ์" เพื่อโพสต์ข่าวใหม่ได้
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {newsList.map((news) => (
                <div key={news.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    {news.imageUrl ? (
                      <img src={news.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">
                        PR
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{news.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{news.content}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('คุณต้องการลบข่าวนี้ใช่หรือไม่?')) {
                        onDeleteNews(news.id);
                      }
                    }}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: User Accounts */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-800 flex items-center space-x-2">
                <Users className="w-5 h-5 text-sky-600" />
                <span>รายชื่อบัญชีผู้ใช้งานในระบบ ({usersList.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                แสดงรายชื่อสมาชิกที่ลงทะเบียนไว้ในระบบ Firestore
              </p>
            </div>

            <button
              onClick={fetchUsers}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>
          </div>

          {usersLoading ? (
            <div className="text-center py-8 text-xs text-slate-500">
              กำลังโหลดรายชื่อผู้ใช้งาน...
            </div>
          ) : usersList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              ไม่พบบัญชีใน Firestore
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">ชื่อแสดงผล</th>
                    <th className="px-4 py-3">อีเมล / ชื่อผู้ใช้</th>
                    <th className="px-4 py-3">ระดับสิทธิ์ (Role)</th>
                    <th className="px-4 py-3">วันที่สมัคร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-800">{u.displayName}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email || u.username}</td>
                      <td className="px-4 py-3">
                        {u.role === 'admin' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            🛡️ แอดมิน
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            ผู้ใช้งานทั่วไป
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Admin Live Preview PR Popup Modal */}
      <PRPopupModal
        isOpen={isPreviewPopupOpen}
        onClose={() => setIsPreviewPopupOpen(false)}
        siteSettings={{
          ...formData,
          popupEnabled: true // Force enable in preview
        }}
      />
    </div>
  );
};

