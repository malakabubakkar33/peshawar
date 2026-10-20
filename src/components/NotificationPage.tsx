import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Bell, CheckCheck, Trash2, 
  Car, Sparkles, Shield, Info, ChevronRight, BellRing, CheckCircle2 
} from 'lucide-react';
import { SAMPLE_NOTIFICATIONS, type AppNotification } from '../lib/peshawarData';
import { pushNotificationService } from '../lib/pushNotificationService';
import { sound } from '../lib/sound';

interface NotificationPageProps {
  onBackToHome: () => void;
  onNavigateToWallet?: () => void;
}

export const NotificationPage: React.FC<NotificationPageProps> = ({ 
  onBackToHome, 
  onNavigateToWallet 
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(SAMPLE_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'ride' | 'promo' | 'security'>('all');
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    setPushStatus(pushNotificationService.getPermission());
  }, []);

  const handleEnablePush = async () => {
    sound.playClick();
    const result = await pushNotificationService.requestPermission();
    setPushStatus(result);
    if (result === 'granted') {
      sound.playSuccess();
      pushNotificationService.sendNotification({
        title: 'Push Notifications Active! 🔔',
        body: 'You will now receive real-time SafarGo ride updates and security alerts.'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'ride':
        return <Car className="w-5 h-5 text-emerald-600" />;
      case 'promo':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'security':
        return <Shield className="w-5 h-5 text-indigo-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pt-20 pb-28 px-4 sm:px-8 max-w-4xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="w-10 h-10 rounded-2xl ios-glass-card flex items-center justify-center text-slate-700 hover:text-lime-600 hover:scale-105 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-lime-500 text-slate-950 font-black text-xs">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Updates on your SafarGo rides, promo vouchers, and account alerts
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-lime-600" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-bold hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Push Notification Device Permission Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            pushStatus === 'granted' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {pushStatus === 'granted' ? <CheckCircle2 className="w-5 h-5" /> : <BellRing className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              {pushStatus === 'granted' ? 'Push Notifications Active' : 'Device Push Notifications'}
            </h4>
            <p className="text-xs text-slate-500">
              {pushStatus === 'granted' 
                ? 'You will receive real-time Peshawar ride tracking, OTP alerts, and driver notifications on your screen.' 
                : 'Enable browser notifications to stay updated on incoming rides, promo discounts, and driver arrivals.'}
            </p>
          </div>
        </div>

        {pushStatus !== 'granted' && (
          <button
            onClick={handleEnablePush}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#48bb13] to-[#3ebd19] text-white text-xs font-bold shadow-md hover:brightness-105 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            Enable Notifications
          </button>
        )}
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'ride', label: 'Rides & Drivers' },
          { id: 'promo', label: 'Promotions' },
          { id: 'security', label: 'Account & Security' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">You're all caught up!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no notifications in this category right now.
            </p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`p-4 sm:p-5 rounded-3xl border transition-all flex items-start gap-3.5 ${
                !item.read
                  ? 'bg-white border-lime-300/80 shadow-md ring-1 ring-lime-400/20'
                  : 'bg-white/80 border-slate-200 shadow-sm opacity-90'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">{item.time}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {item.description}
                </p>

                {item.actionText && (
                  <button
                    onClick={() => {
                      if (item.actionText === 'Apply Code' && onNavigateToWallet) {
                        onNavigateToWallet();
                      } else {
                        alert(`Action triggered: ${item.actionText}`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-50 border border-lime-300 text-lime-800 font-bold text-xs hover:bg-lime-100 transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!item.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-lime-500 shrink-0 mt-2 shadow-sm" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
