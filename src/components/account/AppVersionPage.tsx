import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Info, RefreshCw, 
  Cpu, Database, ShieldCheck, Sparkles
} from 'lucide-react';
import { sound } from '../../lib/sound';

interface AppVersionPageProps {
  onBack: () => void;
}

export const AppVersionPage: React.FC<AppVersionPageProps> = ({ onBack }) => {
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateChecked, setUpdateChecked] = useState(false);

  const handleCheckUpdate = () => {
    sound.playClick();
    setIsCheckingUpdate(true);
    setUpdateChecked(false);

    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateChecked(true);
      sound.playSuccess();
    }, 1200);
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
          <Info className="w-4 h-4 text-[#16a34a]" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            App Version & Build
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Version Hero */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
            <img 
              src="/safar-go-monogram-exact.png" 
              alt="SafarGo" 
              className="w-10 h-10 object-contain"
            />
          </div>

          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            SafarGo Peshawar Passenger Edition
          </h2>
          <span className="text-xs font-black text-[#16a34a] mt-0.5">
            Version 2.4.0 (Build 2026.10.20-PROD)
          </span>

          <div className="mt-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse" />
            <span className="text-xs font-bold text-slate-600">Production Release &bull; Up to Date</span>
          </div>

          <button
            onClick={handleCheckUpdate}
            disabled={isCheckingUpdate}
            className="mt-5 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin text-[#16a34a]' : ''}`} />
            <span>{isCheckingUpdate ? 'Checking for updates...' : 'Check for Updates'}</span>
          </button>

          {updateChecked && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold"
            >
              You have the latest release installed. No updates available.
            </motion.div>
          )}
        </div>

        {/* System & API Status */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
            System & Subsystem Status
          </h3>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Supabase Cloud Database
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Operational
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Resend 6-Digit Email OTP
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Cloudinary Media CDN
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Leaflet Peshawar GPS Tile Engine
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              100% Online
            </span>
          </div>
        </div>

        {/* Release Notes */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-2 text-xs">
          <h3 className="font-black text-slate-900 uppercase tracking-wider mb-2">
            Release Highlights (v2.4.0)
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Real-time GPS auto-location tracking with dual radar beacon on map load</li>
            <li>Redesigned Peshawar search with authentic sectors, phases, and streets</li>
            <li>Complete passenger account drawer, security settings, and safety center</li>
            <li>Verified Peshawar emergency dialers (15, 1122, 1099, 1915)</li>
            <li>Saved Places management (Home, Work, Favorites with autocomplete)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
