import React from 'react';
import { SiteSettings } from '../types';
import { X, Bell, ExternalLink } from 'lucide-react';

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-fadeIn select-none"
      onClick={onClose}
    >
      {showImage ? (
        /* PURE IMAGE POPUP - NO BORDERS, NO TEXT, NO FOOTER, ONLY IMAGE & X BUTTON */
        <div 
          className="relative max-w-5xl max-h-[92vh] flex items-center justify-center rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-2xl border border-white/30 hover:scale-110 active:scale-95"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5.5 h-5.5" />
          </button>

          {/* Pure Full Image */}
          <img 
            src={siteSettings.popupImageUrl} 
            alt={siteSettings.popupTitle || 'ข่าวประชาสัมพันธ์'}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-2xl shadow-2xl block"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80';
            }}
          />
        </div>
      ) : (
        /* TEXT ONLY POPUP (When no image is available) */
        <div 
          className="bg-white rounded-3xl shadow-2xl border border-sky-100 max-w-lg w-full overflow-hidden relative flex flex-col max-h-[90vh]"
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

          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 text-white text-center flex flex-col items-center justify-center space-y-2 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
              ประกาศประชาสัมพันธ์
            </span>
          </div>

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

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold font-heading shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>ปิดหน้าต่าง</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
