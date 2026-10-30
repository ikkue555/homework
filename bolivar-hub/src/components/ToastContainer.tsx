import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  X,
  Sparkles,
  ArrowRight,
  BellRing
} from 'lucide-react';
import { ToastItem, NotificationType, ActiveTab } from '../types';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss, onNavigateTab }) => {
  const duration = toast.duration || 5000;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    const startProgress = progress;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, startProgress - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration, isPaused]);

  const getStyle = (type: NotificationType) => {
    switch (type) {
      case 'error':
        return {
          border: 'border-rose-300/80 dark:border-rose-800/90',
          shadow: 'shadow-2xl shadow-rose-500/15',
          accentGradient: 'from-rose-500 via-red-500 to-orange-500',
          iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm shadow-rose-500/30',
          tagBg: 'bg-rose-100/90 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200/80 dark:border-rose-800',
          tagText: '🚨 เลยกำหนดส่ง',
          barGradient: 'from-rose-500 via-red-500 to-orange-500',
          titleColor: 'text-rose-950 dark:text-rose-100',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          border: 'border-amber-300/80 dark:border-amber-800/90',
          shadow: 'shadow-2xl shadow-amber-500/15',
          accentGradient: 'from-amber-500 via-orange-500 to-yellow-500',
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
          tagBg: 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800',
          tagText: '📅 ต้องส่งวันนี้',
          barGradient: 'from-amber-500 via-orange-500 to-yellow-400',
          titleColor: 'text-amber-950 dark:text-amber-100',
          icon: AlertTriangle,
        };
      case 'success':
        return {
          border: 'border-emerald-300/80 dark:border-emerald-800/90',
          shadow: 'shadow-2xl shadow-emerald-500/15',
          accentGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
          tagBg: 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800',
          tagText: '✨ สำเร็จ',
          barGradient: 'from-emerald-500 via-teal-500 to-cyan-400',
          titleColor: 'text-emerald-950 dark:text-emerald-100',
          icon: CheckCircle2,
        };
      case 'info':
      default:
        return {
          border: 'border-sky-300/80 dark:border-sky-800/90',
          shadow: 'shadow-2xl shadow-sky-500/15',
          accentGradient: 'from-sky-500 via-blue-500 to-indigo-500',
          iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30',
          tagBg: 'bg-sky-100/90 dark:bg-sky-950/80 text-sky-800 dark:text-sky-200 border border-sky-200/80 dark:border-sky-800',
          tagText: '🔔 การแจ้งเตือน',
          barGradient: 'from-sky-500 via-blue-500 to-indigo-500',
          titleColor: 'text-sky-950 dark:text-sky-100',
          icon: Sparkles,
        };
    }
  };

  const style = getStyle(toast.type);
  const Icon = style.icon;

  const handleClickToast = () => {
    if (toast.actionTab && onNavigateTab) {
      onNavigateTab(toast.actionTab);
      onDismiss(toast.id);
    }
  };

  return (
    <div 
      className={`pointer-events-auto w-full rounded-3xl border ${style.border} bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl ${style.shadow} overflow-hidden transition-all duration-300 relative group animate-toastSlideIn ${
        toast.actionTab ? 'cursor-pointer hover:scale-[1.01] hover:shadow-2xl' : ''
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleClickToast}
      role="alert"
    >
      {/* Top Accent Strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${style.accentGradient}`} />

      <div className="p-3.5 sm:p-4 flex items-start space-x-3.5">
        {/* Modern Icon with Subtle Glow */}
        <div className={`w-9 h-9 rounded-2xl ${style.iconBg} flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-heading ${style.tagBg}`}>
              {style.tagText}
            </span>
          </div>

          <h4 className={`text-xs sm:text-sm font-bold font-heading ${style.titleColor} leading-snug line-clamp-2`}>
            {toast.title}
          </h4>

          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words font-text">
            {toast.message}
          </p>

          {/* Quick Action Link if actionTab is present */}
          {toast.actionTab && (
            <div className="mt-2.5 inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 font-heading group-hover:translate-x-1 transition-transform">
              <span>กดเพื่อดูรายการงาน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 active:scale-95"
          title="ปิดการแจ้งเตือน"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Smooth Animated Gradient Countdown Bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${style.barGradient} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss, onNavigateTab }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      id="toast-notification-container"
      className="fixed top-4 right-3 sm:right-5 z-50 flex flex-col gap-3 max-w-sm w-[calc(100vw-1.5rem)] sm:w-96 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastCard 
          key={toast.id} 
          toast={toast} 
          onDismiss={onDismiss} 
          onNavigateTab={onNavigateTab} 
        />
      ))}
    </div>
  );
};
