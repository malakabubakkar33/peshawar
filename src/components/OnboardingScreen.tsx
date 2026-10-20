import React, { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { sound } from '../lib/sound';

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);

  const slides = [
    {
      id: 'drive-your-way',
      title: 'Drive Your Way',
      subtitle: 'Earn More • Explore More',
      description: 'Peshawar’s premier smart mobility network. Ride as a passenger or register your bike / car to earn flexible daily income.'
    },
    {
      id: 'instant-rides',
      title: 'Instant City Rides',
      subtitle: 'Quick Bikes & Comfort Cars',
      description: 'Beat the traffic from Saddar Cantt to Hayatabad, University Town & Ring Road with honest, upfront pricing.'
    },
    {
      id: 'smart-courier',
      title: 'Safe & Tracked Travel',
      subtitle: 'Verified Local Peshawar Drivers',
      description: 'Real-time GPS navigation, emergency helplines, and 24/7 dedicated Peshawar customer assistance.'
    }
  ];

  const handleNext = () => {
    sound.playClick();
    if (currentStep < 2) {
      setCurrentStep((prev) => (prev + 1) as 0 | 1 | 2);
    } else {
      sound.playSuccess();
      onFinish();
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -45 && currentStep < 2) {
      sound.playPop();
      setCurrentStep((prev) => (prev + 1) as 0 | 1 | 2);
    } else if (info.offset.x > 45 && currentStep > 0) {
      sound.playPop();
      setCurrentStep((prev) => (prev - 1) as 0 | 1 | 2);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#f3f9ee] flex flex-col justify-between items-center overflow-hidden select-none z-40 font-sans">
      
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

      {/* 2. TOP BRANDING HEADER & SKIP BUTTON */}
      <div className="relative z-20 w-full max-w-md pt-7 sm:pt-9 px-5 flex items-center justify-between">
        <div className="w-12" /> {/* Left spacer for balance */}

        {/* Center Logo & Wordmark */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center filter drop-shadow-sm">
            <img 
              src="/safar-go-monogram-exact.png" 
              alt="SafarGo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/safar-go-monogram-clean.png';
              }}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center -mt-1">
            <span className="text-[#0f172a]">Safar</span>
            <span className="text-[#16a34a] ml-0.5">Go</span>
          </h1>

          <p className="text-[11px] font-bold text-slate-500 tracking-[0.22em] uppercase mt-0.5">
            Ride &nbsp;&bull;&nbsp; Explore &nbsp;&bull;&nbsp; Peshawar
          </p>
        </div>

        {/* Right Skip Button */}
        <div className="w-12 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onFinish();
            }}
            className="px-3 py-1 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 border border-emerald-200/90 text-xs font-bold shadow-2xs active:scale-95 transition-all"
          >
            Skip
          </button>
        </div>
      </div>

      {/* 3. CENTER HERO SCENE: Iconic Bab-e-Khyber Peshawar Valley */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="relative z-10 w-full flex-1 flex items-center justify-center max-w-md px-3 -my-3 cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <div className="relative w-full h-full max-h-[380px] flex items-center justify-center">
          <img 
            src="/peshawar-gate-scenic.jpg" 
            alt="Peshawar Scenic Gate" 
            className="w-full h-full object-cover object-center rounded-3xl shadow-xl filter saturate-[1.08] contrast-[1.03]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/safar-go-peshawar-splash.png';
            }}
          />
          <div className="absolute inset-0 rounded-3xl ring-1 ring-black/5 pointer-events-none" />
        </div>
      </motion.div>

      {/* 4. BOTTOM CONVEX CURVED DOME & INTERACTIVE SLIDES */}
      <div className="relative z-20 w-full max-w-md pt-5 pb-8 px-6 bg-white/95 backdrop-blur-md rounded-t-[44px] sm:rounded-t-[52px] shadow-[0_-12px_40px_rgba(0,0,0,0.06)] border-t border-emerald-100 flex flex-col items-center text-center">
        
        {/* Animated Slide Content */}
        <div className="w-full min-h-[92px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {slides[currentStep].title}
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {slides[currentStep].subtitle}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1.5 leading-relaxed line-clamp-2">
                {slides[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3-Segment Capsule Progress Pill (Exact Match to User's Screenshot) */}
        <div className="flex items-center gap-1.5 my-4">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playPop();
                setCurrentStep(idx as 0 | 1 | 2);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep === idx 
                  ? 'w-10 bg-[#16a34a] shadow-sm' 
                  : 'w-6 bg-emerald-100 hover:bg-emerald-200'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span>{currentStep === 2 ? 'Get Started' : 'Continue'}</span>
          {currentStep === 2 ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
