import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, 
  ShieldCheck, Tag, CheckCircle2 
} from 'lucide-react';
import { SAMPLE_WALLET_TRANSACTIONS, type WalletTransaction } from '../lib/peshawarData';

interface WalletPageProps {
  onBackToHome: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onBackToHome }) => {
  const [balance, setBalance] = useState<number>(1450.00);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(SAMPLE_WALLET_TRANSACTIONS);
  const [topUpAmount, setTopUpAmount] = useState<string>('500');
  const [selectedMethod, setSelectedMethod] = useState<'easypaisa' | 'jazzcash' | 'sadapay' | 'card'>('easypaisa');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [isAddingFunds, setIsAddingFunds] = useState<boolean>(false);

  const handleAddFunds = () => {
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) return;
    setIsAddingFunds(true);
    setTimeout(() => {
      setBalance(prev => prev + amt);
      const newTx: WalletTransaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `${selectedMethod.toUpperCase()} Top Up`,
        subtitle: 'Added to SafarGo Balance',
        amount: amt,
        type: 'credit',
        date: 'Just now',
        method: selectedMethod
      };
      setTransactions([newTx, ...transactions]);
      setIsAddingFunds(false);
      alert(`🎉 Successfully added PKR ${amt} to your SafarGo Wallet via ${selectedMethod.toUpperCase()}!`);
    }, 1000);
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.toUpperCase() === 'PESHAWAR20' || promoCode.toUpperCase() === 'SAFARGO') {
      setPromoApplied(true);
      setBalance(prev => prev + 200);
      alert('🎉 Promo Code Applied! PKR 200 bonus added to your wallet!');
      setPromoCode('');
    } else {
      alert('Invalid Promo Code. Try using "PESHAWAR20".');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pt-20 pb-28 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBackToHome}
          className="w-10 h-10 rounded-2xl ios-glass-card flex items-center justify-center text-slate-700 hover:text-lime-600 hover:scale-105 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SafarGo Wallet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage your balance, payments, and instant ride refunds
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Digital Card & Top Up */}
        <div className="lg:col-span-1 space-y-6">
          {/* Virtual Glass Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white shadow-2xl relative overflow-hidden border border-emerald-500/20"
          >
            {/* Background glowing orbs */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-lime-500/20 blur-3xl" />
            <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
                  SafarGo Pay Card
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                  PESHAWAR PASS
                </span>
              </div>

              <div className="mb-6">
                <span className="text-[11px] text-slate-400 font-medium block">Total Balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-lime-400 font-bold">PKR</span>
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Account Holder</span>
                  <span className="font-bold text-slate-200">Muhammad Abubakar</span>
                </div>
                <div className="flex items-center gap-1.5 text-lime-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" /> Verified
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Top-Up Box */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-lime-600" /> Quick Add Funds
            </h3>

            {/* Quick Amount Pills */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['200', '500', '1000', '2000'].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    topUpAmount === amt
                      ? 'bg-lime-500 text-slate-950 border-lime-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  PKR {amt}
                </button>
              ))}
            </div>

            {/* Payment Method Selector */}
            <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">Select Payment Gateway</span>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: 'easypaisa', label: 'EasyPaisa', icon: '🟢' },
                { id: 'jazzcash', label: 'JazzCash', icon: '🔴' },
                { id: 'sadapay', label: 'SadaPay', icon: '🟠' },
                { id: 'card', label: 'Debit Card', icon: '💳' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                    selectedMethod === m.id
                      ? 'border-lime-500 bg-lime-50/50 text-slate-900 ring-2 ring-lime-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleAddFunds}
              disabled={isAddingFunds}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isAddingFunds ? 'Processing Top Up...' : `Add PKR ${topUpAmount} via ${selectedMethod.toUpperCase()}`}
            </button>
          </div>

          {/* Promo Code Voucher Box */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" /> Apply Promo Code
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Use code <span className="font-bold text-slate-800">PESHAWAR20</span> for free bonus ride credits.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo voucher"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
              <button
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Apply
              </button>
            </div>
            {promoApplied && (
              <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> PESHAWAR20 applied (+PKR 200 credited)
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Transactions History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Wallet Transactions</h2>
                <p className="text-xs text-slate-500">Live payment activity and ride deductions</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {transactions.length} Activity Logs
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      tx.type === 'credit'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">{tx.title}</h4>
                      <p className="text-[11px] text-slate-500">{tx.subtitle} • {tx.method}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-sm sm:text-base font-black ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'} PKR {tx.amount}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
