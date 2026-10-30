import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Inbox
} from 'lucide-react';
import { AppNotification, ActiveTab, NotificationType } from '../types';

interface NotificationBellModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const NotificationBellModal: React.FC<NotificationBellModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onClearAll,
  onDeleteNotification,
  onNavigateTab,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.type === 'warning' || n.type === 'error';
    return true;
  });

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 45) return 'เมื่อสักครู่';
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
      if (diffDays === 1) return 'เมื่อวานนี้';
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
      
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const getNotificationVisuals = (type: NotificationType) => {
    switch (type) {
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-500 dark:text-amber-400',
          gradientBg: 'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900/80 dark:to-slate-900',
          borderColor: 'border-amber-300/80 dark:border-amber-800/80 hover:border-amber-400 dark:hover:border-amber-600',
          accentBorder: 'bg-gradient-to-b from-amber-400 to-orange-500',
          badgeText: '⚠️ กำหนดส่งวันนี้',
          badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800',
          iconBoxBg: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xs shadow-amber-500/30',
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-rose-500 dark:text-rose-400',
          gradientBg: 'from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-950/40 dark:via-slate-900/80 dark:to-slate-900',
          borderColor: 'border-rose-300/80 dark:border-rose-800/80 hover:border-rose-400 dark:hover:border-rose-600',
          accentBorder: 'bg-gradient-to-b from-rose-500 to-red-600',
          badgeText: '🚨 เลยกำหนดส่ง',
          badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800',
          iconBoxBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-xs shadow-rose-500/30',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-500 dark:text-emerald-400',
          gradientBg: 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-slate-900',
          borderColor: 'border-emerald-300/80 dark:border-emerald-800/80 hover:border-emerald-400 dark:hover:border-emerald-600',
          accentBorder: 'bg-gradient-to-b from-emerald-400 to-teal-500',
          badgeText: '✨ สำเร็จ',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800',
          iconBoxBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs shadow-emerald-500/30',
        };
      case 'info':
      default:
        return {
          icon: Sparkles,
          iconColor: 'text-sky-500 dark:text-sky-400',
          gradientBg: 'from-sky-500/10 via-sky-500/5 to-transparent dark:from-sky-950/40 dark:via-slate-900/80 dark:to-slate-900',
          borderColor: 'border-sky-300/80 dark:border-sky-800/80 hover:border-sky-400 dark:hover:border-sky-600',
          accentBorder: 'bg-gradient-to-b from-sky-400 to-blue-600',
          badgeText: '🔔 การแจ้งเตือน',
          badgeBg: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800',
          iconBoxBg: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xs shadow-sky-500/30',
        };
    }
  };

  const handleItemClick = (notification: AppNotification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionTab && onNavigateTab) {
      onNavigateTab(notification.actionTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-3 sm:p-5 sm:pt-16 sm:pr-8 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Floating Modal Window with Premium Frosted Glass */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[82vh] z-10 transition-colors animate-pop">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-150 dark:border-slate-800 bg-gradient-to-r from-sky-50/50 via-white to-indigo-50/30 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <Bell className="w-5 h-5 animate-wiggle" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold font-heading text-slate-800 dark:text-slate-100 tracking-tight">
                  ศูนย์การแจ้งเตือน
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-2xs">
                    {unreadCount} ใหม่
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                ติดตามการบ้านส่งวันนี้ และงานที่เลยกำหนดส่ง
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all btn-interactive cursor-pointer shrink-0"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filter Tabs */}
        <div className="px-3.5 sm:px-4 py-2.5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50 gap-2 flex-wrap">
          {/* Segmented Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-150/80 dark:bg-slate-800/80 p-0.5 rounded-2xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer btn-interactive ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ทั้งหมด ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer btn-interactive ${
                filter === 'unread'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ยังไม่อ่าน ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer btn-interactive ${
                filter === 'urgent'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ด่วน
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1.5">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800 hover:bg-sky-100 transition-all btn-interactive cursor-pointer"
                title="ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>อ่านทั้งหมด</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800 hover:bg-rose-100 transition-all btn-interactive cursor-pointer"
                title="ล้างประวัติการแจ้งเตือนทั้งหมด"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้าง</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto shadow-inner animate-float">
                <Inbox className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-slate-700 dark:text-slate-300">
                  {filter === 'unread' ? 'ไม่มีการแจ้งเตือนใหม่ที่ยังไม่ได้อ่าน' : 'ไม่มีรายการแจ้งเตือนในขณะนี้'}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                  เมื่อมีการบ้านที่ต้องส่งวันนี้ หรือเลยกำหนดส่ง การแจ้งเตือนจะแสดงที่นี่โดยอัตโนมัติ
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const visual = getNotificationVisuals(item.type);
              const VisualIcon = visual.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden card-interactive flex flex-col justify-between ${
                    item.read
                      ? 'bg-slate-50/70 dark:bg-slate-850/60 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      : `bg-gradient-to-b ${visual.gradientBg} ${visual.borderColor} shadow-xs hover:shadow-md`
                  }`}
                >
                  <div className="p-3.5 sm:p-4 flex items-start space-x-3.5">
                    {/* Visual Type Icon Badge */}
                    <div className={`w-9 h-9 rounded-2xl ${visual.iconBoxBg} flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105`}>
                      <VisualIcon className="w-4.5 h-4.5" />
                    </div>

                    {/* Notification Body */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-heading ${visual.badgeBg}`}>
                          {visual.badgeText}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatRelativeTime(item.timestamp)}</span>
                        </span>
                      </div>

                      <h4 className={`text-xs sm:text-sm font-bold leading-snug ${item.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100 font-heading'}`}>
                        {item.title}
                      </h4>

                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words font-text">
                        {item.message}
                      </p>

                      {item.actionTab && (
                        <div className="mt-2.5 inline-flex items-center space-x-1 text-xs font-bold text-sky-600 dark:text-sky-400 font-heading group-hover:translate-x-1 transition-transform">
                          <span>เปิดดูรายการงาน</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Unread Glowing Dot */}
                    {!item.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-sky-100 dark:ring-sky-950 shrink-0 mt-1 shadow-xs animate-pulse" />
                    )}

                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95"
                      title="ลบการแจ้งเตือนนี้"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 text-center text-[10px] text-slate-400 dark:text-slate-400 flex items-center justify-center space-x-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-sky-500" />
          <span>ระบบตรวจจับและแจ้งเตือนการบ้านอัตโนมัติแบบเรียลไทม์</span>
        </div>
      </div>
    </div>
  );
};
