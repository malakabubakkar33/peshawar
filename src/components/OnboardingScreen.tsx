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
      id: 'step-1',
      titleLine1: 'Your Ride,',
      titleLine2: 'Just a Tap Away',
      titleLine2Color: 'text-[#16a34a]',
      description: 'Book a ride in seconds and reach your destination with ease. Fast, safe and reliable.',
      illustration: '/onboarding-ill-1.png'
    },
    {
      id: 'step-2',
      titleLine1: 'Safe & Reliable',
      titleLine2: 'Every Time',
      titleLine2Color: 'text-[#16a34a]',
      description: 'Verified drivers, real-time tracking and 24/7 support for your safety and peace of mind.',
      illustration: '/onboarding-ill-2.png'
    },
    {
      id: 'step-3',
      titleLine1: 'Explore Peshawar',
      titleLine2: 'With SafarGo',
      titleLine2IsCustom: true,
      description: "From historic places to your daily needs, we're here to take you anywhere in the city.",
      illustration: '/onboarding-ill-3.png'
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
    if (info.offset.x < -40 && currentStep < 2) {
      sound.playPop();
      setCurrentStep((prev) => (prev + 1) as 0 | 1 | 2);
    } else if (info.offset.x > 40 && currentStep > 0) {
      sound.playPop();
      setCurrentStep((prev) => (prev - 1) as 0 | 1 | 2);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#fbfdfa] flex flex-col justify-between items-center px-6 pt-10 pb-8 sm:pb-10 overflow-hidden select-none z-40 font-sans">
      
      {/* 1. TOP BAR: Skip Button (Exact Match to Image 1) */}
      <div className="w-full max-w-sm flex items-center justify-end z-20">
        <button
          onClick={() => {
            sound.playClick();
            onFinish();
          }}
          className="text-sm font-bold text-[#16a34a] hover:text-emerald-700 active:scale-95 transition-all cursor-pointer py-1 px-2"
        >
          Skip
        </button>
      </div>

      {/* 2. CENTER SWIPEABLE CONTENT: Illustration + Dynamic Island Halo */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDragEnd={handleDragEnd}
        className="relative w-full max-w-sm flex-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing my-2"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.94, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.94, x: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            {/* Illustration Container with Soft Mint Background Halo */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-6">
              {/* Soft Radial Ambient Halo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#e5f7db]/70 via-[#edf9e6]/50 to-transparent blur-md pointer-events-none" />

              {/* Cropped Peshawar Scenic Illustration */}
              <img 
                src={slides[currentStep].illustration} 
                alt={slides[currentStep].titleLine1}
                className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_8px_20px_rgba(22,163,74,0.08)] pointer-events-none select-none"
              />
            </div>

            {/* Pagination Dots (Exact Match: Elongated Active Pill + Circular Dots) */}
            <div className="flex items-center gap-2 mb-6">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playPop();
                    setCurrentStep(idx as 0 | 1 | 2);
                  }}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    currentStep === idx 
                      ? 'w-6 bg-[#16a34a]' 
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Typography Section (Exact Copy from Image 1) */}
            <div className="w-full text-left px-2 sm:px-4">
              <h1 className="text-2xl sm:text-[28px] font-black leading-tight tracking-tight text-[#0f172a]">
                {slides[currentStep].titleLine1}
                <br />
                {slides[currentStep].titleLine2IsCustom ? (
                  <span>
                    With <span className="text-[#16a34a]">SafarGo</span>
                  </span>
                ) : (
                  <span className={slides[currentStep].titleLine2Color}>
                    {slides[currentStep].titleLine2}
                  </span>
                )}
              </h1>

              <p className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed mt-3">
                {slides[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 3. BOTTOM BUTTON */}
      <div className="w-full max-w-sm z-20 mt-2">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] hover:brightness-105 active:scale-98 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        >
          <span>{currentStep === 2 ? 'Get Started' : 'Continue'}</span>
          {currentStep === 2 ? (
            <ArrowRight className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
