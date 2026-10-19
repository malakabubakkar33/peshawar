import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, Clock, Download, RotateCcw, CheckCircle2 
} from 'lucide-react';
import { SAMPLE_RIDE_HISTORY, type HistoryRide } from '../lib/peshawarData';

interface HistoryPageProps {
  onBackToHome: () => void;
  onRebookRide?: (ride: HistoryRide) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBackToHome, onRebookRide }) => {
  const [filterType, setFilterType] = useState<'all' | 'bike' | 'car' | 'cargo'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRides = SAMPLE_RIDE_HISTORY.filter(ride => {
    const matchesFilter = filterType === 'all' || ride.type === filterType;
    const matchesSearch = 
      ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.driverName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="px-3 py-1 bg-lime-50 rounded-xl border border-lime-200 text-center">
            <span className="text-[10px] text-lime-700 font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-base font-extrabold text-slate-900">12 Rides</span>
          </div>
          <div className="px-3 py-1 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Dist</span>
            <span className="text-base font-extrabold text-slate-900">74.2 km</span>
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
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
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No rides found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any trips matching your current filter. Try searching for a different landmark.
            </p>
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
                    <span className="text-[11px] text-slate-400 font-medium">
                      {ride.date} • {ride.time} • ID: {ride.id}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 block leading-tight">
                    PKR {ride.fare}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Cash Paid</span>
                </div>
              </div>

              {/* Route Path */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-lime-500 border-2 border-white shadow-sm mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 block">{ride.from}</span>
                    <span className="text-[10px] text-slate-400">Pickup Location</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 block">{ride.to}</span>
                    <span className="text-[10px] text-slate-400">Drop-off Destination</span>
                  </div>
                </div>
              </div>

              {/* Driver & Details Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-3xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {ride.driverName.split(' ')[0][0]}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {ride.driverName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {ride.driverVehicle} • ⭐ {ride.rating}.0
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(`Receipt for ${ride.id} downloaded successfully! Total: PKR ${ride.fare}`);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Receipt
                  </button>
                  <button
                    onClick={() => {
                      if (onRebookRide) onRebookRide(ride);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-lime-500 text-slate-950 text-xs font-extrabold hover:bg-lime-400 flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-book
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
