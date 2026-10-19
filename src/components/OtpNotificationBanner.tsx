import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Copy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OtpNotification } from '../lib/peshawarData';
import { sound } from '../lib/sound';

interface Props {
  onAutoFillOtp?: (code: string) => void;
}

export const OtpNotificationBanner: React.FC<Props> = ({ onAutoFillOtp }) => {
  const [notification, setNotification] = useState<OtpNotification | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<OtpNotification>;
      if (customEvent.detail) {
        setNotification(customEvent.detail);
        sound.playSuccess();
        setCopied(false);
      }
    };

    window.addEventListener('safargo-otp-received', handler);
    return () => window.removeEventListener('safargo-otp-received', handler);
  }, []);

  if (!notification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(notification.code);
    sound.playClick();
    setCopied(true);
    if (onAutoFillOtp) {
      onAutoFillOtp(notification.code);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md"
      >
        <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-lime-400/40 rounded-2xl p-4 shadow-2xl shadow-lime-500/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-lime-500/20 border border-lime-400/40 flex items-center justify-center text-lime-400">
                <Mail className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-lime-400">Safar Go Security</span>
                  <span className="text-[10px] text-slate-400">• Just now</span>
                </div>
                <p className="text-xs text-slate-300">
                  Verification code sent to <span className="font-semibold text-white">{notification.email}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-xl px-3 py-2">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">One-Time Code (OTP):</span>
              <span className="text-xl font-mono font-extrabold tracking-widest text-lime-400">
                {notification.code}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Auto-filled!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
