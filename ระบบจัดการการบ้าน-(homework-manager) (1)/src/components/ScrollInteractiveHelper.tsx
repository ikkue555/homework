import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollInteractiveHelper: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (windowHeight > 0) {
        const progress = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100));
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }

      if (totalScroll > 160) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Top Scroll Indicator Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none bg-slate-200/20 dark:bg-slate-800/20">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 transition-all duration-150 ease-out shadow-sm"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Scroll To Top Button with Circular Progress & Playful Hover */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/90 shadow-lg hover:shadow-xl btn-interactive flex items-center justify-center group cursor-pointer animate-pop"
          title="เลื่อนขึ้นบนสุด"
        >
          {/* Circular Progress Ring */}
          <svg className="w-10 h-10 -rotate-90 absolute" viewBox="0 0 36 36">
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-sky-600 dark:text-sky-400 transition-all duration-150"
              strokeDasharray={`${scrollProgress}, 100`}
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>

          <ArrowUp className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:-translate-y-0.5 group-hover:scale-110 transition-transform relative z-10" />
        </button>
      )}
    </>
  );
};
