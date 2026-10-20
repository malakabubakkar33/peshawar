import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, CheckCircle2, ShieldCheck, 
  ArrowRight, PhoneCall, MessageCircle, FileText, Sparkles, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { type UserAccount, userStorage } from '../lib/supabase';
import { adminManager } from '../lib/adminData';
import { sound } from '../lib/sound';

interface DriverPendingReviewPageProps {
  user: UserAccount | null;
  driverData?: any;
  onGoToPassengerHome: () => void;
  onEnterDriverPanel?: () => void;
}

export const DriverPendingReviewPage: React.FC<DriverPendingReviewPageProps> = ({
  user,
  driverData,
  onGoToPassengerHome,
  onEnterDriverPanel
}) => {
  const [appId] = useState(() => 'SG-PE-' + Math.floor(100000 + Math.random() * 900000));
  const [isApproved, setIsApproved] = useState(false);

  // Poll / Listen for Admin Approval
  useEffect(() => {
    const checkApprovalStatus = () => {
      const apps = adminManager.getDriverApplications();
      const currentApp = apps.find(a => 
        (user && (a.userId === user.id || a.phone === user.phone || a.email === user.email)) ||
        (driverData && (a.phone === driverData.phone || a.email === driverData.email))
      );

      if (currentApp && currentApp.status === 'approved') {
        if (!isApproved) {
          setIsApproved(true);
          sound.playSuccess();
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.4 },
            colors: ['#3ebd19', '#84cc16', '#22c55e', '#16a34a']
          });
        }
      }
    };

    checkApprovalStatus();

    const handleEvent = (e: any) => {
      const approved = e.detail;
      if (
        (user && (approved.userId === user.id || approved.phone === user.phone)) ||
        (driverData && approved.phone === driverData.phone)
      ) {
        setIsApproved(true);
        sound.playSuccess();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.4 },
          colors: ['#3ebd19', '#84cc16', '#22c55e', '#16a34a']
        });
      }
    };

    window.addEventListener('safargo-driver-approved', handleEvent);
    const interval = setInterval(checkApprovalStatus, 4000);

    return () => {
      window.removeEventListener('safargo-driver-approved', handleEvent);
      clearInterval(interval);
    };
  }, [user, driverData, isApproved]);

  const handleEnterDriver = () => {
    sound.playClick();
    if (user) {
      localStorage.setItem(`safargo_driver_registered_${user.id}`, 'true');
      localStorage.setItem(`safargo_active_mode_${user.id}`, 'driver');
      userStorage.updateRole(user.id, 'driver');
    }
    if (onEnterDriverPanel) {
      onEnterDriverPanel();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#fafdf8] px-4 py-8 flex flex-col items-center justify-between selection:bg-[#3ebd19]/20 selection:text-slate-900">
      
      {/* Background Subtle Corner Waves */}
      <div className="fixed top-0 left-0 w-44 h-44 pointer-events-none z-0 select-none opacity-60">
        <svg viewBox="0 0 360 360" fill="none" className="w-full h-full">
          <path d="M0 0 L0 300 C90 280 180 230 250 160 C310 90 330 30 340 0 Z" fill="#6fd622" fillOpacity="0.2" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-[430px] flex flex-col items-center text-center mx-auto my-auto"
      >
        
        {/* Animated Clock or Approved Icon */}
        <div className="relative my-3">
          {isApproved ? (
            <div className="w-24 h-24 rounded-full bg-[#e8f8dc] flex items-center justify-center text-[#3bb516] shadow-xl shadow-lime-500/20 border-2 border-lime-300">
              <Check className="w-12 h-12 stroke-[3] text-[#3ebd19]" />
            </div>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-[#e8f8dc] flex items-center justify-center text-[#3bb516] shadow-lg shadow-[#3bb516]/15 relative">
                <Clock className="w-12 h-12 stroke-[2.2] animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-4 h-4 text-[#3ebd19]" />
              </div>
            </>
          )}
        </div>

        {/* Status Pill Badge */}
        <div className="mt-4 mb-2">
          {isApproved ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Officially Approved by Admin!</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Under Review &bull; Waiting for Admin Approval</span>
            </span>
          )}
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
          {isApproved ? 'Application Approved!' : 'Application Under Review!'}
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-sm">
          {isApproved 
            ? 'Mubarak! SafarGo Admin team ne aapki application aur EasyPaisa payment verify kar ke approve kar di hai.'
            : 'Aapki application aur EasyPaisa payment screenshot Admin team ko mil chuki hai. Admin verification ke bad aapka account activate kare ga.'}
        </p>

        {/* If approved: Show Prominent Enter Driver Panel Button */}
        {isApproved && (
          <div className="w-full my-5 p-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-lime-50 border-2 border-[#3ebd19] shadow-lg">
            <h4 className="text-sm font-extrabold text-slate-900 mb-1">
              Driver Panel Unlocked ✓
            </h4>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              You can now enter Driver Mode and start accepting passenger ride requests across Peshawar.
            </p>
            <button
              type="button"
              onClick={handleEnterDriver}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#44b718] via-[#3ebd19] to-[#2ca012] text-white font-extrabold text-sm uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Launch Driver Panel</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Verification Timeline Card */}
        <div className="w-full my-5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-left">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#3bb516]" />
            <span>Application Timeline</span>
          </h4>

          {/* Stepper */}
          <div className="space-y-3.5">
            {/* Step 1: Completed */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Application & EasyPaisa Receipt Submitted</p>
                <p className="text-[11px] text-slate-500">CNIC, License & PKR 500 fee receipt sent to Admin</p>
              </div>
            </div>

            {/* Step 2: Admin Approval */}
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                isApproved 
                  ? 'bg-[#3ebd19] text-white' 
                  : 'bg-amber-100 border-2 border-amber-500 text-amber-700'
              }`}>
                {isApproved ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <div>
                <p className={`text-xs font-bold ${isApproved ? 'text-slate-800' : 'text-amber-700'}`}>
                  Admin Review & Document Verification {isApproved ? '(Approved)' : '(Pending Admin)'}
                </p>
                <p className="text-[11px] text-slate-500">Peshawar Admin verifying documents & receipt</p>
              </div>
            </div>

            {/* Step 3: Driver Panel */}
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                isApproved
                  ? 'bg-[#3ebd19] text-white'
                  : 'bg-slate-100 border border-slate-300 text-slate-400'
              }`}>
                {isApproved ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : '3'}
              </div>
              <div>
                <p className={`text-xs font-bold ${isApproved ? 'text-[#2e8a11]' : 'text-slate-400'}`}>
                  Driver Panel Active {isApproved ? '✓ Ready' : ''}
                </p>
                <p className="text-[11px] text-slate-400">Accept rides across Peshawar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applicant Details Snapshot */}
        <div className="w-full p-4 rounded-2xl bg-[#f8faf7] border border-slate-200/80 text-left text-xs space-y-1.5 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Applicant:</span>
            <span className="text-slate-800 font-bold">{user?.fullName || driverData?.fullName || 'Driver'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Phone:</span>
            <span className="text-slate-800 font-bold">{user?.phone || driverData?.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Vehicle:</span>
            <span className="text-slate-800 font-bold">{driverData?.vehicleName || 'Vehicle'} ({driverData?.vehicleNumber || 'Registered'})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Payment:</span>
            <span className="text-emerald-700 font-bold">EasyPaisa (PKR 500 Paid)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Application ID:</span>
            <span className="text-[#2e8a11] font-mono font-bold">{appId}</span>
          </div>
        </div>

        {/* Support Buttons */}
        <div className="w-full grid grid-cols-2 gap-3 mb-5">
          <a
            href="https://wa.me/923328888249"
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Support</span>
          </a>
          <a
            href="tel:+923328888249"
            className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <PhoneCall className="w-4 h-4 text-[#3bb516]" />
            <span>Call Helpline</span>
          </a>
        </div>

        {/* Continue in Passenger Mode Button */}
        <div className="w-full">
          <button
            type="button"
            onClick={() => { sound.playClick(); onGoToPassengerHome(); }}
            className="w-full py-3.5 px-6 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition cursor-pointer"
          >
            <span>Explore Passenger Mode in Meantime</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Bottom Bab-e-Khyber Peshawar Landmark Heritage Illustration */}
        <div className="w-full mt-8 flex flex-col items-center justify-center select-none pointer-events-none opacity-85">
          <img 
            src="/peshawar-skyline-clean.png" 
            alt="Peshawar Heritage Skyline" 
            className="w-full max-w-[340px] h-auto object-contain" 
          />
        </div>

      </motion.div>
    </div>
  );
};
