import React from 'react';
import { SiteSettings } from '../types';
import { X, Bell, ExternalLink, Megaphone, Image as ImageIcon } from 'lucide-react';

interface PRPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: SiteSettings;
}

export const PRPopupModal: React.FC<PRPopupModalProps> = ({
  isOpen,
  onClose,
  siteSettings
}) => {
  if (!isOpen || !siteSettings.popupEnabled) return null;

  const mode = siteSettings.popupDisplayMode || 'both';
  const showImage = (mode === 'image_only' || mode === 'both') && Boolean(siteSettings.popupImageUrl);
  const showText = mode === 'text_only' || mode === 'both';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-sky-100 max-w-lg w-full overflow-hidden relative flex flex-col max-h-[90vh] transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Close Button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md border border-white/20"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE 1: IMAGE ONLY or WITH IMAGE */}
        {showImage && (
          <div className={`relative w-full bg-slate-950 overflow-hidden group ${mode === 'image_only' ? 'max-h-[70vh]' : 'h-56 sm:h-64'}`}>
            <img 
              src={siteSettings.popupImageUrl} 
              alt={siteSettings.popupTitle || 'ข่าวประชาสัมพันธ์'}
              className="w-full h-full object-contain sm:object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            {mode !== 'image_only' && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/90 text-white text-[11px] font-bold backdrop-blur-xs shadow-xs">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>ข่าวประชาสัมพันธ์พิเศษ</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* HEADER BADGE IF NO IMAGE or TEXT ONLY */}
        {(!showImage && (showText || mode === 'image_only')) && (
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 text-white text-center flex flex-col items-center justify-center space-y-2 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              {mode === 'image_only' ? <ImageIcon className="w-6 h-6 text-white" /> : <Bell className="w-6 h-6 text-white" />}
            </div>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
              {mode === 'image_only' ? 'ประชาสัมพันธ์รูปภาพ' : 'ประกาศประชาสัมพันธ์ด่วน'}
            </span>
          </div>
        )}

        {/* MODE 2: TEXT BODY (shown in 'text_only' and 'both') */}
        {showText && (
          <div className="p-6 overflow-y-auto space-y-3">
            {siteSettings.popupTitle && (
              <h3 className="text-base sm:text-lg font-bold font-heading text-slate-800 leading-snug">
                {siteSettings.popupTitle}
              </h3>
            )}

            {siteSettings.popupMessage && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {siteSettings.popupMessage}
              </p>
            )}

            {siteSettings.popupLinkUrl && (
              <a
                href={siteSettings.popupLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline pt-1"
              >
                <span>อ่านรายละเอียดเพิ่มเติม</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* FOOTER ACTION BUTTON */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            คุณสามารถปิด Pop up นี้และเรียกดูข้อมูลซ้ำได้ทุกเมื่อ
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>ปิดหน้าต่างประชาสัมพันธ์</span>
          </button>
        </div>
      </div>
    </div>
  );
};

