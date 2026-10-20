import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Bell, Car, CheckCircle2, ShieldAlert, 
  Wallet, Tag, Clock, Navigation
} from 'lucide-react';
import { passengerStorage, type NotificationPreferences } from '../../lib/passengerStorage';
import { sound } from '../../lib/sound';

interface NotificationPreferencesPageProps {
  userId: string;
  onBack: () => void;
}

export const NotificationPreferencesPage: React.FC<NotificationPreferencesPageProps> = ({
  userId,
  onBack
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => 
    passengerStorage.getNotificationPreferences(userId)
  );
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (key === 'accountSecurityAlerts') {
      alert('Security alerts are mandatory to protect your account and cannot be disabled.');
      return;
    }
    sound.playPop();
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    passengerStorage.saveNotificationPreferences(userId, updated);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#fafdf8] pt-18 sm:pt-20 pb-28 px-4 sm:px-6 max-w-2xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-[#16a34a] hover:border-emerald-300 font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#16a34a]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#16a34a]" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Notification Preferences
          </span>
        </div>
      </div>

      {showSavedToast && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
          <span>Notification preference saved.</span>
        </motion.div>
      )}

      {/* Intro Note */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm mb-4">
        <h3 className="text-sm font-black text-slate-900">Push & In-App Alerts</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Customize which updates you receive on your phone during your journeys across Peshawar.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
        {/* Ride booking updates */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16a34a] flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Ride Request & Booking Updates</h4>
              <p className="text-[11px] text-slate-400">Confirmation when searching for nearby captains</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={prefs.rideBookingUpdates}
            onChange={() => handleToggle('rideBookingUpdates')}
            className="w-5 h-5 accent-[#16a34a] cursor-pointer"
          />
        </div>

        {/* Driver acceptance */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Driver Acceptance Alerts</h4>
              <p className="text-[11px] text-slate-400">Driver name, vehicle plate, and initial ETA</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={prefs.driverAcceptance}
            onChange={() => handleToggle('driverAcceptance')}
            className="w-5 h-5 accent-[#16a34a] cursor-pointer"
          />
        </div>

        {/* Driver arrival */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Driver Arrival At Pickup</h4>
              <p className="text-[11px] text-slate-400">Immediate alert when captain reaches your pin</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={prefs.driverArrival}
            onChange={() => handleToggle('driverArrival')}
            className="w-5 h-5 accent-[#16a34a] cursor-pointer"
          />
        </div>

        {/* Trip completion */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Trip Completion & Receipts</h4>
              <p className="text-[11px] text-slate-400">Fare breakdown, rating prompt, and digital receipt</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={prefs.tripCompletion}
            onChange={() => handleToggle('tripCompletion')}
            className="w-5 h-5 accent-[#16a34a] cursor-pointer"
          />
        </div>

        {/* Payments & Refunds */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Wallet & Refund Updates</h4>
              <p className="text-[11px] text-slate-400">Top-up confirmations, EasyPaisa/JazzCash reloads</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={prefs.paymentRefunds}
            onChange={() => handleToggle('paymentRefunds')}
            className="w-5 h-5 accent-[#16a34a] cursor-pointer"
          />
        </div>

        {/* Account security alerts */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900">Account Security Alerts</h4>
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[9px] font-extrabold rounded">
                  Mandatory
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Critical password changes, login OTPs, and security alerts</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={prefs.accountSecurityAlerts}
            disabled
            className="w-5 h-5 accent-[#16a34a] cursor-not-allowed opacity-80"
          />
        </div>

        {/* Offers & promos */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Offers & Peshawar Promos</h4>
              <p className="text-[11px] text-slate-400">Special seasonal discounts, Friday promos, and vouchers</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={prefs.promotionsOffers}
            onChange={() => handleToggle('promotionsOffers')}
            className="w-5 h-5 accent-[#16a34a] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
