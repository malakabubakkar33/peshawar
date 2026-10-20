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
      className="fixed inset-0 w-full h-full bg-[#f3f9ee] flex flex-col justify-between items-center overflow-hidden select-none cursor-pointer z-50 selection:bg-[#3ebd19]/20 font-sans"
    >
      {/* 1. TOP BACKGROUND WAVY CONTOURS (Exact Match to Reference Image) */}
      <div className="absolute top-0 inset-x-0 h-72 pointer-events-none z-0 overflow-hidden">
        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-60">
          <path 
            d="M -20 60 C 80 30, 200 90, 420 30 L 420 0 L -20 0 Z" 
            fill="#e2f4d8" 
          />
          <path 
            d="M -20 120 C 120 70, 240 140, 420 80 L 420 0 L -20 0 Z" 
            fill="#ebf7e4" 
            opacity="0.8"
          />
          <path 
            d="M -20 180 C 100 130, 260 190, 420 140 L 420 0 L -20 0 Z" 
            fill="#f5faef" 
            opacity="0.9"
          />
        </svg>
      </div>

      {/* 2. TOP BRANDING HEADER: Monogram Logo & Wordmark */}
      <motion.div 
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center pt-8 sm:pt-10 px-4"
      >
        {/* Monogram Logo: Interlocking Green & Navy Curves with Location Pin */}
        <div className="relative mb-2.5 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center filter drop-shadow-md">
            <img 
              src="/safar-go-monogram-exact.png" 
              alt="SafarGo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to monogram clean
                (e.target as HTMLImageElement).src = '/safar-go-monogram-clean.png';
              }}
            />
          </div>
        </div>

        {/* Wordmark: SafarGo */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center">
          <span className="text-[#0f172a]">Safar</span>
          <span className="text-[#16a34a] ml-0.5">Go</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-[13px] font-bold text-slate-500 tracking-[0.24em] uppercase mt-1">
          Ride &nbsp;&bull;&nbsp; Explore &nbsp;&bull;&nbsp; Peshawar
        </p>
      </motion.div>

      {/* 3. CENTER HERO SCENE: Iconic Bab-e-Khyber & Peshawar Valley */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
        className="relative z-0 w-full flex-1 flex items-center justify-center max-w-md px-2 -my-4 overflow-hidden"
      >
        <div className="relative w-full h-full max-h-[420px] flex items-center justify-center">
          <img 
            src="/peshawar-gate-scenic.jpg" 
            alt="Peshawar Khyber Gate Heritage" 
            className="w-full h-full object-cover object-center rounded-3xl shadow-xl filter saturate-[1.08] contrast-[1.03]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/safar-go-peshawar-splash.png';
            }}
          />
          {/* Subtle natural vignette & ambient glow */}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-black/5 pointer-events-none" />
        </div>
      </motion.div>

      {/* 4. BOTTOM CONVEX CURVED DOME & SMOOTH PROGRESS BAR */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md pt-6 pb-8 px-6 bg-white/95 backdrop-blur-md rounded-t-[44px] sm:rounded-t-[52px] shadow-[0_-12px_40px_rgba(0,0,0,0.06)] border-t border-emerald-100 flex flex-col items-center text-center"
      >
        {/* Title */}
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          Drive Your Way
        </h2>

        {/* Subtitle */}
        <p className="text-xs font-semibold text-slate-500 mt-0.5 mb-4">
          Earn More &bull; Explore More
        </p>

        {/* Silky Smooth Progress Pill (Exact Match to User's Screenshot) */}
        <div className="w-28 sm:w-36 h-2 bg-emerald-100/90 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] rounded-full shadow-sm transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip hint */}
        <span className="text-[10px] text-slate-400 font-medium mt-3 tracking-wide">
          Tap anywhere to continue
        </span>
      </motion.div>
    </motion.div>
  );
};
