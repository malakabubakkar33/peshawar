import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { usePwa } from '../lib/pwa';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePwa();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white py-1.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md select-none"
        >
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>You are currently offline. SafarGo is running in cached offline mode.</span>
        </motion.div>
      )}

      {showRestored && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-[#16a34a] text-white py-1.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md select-none"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Connection restored! You are back online.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
