import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, 
  ShieldCheck, Tag, CheckCircle2, Wallet, CreditCard
} from 'lucide-react';
import { type WalletTransaction } from '../lib/peshawarData';

interface WalletPageProps {
  onBackToHome: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onBackToHome }) => {
  // Start with clean fresh state
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('safargo_wallet_balance');
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_wallet_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
      const newBal = balance + amt;
      setBalance(newBal);
      localStorage.setItem('safargo_wallet_balance', newBal.toString());

      const newTx: WalletTransaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `${selectedMethod.toUpperCase()} Top Up`,
        subtitle: 'Added to SafarGo Balance',
        amount: amt,
        type: 'credit',
        date: 'Just now',
        method: selectedMethod
      };

      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      localStorage.setItem('safargo_wallet_transactions', JSON.stringify(updatedTxs));

      setIsAddingFunds(false);
      alert(`🎉 Successfully added PKR ${amt} to your SafarGo Wallet via ${selectedMethod.toUpperCase()}!`);
    }, 1000);
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.toUpperCase() === 'PESHAWAR20' || promoCode.toUpperCase() === 'SAFARGO') {
      setPromoApplied(true);
      const newBal = balance + 200;
      setBalance(newBal);
      localStorage.setItem('safargo_wallet_balance', newBal.toString());

      const bonusTx: WalletTransaction = {
        id: `TX-PROMO-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Promo Welcome Bonus',
        subtitle: 'PESHAWAR20 applied',
        amount: 200,
        type: 'credit',
        date: 'Just now',
        method: 'promo'
      };

      const updatedTxs = [bonusTx, ...transactions];
      setTransactions(updatedTxs);
      localStorage.setItem('safargo_wallet_transactions', JSON.stringify(updatedTxs));

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
                  <span className="text-sm font-bold text-lime-400">PKR</span>
                  <span className="text-4xl font-extrabold tracking-tight">
                    {balance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
                <span>Instant Auto-Pay</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Top-Up Container */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Load Wallet Balance</h3>

            {/* Quick Amounts */}
            <div className="grid grid-cols-3 gap-2">
              {['200', '500', '1000'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    topUpAmount === amt
                      ? 'bg-lime-50 border-[#3ebd19] text-[#2c980b] shadow-2xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  PKR {amt}
                </button>
              ))}
            </div>

            {/* Payment Method Selectors */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'easypaisa', label: 'EasyPaisa' },
                { id: 'jazzcash', label: 'JazzCash' },
                { id: 'sadapay', label: 'SadaPay' },
                { id: 'card', label: 'Debit Card' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition ${
                    selectedMethod === m.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleAddFunds}
              disabled={isAddingFunds}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#44b718] to-[#2ca012] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-lime-600/30 hover:brightness-105 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isAddingFunds ? 'Processing...' : `Add PKR ${topUpAmount}`}</span>
            </button>
          </div>

          {/* Promo Code Box */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#3ebd19]" />
              <span>Promo Voucher</span>
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Promo Code (e.g. PESHAWAR20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
              <button
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
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
                {transactions.length} Logs
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {transactions.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-lime-100/70 border border-lime-200 flex items-center justify-center text-[#3ebd19] mb-3">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-800">No Transactions Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                    Your wallet is clean and fresh. Top up using EasyPaisa, JazzCash, or apply promo code <strong>PESHAWAR20</strong> to see real transaction history.
                  </p>
                </div>
              ) : (
                transactions.map(tx => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
