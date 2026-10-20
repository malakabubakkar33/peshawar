import React from 'react';
import { ArrowLeft, Info, Heart, MapPin, ExternalLink } from 'lucide-react';

interface AboutSafarGoPageProps {
  onBack: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
}

export const AboutSafarGoPage: React.FC<AboutSafarGoPageProps> = ({
  onBack,
  onNavigateToTerms,
  onNavigateToPrivacy
}) => {
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
            About SafarGo
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Brand Card */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-200 p-3 shadow-md flex items-center justify-center mb-3">
            <img 
              src="/safar-go-monogram-exact.png" 
              alt="SafarGo" 
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Safar<span className="text-[#16a34a]">Go</span>
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">
            Ride &bull; Explore &bull; Peshawar
          </p>

          <span className="mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200 inline-block">
            City of Flowers Smart Transport Network
          </span>

          <p className="text-xs text-slate-600 mt-4 leading-relaxed max-w-md">
            SafarGo is Pakistan’s hyper-local smart ride-booking and cargo mobility platform, custom-engineered for the historic city of Peshawar, Khyber Pakhtunkhwa. We connect passengers with vetted local bike riders, captains, and cargo carriers.
          </p>
        </div>

        {/* Coverage Zones */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#16a34a]" />
            Operating Service Zones in Peshawar
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-semibold">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              <span>Hayatabad (Phases 1-7)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              <span>Saddar Cantt & Mall Rd</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              <span>University Campus / Town</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              <span>Ring Road Corridors</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              <span>Qissa Khwani & Heritage</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              <span>BRT Corridor Stations</span>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-2 shadow-sm space-y-1">
          {onNavigateToTerms && (
            <button
              onClick={onNavigateToTerms}
              className="w-full p-3.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-800 transition-colors"
            >
              <span>Terms & Conditions</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {onNavigateToPrivacy && (
            <button
              onClick={onNavigateToPrivacy}
              className="w-full p-3.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-800 transition-colors"
            >
              <span>Privacy Policy</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-400 pt-3">
          SafarGo Mobility Services (Private) Limited &bull; Peshawar, Pakistan<br />
          Built with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for the people of Khyber Pakhtunkhwa.
        </div>
      </div>
    </div>
  );
};
