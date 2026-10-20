import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, RotateCcw, Compass,
  Receipt, AlertCircle, X, Download
} from 'lucide-react';
import { type HistoryRide, SAMPLE_RIDE_HISTORY } from '../lib/peshawarData';
import { sound } from '../lib/sound';

interface HistoryPageProps {
  onBackToHome: () => void;
  onRebookRide?: (ride: HistoryRide) => void;
  onReportRideIssue?: (rideId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ 
  onBackToHome, 
  onRebookRide,
  onReportRideIssue
}) => {
  const [filterType, setFilterType] = useState<'all' | 'bike' | 'car' | 'cargo'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Completed' | 'Cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<HistoryRide | null>(null);

  // Load user history or fallback to sample history
  const [rides] = useState<HistoryRide[]>(() => {
    try {
      const saved = localStorage.getItem('safargo_user_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return SAMPLE_RIDE_HISTORY;
  });

  const filteredRides = rides.filter(ride => {
    const matchesVehicle = filterType === 'all' || ride.type === filterType;
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      ride.from.toLowerCase().includes(q) ||
      ride.to.toLowerCase().includes(q) ||
      ride.driverName.toLowerCase().includes(q) ||
      ride.id.toLowerCase().includes(q);
    return matchesVehicle && matchesStatus && matchesSearch;
  });

  const totalDistance = rides.reduce((acc, r) => acc + (parseFloat(r.distance) || 0), 0);
  const totalSpent = rides.reduce((acc, r) => acc + (r.fare || 0), 0);

  return (
    <div className="w-full min-h-screen bg-[#fafdf8] pt-18 sm:pt-20 pb-28 px-4 sm:px-6 max-w-3xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-[#16a34a] hover:border-emerald-300 font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#16a34a]" />
          <span>Back</span>
        </button>

        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
          Trip History & Receipts
        </span>
      </div>

      {/* Summary Stats Card */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Trips</span>
          <span className="text-base font-black text-slate-900">{rides.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Distance</span>
          <span className="text-base font-black text-slate-900">{totalDistance.toFixed(1)} km</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm text-center">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Total Fares</span>
          <span className="text-base font-black text-[#16a34a]">PKR {totalSpent}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Peshawar rides, captain, or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#16a34a] shadow-sm"
          />
        </div>

        {/* Vehicle Filters & Status Toggle */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex gap-1.5">
            {(['all', 'bike', 'car', 'cargo'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  sound.playPop();
                  setFilterType(tab);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterType === tab
                    ? 'bg-[#16a34a] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab === 'all' ? 'All Vehicles' : tab}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {(['all', 'Completed', 'Cancelled'] as const).map(st => (
              <button
                key={st}
                onClick={() => {
                  sound.playPop();
                  setStatusFilter(st);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-3">
        {filteredRides.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center">
            <Compass className="w-10 h-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No rides found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          filteredRides.map(ride => (
            <motion.div
              key={ride.id}
              whileHover={{ scale: 1.006 }}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm relative overflow-hidden"
            >
              {/* Header: Vehicle & Status */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-base border border-emerald-100">
                    {ride.type === 'bike' ? '🏍️' : ride.type === 'cargo' ? '🚚' : '🚗'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 capitalize">{ride.type} Ride</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-extrabold uppercase ${
                        ride.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{ride.date} &bull; {ride.time}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">PKR {ride.fare}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{ride.id}</span>
                </div>
              </div>

              {/* Route */}
              <div className="space-y-2 mb-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0" />
                  <span className="text-slate-400 text-[11px]">Pickup:</span>
                  <span className="font-bold text-slate-800 truncate">{ride.from}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0284c7] shrink-0" />
                  <span className="text-slate-400 text-[11px]">Drop:</span>
                  <span className="font-bold text-slate-800 truncate">{ride.to}</span>
                </div>
              </div>

              {/* Captain & Action Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-bold text-slate-800">{ride.driverName}</span>
                  <span className="text-[10px] text-slate-400">({ride.driverVehicle})</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setSelectedReceipt(ride);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>

                  {onRebookRide && (
                    <button
                      onClick={() => onRebookRide(ride)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#16a34a] text-xs font-bold border border-emerald-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rebook</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Trip Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative"
          >
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#16a34a] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block mb-1">
                SafarGo Peshawar Trip Receipt
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">PKR {selectedReceipt.fare}.00</h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Booking ID: {selectedReceipt.id}</p>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Trip Date & Time</span>
                <span className="font-bold text-slate-900">{selectedReceipt.date}, {selectedReceipt.time}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service Category</span>
                <span className="font-bold text-slate-900 capitalize">{selectedReceipt.type} Ride</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Distance & Duration</span>
                <span className="font-bold text-slate-900">{selectedReceipt.distance} &bull; {selectedReceipt.duration}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Captain Details</span>
                <span className="font-bold text-slate-900">{selectedReceipt.driverName} ({selectedReceipt.driverVehicle})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method</span>
                <span className="font-bold text-emerald-700">Cash / SafarGo Wallet (Paid)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              {onReportRideIssue && (
                <button
                  onClick={() => {
                    const rId = selectedReceipt.id;
                    setSelectedReceipt(null);
                    onReportRideIssue(rId);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-50 flex items-center justify-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Report Dispute</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playSuccess();
                  alert(`Receipt for ${selectedReceipt.id} saved to your device.`);
                  setSelectedReceipt(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#16a34a] text-white text-xs font-black shadow-md hover:bg-emerald-700 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Receipt</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
