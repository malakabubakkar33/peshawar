import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Shield, Star, 
  Clock, Wallet, Bell, LogOut, 
  Phone, ChevronRight, CheckCircle2, Car, ShieldCheck, Camera
} from 'lucide-react';
import { userStorage, type UserAccount } from '../lib/supabase';
import { sound } from '../lib/sound';
import { ImageCropperModal } from './ImageCropperModal';
import { uploadToCloudinary } from '../lib/cloudinary';

interface ProfilePageProps {
  user: UserAccount;
  onBackToHome: () => void;
  onNavigateToHistory: () => void;
  onNavigateToWallet: () => void;
  onNavigateToNotifications: () => void;
  onSwitchToDriver?: () => void;
  onOpenAdminPanel?: () => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onBackToHome,
  onNavigateToHistory,
  onNavigateToWallet,
  onNavigateToNotifications,
  onSwitchToDriver,
  onOpenAdminPanel,
  onLogout
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState(user.avatarUrl);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setRawImageForCrop(dataUrl);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setCurrentUserAvatar(croppedDataUrl);
    sound.playSuccess();
    const updated = userStorage.updateUser(user.id, { avatarUrl: croppedDataUrl });
    if (updated) {
      userStorage.setSession(updated);
    }
    // Asynchronously upload to Cloudinary CDN
    uploadToCloudinary(croppedDataUrl, 'safargo_avatars').then((res) => {
      if (res.success && res.url) {
        userStorage.updateUser(user.id, { avatarUrl: res.url });
      }
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pt-20 pb-28 px-4 sm:px-6 max-w-3xl mx-auto font-sans">
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-lime-700 hover:border-lime-300 font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-lime-600" />
          <span>Back to Map</span>
        </button>

        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
          Passenger Profile
        </span>
      </div>

      {/* Profile Card Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xl mb-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-lime-500 shadow-md">
              <img
                src={currentUserAvatar || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5 text-lime-300" />
              </button>
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {user.fullName || 'Muhammad Abubakar'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 text-[10px] font-black border border-lime-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-lime-700" />
                  Verified
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {user.email || 'user@safargo.pk'}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-extrabold border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  4.96
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  • Peshawar Resident
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2">
            <span className="text-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Role</span>
              <span className="text-xs font-black text-lime-700 uppercase">Passenger</span>
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-slate-100">
          <div className="text-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Total Trips</span>
            <span className="text-base font-black text-slate-900">14</span>
          </div>
          <div className="text-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Distance</span>
            <span className="text-base font-black text-slate-900">82.4 km</span>
          </div>
          <div className="text-center p-2.5 rounded-2xl bg-lime-50/70 border border-lime-200">
            <span className="text-[10px] text-lime-700 uppercase tracking-wider font-bold block">Wallet</span>
            <span className="text-base font-black text-lime-900">PKR 1,450</span>
          </div>
        </div>
      </motion.div>

      {/* Main Options List */}
      <div className="rounded-3xl bg-white border border-slate-200 p-2 shadow-sm space-y-1 mb-5">
        <button
          onClick={() => {
            sound.playPop();
            onNavigateToHistory();
          }}
          className="w-full p-3.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-left transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Ride History & Receipts</span>
              <span className="text-xs text-slate-400 font-medium">Review completed rides and invoices</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
        </button>

        <button
          onClick={() => {
            sound.playPop();
            onNavigateToWallet();
          }}
          className="w-full p-3.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-left transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">SafarGo Cash Wallet</span>
              <span className="text-xs text-slate-400 font-medium">Top-up balance, Easypaisa, JazzCash</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
        </button>

        <button
          onClick={() => {
            sound.playPop();
            onNavigateToNotifications();
          }}
          className="w-full p-3.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-left transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Notifications & Promos</span>
              <span className="text-xs text-slate-400 font-medium">Peshawar discount codes and alerts</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
        </button>

        {/* Switch to Driver Mode Option */}
        <button
          onClick={() => {
            sound.playPop();
            if (onSwitchToDriver) onSwitchToDriver();
          }}
          className="w-full p-3.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-left transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Switch to Driver Mode</span>
              <span className="text-xs text-slate-400 font-medium">Captain dashboard & ride requests</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
        </button>

        {/* Admin Command Center Option (Only visible to real admin) */}
        {userStorage.isUserAdmin(user) && (
          <button
            onClick={() => {
              sound.playSuccess();
              if (onOpenAdminPanel) onOpenAdminPanel();
            }}
            className="w-full p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-between text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-500/20 text-lime-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-lime-400" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Admin Command Suite</span>
                  <span className="px-1.5 py-0.5 rounded bg-lime-500 text-slate-950 font-black text-[9px]">SUPER ADMIN</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">Control users, drivers, live rides & system</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-lime-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Safety & Emergency */}
      <div className="rounded-3xl bg-rose-50 border border-rose-200 p-4 mb-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-600" />
          <h3 className="text-xs font-black text-rose-900 uppercase tracking-wider">
            Peshawar 24/7 Emergency Helplines
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a
            href="tel:15"
            className="p-3 rounded-2xl bg-white border border-rose-200 font-bold text-rose-800 flex items-center justify-between hover:bg-rose-100/50 transition-colors"
          >
            <span>Police: 15</span>
            <Phone className="w-4 h-4 text-rose-600" />
          </a>
          <a
            href="tel:1122"
            className="p-3 rounded-2xl bg-white border border-rose-200 font-bold text-rose-800 flex items-center justify-between hover:bg-rose-100/50 transition-colors"
          >
            <span>Rescue: 1122</span>
            <Phone className="w-4 h-4 text-rose-600" />
          </a>
        </div>
      </div>

      {/* Logout Action */}
      <button
        onClick={() => {
          sound.playPop();
          setShowLogoutConfirm(true);
        }}
        className="w-full py-3.5 rounded-2xl border border-rose-200 bg-white text-rose-600 font-black text-xs hover:bg-rose-50 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of SafarGo</span>
      </button>

      {/* Logout Confirmation Permission Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Log Out of SafarGo?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to sign out of your account? You will need to log in again to book rides.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowLogoutConfirm(false);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageSrc={rawImageForCrop}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
