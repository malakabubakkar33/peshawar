import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, ChevronRight, User, Car, Package } from 'lucide-react';
import { sound } from '../lib/sound';
import { DriverDobVerificationModal } from './DriverDobVerificationModal';

export type CategoryType = 'passenger' | 'driver' | 'cargo';

interface CategorySelectionPageProps {
  userName?: string;
  onSelectCategory: (category: CategoryType) => void;
}

export const CategorySelectionPage: React.FC<CategorySelectionPageProps> = ({
  onSelectCategory
}) => {
  const [selected, setSelected] = useState<CategoryType>('passenger');
  const [isDobModalOpen, setIsDobModalOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key in CategoryType]?: HTMLDivElement | null }>({});

  const categories: {
    id: CategoryType;
    title: string;
    subtitle: string;
    badge: string;
    accentColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'passenger',
      title: 'Passenger',
      subtitle: 'Book rides across Peshawar',
      badge: 'Rider Mode',
      accentColor: '#3ebd19',
      icon: (
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#3ebd19] to-[#84cc16] flex items-center justify-center text-white shadow-lg shadow-lime-500/25">
          <User className="w-10 h-10 stroke-[2.2]" />
        </div>
      )
    },
    {
      id: 'driver',
      title: 'Driver',
      subtitle: 'Earn with your bike or car',
      badge: '18+ Captain Mode',
      accentColor: '#16a34a',
      icon: (
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
          <Car className="w-10 h-10 stroke-[2.2]" />
        </div>
      )
    },
    {
      id: 'cargo',
      title: 'Cargo',
      subtitle: 'Send parcels & packages',
      badge: 'Delivery Mode',
      accentColor: '#f59e0b',
      icon: (
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
          <Package className="w-10 h-10 stroke-[2.2]" />
        </div>
      )
    }
  ];

  const scrollToCenter = (id: CategoryType) => {
    const el = cardRefs.current[id];
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const handleSelect = (id: CategoryType) => {
    sound.playClick();
    setSelected(id);
    scrollToCenter(id);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCenter('passenger');
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollArrow = (direction: 'left' | 'right') => {
    const order: CategoryType[] = ['passenger', 'driver', 'cargo'];
    const currentIndex = order.indexOf(selected);
    let nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= order.length) nextIndex = order.length - 1;

    const nextId = order[nextIndex];
    handleSelect(nextId);
  };

  const handleContinue = () => {
    sound.playClick();
    if (selected === 'driver') {
      // Driver selected: Open Date of Birth (DOB) 18+ Verification Modal
      setIsDobModalOpen(true);
      return;
    }
    sound.playSuccess();
    onSelectCategory(selected);
  };

  const handleDobVerified = (_dobString: string, _calculatedAge: number) => {
    setIsDobModalOpen(false);
    sound.playSuccess();
    onSelectCategory('driver');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-[#fafdf8] flex flex-col items-center justify-center overflow-hidden select-none selection:bg-[#3ebd19]/20">
      
      {/* 1. Leftside Top Emerging Half Circle */}
      <div 
        className="fixed -top-28 -left-28 sm:-top-36 sm:-left-36 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-lime-300 via-lime-400 to-lime-500 shadow-2xl shadow-lime-400/30 pointer-events-none z-0 opacity-70"
        aria-hidden="true"
      />

      {/* 2. Rightside Bottom Emerging Half Circle */}
      <div 
        className="fixed -bottom-28 -right-28 sm:-bottom-36 sm:-right-36 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tl from-lime-500 via-lime-400 to-lime-300 shadow-2xl shadow-lime-400/30 pointer-events-none z-0 opacity-70"
        aria-hidden="true"
      />

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-[#2c980b] text-xs font-bold uppercase tracking-wider mb-2">
            <span>SafarGo Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Select Your Role
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Choose how you want to experience SafarGo in Peshawar
          </p>
        </div>

        {/* Carousel / Circle Selection Buttons */}
        <div className="relative w-full flex items-center justify-center">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScrollArrow('left')}
            className="hidden sm:flex absolute left-4 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer"
            aria-label="Previous Category"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Circle Cards List */}
          <div 
            ref={sliderRef}
            className="w-full flex items-center justify-start sm:justify-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-6 px-12 sm:px-20"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {categories.map((cat) => {
              const isSelected = selected === cat.id;

              return (
                <motion.div
                  key={cat.id}
                  ref={(el) => {
                    cardRefs.current[cat.id] = el;
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(cat.id)}
                  className={`relative w-[210px] h-[260px] sm:w-[230px] sm:h-[280px] shrink-0 snap-center rounded-[36px] p-6 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-3 border-[#3ebd19] shadow-2xl shadow-lime-500/30 ring-4 ring-[#3ebd19]/25 scale-105 z-10'
                      : 'bg-white/90 hover:bg-white border-2 border-slate-200/90 hover:border-lime-300 shadow-md opacity-85 hover:opacity-100 scale-95'
                  }`}
                >
                  {/* Active Selection Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {/* Circular Icon Pod */}
                  <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
                    {cat.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {cat.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                    {cat.subtitle}
                  </p>

                  {/* Status Indicator */}
                  <div className="mt-3">
                    <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full transition ${
                      isSelected
                        ? 'bg-[#3ebd19] text-white font-extrabold shadow-sm'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isSelected ? '✓ Selected' : cat.badge}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScrollArrow('right')}
            className="hidden sm:flex absolute right-4 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer"
            aria-label="Next Category"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Continue Action Button */}
        <div className="mt-8">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="min-w-[260px] py-4 px-8 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] text-white text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-lime-500/30 hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
          >
            <span>Continue as {selected.charAt(0).toUpperCase() + selected.slice(1)}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </motion.button>
        </div>

      </div>

      {/* Driver Date of Birth Verification Modal */}
      <DriverDobVerificationModal
        isOpen={isDobModalOpen}
        onClose={() => setIsDobModalOpen(false)}
        onVerified={handleDobVerified}
      />
    </div>
  );
};
