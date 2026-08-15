import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  X,
  Sparkles
} from 'lucide-react';
import { ToastItem, NotificationType } from '../types';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const duration = toast.duration || 5000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const getStyle = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-200 dark:border-emerald-800/80',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800',
          bar: 'bg-emerald-500',
          titleColor: 'text-emerald-950 dark:text-emerald-100',
          icon: CheckCircle2,
        };
      case 'warning':
        return {
          border: 'border-amber-200 dark:border-amber-800/80',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          iconBg: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800',
          bar: 'bg-amber-500',
          titleColor: 'text-amber-950 dark:text-amber-100',
          icon: AlertTriangle,
        };
      case 'error':
        return {
          border: 'border-rose-200 dark:border-rose-800/80',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          iconBg: 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800',
          bar: 'bg-rose-500',
          titleColor: 'text-rose-950 dark:text-rose-100',
          icon: AlertCircle,
        };
      case 'info':
      default:
        return {
          border: 'border-sky-200 dark:border-sky-800/80',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          iconBg: 'bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800',
          bar: 'bg-sky-500',
          titleColor: 'text-sky-950 dark:text-sky-100',
          icon: Sparkles,
        };
    }
  };

  const style = getStyle(toast.type);
  const Icon = style.icon;

  return (
    <div 
      className={`pointer-events-auto w-full rounded-2xl border ${style.border} ${style.bg} backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 animate-slideDown relative group`}
      role="alert"
    >
      <div className="p-3.5 sm:p-4 flex items-start space-x-3">
        {/* Icon */}
        <div className={`w-8 h-8 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-bold font-heading ${style.titleColor} truncate`}>
              {toast.title}
            </h4>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug break-words">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="ปิดการแจ้งเตือน"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5-second Progress Countdown Bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
        <div 
          className={`h-full ${style.bar} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      id="toast-notification-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] sm:w-88 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
