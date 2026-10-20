import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ShieldAlert, CheckCircle2, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { sound } from '../lib/sound';

interface DriverDobVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (dobString: string, calculatedAge: number) => void;
}

export const DriverDobVerificationModal: React.FC<DriverDobVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified
}) => {
  const currentYear = new Date().getFullYear();

  // Default to 20 years ago (e.g. year 2004/2006)
  const [day, setDay] = useState<number>(15);
  const [month, setMonth] = useState<number>(6); // June
  const [year, setYear] = useState<number>(currentYear - 20);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate age dynamically
  const { age, isEligible } = useMemo(() => {
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }

    return {
      age: calculatedAge,
      isEligible: calculatedAge >= 18
    };
  }, [day, month, year]);

  const handleConfirm = () => {
    if (!isEligible) {
      sound.playError();
      return;
    }
    sound.playSuccess();
    const dobString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onVerified(dobString, age);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col selection:bg-[#3ebd19]/20"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-br from-[#f3fbe9] via-white to-white border-b border-slate-100 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#e6f8d8] text-[#3ebd19] flex items-center justify-center shrink-0 shadow-sm border border-lime-200">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Driver Age Verification
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Confirm your Date of Birth before registering
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Policy Notice Box */}
          <div className="px-6 pt-5 pb-2">
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Government Regulation:</strong> As per Khyber Pakhtunkhwa Transport regulations, individuals under <strong>18 years of age</strong> are strictly not permitted to operate commercial rides.
              </p>
            </div>
          </div>

          {/* Interactive Date Selectors (Day, Month, Year) */}
          <div className="px-6 py-4 space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Your Date of Birth
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Day */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">Day</span>
                <select
                  value={day}
                  onChange={(e) => setDay(parseInt(e.target.value, 10))}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3ebd19] focus:ring-2 focus:ring-[#3ebd19]/20"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">Month</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  className="w-full py-2.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3ebd19] focus:ring-2 focus:ring-[#3ebd19]/20"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m.slice(0, 3)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">Year</span>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3ebd19] focus:ring-2 focus:ring-[#3ebd19]/20"
                >
                  {Array.from({ length: 70 }, (_, i) => currentYear - 10 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculated Age Status Badge */}
            <div className="pt-2">
              {isEligible ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-extrabold text-emerald-950">
                        Age: {age} Years Old &bull; Eligible ✓
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        You meet the minimum age requirement for driver registration.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <div className="text-xs font-extrabold text-red-950">
                        Age: {age} Years Old &bull; Under 18 Not Allowed
                      </div>
                      <div className="text-[11px] text-red-700">
                        You must be at least 18 years old to drive with SafarGo.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold hover:bg-white transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!isEligible}
              onClick={handleConfirm}
              className="py-3 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-lime-500/25 hover:brightness-105 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceed to Registration</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
