import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Bell, Star, Phone, MessageSquare, 
  MapPin, Check, X, Lock, ChevronRight, 
  Car, Bike, User, FileText, Settings as SettingsIcon, 
  HelpCircle, RefreshCw, BarChart2, Clock, 
  Edit3, ChevronDown, LogOut, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { type UserAccount } from '../lib/supabase';
import { sound } from '../lib/sound';

interface DriverPanelProps {
  user: UserAccount | null;
  driverData?: any;
  onSwitchToPassenger: () => void;
  onLogout: () => void;
}

type DriverTab = 'home' | 'requests' | 'earnings' | 'profile';
type ActiveSubScreen = 
  | 'none'
  | 'ride-details'
  | 'navigation'
  | 'arrived'
  | 'in-trip'
  | 'completed'
  | 'vehicle-info'
  | 'documents'
  | 'settings'
  | 'ride-history'
  | 'notifications'
  | 'empty-requests';

interface RideRequestItem {
  id: string;
  passengerName: string;
  passengerRating: number;
  passengerRides: number;
  pickupLocation: string;
  dropLocation: string;
  distanceKm: string;
  durationMin: string;
  farePkr: number;
  vehicleType: 'Bike' | 'Car AC';
  timeAgo: string;
}

const DEFAULT_RIDE_REQUEST: RideRequestItem = {
  id: 'REQ-8821',
  passengerName: 'Ayesha Khan',
  passengerRating: 4.9,
  passengerRides: 48,
  pickupLocation: 'Islamia College Peshawar',
  dropLocation: 'Qissa Khwani Bazaar',
  distanceKm: '3.2 km',
  durationMin: '8 min',
  farePkr: 280,
  vehicleType: 'Bike',
  timeAgo: 'Just now'
};

// Animated Number Counter Hook
const useAnimatedNumber = (target: number, duration: number = 800) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 25);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.floor(start));
      }
    }, 25);

    return () => clearInterval(timer);
  }, [target, duration]);

  return current;
};

// Analytics Data
const HOURLY_BARS = [
  { label: '8 AM', fullLabel: '8:00 AM - 10:00 AM', amount: 420, rides: 2, heightPct: 48 },
  { label: '10 AM', fullLabel: '10:00 AM - 12:00 PM', amount: 720, rides: 3, heightPct: 88 },
  { label: '12 PM', fullLabel: '12:00 PM - 2:00 PM', amount: 510, rides: 2, heightPct: 62 },
  { label: '2 PM', fullLabel: '2:00 PM - 4:00 PM', amount: 280, rides: 1, heightPct: 35 },
  { label: '4 PM', fullLabel: '4:00 PM - 6:00 PM', amount: 580, rides: 3, heightPct: 70 },
  { label: '6 PM', fullLabel: '6:00 PM - 8:00 PM', amount: 440, rides: 2, heightPct: 54 },
  { label: '8 PM', fullLabel: '8:00 PM - 10:00 PM', amount: 350, rides: 2, heightPct: 42 },
];

const WEEKLY_BARS = [
  { label: 'Mon', fullLabel: 'Monday', amount: 2450, rides: 12, heightPct: 68 },
  { label: 'Tue', fullLabel: 'Tuesday', amount: 2850, rides: 14, heightPct: 79 },
  { label: 'Wed', fullLabel: 'Wednesday', amount: 2150, rides: 10, heightPct: 60 },
  { label: 'Thu', fullLabel: 'Thursday', amount: 3200, rides: 15, heightPct: 88 },
  { label: 'Fri', fullLabel: 'Friday (Jumma)', amount: 3650, rides: 17, heightPct: 98 },
  { label: 'Sat', fullLabel: 'Saturday', amount: 2950, rides: 14, heightPct: 82 },
  { label: 'Sun', fullLabel: 'Sunday', amount: 1200, rides: 6, heightPct: 35 },
];

