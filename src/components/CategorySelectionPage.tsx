import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { sound } from '../lib/sound';

export type CategoryType = 'passenger' | 'driver' | 'cargo';

interface CategorySelectionPageProps {
  userName?: string;
  onSelectCategory: (category: CategoryType) => void;
}

export const CategorySelectionPage: React.FC<CategorySelectionPageProps> = ({
  onSelectCategory
}) => {
  const [selected, setSelected] = useState<CategoryType>('passenger');
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key in CategoryType]?: HTMLDivElement | null }>({});

  const categories: {
    id: CategoryType;
    title: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'passenger',
      title: 'Passenger',
      badge: 'Rider Mode',
      icon: (
        <svg viewBox="0 0 80 80" className="w-16 h-16 sm:w-20 sm:h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="24" fill="url(#pass_bg)" />
          {/* User Head */}
          <circle cx="38" cy="29" r="11" fill="#0f172a" />
          {/* User Body */}
          <path 
            d="M20 62C20 51.5 28.5 43 39 43H37C47.5 43 56 51.5 56 62C56 63 55 64 54 64H22C21 64 20 63 20 62Z" 
            fill="#0f172a" 
          />
          {/* Smartphone with GPS indicator */}
          <rect x="47" y="34" width="15" height="25" rx="4" fill="#84cc16" stroke="#ffffff" strokeWidth="2" />
          <circle cx="54.5" cy="46" r="2.5" fill="#0f172a" />
          <path d="M52 38H57" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="pass_bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f7fee7" />
              <stop offset="1" stopColor="#d9f99d" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'driver',
      title: 'Driver',
      badge: 'Captain Mode',
      icon: (
        <svg viewBox="0 0 80 80" className="w-16 h-16 sm:w-20 sm:h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="24" fill="url(#drive_bg)" />
          {/* Steering Wheel Outer Ring */}
          <circle cx="40" cy="40" r="22" stroke="#0f172a" strokeWidth="4.5" />
          {/* Steering Wheel Hub */}
          <circle cx="40" cy="40" r="7.5" fill="#0f172a" />
          <circle cx="40" cy="40" r="3" fill="#84cc16" />
          {/* Steering Wheel Spokes */}
          <path d="M18 40H32.5M47.5 40H62M40 47.5V62" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          {/* Winged Badge */}
          <path d="M29 20L40 24L51 20L40 28L29 20Z" fill="#84cc16" stroke="#0f172a" strokeWidth="1" />
          <defs>
            <linearGradient id="drive_bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f7fee7" />
              <stop offset="1" stopColor="#d9f99d" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'cargo',
      title: 'Cargo',
      badge: 'Delivery Mode',
      icon: (
        <svg viewBox="0 0 80 80" className="w-16 h-16 sm:w-20 sm:h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="24" fill="url(#cargo_bg)" />
          {/* Delivery Truck Cargo Bed */}
          <path d="M16 33H44V55H16V33Z" fill="#0f172a" />
          {/* Cabin */}
          <path d="M44 38H54L61 46V55H44V38Z" fill="#0f172a" />
          {/* Windshield */}
          <path d="M47 41H53L57 46H47V41Z" fill="#d9f99d" />
          {/* Wheels */}
          <circle cx="26" cy="56" r="5.5" fill="#84cc16" stroke="#0f172a" strokeWidth="2.5" />
          <circle cx="52" cy="56" r="5.5" fill="#84cc16" stroke="#0f172a" strokeWidth="2.5" />
          {/* Delivery Parcel on Top */}
          <rect x="23" y="24" width="14" height="11" rx="2" fill="#84cc16" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M30 24V35" stroke="#0f172a" strokeWidth="1.5" />
          <defs>
            <linearGradient id="cargo_bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f7fee7" />
              <stop offset="1" stopColor="#d9f99d" />
            </linearGradient>
          </defs>
        </svg>
      )
    }
  ];

  // Scroll clicked item directly to the center of the viewport
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

  // Center selected card on initial mount
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

  const handleConfirm = () => {
    sound.playSuccess();
    onSelectCategory(selected);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-[#f8fafc] flex flex-col items-center justify-center overflow-hidden select-none">
      
      {/* 1. Leftside Top Emerging Half Circle (Directly on screen corner) */}
      <div 
        className="fixed -top-28 -left-28 sm:-top-36 sm:-left-36 md:-top-44 md:-left-44 w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] rounded-full bg-gradient-to-br from-lime-300 via-lime-400 to-lime-500 shadow-2xl shadow-lime-400/40 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* 2. Rightside Bottom Emerging Half Circle (Directly on screen corner) */}
      <div 
        className="fixed -bottom-28 -right-28 sm:-bottom-36 sm:-right-36 md:-bottom-44 md:-right-44 w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] rounded-full bg-gradient-to-tl from-lime-500 via-lime-400 to-lime-300 shadow-2xl shadow-lime-400/40 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Center Elements Directly on Page — No Nested Container Boxes */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 max-w-5xl">
        
        {/* Clean Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight">
            Select Your Category
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Choose how you want to use Safar Go
          </p>
        </div>

        {/* Animated Sliding Items (No bottom scrollbar line, clicking centers card) */}
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

          {/* Slider Track with scroll-snap and no scrollbar lines */}
          <div 
            ref={sliderRef}
            className="w-full flex items-center justify-start sm:justify-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-6 px-16 sm:px-24"
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
                  whileHover={{ y: -6, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(cat.id)}
                  className={`relative w-[230px] sm:w-[260px] shrink-0 snap-center rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-2 border-lime-500 shadow-2xl shadow-lime-500/25 ring-4 ring-lime-400/35 scale-105 z-10'
                      : 'bg-white/95 hover:bg-white border-2 border-slate-200/90 hover:border-lime-300 shadow-lg opacity-80 hover:opacity-100 scale-95'
                  }`}
                >
                  {/* Active Selection Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-lime-500 text-slate-950 flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {/* Clean SVG Vector Icon Badge */}
                  <div className="mb-4 transform transition-transform duration-300 hover:scale-105">
                    {cat.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
                    {cat.title}
                  </h3>

                  {/* Status Indicator */}
                  <div className="mt-2.5">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full transition ${
                      isSelected
                        ? 'bg-lime-500 text-slate-950 font-extrabold shadow-sm'
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
            onClick={handleConfirm}
            className="lime-glow-button min-w-[240px] py-4 px-8 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wide cursor-pointer shadow-xl"
          >
            <span>Continue as {selected.charAt(0).toUpperCase() + selected.slice(1)}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

      </div>
    </div>
  );
};
