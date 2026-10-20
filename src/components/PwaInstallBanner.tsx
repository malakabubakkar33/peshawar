import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, PlusSquare } from 'lucide-react';
import { usePwa } from '../lib/pwa';
import { sound } from '../lib/sound';

export const PwaInstallBanner: React.FC = () => {
  const { canInstall, isInstalled, triggerInstall } = usePwa();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('safargo_pwa_banner_dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    const isStandalone = (window.navigator as any).standalone === true;
    if (isAppleDevice && !isStandalone) {
      setIsIos(true);
    }
  }, []);

  const handleDismiss = () => {
    sound.playClick();
    setIsDismissed(true);
    sessionStorage.setItem('safargo_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    sound.playSuccess();
    if (isIos) {
      setShowIosGuide(true);
    } else {
      const success = await triggerInstall();
      if (success) {
        setIsDismissed(true);
      }
    }
  };

  // Only show if installable or iOS web, not yet installed, and not dismissed
  if (isInstalled || isDismissed || (!canInstall && !isIos)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-18 sm:top-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-[380px] z-50 pointer-events-auto"
      >
        <div
          className="rounded-[24px] p-3.5 sm:p-4 shadow-[0_16px_36px_-6px_rgba(22,163,74,0.22),0_4px_16px_rgba(0,0,0,0.06)] border border-white/80 transition-all select-none"
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            {/* App Icon */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#16a34a] to-[#22c55e] p-1 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/safar-go-monogram-exact.png"
                alt="SafarGo App"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                  Install SafarGo App
                </h4>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#16a34a] text-[9px] font-black uppercase tracking-wider">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
                Add to your home screen for fast 1-tap rides and full-screen experience.
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Row */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white text-xs font-bold shadow-md shadow-[#16a34a]/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIos ? 'How to Install' : 'Install Now'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold active:scale-[0.98] transition-all"
            >
              Later
            </button>
          </div>

          {/* iOS Guide Popup */}
          {showIosGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1.5"
            >
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Smartphone className="w-4 h-4 text-[#16a34a]" />
                <span>iPhone / iPad Installation:</span>
              </div>
              <p className="flex items-center gap-1.5">
                1. Tap the <Share className="w-3.5 h-3.5 text-blue-500 inline" /> <strong>Share</strong> button in Safari.
              </p>
              <p className="flex items-center gap-1.5">
                2. Select <PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline" /> <strong>Add to Home Screen</strong>.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
