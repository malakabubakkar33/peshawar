import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsConditionsPageProps {
  onBack: () => void;
}

export const TermsConditionsPage: React.FC<TermsConditionsPageProps> = ({ onBack }) => {
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
          <FileText className="w-4 h-4 text-[#16a34a]" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Terms & Conditions
          </span>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">SafarGo Passenger Terms of Service</h2>
          <span className="text-[10px] text-slate-400">Effective Date: October 2026 &bull; Peshawar, KP</span>
        </div>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800">1. Acceptance of Terms</h3>
          <p>
            By accessing or using the SafarGo mobile app in Peshawar, Pakistan, you agree to be bound by these Terms of Service. If you do not agree, you must discontinue using our ride-booking and cargo transport services.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800">2. Passenger Account & Security</h3>
          <p>
            You must maintain an authentic mobile phone number and accurate identity information. Sharing your account or misrepresenting your identity violates our safety protocols.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800">3. Fares, Tolls & Payment Settlement</h3>
          <p>
            Fares are computed on estimated distance and transit time. Riders must settle payments via SafarGo Cash Wallet, EasyPaisa, JazzCash, or immediate cash to the captain. Toll charges or motorway fees are payable by the passenger.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800">4. Code of Conduct & Passenger Safety</h3>
          <p>
            Passengers are expected to treat captains with courtesy and respect. Any harassment, illegal cargo transportation, weapon carriage, or intentional vehicle damage will result in immediate police referral and account ban.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800">5. Cancellation & Waiting Fees</h3>
          <p>
            Passengers can cancel trips without fee within 3 minutes of booking. Extended captain waiting time beyond 5 minutes may accrue minimal waiting compensation for the driver.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-slate-800">6. Governing Law</h3>
          <p>
            These terms are governed by and construed in accordance with the applicable laws of Khyber Pakhtunkhwa and the Islamic Republic of Pakistan.
          </p>
        </section>
      </div>
    </div>
  );
};
