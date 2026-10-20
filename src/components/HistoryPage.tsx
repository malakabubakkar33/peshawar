import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, RotateCcw, CheckCircle2, Car, Compass
} from 'lucide-react';
import { type HistoryRide } from '../lib/peshawarData';

interface HistoryPageProps {
  onBackToHome: () => void;
  onRebookRide?: (ride: HistoryRide) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBackToHome, onRebookRide }) => {
  const [filterType, setFilterType] = useState<'all' | 'bike' | 'car' | 'cargo'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Start with clean, fresh history populated only from real user rides
  const [rides] = useState<HistoryRide[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_user_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const filteredRides = rides.filter(ride => {
    const matchesFilter = filterType === 'all' || ride.type === filterType;
    const matchesSearch = 
      ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.driverName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate real distance
  const totalDistance = rides.reduce((acc, r) => {
    const km = parseFloat(r.distance) || 0;
    return acc + km;
  }, 0);

  return (
    <div className="w-full min-h-screen bg-slate-50 pt-20 pb-28 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="w-10 h-10 rounded-2xl ios-glass-card flex items-center justify-center text-slate-700 hover:text-lime-600 hover:scale-105 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trip History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Review your past SafarGo rides in Peshawar
            </p>
          </div>
        </div>

        {/* Real Dynamic Stats Pill */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="px-3 py-1 bg-lime-50 rounded-xl border border-lime-200 text-center">
            <span className="text-[10px] text-lime-700 font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-base font-extrabold text-slate-900">{rides.length} Rides</span>
          </div>
          <div className="px-3 py-1 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Dist</span>
            <span className="text-base font-extrabold text-slate-900">{totalDistance.toFixed(1)} km</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by location, driver, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500 shadow-sm"
          />
        </div>

        {/* Vehicle Type Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl self-start sm:self-auto overflow-x-auto no-scrollbar">
          {(['all', 'bike', 'car', 'cargo'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filterType === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'All Rides' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-4">
        {filteredRides.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-lime-100/70 border border-lime-200 flex items-center justify-center text-[#3ebd19] mb-4 shadow-sm">
              <Compass className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">No Rides Yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              You haven't taken any trips yet. As you book rides across Peshawar, your complete trip receipts and route history will appear here.
            </p>
            <button
              onClick={onBackToHome}
              className="py-3 px-6 rounded-full bg-gradient-to-r from-[#44b718] to-[#2ca012] text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-lime-600/30 hover:brightness-105 active:scale-95 transition cursor-pointer flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>Book Your First Ride</span>
            </button>
          </div>
        ) : (
          filteredRides.map((ride, idx) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Top Row: Date, ID, Fare */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center font-bold text-sm">
                    {ride.type === 'bike' ? '🏍️' : ride.type === 'cargo' ? '🚚' : '🚗'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 capitalize">{ride.type} Ride</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> {ride.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{ride.date} • {ride.time}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 block">
                    PKR {ride.fare}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{ride.id}</span>
                </div>
              </div>

              {/* Middle Row: Route (From -> To) */}
              <div className="space-y-2 mb-4 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-lime-500 shrink-0" />
                  <span className="text-slate-400 text-[11px]">From:</span>
                  <span className="font-bold text-slate-800 truncate">{ride.from}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-slate-400 text-[11px]">To:</span>
                  <span className="font-bold text-slate-800 truncate">{ride.to}</span>
                </div>
              </div>

              {/* Bottom Row: Driver & Rebook */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                    {ride.driverName.charAt(0)}
                  </div>
                  <span className="text-xs text-slate-600 font-medium">Captain {ride.driverName}</span>
                </div>

                {onRebookRide && (
                  <button
                    onClick={() => onRebookRide(ride)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-50 text-lime-700 hover:bg-lime-100 text-xs font-bold border border-lime-200/60 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rebook</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
