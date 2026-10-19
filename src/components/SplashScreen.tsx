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
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 4;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div 
      onClick={onComplete}
      className="relative w-full min-h-screen bg-[#f3f9ed] flex flex-col justify-between items-center px-6 py-8 overflow-hidden select-none cursor-pointer"
    >
      {/* Top Left Organic Vine / Leaves Graphic */}
      <div className="absolute top-0 left-0 w-36 sm:w-44 h-36 sm:h-44 pointer-events-none opacity-85 z-10">
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M-10 -10 C30 20, 60 70, 70 120 C50 100, 30 80, -10 60 Z" fill="#65a30d" fillOpacity="0.7" />
          <path d="M-10 -10 C50 10, 100 40, 130 90 C100 80, 70 60, 20 40 Z" fill="#84cc16" fillOpacity="0.85" />
          <path d="M10 -10 C40 40, 80 80, 110 130 C90 100, 60 70, 30 20 Z" fill="#4d7c0f" fillOpacity="0.6" />
          <circle cx="85" cy="50" r="16" fill="#84cc16" fillOpacity="0.4" />
          <circle cx="45" cy="85" r="14" fill="#65a30d" fillOpacity="0.45" />
          <circle cx="110" cy="100" r="12" fill="#a3e635" fillOpacity="0.5" />
        </svg>
      </div>

      {/* Top Right Subtle Curve */}
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-50 z-10">
        <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
          <path d="M120 0 C90 30, 80 70, 60 120 C80 90, 100 60, 120 40 Z" fill="#84cc16" fillOpacity="0.4" />
        </svg>
      </div>

      {/* CENTER: SafarGo Monogram Emblem & Typography */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-6 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          {/* Logo Monogram */}
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/90 backdrop-blur-md shadow-xl shadow-lime-500/15 border border-lime-200/80 flex items-center justify-center p-3">
              <img 
                src="/safar-go-monogram-exact.png" 
                alt="SafarGo Monogram" 
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            {/* Pulsing glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-lime-400/20 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-[#1e293b] tracking-tight">
            Safar<span className="text-[#3ebd19]">Go</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-bold text-slate-500 tracking-[0.2em] uppercase mt-1">
            Ride • Explore • Peshawar
          </p>

          {/* Peshawar Artistic Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 flex flex-col items-center"
          >
            <span className="text-base sm:text-lg font-black italic text-[#2c980b] font-serif tracking-wide">
              Peshawar
            </span>
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider">
              Safer Rides, Brighter Journeys
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* BOTTOM: Peshawar Landmark Silhouette / Khyber Gate Graphic & Loading Progress */}
      <div className="w-full max-w-sm flex flex-col items-center z-20 pb-2">
        
        {/* Khyber Pass / Bab-e-Khyber Scenic Illustration Graphic */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full h-44 sm:h-52 rounded-3xl overflow-hidden relative shadow-lg shadow-emerald-900/10 border border-lime-200/70 mb-5 bg-gradient-to-b from-emerald-100/60 to-emerald-200/80"
        >
          {/* Mountains Silhouette */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/skyline-full.png')` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
          </div>

          {/* Bab-e-Khyber Arch Vector Badge in Center */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/80 via-slate-900/50 to-transparent flex items-end justify-between">
            <div className="text-left">
              <p className="text-[10px] uppercase font-black text-lime-400 tracking-widest leading-none">
                Historical Heritage
              </p>
              <p className="text-xs font-bold text-white leading-tight mt-0.5">
                Bab-e-Khyber & Peshawar City
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
              City of Flowers
            </span>
          </div>
        </motion.div>

        {/* Loading Progress Bar matching reference */}
        <div className="w-40 sm:w-48 h-2 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#44b718] to-[#65a30d] rounded-full shadow-sm"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>

        <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-2">
          {progress < 100 ? 'Starting SafarGo...' : 'Welcome to Peshawar'}
        </p>
      </div>

    </div>
  );
};
