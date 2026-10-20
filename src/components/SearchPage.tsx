import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, MapPin, Clock, ArrowUpDown, 
  X, Building2, GraduationCap, Stethoscope, ShoppingBag, 
  Plane, Landmark, Bus, Crosshair, ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { 
  PESHAWAR_PLACES, type PeshawarPlace, 
  getRecentSearches, saveRecentSearch, 
  calculateDistanceKm, getNearestPeshawarPlace 
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<PeshawarPlace[]>(() => getRecentSearches());
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsSuccessMessage, setGpsSuccessMessage] = useState<string | null>(null);

  // Category Icon & Color Mapping
  const getCategoryDetails = (place: PeshawarPlace) => {
    switch (place.category) {
      case 'university':
        return { 
          icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        };
      case 'hospital':
        return { 
          icon: <Stethoscope className="w-4 h-4 text-rose-600" />,
          bg: 'bg-rose-50 text-rose-700 border-rose-200' 
        };
      case 'shopping':
        return { 
          icon: <ShoppingBag className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50 text-amber-700 border-amber-200' 
        };
      case 'brt':
        return { 
          icon: <Bus className="w-4 h-4 text-sky-600" />,
          bg: 'bg-sky-50 text-sky-700 border-sky-200' 
        };
      case 'historic':
        return { 
          icon: <Landmark className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-50 text-purple-700 border-purple-200' 
        };
      case 'transport':
        return { 
          icon: <Plane className="w-4 h-4 text-blue-600" />,
          bg: 'bg-blue-50 text-blue-700 border-blue-200' 
        };
      case 'sector':
        return { 
          icon: <Building2 className="w-4 h-4 text-teal-600" />,
          bg: 'bg-teal-50 text-teal-700 border-teal-200' 
        };
      default:
        return { 
          icon: <MapPin className="w-4 h-4 text-[#16a34a]" />,
          bg: 'bg-emerald-50 text-[#16a34a] border-emerald-200' 
        };
    }
  };

  // Swap Pickup and Destination
  const handleSwap = () => {
    sound.playPop();
    const temp = fromPlace;
    onSelectFrom(toPlace);
    onSelectTo(temp);
  };

  // Select place from list or suggestions
  const handleSelectPlace = (place: PeshawarPlace) => {
    sound.playPop();
    saveRecentSearch(place);
    setRecentSearches(getRecentSearches());

    if (activeInput === 'from') {
      onSelectFrom(place);
      setActiveInput('to');
    } else {
      onSelectTo(place);
      // Automatically confirm route
      onConfirmTrip(fromPlace, place);
    }
  };

  // Use Real GPS Live Location
  const handleUseLiveGpsLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Location services are not supported by your browser.');
      return;
    }

    sound.playClick();
    setIsDetectingGps(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        const matched = getNearestPeshawarPlace(latitude, longitude);
        onSelectFrom(matched);
        saveRecentSearch(matched);
        setRecentSearches(getRecentSearches());
        setGpsSuccessMessage(`Locked to: ${matched.name}`);
        setTimeout(() => setGpsSuccessMessage(null), 3500);
        setActiveInput('to');
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn('GPS location tracking error:', err.message);
        // Fallback to nearest central Peshawar location
        const fallback = PESHAWAR_PLACES[0];
        onSelectFrom(fallback);
        setActiveInput('to');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Filter places based on search query and category filter
  const filteredPlaces = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return PESHAWAR_PLACES.filter(place => {
      // Query search match: name, address, sector, phase, street, tags
      const matchesQuery = 
        q === '' ||
        place.name.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        (place.sector && place.sector.toLowerCase().includes(q)) ||
        (place.phase && place.phase.toLowerCase().includes(q)) ||
        (place.street && place.street.toLowerCase().includes(q)) ||
        (place.tags && place.tags.some(tag => tag.toLowerCase().includes(q)));

      // Category filter match
      if (selectedFilter === 'all') return matchesQuery;
      if (selectedFilter === 'popular') return matchesQuery && place.popular;
      if (selectedFilter === 'hayatabad') {
        return matchesQuery && (place.phase || place.tags?.includes('hayatabad') || place.name.toLowerCase().includes('hayatabad'));
      }
      if (selectedFilter === 'saddar') {
        return matchesQuery && (place.tags?.includes('saddar') || place.name.toLowerCase().includes('saddar') || place.address.toLowerCase().includes('saddar'));
      }
      if (selectedFilter === 'brt') return matchesQuery && place.category === 'brt';
      if (selectedFilter === 'university') return matchesQuery && place.category === 'university';
      if (selectedFilter === 'hospital') return matchesQuery && place.category === 'hospital';
      if (selectedFilter === 'shopping') return matchesQuery && (place.category === 'shopping' || place.tags?.includes('karkhano') || place.tags?.includes('bazaar'));

      return matchesQuery && place.category === selectedFilter;
    });
  }, [searchQuery, selectedFilter]);

  // Total trip distance for the currently chosen places
  const currentTripDistance = useMemo(() => {
    return calculateDistanceKm(fromPlace.lat, fromPlace.lng, toPlace.lat, toPlace.lng);
  }, [fromPlace, toPlace]);

  return (
    <div className="w-full min-h-screen bg-[#fafdf8] text-slate-800 flex flex-col pt-16 sm:pt-20 pb-28 px-4 sm:px-6 max-w-4xl mx-auto">
      
      {/* 1. TOP BAR NAVIGATION */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-sm hover:border-emerald-300 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#16a34a]" />
          <span>Back to Map</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
          <span className="text-[11px] font-extrabold text-emerald-800 tracking-tight">
            Peshawar Real City Routing
          </span>
        </div>
      </div>

      {/* 2. DUAL ROUTE PICKUP & DESTINATION CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.05)] relative mb-5"
      >
        <div className="flex items-stretch gap-3">
          {/* Vertical connecting route icons */}
          <div className="flex flex-col items-center justify-between py-3.5 px-0.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#16a34a] ring-4 ring-emerald-100 shadow-sm" />
            <div className="w-0.5 flex-1 bg-gradient-to-b from-[#16a34a] via-slate-300 to-[#0284c7] my-1.5 border-dashed" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#0284c7] ring-4 ring-sky-100 shadow-sm" />
          </div>

          {/* Dual Inputs Container */}
          <div className="flex-1 space-y-2.5">
            {/* Pickup Input Card */}
            <div 
              onClick={() => {
                setActiveInput('from');
                sound.playClick();
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                activeInput === 'from'
                  ? 'bg-emerald-50/70 border-[#16a34a] shadow-sm ring-2 ring-emerald-400/20'
                  : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#16a34a]">
                    Pickup Location (From)
                  </span>
                  {activeInput === 'from' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#16a34a] text-white font-extrabold">
                      Active
                    </span>
                  )}
                </div>
                <span className="text-sm font-extrabold text-slate-900 truncate block mt-0.5">
                  {fromPlace.name}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {fromPlace.sector ? `${fromPlace.sector} • ` : ''}{fromPlace.address}
                </span>
              </div>

              {activeInput === 'from' && (
                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center hover:bg-emerald-200"
                    title="Clear query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Destination Input Card */}
            <div 
              onClick={() => {
                setActiveInput('to');
                sound.playClick();
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                activeInput === 'to'
                  ? 'bg-sky-50/70 border-[#0284c7] shadow-sm ring-2 ring-sky-400/20'
                  : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0284c7]">
                    Destination (Where to?)
                  </span>
                  {activeInput === 'to' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#0284c7] text-white font-extrabold">
                      Active
                    </span>
                  )}
                </div>
                <span className="text-sm font-extrabold text-slate-900 truncate block mt-0.5">
                  {toPlace.name}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {toPlace.sector ? `${toPlace.sector} • ` : ''}{toPlace.address}
                </span>
              </div>

              {activeInput === 'to' && (
                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center hover:bg-sky-200"
                    title="Clear query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleSwap}
              title="Swap Pickup & Destination"
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-emerald-50 active:scale-90 text-slate-700 hover:text-[#16a34a] flex items-center justify-center border border-slate-200 hover:border-emerald-300 transition-all shadow-sm"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Search Input with Instant Peshawar Autocomplete */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search Peshawar (e.g., Phase 3, Bilal Market, Saddar Mall, KTH, BRT)...`}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* GPS Success Feedback Toast inside Card */}
        {gpsSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
            <span>{gpsSuccessMessage}</span>
          </motion.div>
        )}
      </motion.div>

      {/* 3. "USE CURRENT LIVE LOCATION (GPS)" ACTION TILE */}
      <div className="mb-4">
        <button
          onClick={handleUseLiveGpsLocation}
          disabled={isDetectingGps}
          className="w-full p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-emerald-200/80 shadow-sm flex items-center justify-between group transition-all active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-center text-[#16a34a] ${isDetectingGps ? 'animate-spin' : 'group-hover:scale-105 transition-transform'}`}>
              <Crosshair className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#16a34a] transition-colors">
                  {isDetectingGps ? 'Tracking Live GPS Coordinates...' : 'Use My Current Live Location'}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold uppercase">
                  Real GPS
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Automatically snaps to where you are standing in Peshawar
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#16a34a] transition-colors" />
        </button>
      </div>

      {/* 4. RECENT SEARCHES (PEST-TESTED QUICK RECALL) */}
      {recentSearches.length > 0 && searchQuery.trim() === '' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#16a34a]" />
              Recent Places in Peshawar
            </span>
            <span className="text-[10px] text-slate-400">Tap to Quick Select</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {recentSearches.slice(0, 8).map(place => (
              <button
                key={place.id}
                onClick={() => handleSelectPlace(place)}
                className="shrink-0 px-3.5 py-2 rounded-2xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-[#16a34a]" />
                <span className="truncate max-w-[140px]">{place.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. PESHAWAR CATEGORY / AREA FILTER PILLS */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Places' },
            { id: 'popular', label: '⭐ Popular' },
            { id: 'hayatabad', label: '🏡 Hayatabad' },
            { id: 'saddar', label: '🏬 Saddar Cantt' },
            { id: 'brt', label: '🚌 BRT Stations' },
            { id: 'university', label: '🎓 Universities' },
            { id: 'hospital', label: '🏥 Hospitals' },
            { id: 'shopping', label: '🛍️ Markets' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedFilter(cat.id);
                sound.playPop();
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                selectedFilter === cat.id
                  ? 'bg-[#16a34a] text-white shadow-emerald-500/20 font-black scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. REAL PLACES LIST & DETAILED SECTOR/STREET SUGGESTIONS */}
      <div className="space-y-2.5 flex-1">
        <div className="flex items-center justify-between pb-1 px-1">
          <span className="text-xs font-extrabold text-slate-600">
            {filteredPlaces.length} Authentic Peshawar Locations Found
          </span>
          <span className="text-[11px] font-bold text-[#16a34a]">
            Selecting for: {activeInput === 'from' ? 'Pickup (From)' : 'Destination (To)'}
          </span>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No matching Peshawar location found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try searching "Phase 1", "Saddar", "KTH", "Tatara", or "BRT Station"
            </p>
          </div>
        ) : (
          filteredPlaces.map(place => {
            const { icon, bg } = getCategoryDetails(place);
            const distFromReference = calculateDistanceKm(
              activeInput === 'to' ? fromPlace.lat : toPlace.lat,
              activeInput === 'to' ? fromPlace.lng : toPlace.lng,
              place.lat,
              place.lng
            );
            const approxMinutes = Math.max(3, Math.round(distFromReference * 2.2));

            return (
              <motion.div
                key={place.id}
                whileHover={{ scale: 1.008 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectPlace(place)}
                className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-300 cursor-pointer transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
              >
                {/* Left: Category Icon & Place Details */}
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${bg} shadow-sm group-hover:scale-105 transition-transform`}>
                    {icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#16a34a] transition-colors truncate">
                        {place.name}
                      </h4>
                      {place.popular && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                          POPULAR
                        </span>
                      )}
                      {place.phase && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                          {place.phase}
                        </span>
                      )}
                    </div>

                    {/* Sector, Street, and Address Metadata */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                      {place.sector && (
                        <span className="font-semibold text-slate-700">
                          {place.sector} •
                        </span>
                      )}
                      {place.street && (
                        <span className="text-slate-600">
                          {place.street} •
                        </span>
                      )}
                      <span className="truncate">{place.address}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Distance & Select Button */}
                <div className="text-right shrink-0 pl-2 border-l border-slate-100">
                  <span className="text-xs font-black text-slate-800 block">
                    {distFromReference} km
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    ~{approxMinutes} mins
                  </span>
                  <span className="text-[10px] font-extrabold text-[#16a34a] group-hover:underline mt-0.5 block">
                    Select &rarr;
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 7. BOTTOM STICKY BAR: ROUTE SUMMARY & DIRECT PROCEED BUTTON */}
      <div className="sticky bottom-4 mt-6 z-20">
        <div className="p-3.5 rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
              Trip Distance: {currentTripDistance} km
            </span>
            <span className="text-xs font-extrabold text-white truncate block">
              {fromPlace.name.split(' ')[0]} &rarr; {toPlace.name.split(' ')[0]}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playSuccess();
              onConfirmTrip(fromPlace, toPlace);
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#16a34a] text-white font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Proceed to Rides</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
