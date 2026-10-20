import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Home, Briefcase, Heart, 
  Plus, Trash2, X, Search, ChevronRight
} from 'lucide-react';
import { passengerStorage, type SavedPlace } from '../../lib/passengerStorage';
import { PESHAWAR_PLACES, type PeshawarPlace } from '../../lib/peshawarData';
import { sound } from '../../lib/sound';

interface SavedPlacesPageProps {
  userId: string;
  onBack: () => void;
  onSelectForTrip?: (place: PeshawarPlace) => void;
}

export const SavedPlacesPage: React.FC<SavedPlacesPageProps> = ({
  userId,
  onBack,
  onSelectForTrip
}) => {
  const [places, setPlaces] = useState<SavedPlace[]>(() => passengerStorage.getSavedPlaces(userId));
  
  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'Favorite' | 'Other'>('Favorite');
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [peshawarSearchQuery, setPeshawarSearchQuery] = useState('');
  const [selectedPeshawarPlace, setSelectedPeshawarPlace] = useState<PeshawarPlace | null>(null);

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return <Home className="w-5 h-5 text-emerald-600" />;
      case 'Work':
        return <Briefcase className="w-5 h-5 text-sky-600" />;
      default:
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-50" />;
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    passengerStorage.deleteSavedPlace(userId, id);
    setPlaces(passengerStorage.getSavedPlaces(userId));
  };

  const handleSelectPeshawarAutocomplete = (p: PeshawarPlace) => {
    sound.playPop();
    setSelectedPeshawarPlace(p);
    setNewName(p.name);
    setNewAddress(p.address);
    setPeshawarSearchQuery('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('Please enter a place name or select one from the Peshawar suggestions.');
      return;
    }

    sound.playSuccess();
    const lat = selectedPeshawarPlace?.lat || 34.0151;
    const lng = selectedPeshawarPlace?.lng || 71.5349;

    passengerStorage.addSavedPlace(userId, {
      label: newLabel,
      name: newName.trim(),
      address: newAddress.trim() || `${newName.trim()}, Peshawar`,
      lat,
      lng
    });

    setPlaces(passengerStorage.getSavedPlaces(userId));
    setIsAddModalOpen(false);
    setNewName('');
    setNewAddress('');
    setSelectedPeshawarPlace(null);
  };

  const filteredPeshawarPlaces = PESHAWAR_PLACES.filter(p => {
    if (!peshawarSearchQuery.trim()) return false;
    const q = peshawarSearchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
  }).slice(0, 5);

  return (
    <div className="w-full min-h-screen bg-[#fafdf8] pt-18 sm:pt-20 pb-28 px-4 sm:px-6 max-w-2xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-[#16a34a] hover:border-emerald-300 font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#16a34a]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#16a34a]" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Saved Places
          </span>
        </div>
      </div>

      {/* Add New Place Action Card */}
      <div className="mb-5">
        <button
          onClick={() => {
            sound.playPop();
            setIsAddModalOpen(true);
          }}
          className="w-full p-4 rounded-3xl bg-white hover:bg-emerald-50/50 border border-emerald-200/90 shadow-sm flex items-center justify-between group transition-all active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#16a34a] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#16a34a] transition-colors block">
                Add New Saved Place
              </span>
              <span className="text-[11px] text-slate-500">
                Save Home, Office, University, or Favorite Spot
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#16a34a] transition-colors" />
        </button>
      </div>

      {/* Places List */}
      <div className="space-y-3">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
          Your Saved Destinations ({places.length})
        </span>

        {places.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white border border-slate-200 p-6">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No saved places yet</p>
            <p className="text-xs text-slate-400 mt-1">Tap above to save your frequent Peshawar locations.</p>
          </div>
        ) : (
          places.map((place) => (
            <motion.div
              key={place.id}
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (onSelectForTrip) {
                  sound.playSuccess();
                  const targetPlace: PeshawarPlace = {
                    id: place.id,
                    name: place.name,
                    address: place.address,
                    lat: place.lat,
                    lng: place.lng,
                    category: 'popular'
                  };
                  onSelectForTrip(targetPlace);
                }
              }}
              className="p-4 rounded-3xl bg-white hover:bg-emerald-50/40 border border-slate-200/90 shadow-sm flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getLabelIcon(place.label)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#16a34a] transition-colors truncate">
                      {place.name}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold uppercase">
                      {place.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {place.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onSelectForTrip && (
                  <span className="text-[11px] font-bold text-[#16a34a] hidden sm:block">
                    Book Trip &rarr;
                  </span>
                )}
                <button
                  onClick={(e) => handleDelete(place.id, e)}
                  title="Delete Place"
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Place Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-slate-900">Add a Saved Place</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Category Pill Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Place Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Home', 'Work', 'Favorite'] as const).map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setNewLabel(l)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        newLabel === l
                          ? 'bg-[#16a34a] text-white border-[#16a34a] shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Peshawar Autocomplete Search */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Search Landmark in Peshawar</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={peshawarSearchQuery}
                    onChange={(e) => setPeshawarSearchQuery(e.target.value)}
                    placeholder="Search Saddar, Phase 3, KTH, etc."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                  />
                </div>

                {filteredPeshawarPlaces.length > 0 && (
                  <div className="mt-1.5 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    {filteredPeshawarPlaces.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPeshawarAutocomplete(p)}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-xs border-b border-slate-100 last:border-none"
                      >
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{p.address}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Place Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Place Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. My Hayatabad Home"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              {/* Full Address */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Sector G-3, Street 5, Phase 3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#16a34a] text-white text-xs font-black shadow-md hover:bg-emerald-700"
                >
                  Save Place
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
