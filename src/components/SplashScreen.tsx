import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sound } from '../lib/sound';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    sound.playSuccess();
    const startTime = performance.now();
    const duration = 2800; // 2.8 seconds smooth splash duration

    let animationFrameId: number;

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(rawProgress);

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setTimeout(onComplete, 300);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      onClick={onComplete}
      className="fixed inset-0 w-full h-full bg-[#fafdf8] flex flex-col justify-between items-center px-4 py-8 sm:py-10 overflow-hidden select-none cursor-pointer z-50 selection:bg-[#3ebd19]/20"
    >
      {/* ===== BACKGROUND DECORATIVE GRAPHICS (Exact Match with Login Page) ===== */}
      
      {/* Top-Left Organic Curved Wave */}
      <div className="absolute top-0 left-0 w-[180px] sm:w-[240px] h-[180px] sm:h-[240px] pointer-events-none z-0 select-none opacity-85">
        <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="splashWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#48bb13" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#6fd622" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9be738" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="splashWaveGrad2" x1="0%" y1="0%" x2="80%" y2="80%">
              <stop offset="0%" stopColor="#55c218" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#82de29" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="splashWaveGrad3" x1="0%" y1="0%" x2="70%" y2="70%">
              <stop offset="0%" stopColor="#3ca80d" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#59c719" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M0 0 L0 320 C90 310 180 260 250 180 C310 110 340 50 350 0 Z" fill="url(#splashWaveGrad1)" />
          <path d="M0 0 L0 250 C70 240 140 200 190 140 C240 80 270 30 280 0 Z" fill="url(#splashWaveGrad2)" />
          <path d="M0 0 L0 180 C50 170 100 140 140 95 C180 50 200 20 210 0 Z" fill="url(#splashWaveGrad3)" />
        </svg>
      </div>

      {/* Top-Right Dotted Travel Trajectory with Map Pins */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-44 sm:w-60 h-44 sm:h-60 pointer-events-none z-0 select-none opacity-85">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path 
            d="M 180 25 C 130 35 150 90 95 110 C 65 120 75 160 50 175" 
            stroke="#94d82d" 
            strokeWidth="2.5" 
            strokeDasharray="5 6" 
            strokeLinecap="round"
            fill="none" 
          />
          <g transform="translate(150, 18) scale(0.9)">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#b8e986" />
            <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
          </g>
          <g transform="translate(85, 95) scale(0.95)">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#a4e262" />
            <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Spacer */}
      <div className="w-full h-6" />

      {/* CENTER: SafarGo Monogram Emblem & Smooth Animated Typography */}
      <div className="relative z-10 flex flex-col items-center justify-center -mt-4">
        {/* Animated Monogram Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-4 flex items-center justify-center"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/95 backdrop-blur-md shadow-xl shadow-lime-500/15 border border-lime-200/90 flex items-center justify-center p-3.5">
            <img 
              src="/safar-go-monogram-exact.png" 
              alt="SafarGo" 
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 rounded-3xl bg-lime-400/20 blur-xl pointer-events-none animate-pulse-slow" />
        </motion.div>

        {/* Animated Title & Branding */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-[#1e293b] tracking-tight">
            Safar<span className="text-[#3ebd19]">Go</span>
          </h1>

          <p className="text-xs sm:text-sm font-bold text-slate-500 tracking-[0.25em] uppercase mt-1">
            Ride &bull; Explore &bull; Peshawar
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100/80 border border-lime-200 text-[#2c980b] text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#3ebd19] animate-ping" />
            <span>Peshawar Smart Mobility</span>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM SECTION: Peshawar Heritage Skyline & Silky Smooth Progress Line */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center pb-4">
        {/* Silky Smooth Progress Bar */}
        <div className="w-48 sm:w-56 h-2 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner mb-3">
          <div 
            className="h-full bg-gradient-to-r from-[#44b718] via-[#3ebd19] to-[#65a30d] rounded-full shadow-sm transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase mb-5">
          {progress < 100 ? 'Starting SafarGo...' : 'Welcome to Peshawar'}
        </p>

        {/* Unified Peshawar Landmark Skyline (Matching Login Page Grounded Silhouette) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          className="w-full flex justify-center"
        >
          <img 
            src="/peshawar-skyline-clean.png" 
            alt="Peshawar Skyline" 
            className="w-full max-w-[360px] h-auto object-contain pointer-events-none drop-shadow-sm opacity-95" 
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
