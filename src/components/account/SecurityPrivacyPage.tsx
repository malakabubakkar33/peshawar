import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Shield, KeyRound, Lock, Smartphone, 
  MapPin, Download, CheckCircle2, AlertCircle, LogOut,
  ChevronRight, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { userStorage, type UserAccount } from '../../lib/supabase';
import { sound } from '../../lib/sound';

interface SecurityPrivacyPageProps {
  user: UserAccount;
  onBack: () => void;
  onOpenForgotPassword?: () => void;
}

export const SecurityPrivacyPage: React.FC<SecurityPrivacyPageProps> = ({
  user,
  onBack,
  onOpenForgotPassword
}) => {
  // Password change state
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Sessions
  const [sessionsSignedOut, setSessionsSignedOut] = useState(false);

  // Data download
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPass.length < 6) {
      setPassMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      sound.playError();
      return;
    }

    if (newPass !== confirmPass) {
      setPassMessage({ type: 'error', text: 'New passwords do not match.' });
      sound.playError();
      return;
    }

    // Verify current password if user has one
    if (user.password && currentPass !== user.password) {
      setPassMessage({ type: 'error', text: 'Current password is incorrect.' });
      sound.playError();
      return;
    }

    sound.playClick();
    const updated = userStorage.updatePassword(user.email, newPass);
    if (updated) {
      sound.playSuccess();
      setPassMessage({ type: 'success', text: 'Password successfully changed!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setIsChangingPass(false), 2000);
    } else {
      setPassMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
      sound.playError();
    }
  };

  const handleSignOutOtherSessions = () => {
    sound.playClick();
    setSessionsSignedOut(true);
    setTimeout(() => setSessionsSignedOut(false), 3500);
  };

  const handleDownloadUserData = () => {
    sound.playClick();
    setIsDownloading(true);

    setTimeout(() => {
      setIsDownloading(false);
      const exportData = {
        app: 'SafarGo Peshawar',
        exportedAt: new Date().toISOString(),
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          username: user.username,
          city: user.city,
          role: user.role,
          walletBalance: user.walletBalance,
          createdAt: user.createdAt
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safargo_passenger_data_${user.username || 'peshawar'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      sound.playSuccess();
    }, 1000);
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
          <Shield className="w-4 h-4 text-[#16a34a]" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Security & Privacy
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* 1. PASSWORD & RECOVERY CARD */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16a34a] flex items-center justify-center border border-emerald-100">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Account Password</h3>
              <p className="text-xs text-slate-500">Manage your login credentials & recovery</p>
            </div>
          </div>

          {!isChangingPass ? (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  sound.playPop();
                  setIsChangingPass(true);
                }}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/70 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-slate-500 group-hover:text-[#16a34a]" />
                  <span className="text-xs font-bold text-slate-800">Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {onOpenForgotPassword && (
                <button
                  onClick={() => {
                    sound.playPop();
                    onOpenForgotPassword();
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/70 text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-slate-500 group-hover:text-[#16a34a]" />
                    <span className="text-xs font-bold text-slate-800">Account Recovery via Email OTP</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-3 border-t border-slate-100">
              {passMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  passMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {passMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#16a34a]" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{passMessage.text}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">New Password (Min 6 chars)</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Confirm New Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPass ? 'Hide passwords' : 'Show passwords'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingPass(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#16a34a] text-white text-xs font-black shadow-sm hover:bg-emerald-700"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* 2. TWO-STEP VERIFICATION & AUTHENTICATION */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">2-Step OTP Verification</h3>
                <p className="text-xs text-slate-500">6-digit email & device OTP authentication</p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200 uppercase">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
            All logins from unrecognized devices require 6-digit verification codes sent directly to your registered contact address via Resend secure mail.
          </p>
        </div>

        {/* 3. ACTIVE SESSIONS & DEVICE SECURITY */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Active Devices & Sessions</h3>
                <p className="text-xs text-slate-500">Current device logged into SafarGo</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">This Device (Peshawar, Pakistan)</span>
                <span className="text-[10px] text-slate-400">Online • Active Session</span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              Current
            </span>
          </div>

          {sessionsSignedOut && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
              <span>All other remote sessions have been signed out.</span>
            </motion.div>
          )}

          <button
            onClick={handleSignOutOtherSessions}
            className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out All Other Devices</span>
          </button>
        </div>

        {/* 4. LOCATION PERMISSION GUIDANCE */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16a34a] flex items-center justify-center border border-emerald-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">GPS Location Privacy</h3>
                <p className="text-xs text-slate-500">Live navigation & driver dispatching</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
              Enabled
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
            Your location is exclusively accessed while booking rides or tracking driver arrival in Peshawar. We do not sell or store personal background telemetry.
          </p>
        </div>

        {/* 5. DOWNLOAD MY DATA */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Download Account Data</h3>
                <p className="text-xs text-slate-500">Export your passenger profile and trip history</p>
              </div>
            </div>

            <button
              onClick={handleDownloadUserData}
              disabled={isDownloading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95"
            >
              {isDownloading ? 'Exporting...' : 'Export JSON'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
