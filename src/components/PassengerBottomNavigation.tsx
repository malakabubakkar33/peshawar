import React from 'react';
import { motion } from 'framer-motion';
import { House, History, CarFront, Wallet, UserRound } from 'lucide-react';
import { sound } from '../lib/sound';

export type PassengerNavTab = 'home' | 'history' | 'book' | 'wallet' | 'profile';

interface PassengerBottomNavigationProps {
  activeTab: 'home' | 'history' | 'wallet' | 'profile' | string;
  onNavigate: (tab: PassengerNavTab) => void;
}

export const PassengerBottomNavigation: React.FC<PassengerBottomNavigationProps> = ({
  activeTab,
  onNavigate,
}) => {
  // Normalize active route state
  const isHome = activeTab === 'home';
  const isHistory = activeTab === 'history';
  const isWallet = activeTab === 'wallet';
  const isProfile = activeTab === 'profile' || activeTab === 'personal_info';

  const handleTabClick = (tab: PassengerNavTab) => {
    if (tab === 'book') {
      sound.playSuccess();
    } else {
      sound.playPop();
    }
    onNavigate(tab);
  };

  return (
    <div className="fixed bottom-3 sm:bottom-5 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none select-none">
      <nav
        aria-label="Passenger Navigation Bar"
        className="pointer-events-auto max-w-[430px] mx-auto relative"
      >
        {/* ======================================================== */}
        {/* PREMIUM GLASSMORPHISM PILL CONTAINER                     */}
        {/* ======================================================== */}
        <div
          className="relative rounded-[32px] sm:rounded-[36px] px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between shadow-[0_16px_38px_-8px_rgba(0,0,0,0.1),0_0_22px_rgba(22,163,74,0.08)] border border-white/80 transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Subtle top specular glass highlight */}
          <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-full" />

          {/* ---------------------------------------------------- */}
          {/* 1. HOME TAB                                          */}
          {/* ---------------------------------------------------- */}
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className="flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-[0.92] group focus:outline-none"
            aria-label="Home"
          >
            <div
              className={`relative flex items-center justify-center transition-all ${
                isHome
                  ? 'w-11 h-8 rounded-full bg-[#16a34a]/12 text-[#16a34a]'
                  : 'w-10 h-8 text-slate-600 group-hover:text-slate-800'
              }`}
            >
              <House
                className={`w-[22px] h-[22px] transition-colors ${
                  isHome ? 'fill-[#16a34a] text-[#16a34a]' : 'stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[11px] tracking-tight transition-colors mt-0.5 ${
                isHome ? 'font-black text-[#16a34a]' : 'font-semibold text-slate-600 group-hover:text-slate-900'
              }`}
            >
              Home
            </span>
            {isHome ? (
              <motion.div
                layoutId="nav-active-pill"
                className="w-5 h-1 rounded-full bg-[#16a34a] mt-0.5 shadow-xs"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            ) : (
              <div className="w-5 h-1 mt-0.5 opacity-0" />
            )}
          </button>

          {/* ---------------------------------------------------- */}
          {/* 2. HISTORY TAB                                       */}
          {/* ---------------------------------------------------- */}
          <button
            type="button"
            onClick={() => handleTabClick('history')}
            className="flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-[0.92] group focus:outline-none"
            aria-label="Trip History"
          >
            <div
              className={`relative flex items-center justify-center transition-all ${
                isHistory
                  ? 'w-11 h-8 rounded-full bg-[#16a34a]/12 text-[#16a34a]'
                  : 'w-10 h-8 text-slate-600 group-hover:text-slate-800'
              }`}
            >
              <History
                className={`w-[22px] h-[22px] transition-colors ${
                  isHistory ? 'text-[#16a34a] stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[11px] tracking-tight transition-colors mt-0.5 ${
                isHistory ? 'font-black text-[#16a34a]' : 'font-semibold text-slate-600 group-hover:text-slate-900'
              }`}
            >
              History
            </span>
            {isHistory ? (
              <motion.div
                layoutId="nav-active-pill"
                className="w-5 h-1 rounded-full bg-[#16a34a] mt-0.5 shadow-xs"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            ) : (
              <div className="w-5 h-1 mt-0.5 opacity-0" />
            )}
          </button>

          {/* ---------------------------------------------------- */}
          {/* 3. CENTER BOOK RIDE BUTTON (CIRCULAR GREEN GLASS)    */}
          {/* ---------------------------------------------------- */}
          <div className="relative -top-5 sm:-top-6 px-1 flex flex-col items-center justify-center">
            {/* Outer soft glowing backdrop */}
            <div className="absolute inset-0 rounded-full bg-[#22c55e]/25 blur-md pointer-events-none scale-110" />

            {/* Elevated Circular Glass Button */}
            <button
              type="button"
              onClick={() => handleTabClick('book')}
              title="Book Ride"
              aria-label="Book Ride"
              className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#16a34a] via-[#22c55e] to-[#15803d] text-white flex items-center justify-center shadow-[0_10px_25px_-4px_rgba(22,163,74,0.45)] ring-4 ring-white/90 active:scale-[0.92] transition-transform duration-150 focus:outline-none group"
            >
              {/* Inner top gloss radial sheen */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none opacity-80" />

              <CarFront className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white stroke-[1.8] group-hover:scale-105 transition-transform" />
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* 4. WALLET TAB                                        */}
          {/* ---------------------------------------------------- */}
          <button
            type="button"
            onClick={() => handleTabClick('wallet')}
            className="flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-[0.92] group focus:outline-none"
            aria-label="Wallet"
          >
            <div
              className={`relative flex items-center justify-center transition-all ${
                isWallet
                  ? 'w-11 h-8 rounded-full bg-[#16a34a]/12 text-[#16a34a]'
                  : 'w-10 h-8 text-slate-600 group-hover:text-slate-800'
              }`}
            >
              <Wallet
                className={`w-[22px] h-[22px] transition-colors ${
                  isWallet ? 'text-[#16a34a] stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[11px] tracking-tight transition-colors mt-0.5 ${
                isWallet ? 'font-black text-[#16a34a]' : 'font-semibold text-slate-600 group-hover:text-slate-900'
              }`}
            >
              Wallet
            </span>
            {isWallet ? (
              <motion.div
                layoutId="nav-active-pill"
                className="w-5 h-1 rounded-full bg-[#16a34a] mt-0.5 shadow-xs"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            ) : (
              <div className="w-5 h-1 mt-0.5 opacity-0" />
            )}
          </button>

          {/* ---------------------------------------------------- */}
          {/* 5. PROFILE TAB                                       */}
          {/* ---------------------------------------------------- */}
          <button
            type="button"
            onClick={() => handleTabClick('profile')}
            className="flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-[0.92] group focus:outline-none"
            aria-label="Profile"
          >
            <div
              className={`relative flex items-center justify-center transition-all ${
                isProfile
                  ? 'w-11 h-8 rounded-full bg-[#16a34a]/12 text-[#16a34a]'
                  : 'w-10 h-8 text-slate-600 group-hover:text-slate-800'
              }`}
            >
              <UserRound
                className={`w-[22px] h-[22px] transition-colors ${
                  isProfile ? 'text-[#16a34a] stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[11px] tracking-tight transition-colors mt-0.5 ${
                isProfile ? 'font-black text-[#16a34a]' : 'font-semibold text-slate-600 group-hover:text-slate-900'
              }`}
            >
              Profile
            </span>
            {isProfile ? (
              <motion.div
                layoutId="nav-active-pill"
                className="w-5 h-1 rounded-full bg-[#16a34a] mt-0.5 shadow-xs"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            ) : (
              <div className="w-5 h-1 mt-0.5 opacity-0" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};
