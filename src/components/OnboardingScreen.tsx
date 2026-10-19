import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, MapPin, DollarSign, Car, 
  Clock, Compass, Radio, Navigation, ArrowRight 
} from 'lucide-react';
import { sound } from '../lib/sound';

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const handleNext = () => {
    sound.playClick();
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      sound.playSuccess();
      onFinish();
    }
  };

  const handleSkip = () => {
    sound.playClick();
    onFinish();
  };

  return (
    <div className="relative w-full min-h-screen bg-[#f7fbf3] flex flex-col justify-between px-5 sm:px-8 py-6 select-none overflow-hidden font-sans">
      
      {/* Top Header with SafarGo Logo */}
      <div className="w-full flex items-center justify-center pt-2">
        <div className="flex items-center gap-2 select-none">
          <img 
            src="/safar-go-monogram-exact.png" 
            alt="SafarGo" 
            className="w-7 h-7 object-contain" 
          />
          <span className="text-lg font-black text-slate-900 tracking-tight">
            Safar<span className="text-[#3ebd19]">Go</span>
          </span>
        </div>
      </div>

      {/* Main Stepper Card Carousel */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full py-4">
        <AnimatePresence mode="wait">
          
          {/* ========================================================================= */}
          {/* STEP 1: RIDE YOUR WAY ACROSS PESHAWAR                                    */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Heading */}
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 leading-tight mb-2">
                Ride Your Way <br />
                Across <span className="text-[#3ebd19]">Peshawar</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mb-6">
                Book a ride quickly and easily, anytime, anywhere in Peshawar.
              </p>

              {/* Center Graphic: Motorbike with Green Pin and City Gateway Backdrop */}
              <div className="w-full h-56 sm:h-64 rounded-3xl bg-gradient-to-b from-[#eaf6e3] to-[#daf1d0] relative flex items-center justify-center overflow-hidden border border-lime-200/80 shadow-md shadow-lime-900/5 mb-6">
                {/* Gateway backdrop */}
                <div 
                  className="absolute inset-0 bg-contain bg-bottom bg-no-repeat opacity-35"
                  style={{ backgroundImage: `url('/peshawar-skyline.png')` }}
                />
                
                {/* Floating Map Pin */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="absolute top-6 w-9 h-9 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shadow-lg shadow-[#3ebd19]/40 border-2 border-white z-10"
                >
                  <MapPin className="w-5 h-5 fill-white" />
                </motion.div>

                {/* Bike & Rider Asset */}
                <motion.img 
                  src="/vehicle-bike.png" 
                  alt="Peshawar Bike Ride" 
                  className="w-48 sm:w-56 object-contain z-10 drop-shadow-xl mt-6"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Road Curve */}
                <div className="absolute -bottom-8 inset-x-0 h-16 bg-white/70 rounded-[100%] blur-[1px]" />
              </div>

              {/* 3 Feature Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                    <Zap className="w-4 h-4 fill-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Fast</span>
                  <span className="text-[10px] text-slate-400 font-medium">Pickup</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-lime-50 text-[#3ebd19] flex items-center justify-center mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#3ebd19]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Safe</span>
                  <span className="text-[10px] text-slate-400 font-medium">Rides</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-1">
                    <MapPin className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Reliable</span>
                  <span className="text-[10px] text-slate-400 font-medium">Drivers</span>
                </div>
              </div>

            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: COMFORTABLE RIDES FOR EVERYONE                                   */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Heading */}
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 leading-tight mb-2">
                Comfortable Rides <br />
                For <span className="text-[#3ebd19]">Everyone</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mb-6">
                Choose from bikes, cars and more for a smooth and comfortable journey.
              </p>

              {/* Center Graphic: Modern White Sedan Car on Road with Green Pin */}
              <div className="w-full h-56 sm:h-64 rounded-3xl bg-gradient-to-b from-[#eaf6e3] to-[#daf1d0] relative flex items-center justify-center overflow-hidden border border-lime-200/80 shadow-md shadow-lime-900/5 mb-6">
                {/* Domes and Minarets backdrop */}
                <div 
                  className="absolute inset-0 bg-contain bg-bottom bg-no-repeat opacity-40"
                  style={{ backgroundImage: `url('/skyline-illustration.png')` }}
                />

                {/* Floating Map Pin */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="absolute top-6 w-9 h-9 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shadow-lg shadow-[#3ebd19]/40 border-2 border-white z-10"
                >
                  <MapPin className="w-5 h-5 fill-white" />
                </motion.div>

                {/* Car Asset */}
                <motion.img 
                  src="/vehicle-car.png" 
                  alt="Peshawar Car Ride" 
                  className="w-52 sm:w-60 object-contain z-10 drop-shadow-xl mt-6"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Road Curve */}
                <div className="absolute -bottom-8 inset-x-0 h-16 bg-white/70 rounded-[100%] blur-[1px]" />
              </div>

              {/* 3 Feature Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Affordable</span>
                  <span className="text-[10px] text-slate-400 font-medium">Fares</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-lime-50 text-[#3ebd19] flex items-center justify-center mb-1">
                    <Car className="w-4 h-4 text-[#3ebd19]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Clean</span>
                  <span className="text-[10px] text-slate-400 font-medium">Vehicles</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">24/7</span>
                  <span className="text-[10px] text-slate-400 font-medium">Service</span>
                </div>
              </div>

            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: EXPLORE PESHAWAR WITH SAFARGO                                    */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Heading */}
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 leading-tight mb-2">
                Explore Peshawar <br />
                With <span className="text-[#3ebd19]">SafarGo</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mb-6">
                Your trusted ride partner for every destination in the city.
              </p>

              {/* Center Graphic: Connected Landmark Map Cards with Dotted Route */}
              <div className="w-full h-56 sm:h-64 rounded-3xl bg-gradient-to-b from-[#eaf6e3] to-[#daf1d0] relative flex items-center justify-center p-3 overflow-hidden border border-lime-200/80 shadow-md shadow-lime-900/5 mb-6">
                
                {/* SVG Connecting Dotted Route */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 240">
                  <path 
                    d="M 60 70 Q 160 110, 160 120 T 260 80 M 160 120 Q 160 180, 220 180" 
                    fill="none" 
                    stroke="#84cc16" 
                    strokeWidth="2.5" 
                    strokeDasharray="5,5" 
                  />
                </svg>

                {/* Central Location Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shadow-lg border-2 border-white z-20">
                  <MapPin className="w-5 h-5 fill-white" />
                </div>

                {/* Landmark Card 1: Islamia College (Top-Left) */}
                <div className="absolute top-3 left-3 bg-white p-1.5 rounded-xl shadow-md border border-slate-200/80 flex flex-col items-center max-w-[95px] z-10">
                  <div className="w-20 h-11 rounded-lg overflow-hidden bg-slate-100 mb-1">
                    <img 
                      src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80" 
                      alt="Islamia College" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-800 truncate w-full text-center">
                    Islamia College
                  </span>
                </div>

                {/* Landmark Card 2: Qissa Khwani Bazaar (Top-Right) */}
                <div className="absolute top-3 right-3 bg-white p-1.5 rounded-xl shadow-md border border-slate-200/80 flex flex-col items-center max-w-[95px] z-10">
                  <div className="w-20 h-11 rounded-lg overflow-hidden bg-slate-100 mb-1">
                    <img 
                      src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=120&auto=format&fit=crop&q=80" 
                      alt="Qissa Khwani" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-800 truncate w-full text-center">
                    Qissa Khwani
                  </span>
                </div>

                {/* Landmark Card 3: Peshawar Museum (Bottom-Right) */}
                <div className="absolute bottom-3 right-5 bg-white p-1.5 rounded-xl shadow-md border border-slate-200/80 flex flex-col items-center max-w-[95px] z-10">
                  <div className="w-20 h-11 rounded-lg overflow-hidden bg-slate-100 mb-1">
                    <img 
                      src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&auto=format&fit=crop&q=80" 
                      alt="Peshawar Museum" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-slate-800 truncate w-full text-center">
                    Peshawar Museum
                  </span>
                </div>

              </div>

              {/* 3 Feature Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                    <Compass className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Local</span>
                  <span className="text-[10px] text-slate-400 font-medium">Expertise</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-lime-50 text-[#3ebd19] flex items-center justify-center mb-1">
                    <Radio className="w-4 h-4 text-[#3ebd19]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Real-Time</span>
                  <span className="text-[10px] text-slate-400 font-medium">Tracking</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                    <Navigation className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">Best</span>
                  <span className="text-[10px] text-slate-400 font-medium">Routes</span>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Controls: Pagination Dots + Buttons */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 pb-2">
        
        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              onClick={() => { sound.playClick(); setCurrentStep(step as 1 | 2 | 3); }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentStep === step 
                  ? 'w-6 bg-[#3ebd19]' 
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Buttons Bar (Skip on Left, Next / Get Started on Right) */}
        <div className="w-full flex items-center justify-between gap-4 pt-1">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Skip
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3.5 px-6 rounded-full bg-gradient-to-r from-[#44b718] via-[#3ebd19] to-[#2ca012] hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#3ebd19]/30 transition cursor-pointer"
          >
            <span>{currentStep === 3 ? 'Get Started' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
