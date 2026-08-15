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
  ExternalLink
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
          iconColor: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-950/60',
          borderColor: 'border-amber-200/80 dark:border-amber-800/80',
          badgeText: 'สำคัญ/ด่วน',
          badgeBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200',
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-rose-600 dark:text-rose-400',
          bgColor: 'bg-rose-50 dark:bg-rose-950/60',
          borderColor: 'border-rose-200/80 dark:border-rose-800/80',
          badgeText: 'เลยกำหนด',
          badgeBg: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
          borderColor: 'border-emerald-200/80 dark:border-emerald-800/80',
          badgeText: 'สำเร็จ',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200',
        };
      case 'info':
      default:
        return {
          icon: Sparkles,
          iconColor: 'text-sky-600 dark:text-sky-400',
          bgColor: 'bg-sky-50 dark:bg-sky-950/60',
          borderColor: 'border-sky-200/80 dark:border-sky-800/80',
          badgeText: 'ระบบ',
          badgeBg: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-3 sm:p-5 sm:pt-16 sm:pr-8 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Floating Modal Window */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] z-10 transition-colors animate-pop">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-200/60 dark:border-sky-800">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold font-heading text-slate-800 dark:text-slate-100">
                  การแจ้งเตือน
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-2xs">
                    {unreadCount} ใหม่
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ประวัติและการแจ้งเตือนกำหนดส่งงานทั้งหมด
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Action Controls & Filter Tabs */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 gap-2 flex-wrap">
          {/* Filters */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ทั้งหมด ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ยังไม่อ่าน ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                filter === 'urgent'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ด่วน & เลยกำหนด
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1 px-1.5 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/50 cursor-pointer"
                title="ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">อ่านทั้งหมด</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center space-x-1 px-1.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                title="ล้างการแจ้งเตือนทั้งหมด"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ล้าง</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y-0">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {filter === 'unread' ? 'ไม่มีการแจ้งเตือนใหม่ที่ยังไม่ได้อ่าน' : 'ไม่มีรายการแจ้งเตือน'}
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                เมื่อมีการบ้านที่ต้องส่งวันนี้ เลยกำหนด หรือมีการดำเนินการต่างๆ การแจ้งเตือนจะแสดงที่นี่
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const visual = getNotificationVisuals(item.type);
              const VisualIcon = visual.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    item.read
                      ? 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-150 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      : `${visual.bgColor} ${visual.borderColor} shadow-2xs hover:brightness-95 dark:hover:brightness-110`
                  }`}
                >
                  {/* Visual Type Icon */}
                  <div className={`w-8 h-8 rounded-xl bg-white dark:bg-slate-850 flex items-center justify-center shrink-0 shadow-2xs border border-slate-100 dark:border-slate-750 ${visual.iconColor}`}>
                    <VisualIcon className="w-4 h-4" />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${visual.badgeBg}`}>
                        {visual.badgeText}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatRelativeTime(item.timestamp)}</span>
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold mt-1 ${item.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100 font-heading'}`}>
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed break-words">
                      {item.message}
                    </p>

                    {item.actionTab && (
                      <div className="mt-2 inline-flex items-center space-x-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                        <span>เปิดดูรายการ</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Unread Indicator Dot */}
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 ring-4 ring-sky-100 dark:ring-sky-950 shrink-0 mt-1" />
                  )}

                  {/* Delete individual button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(item.id);
                    }}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="ลบการแจ้งเตือนนี้"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-center text-[10px] text-slate-400 dark:text-slate-500">
          ระบบแจ้งเตือนอัตโนมัติเมื่อมีการบ้านส่งวันนี้และเลยกำหนด
        </div>
      </div>
    </div>
  );
};
