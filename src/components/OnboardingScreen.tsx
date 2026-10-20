import React, { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { 
  ArrowRight, MapPin, Zap, ShieldCheck, 
  Sparkles, Package, Bike, Landmark, Compass, Check
} from 'lucide-react';
import { sound } from '../lib/sound';

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);

  const slides = [
    {
      id: 'peshawar-city',
      title: 'Welcome to Peshawar',
      subtitle: 'City of Flowers & Timeless Heritage',
      description: 'Discover seamless, reliable urban mobility designed exclusively for Peshawar—from Saddar to Hayatabad and beyond.',
      tag: 'Heritage & Mobility',
      icon: Landmark,
      centerGraphic: (
        <div className="relative w-full h-56 sm:h-64 rounded-3xl bg-gradient-to-b from-[#eaf6e3] to-[#daf1d0] flex items-center justify-center overflow-hidden border border-lime-200/90 shadow-md">
          {/* Bab-e-Khyber Skyline Silhouette */}
          <div 
            className="absolute inset-0 bg-contain bg-bottom bg-no-repeat opacity-40"
            style={{ backgroundImage: `url('/peshawar-skyline-clean.png')` }}
          />

          {/* Floating animated pin */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="absolute top-6 w-11 h-11 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shadow-lg shadow-[#3ebd19]/40 border-2 border-white z-20"
          >
            <MapPin className="w-6 h-6 fill-white" />
          </motion.div>

          {/* Central Monogram Badge */}
          <div className="z-10 bg-white/95 backdrop-blur-sm p-4 rounded-3xl border border-lime-200 shadow-xl flex flex-col items-center">
            <img 
              src="/safar-go-monogram-exact.png" 
              alt="SafarGo" 
              className="w-16 h-16 object-contain" 
            />
            <span className="text-xs font-black text-slate-900 mt-2 tracking-tight">
              Safar<span className="text-[#3ebd19]">Go</span> Peshawar
            </span>
          </div>
        </div>
      ),
      features: [
        { label: 'Local Routes', sub: 'Every Corner', icon: Compass },
        { label: 'Fair Fares', sub: 'Honest Pricing', icon: Zap },
        { label: 'Safe & Verified', sub: 'Peshawar Drivers', icon: ShieldCheck }
      ]
    },
    {
      id: 'bike-ride',
      title: 'Quick & Affordable Bike Rides',
      subtitle: 'Beat the Peshawar Traffic',
      description: 'Hop on a bike ride for the fastest, most economical travel through busy bazaars, BRT routes, and city corridors.',
      tag: 'Swift Bike Service',
      icon: Bike,
      centerGraphic: (
        <div className="relative w-full h-56 sm:h-64 rounded-3xl bg-gradient-to-b from-[#eaf6e3] to-[#daf1d0] flex items-center justify-center overflow-hidden border border-lime-200/90 shadow-md">
          {/* Subtle Skyline */}
          <div 
            className="absolute inset-0 bg-contain bg-bottom bg-no-repeat opacity-30"
            style={{ backgroundImage: `url('/peshawar-skyline.png')` }}
          />

          {/* Floating Map Pin */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute top-5 w-9 h-9 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shadow-lg shadow-[#3ebd19]/40 border-2 border-white z-10"
          >
            <MapPin className="w-5 h-5 fill-white" />
          </motion.div>

          {/* Bike & Rider Asset */}
          <motion.img 
            src="/vehicle-bike.png" 
            alt="Peshawar Bike Ride" 
            className="w-48 sm:w-56 object-contain z-10 drop-shadow-xl mt-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          />

          <div className="absolute -bottom-6 inset-x-0 h-14 bg-white/70 rounded-[100%] blur-[1px]" />
        </div>
      ),
      features: [
        { label: 'Lowest Fares', sub: 'Starting Rs 50', icon: Zap },
        { label: 'Helmet Safety', sub: 'Rider & Passenger', icon: ShieldCheck },
        { label: 'Instant Pickup', sub: 'Under 3 Minutes', icon: Sparkles }
      ]
    },
    {
      id: 'multi-service',
      title: 'Smart City Multi-Services',
      subtitle: 'Rides, Courier & Parcel Deliveries',
      description: 'More than just rides. Send parcels across Peshawar or book comfort cars for your family with a single tap.',
      tag: 'All-in-One Mobility',
      icon: Package,
      centerGraphic: (
        <div className="relative w-full h-56 sm:h-64 rounded-3xl bg-gradient-to-b from-[#eaf6e3] to-[#daf1d0] flex items-center justify-center overflow-hidden border border-lime-200/90 shadow-md">
          {/* Modern white sedan and parcel box */}
          <motion.img 
            src="/vehicle-car.png" 
            alt="Peshawar Car & Cargo" 
            className="w-52 sm:w-60 object-contain z-10 drop-shadow-xl -mt-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Floating Delivery Box Badge */}
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="absolute top-5 right-8 px-3 py-1 rounded-full bg-white text-slate-800 text-[11px] font-bold shadow-md border border-lime-200 flex items-center gap-1.5 z-20"
          >
            <Package className="w-3.5 h-3.5 text-[#3ebd19]" />
            <span>Fast Parcel Delivery</span>
          </motion.div>

          <div className="absolute -bottom-6 inset-x-0 h-14 bg-white/70 rounded-[100%] blur-[1px]" />
        </div>
      ),
      features: [
        { label: 'Door Delivery', sub: 'Across Peshawar', icon: Package },
        { label: 'AC & Economy', sub: 'Clean Vehicles', icon: Sparkles },
        { label: 'Live Tracking', sub: 'GPS Navigation', icon: MapPin }
      ]
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

  // Mobile Swipe Gesture Handlers
  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && currentStep < 2) {
      // Swiped Left -> Next
      sound.playClick();
      setCurrentStep(prev => (prev + 1) as 0 | 1 | 2);
    } else if (info.offset.x > swipeThreshold && currentStep > 0) {
      // Swiped Right -> Previous
      sound.playClick();
      setCurrentStep(prev => (prev - 1) as 0 | 1 | 2);
    }
  };

  const activeSlide = slides[currentStep];

  return (
    <div className="relative w-full min-h-screen bg-[#fafdf8] flex flex-col justify-between px-5 sm:px-8 py-6 select-none overflow-hidden font-sans selection:bg-[#3ebd19]/20">
      
      {/* Background Corner Wave Graphics matching SafarGo Theme */}
      <div className="fixed top-0 left-0 w-[170px] sm:w-[220px] h-[170px] sm:h-[220px] pointer-events-none z-0 select-none opacity-80">
        <svg viewBox="0 0 360 360" fill="none" className="w-full h-full">
          <path d="M0 0 L0 320 C90 310 180 260 250 180 C310 110 340 50 350 0 Z" fill="#6fd622" fillOpacity="0.25" />
          <path d="M0 0 L0 250 C70 240 140 200 190 140 C240 80 270 30 280 0 Z" fill="#48bb13" fillOpacity="0.35" />
        </svg>
      </div>

      {/* Top Header with SafarGo Monogram Logo */}
      <div className="relative z-10 w-full flex items-center justify-center pt-2">
        <div className="flex items-center gap-2 select-none px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-2xs">
          <img 
            src="/safar-go-monogram-exact.png" 
            alt="SafarGo" 
            className="w-6 h-6 object-contain" 
          />
          <span className="text-base font-black text-slate-900 tracking-tight">
            Safar<span className="text-[#3ebd19]">Go</span>
          </span>
        </div>
      </div>

      {/* Main Touch Swipeable Carousel Container */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full py-4 cursor-grab active:cursor-grabbing"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full flex flex-col items-center text-center"
          >
            {/* Tag Badge */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f8dc] text-[#2c980b] text-[11px] font-bold uppercase tracking-wider border border-lime-200">
                <activeSlide.icon className="w-3.5 h-3.5" />
                <span>{activeSlide.tag}</span>
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 leading-tight mb-1 tracking-tight">
              {activeSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#3ebd19] font-bold mb-2">
              {activeSlide.subtitle}
            </p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mb-5">
              {activeSlide.description}
            </p>

            {/* Center Graphic */}
            <div className="w-full mb-5">
              {activeSlide.centerGraphic}
            </div>

            {/* 3 Feature Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
              {activeSlide.features.map((feat, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col items-center text-center"
                >
                  <div className="w-8 h-8 rounded-full bg-lime-50 text-[#3ebd19] flex items-center justify-center mb-1">
                    <feat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">{feat.label}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{feat.sub}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Footer Controls: Pagination Dots + Stylish Next Arrow Button */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center gap-4 pb-2">
        
        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { sound.playClick(); setCurrentStep(idx as 0 | 1 | 2); }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentStep === idx 
                  ? 'w-7 bg-[#3ebd19]' 
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Stylish Circular / Rounded Arrow Button with Micro-Animation */}
        <div className="w-full flex items-center justify-center pt-1">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="group relative flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-full bg-gradient-to-r from-[#44b718] via-[#3ebd19] to-[#2ca012] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#3ebd19]/35 hover:brightness-105 active:scale-[0.98] transition duration-200 cursor-pointer overflow-hidden"
          >
            {/* Glowing shimmer ring */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

            <span>{currentStep === 2 ? 'Get Started' : 'Next'}</span>

            {/* Sleek Arrow Icon Container */}
            <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center transition-transform group-hover:translate-x-1">
              {currentStep === 2 ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
          </motion.button>
        </div>

      </div>

    </div>
  );
};
