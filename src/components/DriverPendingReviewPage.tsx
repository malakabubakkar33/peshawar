import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, CheckCircle2, ShieldCheck, 
  ArrowRight, PhoneCall, MessageCircle, FileText
} from 'lucide-react';
import { type UserAccount } from '../lib/supabase';
import { sound } from '../lib/sound';

interface DriverPendingReviewPageProps {
  user: UserAccount | null;
  driverData?: any;
  onGoToPassengerHome: () => void;
}

export const DriverPendingReviewPage: React.FC<DriverPendingReviewPageProps> = ({
  user,
  driverData,
  onGoToPassengerHome
}) => {
  const [appId] = React.useState(() => 'SG-PE-' + Math.floor(100000 + Math.random() * 900000));
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
        
        {/* Animated Clock / Verification Icon */}
        <div className="relative my-3">
          <div className="w-24 h-24 rounded-full bg-[#e8f8dc] flex items-center justify-center text-[#3bb516] shadow-lg shadow-[#3bb516]/15 relative">
            <Clock className="w-12 h-12 stroke-[2.2] animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-4 h-4 text-[#3ebd19]" />
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="mt-4 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>Under Review &bull; Expected within 24 Hours</span>
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
          Application Submitted!
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-sm">
          Aapki registration application SafarGo Peshawar team ko mil chuki hai. Hamari team aapke documents verify kar rahi hai.
        </p>

        {/* 24 Hours Notification Notice Card */}
        <div className="w-full my-5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-left">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#3bb516]" />
            <span>Verification Timeline</span>
          </h4>

          {/* Stepper */}
          <div className="space-y-3.5">
            {/* Step 1: Completed */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Application & Documents Submitted</p>
                <p className="text-[11px] text-slate-500">CNIC, License & Vehicle details received</p>
              </div>
            </div>

            {/* Step 2: In Progress */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700">Document Verification (In Progress)</p>
                <p className="text-[11px] text-slate-500">Peshawar verification team reviewing records</p>
              </div>
            </div>

            {/* Step 3: Pending */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Driver Panel & Ride Requests Active</p>
                <p className="text-[11px] text-slate-400">SMS / Email confirmation will be sent within 24h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applicant Details Snapshot */}
        <div className="w-full p-4 rounded-2xl bg-[#f8faf7] border border-slate-200/80 text-left text-xs space-y-1.5 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Applicant Name:</span>
            <span className="text-slate-800 font-bold">{user?.fullName || driverData?.fullName || 'Driver'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Contact:</span>
            <span className="text-slate-800 font-bold">{user?.phone || driverData?.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Vehicle:</span>
            <span className="text-slate-800 font-bold">{driverData?.vehicleModel || 'Vehicle'} ({driverData?.vehicleNumber || 'Registered'})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Application ID:</span>
            <span className="text-[#2e8a11] font-mono font-bold">{appId}</span>
          </div>
        </div>

        {/* Support Buttons (WhatsApp & Call) */}
        <div className="w-full grid grid-cols-2 gap-3 mb-5">
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Help</span>
          </a>
          <a
            href="tel:+923001234567"
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
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer"
          >
            <span>Explore Passenger Mode</span>
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
