import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
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
            Privacy Policy
          </span>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">SafarGo Privacy & Data Protection Policy</h2>
          <span className="text-[10px] text-slate-400">Updated: October 2026 &bull; SafarGo Mobility Peshawar</span>
        </div>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#16a34a]" />
            1. Information We Collect
          </h3>
          <p>
            We collect personal identity data (Name, Phone number, Email address), live GPS coordinates during active bookings, device information, and transaction records for trip invoicing.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#16a34a]" />
            2. How We Use Your Location Data
          </h3>
          <p>
            Precise geolocation is accessed strictly to pair you with the closest available bike rider or car captain, compute accurate Peshawar fares, and display real-time live navigation. We do NOT harvest background location when the app is terminated.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#16a34a]" />
            3. Sharing of Information
          </h3>
          <p>
            When a ride is requested, your pickup location and first name are shared with the dispatched driver. We never sell your personal contact numbers or private travel logs to third-party ad networks.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800">4. Data Retention & Your Rights</h3>
          <p>
            Passengers have the right to request a complete export of their personal data or request permanent account deletion via Account &gt; Personal Information &gt; Request Account Deletion.
          </p>
        </section>
      </div>
    </div>
  );
};
