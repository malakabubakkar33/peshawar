import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, MapPin, Clock, ArrowUpDown, 
  X, Building2, GraduationCap, 
  Stethoscope, ShoppingBag, Plane, Landmark
} from 'lucide-react';
import { 
  PESHAWAR_PLACES, type PeshawarPlace, 
  getRecentSearches, saveRecentSearch 
} from '../lib/peshawarData';
import { sound } from '../lib/sound';

interface SearchPageProps {
  fromPlace: PeshawarPlace;
  toPlace: PeshawarPlace;
  onSelectFrom: (place: PeshawarPlace) => void;
  onSelectTo: (place: PeshawarPlace) => void;
  onConfirmTrip: (from: PeshawarPlace, to: PeshawarPlace) => void;
  onBackToHome: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  fromPlace,
  toPlace,
  onSelectFrom,
  onSelectTo,
  onConfirmTrip,
  onBackToHome
}) => {
  const [activeInput, setActiveInput] = useState<'from' | 'to'>('to');
  const [query, setQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<PeshawarPlace[]>(() => getRecentSearches());

  // Category Icons Map
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'university':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'hospital':
        return <Stethoscope className="w-4 h-4 text-rose-600" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-amber-600" />;
      case 'historic':
        return <Landmark className="w-4 h-4 text-purple-600" />;
      case 'transport':
        return <Plane className="w-4 h-4 text-sky-600" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  // Swap From and To
  const handleSwap = () => {
    sound.playPop();
    const temp = fromPlace;
    onSelectFrom(toPlace);
    onSelectTo(temp);
  };

  // Select a place
  const handleSelect = (place: PeshawarPlace) => {
    sound.playPop();
    saveRecentSearch(place);
    setRecentSearches(getRecentSearches());

    if (activeInput === 'from') {
      onSelectFrom(place);
      setActiveInput('to');
    } else {
      onSelectTo(place);
      // Auto confirm to proceed to ride categories
      onConfirmTrip(fromPlace, place);
    }
  };

  // Filtered places
  const filteredPlaces = PESHAWAR_PLACES.filter(place => {
    const q = query.toLowerCase().trim();
    const matchesQuery = 
      q === '' ||
      place.name.toLowerCase().includes(q) ||
      place.address.toLowerCase().includes(q);

    const matchesCategory = 
      selectedCategoryFilter === 'all' ||
      (selectedCategoryFilter === 'popular' && place.popular) ||
      place.category === selectedCategoryFilter;

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 flex flex-col pt-16 sm:pt-20 pb-28 px-4 sm:px-6 max-w-4xl mx-auto">
      
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-lime-400" />
          <span>Back to Map</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
          <span className="text-xs font-bold text-lime-400">Peshawar Live Ride Search</span>
        </div>
      </div>

      {/* Inputs Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-slate-800/80 backdrop-blur-xl border border-white/10 p-4 sm:p-5 shadow-2xl relative mb-6"
      >
        <div className="flex items-stretch gap-3">
          {/* Timeline dots / line */}
          <div className="flex flex-col items-center justify-between py-3">
            <div className="w-3.5 h-3.5 rounded-full bg-lime-400 ring-4 ring-lime-400/20 shadow-sm" />
            <div className="w-0.5 flex-1 bg-gradient-to-b from-lime-400 via-slate-600 to-rose-500 my-1.5 dashed" />
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20 shadow-sm" />
          </div>

          {/* Dual Inputs */}
          <div className="flex-1 space-y-2.5">
            {/* Pickup Input */}
            <div 
              onClick={() => setActiveInput('from')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                activeInput === 'from'
                  ? 'bg-slate-900 border-lime-400 shadow-md ring-2 ring-lime-400/20'
                  : 'bg-slate-900/60 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex-1 overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pickup Location
                </span>
                <span className="text-sm font-bold text-white truncate block">
                  {fromPlace.name}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {fromPlace.address}
                </span>
              </div>
              {activeInput === 'from' && (
                <span className="px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 text-[10px] font-extrabold border border-lime-400/30">
                  Editing
                </span>
              )}
            </div>

            {/* Destination Input */}
            <div 
              onClick={() => setActiveInput('to')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                activeInput === 'to'
                  ? 'bg-slate-900 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                  : 'bg-slate-900/60 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex-1 overflow-hidden">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  Destination (Where to?)
                </span>
                <span className="text-sm font-bold text-white truncate block">
                  {toPlace.name}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {toPlace.address}
                </span>
              </div>
              {activeInput === 'to' && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                  Select
                </span>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleSwap}
              title="Swap Pickup & Destination"
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center border border-white/10 transition-all shadow-md"
            >
              <ArrowUpDown className="w-4 h-4 text-lime-400" />
            </button>
          </div>
        </div>

        {/* Live Search Bar for filtering list */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Type landmark in Peshawar (e.g. Saddar, Hayatabad, KTH, Deans)...`}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Last Searched in Peshawar (Moved here as requested!) */}
      {recentSearches.length > 0 && query.trim() === '' && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-lime-400" />
              Last Searched in Peshawar
            </span>
            <span className="text-[10px] text-slate-400">Quick Select</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {recentSearches.slice(0, 6).map(place => (
              <button
                key={place.id}
                onClick={() => handleSelect(place)}
                className="shrink-0 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-lime-400/10 border border-white/10 hover:border-lime-400/40 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                <span>{place.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Places' },
            { id: 'popular', label: '⭐ Popular' },
            { id: 'university', label: '🎓 Universities' },
            { id: 'hospital', label: '🏥 Hospitals' },
            { id: 'shopping', label: '🛍️ Shopping' },
            { id: 'historic', label: '🏛️ Historic' },
            { id: 'transport', label: '✈️ Transport' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategoryFilter(cat.id);
                sound.playPop();
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategoryFilter === cat.id
                  ? 'bg-lime-400 text-slate-950 shadow-md font-black scale-105'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Places List */}
      <div className="space-y-2.5 flex-1">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-slate-400">
            {filteredPlaces.length} Peshawar Locations
          </span>
          <span className="text-[11px] text-lime-400 font-medium">
            Tap to set as {activeInput === 'from' ? 'Pickup' : 'Destination'}
          </span>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-slate-900/40 border border-white/5">
            <MapPin className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-300">No Peshawar location found</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for Saddar, Hayatabad, or Ring Road</p>
          </div>
        ) : (
          filteredPlaces.map(place => (
            <motion.div
              key={place.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(place)}
              className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-lime-400/40 cursor-pointer transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-lime-400/20 border border-white/10 group-hover:border-lime-400/30 flex items-center justify-center transition-colors">
                  {getCategoryIcon(place.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-lime-300 transition-colors">
                      {place.name}
                    </h4>
                    {place.popular && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-lime-400/20 text-lime-300 font-extrabold border border-lime-400/30">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{place.address}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-lime-400 block transition-colors">
                  Select &rarr;
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Floating Action to proceed directly */}
      <div className="sticky bottom-20 mt-4">
        <button
          onClick={() => onConfirmTrip(fromPlace, toPlace)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-lime-500/20 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Choose Vehicle & Ride Options</span>
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};
