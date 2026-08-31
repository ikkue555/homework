import React, { useEffect } from 'react';
import { SiteSettings } from '../types';
import { X, Bell, ExternalLink, Sparkles } from 'lucide-react';

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
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !siteSettings.popupEnabled) return null;

  const mode = siteSettings.popupDisplayMode || 'both';
  const hasImage = Boolean(siteSettings.popupImageUrl && siteSettings.popupImageUrl.trim().length > 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pr-popup-title"
    >
      {/* MODE 1: IMAGE ONLY (Pure poster / PR flyer view) */}
      {mode === 'image_only' && hasImage ? (
        <div 
          className="relative max-w-4xl max-h-[92vh] w-auto flex flex-col items-center justify-center rounded-3xl shadow-2xl overflow-hidden animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating High-Contrast Close X Button */}
          <button
            id="pr-popup-close-img"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-10 h-10 rounded-full bg-slate-900/85 hover:bg-slate-950 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-2xl border border-white/30 hover:scale-110 active:scale-95 group"
            title="ปิดหน้าต่าง (Esc)"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* Optional External Link floating pill button at bottom of image if link is provided */}
          {siteSettings.popupLinkUrl && (
            <a
              href={siteSettings.popupLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600/95 hover:bg-sky-600 text-white rounded-full text-xs sm:text-sm font-bold font-heading shadow-xl backdrop-blur-md border border-white/30 hover:scale-105 active:scale-95 transition-all"
            >
              <span>เปิดดูรายละเอียดเพิ่มเติม</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* High resolution responsive image */}
          <img 
            src={siteSettings.popupImageUrl} 
            alt={siteSettings.popupTitle || 'รูปภาพประชาสัมพันธ์'}
            className="max-w-full max-h-[88vh] w-auto h-auto object-contain rounded-3xl shadow-2xl block bg-slate-900"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80';
            }}
          />
        </div>
      ) : mode === 'both' && hasImage ? (
        /* MODE 2: BOTH (Image Header + Text Details & Action Buttons) */
        <div 
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full overflow-hidden relative flex flex-col max-h-[92vh] animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Floating Close Button */}
          <button
            id="pr-popup-close-both"
            onClick={onClose}
            className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-lg border border-white/30 hover:scale-105 active:scale-95"
            title="ปิดหน้าต่าง (Esc)"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Top Cover Image */}
          <div className="relative w-full h-52 sm:h-60 bg-slate-900 shrink-0 overflow-hidden">
            <img 
              src={siteSettings.popupImageUrl} 
              alt={siteSettings.popupTitle || 'รูปภาพประชาสัมพันธ์'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
            
            {/* PR Badge Tag over image */}
            <div className="absolute bottom-3 left-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-600/90 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ประกาศประชาสัมพันธ์</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
            {siteSettings.popupTitle && (
              <h3 id="pr-popup-title" className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-slate-100 leading-snug">
                {siteSettings.popupTitle}
              </h3>
            )}

            {siteSettings.popupMessage && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {siteSettings.popupMessage}
              </p>
            )}

            {siteSettings.popupLinkUrl && (
              <div className="pt-2">
                <a
                  href={siteSettings.popupLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline"
                >
                  <span>คลิกอ่านรายละเอียดเพิ่มเติม</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              กด Esc หรือคลิกด้านนอกเพื่อปิด
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold font-heading shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center space-x-1.5 hover:scale-102 active:scale-98"
            >
              <X className="w-4 h-4" />
              <span>ปิดหน้าต่าง</span>
            </button>
          </div>
        </div>
      ) : (
        /* MODE 3: TEXT ONLY POPUP (Or fallback when no image) */
        <div 
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-sky-100 dark:border-slate-800 max-w-lg w-full overflow-hidden relative flex flex-col max-h-[90vh] animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Floating Close Button */}
          <button
            id="pr-popup-close-text"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md border border-white/20 hover:scale-105 active:scale-95"
            title="ปิดหน้าต่าง (Esc)"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 text-white text-center flex flex-col items-center justify-center space-y-2 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
              ประกาศประชาสัมพันธ์
            </span>
          </div>

          {/* Text Content Body */}
          <div className="p-6 overflow-y-auto space-y-3">
            {siteSettings.popupTitle && (
              <h3 id="pr-popup-title" className="text-base sm:text-lg font-bold font-heading text-slate-800 dark:text-slate-100 leading-snug">
                {siteSettings.popupTitle}
              </h3>
            )}

            {siteSettings.popupMessage && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {siteSettings.popupMessage}
              </p>
            )}

            {siteSettings.popupLinkUrl && (
              <a
                href={siteSettings.popupLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline pt-1"
              >
                <span>อ่านรายละเอียดเพิ่มเติม</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
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
