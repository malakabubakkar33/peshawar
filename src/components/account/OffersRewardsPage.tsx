import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Tag, Gift, Copy, Check, Share2, 
  Clock, AlertCircle, CheckCircle2
} from 'lucide-react';
import { passengerStorage, type PromoOffer } from '../../lib/passengerStorage';
import { type UserAccount } from '../../lib/supabase';
import { sound } from '../../lib/sound';

interface OffersRewardsPageProps {
  user: UserAccount;
  onBack: () => void;
}

export const OffersRewardsPage: React.FC<OffersRewardsPageProps> = ({
  user,
  onBack
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoOffer | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const referralCode = `SAFAR-${(user.username || user.fullName.replace(/\s+/g, '')).slice(0, 5).toUpperCase()}${user.id.slice(-2).toUpperCase()}`;

  const offers = passengerStorage.getActiveOffers();

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);

    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) {
      setPromoError('Please enter a promo code.');
      sound.playError();
      return;
    }

    const match = offers.find(o => o.code === clean);
    if (match) {
      sound.playSuccess();
      setAppliedPromo(match);
      setPromoCodeInput('');
    } else {
      sound.playError();
      setPromoError('Invalid or expired promo code for Peshawar region.');
    }
  };

  const handleCopyReferral = () => {
    sound.playSuccess();
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareReferral = () => {
    sound.playClick();
    const shareText = `Use my SafarGo Peshawar referral code ${referralCode} to get PKR 150 discount on your first rides! Download: https://safargo.pk/invite`;
    if (navigator.share) {
      navigator.share({
        title: 'SafarGo Peshawar Referral',
        text: shareText,
        url: 'https://safargo.pk'
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Referral invitation link copied to clipboard!');
    }
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
          <Gift className="w-4 h-4 text-[#16a34a]" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Offers & Referrals
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* 1. REFERRAL HERO CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-[#16a34a] to-[#059669] text-white p-6 shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-white/20 inline-block mb-2">
              SafarGo Rewards
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Invite Friends, Earn PKR 200
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-md leading-relaxed">
              Share your referral code with friends and family in Peshawar. When they complete their first ride, both of you earn PKR 200 wallet credits!
            </p>

            {/* Referral Code Box */}
            <div className="mt-5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider block font-bold">
                  Your Exclusive Referral Code
                </span>
                <span className="text-base sm:text-lg font-black tracking-widest text-white">
                  {referralCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReferral}
                  className="px-3 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#16a34a]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleShareReferral}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                  title="Share Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. PROMO CODE REDEMPTION FORM */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#16a34a]" />
            Have a Promo Voucher?
          </h3>
          <p className="text-xs text-slate-500 mb-3">Enter voucher code to apply discount on your next ride.</p>

          <form onSubmit={handleApplyCode} className="flex gap-2">
            <input
              type="text"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. PESHAWAR50"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-slate-50"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#16a34a] text-white text-xs font-black hover:bg-emerald-700 active:scale-95 transition-all shrink-0"
            >
              Apply
            </button>
          </form>

          {appliedPromo && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                <span>Code <strong>{appliedPromo.code}</strong> applied! ({appliedPromo.discount})</span>
              </div>
              <button
                onClick={() => setAppliedPromo(null)}
                className="text-[10px] text-emerald-700 underline font-bold"
              >
                Remove
              </button>
            </motion.div>
          )}

          {promoError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{promoError}</span>
            </motion.div>
          )}
        </div>

        {/* 3. AVAILABLE OFFERS & DISCOUNTS */}
        <div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider px-1 block mb-3">
            Available Peshawar Promos
          </span>

          <div className="space-y-3">
            {offers.map(offer => (
              <div
                key={offer.id}
                className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      {offer.discount}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{offer.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{offer.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      sound.playSuccess();
                      setAppliedPromo(offer);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[#16a34a] hover:bg-[#16a34a] hover:text-white font-extrabold text-xs transition-colors shrink-0"
                  >
                    Use Code
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {offer.expiryDate}
                  </span>
                  <span className="font-bold text-slate-700">
                    Code: <span className="text-[#16a34a] font-black">{offer.code}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
