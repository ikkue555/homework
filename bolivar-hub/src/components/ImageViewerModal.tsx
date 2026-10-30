import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl?: string | null;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  imageUrl,
  title,
  subtitle,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="รูปภาพขนาดเต็มจอ"
      onClick={onClose}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-md animate-fadeIn select-none"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Top Bar: Fixed to the top edge of the browser viewport with a single clean Back button */}
      <header
        onClick={(e) => e.stopPropagation()}
        className="w-full fixed top-0 left-0 right-0 z-[1000000] px-4 sm:px-6 py-3 sm:py-4 bg-slate-900/85 backdrop-blur-md border-b border-white/15 flex items-center justify-between gap-4 shadow-xl"
      >
        {/* Left: Single, clear Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-sm sm:text-base font-heading backdrop-blur-md border border-white/25 shadow-lg cursor-pointer transition-all shrink-0"
          title="ย้อนกลับ (Esc)"
          autoFocus
        >
          <ArrowLeft className="w-5 h-5 text-white stroke-[2.5]" />
          <span>ย้อนกลับ</span>
        </button>

        {/* Center: Title / Subtitle Info */}
        <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-2 text-center">
          {subtitle && (
            <span className="text-[11px] sm:text-xs font-semibold text-sky-400 truncate max-w-xs sm:max-w-md">
              {subtitle}
            </span>
          )}
          <span className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md font-heading">
            {title || 'รูปภาพประกอบ'}
          </span>
        </div>

        {/* Right: Balance spacer so title stays centered and no duplicate buttons */}
        <div className="w-20 sm:w-28 shrink-0" aria-hidden="true" />
      </header>

      {/* Center Image Container: fills available space */}
      <main
        onClick={onClose}
        className="w-full h-full flex items-center justify-center pt-20 pb-8 px-4 sm:px-8 cursor-zoom-out"
      >
        <img
          src={imageUrl}
          alt={title || 'รูปภาพขนาดเต็ม'}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10 transition-transform duration-200 hover:scale-[1.005] cursor-pointer"
          title="คลิกที่รูปหรือกดปุ่มย้อนกลับ"
        />
      </main>
    </div>,
    document.body
  );
};