export const DriverPanel: React.FC<DriverPanelProps> = ({
  user,
  driverData,
  onSwitchToPassenger,
  onLogout
}) => {
  // Navigation & Subscreen state
  const [activeTab, setActiveTab] = useState<DriverTab>('home');
  const [activeSubScreen, setActiveSubScreen] = useState<ActiveSubScreen>('none');
  const [requestTab, setRequestTab] = useState<'new' | 'accepted' | 'completed'>('new');

  // Driver Drawer & Modals State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [declineToast, setDeclineToast] = useState<string | null>(null);

  // Driver Status (Online / Offline)
  const [isOnline, setIsOnline] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState(() => {
    const saved = localStorage.getItem(`safargo_driver_earnings_${user?.id || 'default'}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [weeklyEarnings] = useState(() => {
    const saved = localStorage.getItem(`safargo_driver_weekly_${user?.id || 'default'}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [completedCount, setCompletedCount] = useState(() => {
    const saved = localStorage.getItem(`safargo_driver_completed_${user?.id || 'default'}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [cancelledCount] = useState(0);
  const [totalDistance] = useState(0);

  // Animated Numbers
  const animCompleted = useAnimatedNumber(completedCount, 700);
  const animCancelled = useAnimatedNumber(cancelledCount, 700);
  const animDistance = useAnimatedNumber(totalDistance, 800);
  const animEarnings = useAnimatedNumber(todayEarnings, 800);
  const animWeeklyEarnings = useAnimatedNumber(weeklyEarnings, 900);

  // Active Trip & Inbound Request Push Alert
  const [currentRide] = useState<RideRequestItem>(DEFAULT_RIDE_REQUEST);
  const [driverRatingScore, setDriverRatingScore] = useState(5);
  const [hasNewRequest, setHasNewRequest] = useState(true);
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [requestCountdown, setRequestCountdown] = useState(20);

  // Analytics Chart State
  const [analyticsView, setAnalyticsView] = useState<'today' | 'weekly'>('today');
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  // Settings State
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Manual Vehicle Info (editable)
  const [vehicleName, setVehicleName] = useState(driverData?.vehicleName || 'Honda CG 125');
  const [vehicleModel, setVehicleModel] = useState(driverData?.vehicleModel || '2023');
  const [vehicleNumber, setVehicleNumber] = useState(driverData?.vehicleNumber || 'PWA-7421');
  const [vehicleColor] = useState(driverData?.vehicleColor || 'Black');
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);

  // Driver details
  const driverName = driverData?.fullName || user?.fullName || 'Usman Khan';
  const driverId = driverData?.driverId || 'SGD12345';
  const driverAvatar = driverData?.documents?.selfie || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // Reset selected bar when toggling view
  useEffect(() => {
    setSelectedBar(null);
  }, [analyticsView]);

  // Simulate periodic incoming request when Online
  useEffect(() => {
    if (!isOnline) {
      setShowPushNotification(false);
      return;
    }

    const timer = setTimeout(() => {
      if (isOnline && activeSubScreen === 'none' && !showPushNotification && hasNewRequest) {
        setShowPushNotification(true);
        setRequestCountdown(20);
        sound.playSuccess();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [isOnline, activeSubScreen, hasNewRequest, showPushNotification]);

  // Push Notification Countdown
  useEffect(() => {
    if (!showPushNotification || !isOnline) return;

    const interval = setInterval(() => {
      setRequestCountdown(prev => {
        if (prev <= 1) {
          setShowPushNotification(false);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPushNotification, isOnline]);

  // Toggle Online/Offline
  const handleToggleOnline = () => {
    sound.playClick();
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (!nextState) {
      setShowPushNotification(false);
      setHasNewRequest(false);
    } else {
      setHasNewRequest(true);
    }
  };

  // Ride Action Handlers
  const handleAcceptRequest = () => {
    sound.playSuccess();
    setShowPushNotification(false);
    setActiveSubScreen('ride-details');
  };

  // Immediate Clean Decline Handler: removes push message & declines request with feedback
  const handleDeclineRequest = (fromTab: boolean = false) => {
    sound.playClick();
    setShowPushNotification(false);
    setHasNewRequest(false);
    setDeclineToast('Ride request has been declined.');
    setTimeout(() => setDeclineToast(null), 3000);

    if (fromTab) {
      setActiveSubScreen('empty-requests');
    }
  };

  const handleStartNavigation = () => {
    sound.playSuccess();
    setActiveSubScreen('navigation');
  };

  const handleArrivedAtPickup = () => {
    sound.playSuccess();
    setActiveSubScreen('arrived');
  };

  const handleStartTrip = () => {
    sound.playSuccess();
    setActiveSubScreen('in-trip');
  };

  const handleEndTrip = () => {
    sound.playSuccess();
    setActiveSubScreen('completed');
  };

  const handleFinishCompletedTrip = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    sound.playSuccess();
    setTodayEarnings(prev => prev + currentRide.farePkr);
    setCompletedCount(prev => prev + 1);
    setActiveSubScreen('none');
    setActiveTab('home');
  };

  // Helper: Top Header for Sub-screens
  const renderSubHeader = (title: string, showLogo: boolean = false, backTo: ActiveSubScreen | 'requests' = 'none') => (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      <button
        onClick={() => {
          sound.playClick();
          if (backTo === 'requests') {
            setActiveSubScreen('none');
            setActiveTab('requests');
          } else {
            setActiveSubScreen(backTo);
          }
        }}
        className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition cursor-pointer active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {showLogo ? (
        <div className="flex items-center gap-2">
          <img src="/safar-go-monogram-exact.png" alt="SafarGo" className="w-7 h-7 object-contain" />
          <span className="text-base font-black text-slate-900 tracking-tight">
            Safar<span className="text-[#3ebd19]">Go</span>
          </span>
        </div>
      ) : (
        <h2 className="text-sm font-extrabold text-[#0f172a] tracking-tight">{title}</h2>
      )}

      <div className="w-10"></div>
    </div>
  );

  // Helper: Stylized Peshawar Route Map Background
  const renderPeshawarMapCanvas = (showRoute: boolean = false, showCarAtPickup: boolean = false) => (
    <div className="relative w-full h-full min-h-[220px] bg-[#eef7ec] overflow-hidden select-none">
      <svg className="w-full h-full absolute inset-0 opacity-80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="road-grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#d5ebd0" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#road-grid-pattern)" />
        <path d="M -20 180 Q 150 160 300 240 T 500 260" fill="none" stroke="#ffffff" strokeWidth="10" />
        <path d="M -20 180 Q 150 160 300 240 T 500 260" fill="none" stroke="#d0e8cb" strokeWidth="5" />
        <path d="M 80 -20 Q 120 150 240 350" fill="none" stroke="#ffffff" strokeWidth="8" />
        <path d="M 80 -20 Q 120 150 240 350" fill="none" stroke="#d0e8cb" strokeWidth="4" />
        <path d="M 180 40 L 400 120" fill="none" stroke="#ffffff" strokeWidth="6" />

        {showRoute && (
          <path
            d="M 110 170 Q 200 120 280 90"
            fill="none"
            stroke="#22c55e"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        )}
      </svg>

      <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/85 backdrop-blur-xs px-2.5 py-1 rounded-full border border-emerald-200/60 shadow-xs pointer-events-none">
        <MapPin className="w-3.5 h-3.5 text-[#3ebd19] fill-[#3ebd19]" />
        <span className="text-[11px] font-bold text-slate-700">Peshawar</span>
      </div>

      <div className="absolute top-[160px] left-[105px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white text-[10px] font-bold">
          A
        </div>
      </div>

      {showCarAtPickup && (
        <div className="absolute top-[140px] left-[180px] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-emerald-400 flex items-center justify-center animate-bounce">
          <Car className="w-4 h-4 text-emerald-600" />
        </div>
      )}

      {showRoute && (
        <div className="absolute top-[85px] left-[280px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <MapPin className="w-4 h-4 fill-white" />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-[#f8faf7] flex flex-col font-sans selection:bg-[#3ebd19]/20 selection:text-slate-900 overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. FIXED TOP HEADER (Active on Main Tabs) */}
      {/* ========================================================================= */}
      {activeSubScreen === 'none' && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
          {/* Driver Dedicated Hamburger Button */}
          <button 
            type="button"
            onClick={() => {
              sound.playClick();
              setIsDrawerOpen(true);
            }}
            title="Open Driver Menu"
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition cursor-pointer active:scale-95"
          >
            <div className="space-y-1">
              <div className="w-4 h-0.5 bg-slate-800 rounded-full"></div>
              <div className="w-4 h-0.5 bg-slate-800 rounded-full"></div>
              <div className="w-2.5 h-0.5 bg-slate-800 rounded-full"></div>
            </div>
          </button>

          {/* Unified Official SafarGo Logo */}
          <div className="flex items-center gap-2 select-none">
            <img 
              src="/safar-go-monogram-exact.png" 
              alt="SafarGo" 
              className="w-7 h-7 object-contain drop-shadow-xs" 
            />
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Safar<span className="text-[#3ebd19]">Go</span>
            </span>
            <span className="text-[10px] font-black bg-[#eaf8e4] text-[#2c980b] px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
              Captain
            </span>
          </div>

          {/* Driver Notifications Bell */}
          <button 
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveSubScreen('notifications');
            }}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-700 relative hover:bg-slate-100 transition cursor-pointer active:scale-95"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#3ebd19] ring-2 ring-white animate-pulse"></span>
          </button>
        </header>
      )}

      {/* Global Feedback Toast (e.g. for Declined request) */}
      <AnimatePresence>
        {declineToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-2"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>{declineToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. TOP INBOUND RIDE REQUEST PUSH NOTIFICATION BANNER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOnline && showPushNotification && activeSubScreen === 'none' && (
          <motion.div
            initial={{ opacity: 0, y: -90, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -90, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed top-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-900 text-white rounded-3xl p-4 shadow-[0_15px_35px_rgba(0,0,0,0.35)] border border-emerald-500/40"
          >
            {/* Top Row: Passenger Info & Countdown */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-400">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" 
                      alt="Passenger" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#3ebd19] ring-1 ring-slate-900 animate-ping"></div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{currentRide.passengerName}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{currentRide.passengerRating} ({currentRide.passengerRides} rides)</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold block">Fare</span>
                <span className="text-sm font-black text-[#3ebd19]">PKR {currentRide.farePkr}</span>
              </div>
            </div>

            {/* Middle: Pickup -> Drop */}
            <div className="py-2.5 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="truncate font-semibold">{currentRide.pickupLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="truncate">{currentRide.dropLocation}</span>
              </div>
              <span className="text-[10px] text-slate-400 pl-4 block">
                {currentRide.distanceKm} • {currentRide.durationMin}
              </span>
            </div>

            {/* Countdown Progress Bar */}
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
              <motion.div 
                className="h-full bg-[#3ebd19]"
                initial={{ width: '100%' }}
                animate={{ width: `${(requestCountdown / 20) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>

            {/* Action Buttons: Accept & Decline */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAcceptRequest}
                className="py-2.5 rounded-xl bg-[#3ebd19] hover:bg-[#34a914] text-white font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Accept ({requestCountdown}s)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeclineRequest(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer active:scale-95"
              >
                Decline
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. DEDICATED DRIVER DRAWER / SIDEBAR (Hamburger Menu) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="relative w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto"
            >
              {/* Drawer Content */}
              <div>
                {/* Top Driver Profile Header */}
                <div className="p-5 bg-gradient-to-br from-emerald-800 to-slate-900 text-white">
                  <div className="flex items-center justify-between pb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400 shadow-md">
                      <img src={driverAvatar} alt="Driver" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{driverName}</h3>
                  <div className="flex items-center gap-2 text-xs text-emerald-200 mt-0.5">
                    <span>Driver ID: {driverId}</span>
                    <span>•</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                    <span>{isOnline ? 'Online (Accepting Rides)' : 'Offline'}</span>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="p-3 space-y-1">
                  {[
                    { id: 'home', label: 'Driver Dashboard', icon: BarChart2, action: () => { setActiveTab('home'); setActiveSubScreen('none'); } },
                    { id: 'requests', label: 'Ride Requests', icon: Bike, action: () => { setActiveTab('requests'); setActiveSubScreen('none'); } },
                    { id: 'earnings', label: 'Earnings & Analytics', icon: TrendingUp, action: () => { setActiveTab('earnings'); setActiveSubScreen('none'); } },
                    { id: 'vehicle-info', label: 'Vehicle Information', icon: Car, action: () => { setActiveSubScreen('vehicle-info'); } },
                    { id: 'documents', label: 'Uploaded Documents', icon: FileText, action: () => { setActiveSubScreen('documents'); } },
                    { id: 'notifications', label: 'Notifications', icon: Bell, action: () => { setActiveSubScreen('notifications'); } },
                    { id: 'settings', label: 'Driver Settings', icon: SettingsIcon, action: () => { setActiveSubScreen('settings'); } },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          item.action();
                          setIsDrawerOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-bold text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-emerald-600" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions: Switch Mode & Log Out */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsDrawerOpen(false);
                    setShowSwitchConfirm(true);
                  }}
                  className="w-full p-3 rounded-2xl bg-[#eaf8e4] text-[#248107] hover:bg-[#d8f5d0] font-extrabold text-xs flex items-center justify-between transition cursor-pointer border border-emerald-200"
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4" />
                    <span>Switch to Passenger App</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsDrawerOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full p-3 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-extrabold text-xs flex items-center justify-between transition cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. MODALS: Switch to Passenger Confirm & Logout Confirm */}
      {/* ========================================================================= */}
      {/* Switch to Passenger Confirmation Modal */}
      {showSwitchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Switch to Passenger App?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                You will leave Driver Mode and return to the Passenger Map. Your driver account and verified documents remain saved.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSwitchConfirm(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Stay as Driver
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSwitchConfirm(false);
                  onSwitchToPassenger();
                }}
                className="py-2.5 px-4 rounded-xl bg-[#3ebd19] hover:bg-[#34a914] text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Yes, Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Log Out of Driver Account?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                You will be logged out of your driver account. You will need to sign in again to receive and accept ride requests.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MAIN CONTENT SCROLL CONTAINER (Fixed Header Clearance: pt-24, Bottom Nav: pb-32) */}
      {/* ========================================================================= */}
      <main className="w-full max-w-2xl mx-auto flex-1 flex flex-col pt-24 sm:pt-28 pb-32 sm:pb-36 px-4 sm:px-6">

        {/* ------------------------------------------------------------------------- */}
        {/* TAB 1: DRIVER DASHBOARD (HOME) */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'none' && activeTab === 'home' && (
          <div className="space-y-4">
            
            {/* Refined Proportioned Driver Profile Hero Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shadow-xs">
                    <img src={driverAvatar} alt="Driver" className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-[#3ebd19]' : 'bg-slate-400'}`}></div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">{driverName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-700">4.8 (124 rides)</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#3ebd19] animate-pulse' : 'bg-slate-400'}`}></span>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            {/* Enhanced, Spacious Analytics Dashboard (With Real Working Weekly View) */}
            <div className="bg-gradient-to-br from-white via-emerald-50/20 to-lime-50/30 border border-emerald-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                    {analyticsView === 'today' ? "Today's Earnings" : "This Week's Earnings"}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                    PKR {analyticsView === 'today' ? animEarnings.toLocaleString() : animWeeklyEarnings.toLocaleString()}
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                    {analyticsView === 'today' ? '12 Rides Completed • Peak: 10:00 AM' : '88 Rides Completed this week • Best: Friday'}
                  </p>
                </div>

                {/* View Switcher Pill */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setAnalyticsView('today')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${analyticsView === 'today' ? 'bg-[#3ebd19] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsView('weekly')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${analyticsView === 'weekly' ? 'bg-[#3ebd19] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Bar Chart */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                  <span>{analyticsView === 'today' ? 'Hourly Activity (Peshawar City)' : 'Weekly Performance (Monday - Sunday)'}</span>
                  <span className="text-slate-400">Tap bar to view details</span>
                </div>

                {/* Bars Canvas (Increased Height: h-36) */}
                <div className="h-36 bg-white/90 border border-slate-200/80 rounded-2xl p-3 sm:p-4 flex items-end justify-between gap-1.5 sm:gap-2 shadow-inner">
                  {(analyticsView === 'today' ? HOURLY_BARS : WEEKLY_BARS).map((item, idx) => {
                    const isSelected = selectedBar === idx;
                    return (
                      <div 
                        key={idx}
                        onClick={() => setSelectedBar(isSelected ? null : idx)}
                        className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                      >
                        {/* Bar Graphic */}
                        <div className="w-full max-w-[32px] bg-slate-100 rounded-xl relative overflow-hidden flex items-end h-24">
                          <motion.div
                            key={`${analyticsView}-${idx}`}
                            initial={{ height: 0 }}
                            animate={{ height: `${item.heightPct}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.06, ease: 'easeOut' }}
                            className={`w-full rounded-xl transition-all ${
                              isSelected 
                                ? 'bg-gradient-to-t from-emerald-600 to-lime-400 shadow-md ring-2 ring-emerald-500' 
                                : 'bg-gradient-to-t from-emerald-500 to-lime-400/90 group-hover:brightness-110'
                            }`}
                          />
                        </div>
                        {/* Bar Label */}
                        <span className={`text-[10px] font-bold mt-2 transition ${isSelected ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-700'}`}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Bar Details Floating Banner */}
                {selectedBar !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-950 shadow-xs"
                  >
                    <span>
                      {(analyticsView === 'today' ? HOURLY_BARS : WEEKLY_BARS)[selectedBar].fullLabel}: PKR {(analyticsView === 'today' ? HOURLY_BARS : WEEKLY_BARS)[selectedBar].amount.toLocaleString()}
                    </span>
                    <span className="bg-emerald-200/70 px-2 py-0.5 rounded-md">
                      {(analyticsView === 'today' ? HOURLY_BARS : WEEKLY_BARS)[selectedBar].rides} Rides
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* 3 Metric Summary Boxes with Smooth Animated Numbers */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Completed</span>
                <span className="text-xl font-black text-slate-900 mt-1 block tracking-tight">{animCompleted}</span>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Cancelled</span>
                <span className="text-xl font-black text-slate-900 mt-1 block tracking-tight">{animCancelled}</span>
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Total Distance</span>
                <span className="text-xl font-black text-slate-900 mt-1 block tracking-tight">{animDistance} km</span>
              </div>
            </div>

            {/* Online / Offline Toggle Card */}
            <div className={`p-4 rounded-3xl border transition shadow-sm flex items-center justify-between ${isOnline ? 'bg-white border-slate-200/90' : 'bg-slate-100/90 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isOnline ? 'bg-emerald-50 text-[#3ebd19]' : 'bg-slate-200 text-slate-500'}`}>
                  <MapPin className="w-5 h-5 fill-current stroke-none" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    {isOnline ? 'You are Online' : 'You are Offline'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isOnline ? 'Available for nearby ride requests' : 'Offline: No requests will be received'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleOnline}
                className={`w-12 h-6 rounded-full transition p-0.5 cursor-pointer ${isOnline ? 'bg-[#3ebd19]' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Action Button: Go Offline / Go Online */}
            <div>
              <button
                type="button"
                onClick={handleToggleOnline}
                className={`w-full py-4 rounded-full font-extrabold text-sm tracking-wide shadow-lg transition cursor-pointer active:scale-95 ${
                  isOnline 
                    ? 'bg-[#3ebd19] hover:bg-[#34a914] text-white shadow-emerald-500/25' 
                    : 'bg-slate-900 hover:bg-black text-white shadow-slate-900/20'
                }`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>

            {/* Offline Alert Box if Offline */}
            {!isOnline && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You are currently offline. Tap <b>"Go Online"</b> above to start receiving ride requests.</span>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* TAB 2: RIDE REQUESTS */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'none' && activeTab === 'requests' && (
          <div className="space-y-4">
            
            {/* Segmented Control Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'new', label: 'New (3)' },
                { id: 'accepted', label: 'Accepted (1)' },
                { id: 'completed', label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setRequestTab(tab.id as any);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    requestTab === tab.id 
                      ? 'bg-[#3ebd19] text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Map Canvas */}
            <div className="w-full h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
              {renderPeshawarMapCanvas(false, false)}
            </div>

            {/* Floating Ride Request Card */}
            {isOnline && hasNewRequest ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">New Ride Request</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{currentRide.timeAgo}</span>
                </div>

                <div className="space-y-2 py-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
                    <span className="text-xs font-bold text-slate-800">{currentRide.pickupLocation}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></div>
                    <span className="text-xs font-bold text-slate-800">{currentRide.dropLocation}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 pl-5 block">
                    {currentRide.distanceKm} • {currentRide.durationMin}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Bike className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">Bike Ride</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">PKR {currentRide.farePkr}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleAcceptRequest}
                    className="py-3 rounded-2xl bg-[#3ebd19] hover:bg-[#34a914] text-white font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(true)}
                    className="py-3 rounded-2xl bg-white border-2 border-red-400 text-red-500 font-extrabold text-xs hover:bg-red-50 transition cursor-pointer active:scale-95"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Clock className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {!isOnline ? 'You are offline' : 'No new requests available'}
                </h4>
                <p className="text-xs text-slate-400">
                  {!isOnline ? 'Please go online to receive ride bookings.' : 'Nearby passenger requests will appear automatically.'}
                </p>
                {!isOnline && (
                  <button
                    onClick={handleToggleOnline}
                    className="py-2.5 px-6 rounded-full bg-[#3ebd19] text-white font-bold text-xs"
                  >
                    Go Online Now
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* TAB 3: EARNINGS */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'none' && activeTab === 'earnings' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs cursor-pointer">
                <span>Today (Oct 18)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Payout Ready
              </span>
            </div>

            {/* Total Earnings Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400">Total Earnings</span>
                <div className="text-3xl font-black text-slate-900 mt-1">PKR {animEarnings.toLocaleString()}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400">Rides</span>
                  <p className="text-sm font-extrabold text-slate-900">{completedCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Online Time</span>
                  <p className="text-sm font-extrabold text-slate-900">6h 20m</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Avg. per Ride</span>
                  <p className="text-sm font-extrabold text-slate-900">PKR 204</p>
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider pl-1">
                Recent Transactions
              </h3>

              <div className="space-y-2">
                {[
                  { time: '10:32 AM', status: 'Ride Completed', amount: 280 },
                  { time: '09:15 AM', status: 'Ride Completed', amount: 250 },
                  { time: '08:20 AM', status: 'Ride Completed', amount: 310 },
                  { time: '07:45 AM', status: 'Ride Completed', amount: 320 },
                ].map((tx, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800">{tx.status}</span>
                        <p className="text-[10px] text-slate-400">{tx.time}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">PKR {tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* TAB 4: DRIVER PROFILE */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'none' && activeTab === 'profile' && (
          <div className="space-y-4">
            
            {/* Driver Profile Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0 shadow-xs">
                <img src={driverAvatar} alt="Driver" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{driverName}</h3>
                <span className="text-xs text-slate-500 font-medium block">Driver ID: {driverId}</span>
                <div className="flex items-center gap-1 text-xs text-slate-700 mt-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold">4.8 (124 rides)</span>
                </div>
              </div>
            </div>

            {/* Menu Options */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-2 shadow-xs space-y-1">
              {[
                { label: 'Personal Information', icon: User, action: () => alert(`Personal Details:\nName: ${driverName}\nPhone: ${driverData?.phone || '0300-1234567'}\nEmail: ${driverData?.email || 'driver@safargo.pk'}`) },
                { label: 'Vehicle Information', icon: Car, action: () => setActiveSubScreen('vehicle-info') },
                { label: 'Documents', icon: FileText, action: () => setActiveSubScreen('documents') },
                { label: 'Ride History', icon: Clock, action: () => setActiveSubScreen('ride-history') },
                { label: 'Settings', icon: SettingsIcon, action: () => setActiveSubScreen('settings') },
                { label: 'Help & Support', icon: HelpCircle, action: () => alert('SafarGo 24/7 Helpline: 091-111-723274') },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      sound.playClick();
                      item.action();
                    }}
                    className="p-3 hover:bg-slate-50 rounded-2xl flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                );
              })}

              {/* Switch to Passenger App with confirmation */}
              <div 
                onClick={() => setShowSwitchConfirm(true)}
                className="p-3 hover:bg-emerald-50 rounded-2xl flex items-center justify-between cursor-pointer transition border-t border-slate-100 mt-1"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-[#3ebd19]" />
                  <span className="text-xs font-bold text-[#207a09]">Switch to Passenger Mode</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </div>

              {/* Log Out with confirmation */}
              <div 
                onClick={() => setShowLogoutConfirm(true)}
                className="p-3 hover:bg-rose-50 rounded-2xl flex items-center justify-between cursor-pointer transition text-rose-600"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold">Log Out</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: DRIVER NOTIFICATIONS */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'notifications' && (
          <div className="space-y-4">
            {renderSubHeader('Notifications', false, 'none')}

            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500">Recent Updates</span>
              <button
                type="button"
                onClick={() => { sound.playSuccess(); alert('All notifications marked as read.'); }}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'Trip Payment Received', body: 'PKR 280 has been added to your today earnings for ride to Qissa Khwani Bazaar.', time: '5 min ago', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700' },
                { title: 'New Surge Pricing Active', body: 'High ride demand in Peshawar Cantt & Saddar area. 1.3x fare bonus active now!', time: '1 hour ago', icon: TrendingUp, bg: 'bg-amber-50', text: 'text-amber-700' },
                { title: 'Passenger Feedback ⭐ 5.0', body: 'Ayesha Khan left a 5-star rating: "Fast and very safe riding!".', time: '3 hours ago', icon: Star, bg: 'bg-blue-50', text: 'text-blue-700' },
                { title: 'Driver Account Verified', body: 'Your vehicle papers and driving license are completely verified.', time: 'Yesterday', icon: ShieldCheck, bg: 'bg-emerald-50', text: 'text-emerald-700' },
              ].map((notif, idx) => {
                const Icon = notif.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${notif.bg} ${notif.text} flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 pl-8 leading-relaxed">{notif.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: RIDE DETAILS */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'ride-details' && (
          <div className="space-y-4">
            {renderSubHeader('Ride Details', true, 'requests')}

            <div className="h-60 w-full rounded-3xl overflow-hidden border border-slate-200 relative shadow-sm">
              {renderPeshawarMapCanvas(true, false)}
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80" 
                      alt="Passenger" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">{currentRide.passengerName}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{currentRide.passengerRating} ({currentRide.passengerRides} rides)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => sound.playClick()} className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Phone className="w-4 h-4 fill-current stroke-none" />
                  </button>
                  <button onClick={() => sound.playClick()} className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <MessageSquare className="w-4 h-4 fill-current stroke-none" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-50 mt-1 shrink-0"></div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">From</span>
                    <p className="text-xs font-bold text-slate-800">{currentRide.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full border-2 border-emerald-600 bg-emerald-600 mt-1 shrink-0"></div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To</span>
                    <p className="text-xs font-bold text-slate-800">{currentRide.dropLocation}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 px-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-medium text-slate-400">Distance</span>
                  <p className="text-sm font-extrabold text-slate-800">{currentRide.distanceKm}</p>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400">ETA</span>
                  <p className="text-sm font-extrabold text-slate-800">{currentRide.durationMin}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Fare</span>
                  <div className="text-xl font-extrabold text-slate-900">PKR {currentRide.farePkr}</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <Bike className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Bike Ride</span>
                </div>
              </div>

              <button
                onClick={handleStartNavigation}
                className="w-full py-4 rounded-full bg-[#3ebd19] hover:bg-[#34a914] active:scale-[0.99] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(62,189,25,0.35)] transition cursor-pointer"
              >
                Accept Ride
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: NAVIGATION TO PICKUP */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'navigation' && (
          <div className="space-y-4">
            {renderSubHeader('Navigation to Pickup', true, 'ride-details')}

            <div className="bg-[#3ebd19] text-white p-4 rounded-3xl shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-100">Go to Pickup Location</h4>
                  <p className="text-sm font-extrabold text-white">{currentRide.pickupLocation}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>

            <div className="h-64 w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
              {renderPeshawarMapCanvas(true, true)}
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" 
                    alt="Passenger" 
                    className="w-11 h-11 rounded-full object-cover border border-slate-200" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{currentRide.passengerName}</h4>
                    <span className="text-[10px] font-bold text-emerald-600 block">ETA 3 min • 0.8 km</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => sound.playClick()} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 fill-current stroke-none" />
                  </button>
                  <button onClick={() => sound.playClick()} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 fill-current stroke-none" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleArrivedAtPickup}
                className="w-full py-4 rounded-full bg-[#3ebd19] hover:bg-[#34a914] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(62,189,25,0.35)] transition cursor-pointer"
              >
                <span>Arrived at Pickup</span>
                <Lock className="w-4 h-4 ml-1 opacity-80" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: ARRIVED AT PICKUP */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'arrived' && (
          <div className="space-y-6 text-center py-4">
            {renderSubHeader('Arrived at Pickup', true, 'navigation')}

            <div className="w-20 h-20 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">You've Arrived!</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{currentRide.pickupLocation}</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" 
                  alt="Passenger" 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{currentRide.passengerName}</h4>
                  <span className="text-[11px] text-slate-500 font-medium">Passenger is waiting nearby</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => sound.playClick()} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 fill-current stroke-none" />
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleStartTrip}
                className="w-full py-4 rounded-full bg-[#3ebd19] hover:bg-[#34a914] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(62,189,25,0.35)] transition cursor-pointer"
              >
                Start Ride
              </button>
              <p className="text-[11px] text-slate-400 font-medium">
                Please wait for the passenger to get in the vehicle.
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: RIDE IN PROGRESS */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'in-trip' && (
          <div className="space-y-4">
            {renderSubHeader('Ride in Progress', true, 'arrived')}

            <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#3ebd19] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">To {currentRide.dropLocation}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{currentRide.distanceKm} • {currentRide.durationMin}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>

            <div className="h-64 w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
              {renderPeshawarMapCanvas(true, true)}
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" 
                    alt="Passenger" 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{currentRide.passengerName}</h4>
                    <span className="text-[11px] text-slate-500">Ride in progress...</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  ETA 8 min
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleEndTrip}
                  className="py-3 rounded-2xl bg-white border-2 border-red-500 text-red-600 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-red-50 transition cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>End Ride</span>
                </button>
                <button
                  onClick={() => sound.playClick()}
                  className="py-3 rounded-2xl bg-[#3ebd19] hover:bg-[#34a914] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: TRIP COMPLETED */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'completed' && (
          <div className="space-y-6 text-center py-4">
            {renderSubHeader('Completed', true, 'none')}

            <div className="w-20 h-20 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 mx-auto">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Trip Completed!</h3>
              <p className="text-xs text-slate-500 font-medium">Thank you for your ride.</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1"></div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">From</span>
                  <p className="text-xs font-bold text-slate-800">{currentRide.pickupLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1"></div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">To</span>
                  <p className="text-xs font-bold text-slate-800">{currentRide.dropLocation}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400">Distance</span>
                  <p className="text-xs font-extrabold text-slate-800">{currentRide.distanceKm}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Duration</span>
                  <p className="text-xs font-extrabold text-slate-800">{currentRide.durationMin}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Fare</span>
                  <p className="text-xs font-extrabold text-emerald-700">PKR {currentRide.farePkr}</p>
                </div>
              </div>
            </div>

            <div className="w-full pt-1">
              <span className="text-xs font-bold text-slate-600 block mb-2">Rate the Passenger</span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      sound.playClick();
                      setDriverRatingScore(star);
                    }}
                    className="transition hover:scale-110 cursor-pointer"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= driverRatingScore 
                          ? 'text-[#3ebd19] fill-[#3ebd19]' 
                          : 'text-slate-200 fill-slate-100'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full pt-2">
              <button
                onClick={handleFinishCompletedTrip}
                className="w-full py-4 rounded-full bg-[#3ebd19] hover:bg-[#34a914] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(62,189,25,0.35)] transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: VEHICLE INFORMATION */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'vehicle-info' && (
          <div className="space-y-4">
            {renderSubHeader('Vehicle Information', false, 'none')}

            <div className="w-full h-44 rounded-3xl bg-[#f2fbf0] border border-emerald-100 flex items-center justify-center p-4 overflow-hidden relative shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=80"
                alt="Vehicle"
                className="max-h-full object-contain drop-shadow-lg"
              />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{vehicleName}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Bike • Model {vehicleModel}</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Registration No.</span>
                <span className="font-extrabold text-slate-900 uppercase tracking-wider">{vehicleNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Color</span>
                <span className="font-extrabold text-slate-900">{vehicleColor}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-medium text-slate-500">Model Year</span>
                <span className="font-extrabold text-slate-900">{vehicleModel}</span>
              </div>
            </div>

            {isEditingVehicle && (
              <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-200 space-y-2">
                <span className="text-xs font-bold text-emerald-800">Edit Vehicle Specs</span>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="Vehicle Name"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Model Year"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="Registration Number"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            )}

            <button
              onClick={() => {
                sound.playClick();
                setIsEditingVehicle(!isEditingVehicle);
              }}
              className="w-full py-3.5 rounded-full bg-[#3ebd19] hover:bg-[#34a914] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(62,189,25,0.35)] transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditingVehicle ? 'Save Changes' : 'Edit Specs'}</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: DOCUMENTS */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'documents' && (
          <div className="space-y-4">
            {renderSubHeader('Documents', false, 'none')}

            <div className="space-y-2.5">
              {[
                { key: 'cnicFront', title: 'CNIC Front', img: driverData?.documents?.cnicFront || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&auto=format&fit=crop&q=80' },
                { key: 'cnicBack', title: 'CNIC Back', img: driverData?.documents?.cnicBack || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&auto=format&fit=crop&q=80' },
                { key: 'license', title: 'Driving License', img: driverData?.documents?.license || 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=100&auto=format&fit=crop&q=80' },
                { key: 'plate', title: 'Vehicle Number Plate', img: driverData?.documents?.plate || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100&auto=format&fit=crop&q=80' },
                { key: 'selfie', title: 'Personal Photo', img: driverData?.documents?.selfie || driverAvatar },
              ].map((doc) => (
                <div key={doc.key} className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img src={doc.img} alt={doc.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{doc.title}</h4>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                sound.playClick();
                alert('Documents are verified and securely archived.');
              }}
              className="w-full py-3.5 rounded-full bg-[#3ebd19] hover:bg-[#34a914] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(62,189,25,0.35)] transition cursor-pointer"
            >
              Update Documents
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: SETTINGS */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'settings' && (
          <div className="space-y-4">
            {renderSubHeader('Settings', false, 'none')}

            <div className="space-y-2.5">
              <div 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">Notification Settings</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{notificationsEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600 font-bold text-xs">🌙</span>
                  <span className="text-xs font-bold text-slate-800">Dark Mode</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full transition p-0.5 cursor-pointer ${darkMode ? 'bg-[#3ebd19]' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition shadow-xs">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">Help & Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: RIDE HISTORY */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'ride-history' && (
          <div className="space-y-4">
            {renderSubHeader('Ride History', false, 'none')}

            <div className="space-y-2.5">
              {[
                { time: 'Oct 18, 2026 - 10:32 AM', fromTo: 'Islamia College → Qissa Khwani', fare: 280 },
                { time: 'Oct 18, 2026 - 09:15 AM', fromTo: 'University Road → Saddar', fare: 250 },
                { time: 'Oct 17, 2026 - 06:45 PM', fromTo: 'Karkhano → Peshawar Cantt', fare: 320 },
                { time: 'Oct 17, 2026 - 05:20 PM', fromTo: 'Town Ship → Saddar', fare: 210 },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                    <span className="text-xs font-extrabold text-slate-900">PKR {item.fare}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <p className="text-xs font-bold text-slate-800">{item.fromTo}</p>
                  </div>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    ✔ Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SUB-SCREEN: NO RIDE REQUESTS (Empty State) */}
        {/* ------------------------------------------------------------------------- */}
        {activeSubScreen === 'empty-requests' && (
          <div className="space-y-6 text-center py-8">
            {renderSubHeader('No Ride Requests', false, 'none')}

            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <Clock className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">No Ride Requests Right Now</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                You're offline or there are no nearby rides in your zone.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playSuccess();
                setIsOnline(true);
                setHasNewRequest(true);
                setActiveSubScreen('none');
                setActiveTab('requests');
              }}
              className="w-full max-w-xs py-3.5 rounded-full bg-[#3ebd19] hover:bg-[#34a914] text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(62,189,25,0.35)] transition cursor-pointer mx-auto"
            >
              Go Online
            </button>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 6. FIXED BOTTOM NAVIGATION BAR (Permanently pinned at bottom) */}
      {/* ========================================================================= */}
      {activeSubScreen === 'none' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 h-16 flex items-center justify-around px-4 sm:px-6 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('home');
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === 'home' ? 'text-[#3ebd19]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
            </svg>
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {/* 2. Ride Requests */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('requests');
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === 'requests' ? 'text-[#3ebd19]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className="relative">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
              </svg>
              {hasNewRequest && isOnline && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#3ebd19] animate-ping"></span>
              )}
            </div>
            <span className="text-[10px] font-bold">Ride Requests</span>
          </button>

          {/* 3. Earnings */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('earnings');
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === 'earnings' ? 'text-[#3ebd19]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
            <span className="text-[10px] font-bold">Earnings</span>
          </button>

          {/* 4. Profile */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('profile');
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === 'profile' ? 'text-[#3ebd19]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </nav>
      )}

    </div>
  );
};
