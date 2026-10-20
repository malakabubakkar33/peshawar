import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronRight, MapPin, Clock, ArrowLeft, 
  X, ShieldCheck, Bike, Car 
} from 'lucide-react';
import { 
  PESHAWAR_PLACES, type PeshawarPlace, 
  getRecentSearches, saveRecentSearch, clearRecentSearches 
} from '../lib/peshawarData';
import { sound } from '../lib/sound';

export type SearchPanelState = 'collapsed' | 'half_sheet' | 'full_search' | 'results_route';

interface RideSearchSheetProps {
  fromPlace: PeshawarPlace;
  toPlace: PeshawarPlace;
  searchState: SearchPanelState;
  onStateChange: (state: SearchPanelState) => void;
  onSelectFrom: (place: PeshawarPlace) => void;
  onSelectTo: (place: PeshawarPlace) => void;
  selectedVehicle: 'bike' | 'car' | 'cargo';
  onSelectVehicle: (type: 'bike' | 'car' | 'cargo') => void;
  onRequestRide: () => void;
  metrics: {
    distanceKm: number;
    fares: { bike: number; car: number; cargo: number };
  };
  onOpenSafetyDrawer?: () => void;
}

export const RideSearchSheet: React.FC<RideSearchSheetProps> = ({
  fromPlace,
  toPlace,
  searchState,
  onStateChange,
  onSelectFrom,
  onSelectTo,
  selectedVehicle,
  onSelectVehicle,
  onRequestRide,
  metrics,
  onOpenSafetyDrawer,
}) => {
  const [activeInput, setActiveInput] = useState<'from' | 'to'>('to');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<PeshawarPlace[]>(() => getRecentSearches());

  // Filtered suggested places based on input query
  const filteredPlaces = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      // Default top 4 Peshawar iconic landmarks matching reference image
      return [
        PESHAWAR_PLACES.find(p => p.name.includes('Islamia College')) || PESHAWAR_PLACES[0],
        PESHAWAR_PLACES.find(p => p.name.includes('Qissa Khwani')) || PESHAWAR_PLACES[1],
        PESHAWAR_PLACES.find(p => p.name.includes('Peshawar Museum')) || PESHAWAR_PLACES[2],
        PESHAWAR_PLACES.find(p => p.name.includes('Saddar')) || PESHAWAR_PLACES[3],
      ].filter(Boolean) as PeshawarPlace[];
    }
    return PESHAWAR_PLACES.filter(place => 
      place.name.toLowerCase().includes(q) ||
      place.address.toLowerCase().includes(q) ||
      (place.sector && place.sector.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [searchQuery]);

  // Select place from recent or suggestions
  const handleSelectPlace = (place: PeshawarPlace) => {
    sound.playPop();
    saveRecentSearch(place);
    setRecentSearches(getRecentSearches());

    if (activeInput === 'from') {
      onSelectFrom(place);
      setActiveInput('to');
    } else {
      onSelectTo(place);
      // Auto-transition to Results / Route preview (Screen 4)
      onStateChange('results_route');
    }
    setSearchQuery('');
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    clearRecentSearches();
    setRecentSearches([]);
  };

  // --------------------------------------------------------------------------
  // 1. COLLAPSED FLOATING SEARCH PILL BUTTON (Screen 1)
  // --------------------------------------------------------------------------
  if (searchState === 'collapsed') {
    return (
      <div className="fixed bottom-[92px] sm:bottom-[100px] left-0 right-0 z-30 px-4 sm:px-6 pointer-events-none select-none">
        <div className="max-w-[430px] mx-auto pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onStateChange('half_sheet');
            }}
            className="w-full rounded-full py-3 px-4.5 sm:py-3.5 sm:px-5 flex items-center justify-between shadow-[0_12px_32px_-6px_rgba(0,0,0,0.12),0_0_18px_rgba(22,163,74,0.06)] border border-white/80 active:scale-[0.97] transition-all duration-150 group"
            style={{
              background: 'rgba(255, 255, 255, 0.82)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            aria-label="Search ride in Peshawar"
          >
            <div className="flex items-center gap-3">
              <Search className="w-[18px] h-[18px] text-slate-400 group-hover:text-[#16a34a] transition-colors stroke-[2.2]" />
              <span className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                Search ride...
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-[#16a34a] group-hover:bg-[#16a34a] group-hover:text-white transition-all">
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dimmed Background Overlay */}
      <AnimatePresence>
        {(searchState === 'half_sheet' || searchState === 'full_search') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              sound.playPop();
              onStateChange('collapsed');
            }}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------------- */}
      {/* 2. HALF SHEET SEARCH PANEL (Screen 2 - Where are you going?)        */}
      {/* -------------------------------------------------------------------- */}
      {searchState === 'half_sheet' && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-4 pb-24 sm:pb-28 max-w-[460px] mx-auto pointer-events-auto"
        >
          <div
            className="rounded-[32px] sm:rounded-[36px] p-4 sm:p-5 shadow-[0_-12px_42px_-8px_rgba(0,0,0,0.18)] border border-white/80 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Drag Pill Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-300/80 mx-auto mb-3" />

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-3">
              Where are you going?
            </h2>

            {/* From & To Interactive Rows */}
            <div className="space-y-2 mb-3.5">
              {/* From Row */}
              <div
                onClick={() => {
                  sound.playClick();
                  setActiveInput('from');
                  onStateChange('full_search');
                }}
                className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-4 h-4 fill-white text-white" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#16a34a] block leading-tight">
                      From
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block">
                      {fromPlace.name || 'Current Location (Campus Zone)'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
              </div>

              {/* To Row */}
              <div
                onClick={() => {
                  sound.playPop();
                  setActiveInput('to');
                  onStateChange('full_search');
                }}
                className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-[#f43f5e] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-4 h-4 fill-white text-white" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#f43f5e] block leading-tight">
                      To
                    </span>
                    <span className={`text-xs sm:text-sm font-semibold truncate block ${toPlace?.name ? 'text-slate-800 font-bold' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {toPlace?.name || 'Where are you going?'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
              </div>
            </div>

            {/* Big Green Search Ride Button */}
            <button
              type="button"
              onClick={() => {
                sound.playSuccess();
                if (!toPlace || !toPlace.name) {
                  setActiveInput('to');
                  onStateChange('full_search');
                } else {
                  onStateChange('results_route');
                }
              }}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#16a34a]/30 flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Search Ride</span>
            </button>

            {/* Safety Assurance Banner */}
            <div
              onClick={() => {
                sound.playClick();
                onOpenSafetyDrawer?.();
              }}
              className="mt-2.5 py-2 px-3.5 rounded-full bg-emerald-50/70 hover:bg-emerald-100/60 border border-emerald-100 flex items-center justify-between text-[11px] font-semibold text-[#16a34a] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#16a34a]" />
                <span className="truncate">Safe Rides • Trusted Drivers • Peshawar Only</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#16a34a]" />
            </div>
          </div>
        </motion.div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 3. FULL SCREEN SEARCH SHEET (Screen 3 - Typing & Suggestions)        */}
      {/* -------------------------------------------------------------------- */}
      {searchState === 'full_search' && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 top-10 sm:top-12 z-50 bg-white rounded-t-[32px] sm:rounded-t-[36px] shadow-2xl flex flex-col overflow-hidden max-w-[480px] mx-auto"
        >
          {/* Top Bar with Back Arrow & Title */}
          <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-slate-100">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onStateChange('half_sheet');
              }}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <h1 className="text-base font-extrabold text-slate-900">
              Search Ride
            </h1>
            <div className="w-9" />
          </div>

          {/* From & To Inputs Container */}
          <div className="p-4 space-y-2 border-b border-slate-100 bg-slate-50/50">
            {/* From Input Row */}
            <div
              onClick={() => setActiveInput('from')}
              className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                activeInput === 'from'
                  ? 'border-[#16a34a] bg-emerald-50/30 ring-2 ring-[#16a34a]/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 fill-white text-white" />
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#16a34a] block leading-tight">
                    From
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {fromPlace.name || 'Current Location (Campus Zone)'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* To Input Row (Active Typing Field) */}
            <div
              onClick={() => setActiveInput('to')}
              className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                activeInput === 'to'
                  ? 'border-[#16a34a] bg-emerald-50/30 ring-2 ring-[#16a34a]/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                <div className="w-8 h-8 rounded-full bg-[#f43f5e] text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 fill-white text-white" />
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#f43f5e] block leading-tight">
                    To
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={toPlace?.name || 'Where are you going?'}
                    autoFocus
                    className="w-full bg-transparent text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                  />
                </div>
              </div>
              {searchQuery ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </div>
          </div>

          {/* Search Suggestions & Recent Searches List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* 1. Recent Searches */}
            {recentSearches.length > 0 && !searchQuery && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>Recent Searches</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllRecent}
                    className="text-[11px] font-bold text-[#16a34a] hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-1.5">
                  {recentSearches.map((place) => (
                    <div
                      key={place.id}
                      onClick={() => handleSelectPlace(place)}
                      className="p-2.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#16a34a] flex items-center justify-center shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#16a34a] transition-colors">
                            {place.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {place.address || 'Peshawar, Pakistan'}
                          </p>
                        </div>
                      </div>
                      <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Suggested Places */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>Suggested Places</span>
              </div>

              <div className="space-y-1.5">
                {filteredPlaces.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className="p-2.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-50 text-slate-400 group-hover:text-[#16a34a] flex items-center justify-center shrink-0 transition-colors">
                        <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#16a34a] transition-colors">
                          {place.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {place.address || 'Peshawar, Pakistan'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. RESULTS / MAP ROUTE & VEHICLE SELECTION (Screen 4)                */}
      {/* -------------------------------------------------------------------- */}
      {searchState === 'results_route' && (
        <>
          {/* Top Floating Route Summary Pill */}
          <div className="fixed top-3 left-0 right-0 z-40 px-3 sm:px-4 pointer-events-none select-none max-w-[460px] mx-auto">
            <div
              className="pointer-events-auto rounded-[24px] p-3 shadow-lg border border-white/80 transition-all flex items-center justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onStateChange('half_sheet');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 shrink-0"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="flex-1 px-3 overflow-hidden">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 truncate">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0" />
                  <span className="truncate">{fromPlace.name.split(' ')[0]}</span>
                  <span className="text-slate-400">→</span>
                  <span className="w-2 h-2 rounded-full bg-[#f43f5e] shrink-0" />
                  <span className="truncate">{toPlace.name.split(' ')[0]}</span>
                </div>
                <div className="text-[10px] text-[#16a34a] font-semibold flex items-center gap-1">
                  <span>{metrics.distanceKm} km route</span>
                  <span>•</span>
                  <span>Direct road</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onStateChange('full_search');
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 flex items-center justify-center shrink-0 transition-colors"
                title="Change destination"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Floating Vehicle Card */}
          <div className="fixed bottom-[84px] sm:bottom-[92px] left-0 right-0 z-30 px-3 sm:px-4 pointer-events-none select-none max-w-[460px] mx-auto">
            <div
              className="pointer-events-auto rounded-[30px] p-3.5 sm:p-4 shadow-[0_12px_42px_-6px_rgba(0,0,0,0.18)] border border-white/80 space-y-3"
              style={{
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
              }}
            >
              {/* Vehicle Switcher Tabs (Bike vs Car) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    onSelectVehicle('bike');
                  }}
                  className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all active:scale-[0.98] ${
                    selectedVehicle === 'bike'
                      ? 'border-[#16a34a] bg-emerald-50/80 text-[#16a34a] shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bike className="w-4 h-4 stroke-[2.2]" />
                  <span>Bike</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    onSelectVehicle('car');
                  }}
                  className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all active:scale-[0.98] ${
                    selectedVehicle === 'car'
                      ? 'border-[#16a34a] bg-emerald-50/80 text-[#16a34a] shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Car className="w-4 h-4 stroke-[2.2]" />
                  <span>Car</span>
                </button>
              </div>

              {/* Selected Ride Row (Bike / Car Details & Fare) */}
              <div className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-[#16a34a] flex items-center justify-center shrink-0">
                    {selectedVehicle === 'bike' ? (
                      <Bike className="w-5 h-5 stroke-[2.2]" />
                    ) : (
                      <Car className="w-5 h-5 stroke-[2.2]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {selectedVehicle === 'bike' ? 'Bike Ride' : 'Car Ride'}
                    </h4>
                    <span className="text-[10px] text-slate-400">2 min away</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    Rs {metrics.fares[selectedVehicle]}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Big Request Ride Button */}
              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  onRequestRide();
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-black text-sm sm:text-base shadow-lg shadow-[#16a34a]/30 flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span>Request Ride</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
