import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Search, MapPin, 
  Phone, MessageCircle, Check, X, Clock, Wallet, 
  Bell, Shield, LogOut, ChevronRight, Navigation, ShieldCheck,
  User as UserIcon, Settings, HelpCircle, 
  AlertCircle, FileText, Lock, Smartphone, Tag, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { type UserAccount } from '../lib/supabase';
import { 
  PESHAWAR_PLACES, calculateTripMetrics, type PeshawarPlace, 
  type HistoryRide, getNearestPeshawarPlace 
} from '../lib/peshawarData';
import { sound } from '../lib/sound';
import { PeshawarRealMap } from './PeshawarRealMap';
import { LocationPermissionModal } from './LocationPermissionModal';
import { HistoryPage } from './HistoryPage';
import { WalletPage } from './WalletPage';
import { NotificationPage } from './NotificationPage';
import { SearchPage } from './SearchPage';
import { PassengerBottomNavigation, type PassengerNavTab } from './PassengerBottomNavigation';
import { DriverChatModal, DriverCallModal } from './DriverChatModal';
import { PersonalInfoPage } from './account/PersonalInfoPage';
import { SecurityPrivacyPage } from './account/SecurityPrivacyPage';
import { AppSettingsPage } from './account/AppSettingsPage';
import { NotificationPreferencesPage } from './account/NotificationPreferencesPage';
import { SavedPlacesPage } from './account/SavedPlacesPage';
import { OffersRewardsPage } from './account/OffersRewardsPage';
import { SafetyCenterPage } from './account/SafetyCenterPage';
import { HelpSupportPage } from './account/HelpSupportPage';
import { ReportIssuePage } from './account/ReportIssuePage';
import { AboutSafarGoPage } from './account/AboutSafarGoPage';
import { TermsConditionsPage } from './account/TermsConditionsPage';
import { PrivacyPolicyPage } from './account/PrivacyPolicyPage';
import { AppVersionPage } from './account/AppVersionPage';

interface DashboardProps {
  user: UserAccount;
  onLogout: () => void;
  onOpenDriverApplication?: () => void;
  onOpenDriverPanel?: () => void;
  onOpenAdminPanel?: () => void;
}

type ScreenState = 
  | 'home'              // Screen 1: Home Map & Search
  | 'categories'        // Screen 2: Ride Categories (Bike, Car, Cargo)
  | 'request_sent'      // Screen 3: Finding Driver
  | 'driver_accepted'   // Screen 4: Driver Accepted (Usman Khan)
  | 'live_tracking'     // Screen 5: Live GPS Tracking
  | 'driver_arrived'    // Screen 6: Driver Arrived
  | 'ride_in_progress'  // Screen 7: Ride in Progress
  | 'ride_completed';   // Screen 8: Ride Complete & Receipt

type ActivePage = 
  | 'home' 
  | 'search' 
  | 'wallet' 
  | 'notifications' 
  | 'history' 
  | 'profile'
  | 'personal_info'
  | 'security_privacy'
  | 'app_settings'
  | 'notification_preferences'
  | 'saved_places'
  | 'offers_rewards'
  | 'safety_center'
  | 'help_support'
  | 'report_issue'
  | 'about'
  | 'terms'
  | 'privacy'
  | 'app_version';

export const DashboardPreview: React.FC<DashboardProps> = ({ 
  user, 
  onLogout,
  onOpenDriverApplication,
  onOpenDriverPanel,
  onOpenAdminPanel
}) => {
  // Active Main Page
  const [activePage, setActivePage] = useState<ActivePage>('home');

  // Authenticated Passenger State
  const [currentUser, setCurrentUser] = useState<UserAccount>(user);
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Logout Confirmation Modal
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  // Issue Dispute Ride ID
  const [disputedRideId, setDisputedRideId] = useState<string | undefined>();

  // 8-step Ride Booking state (active when on 'home' page)
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('home');

  // Selected Locations
  const [fromPlace, setFromPlace] = useState<PeshawarPlace>(PESHAWAR_PLACES[0]); // Islamia College Peshawar
  const [toPlace, setToPlace] = useState<PeshawarPlace>(PESHAWAR_PLACES[3]);     // Saddar Cantt Bazaar
  const [selectedCategory, setSelectedCategory] = useState<'bike' | 'car' | 'cargo'>('car');

  // Mandatory Location Permission State (Device GPS must be enabled)
  const [isLocationGranted, setIsLocationGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !!sessionStorage.getItem('safargo_user_lat');
  });

  // Automatic Real Location Tracking on Dashboard Mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          sessionStorage.setItem('safargo_user_lat', lat.toString());
          sessionStorage.setItem('safargo_user_lng', lng.toString());
          setIsLocationGranted(true);

          const nearest = getNearestPeshawarPlace(lat, lng);
          setFromPlace(nearest);
        },
        (err) => {
          console.warn('GPS initial detection note:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  // Interactive Passenger Experience States (Chat, Calling, Custom Pins)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [hasUnreadDriverMsg, setHasUnreadDriverMsg] = useState(false);
  const [isCustomPinMode, setIsCustomPinMode] = useState(false);
  const [pinModeType, setPinModeType] = useState<'from' | 'to'>('from');

  // Switch to Driver Mode Handler
  const handleSwitchToDriver = () => {
    const isRegisteredDriver = 
      user.role === 'driver' || 
      localStorage.getItem(`safargo_driver_registered_${user.id}`) === 'true' ||
      Boolean(localStorage.getItem(`safargo_driver_data_${user.id}`));

    if (isRegisteredDriver) {
      sound.playSuccess();
      if (onOpenDriverPanel) {
        onOpenDriverPanel();
      }
    } else {
      sound.playClick();
      if (onOpenDriverApplication) {
        onOpenDriverApplication();
      }
    }
  };

  // Navigation Drawer
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Driver Rating on Completion Screen
  const [driverRating, setDriverRating] = useState<number>(5);

  // Trip metrics calculation
  const metrics = calculateTripMetrics(fromPlace.name, toPlace.name);

  // Automated progression for the ride booking simulation
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let msgTimer: ReturnType<typeof setTimeout>;

    if (currentScreen === 'request_sent') {
      timer = setTimeout(() => {
        sound.playSuccess();
        setCurrentScreen('driver_accepted');
      }, 3500);
    } else if (currentScreen === 'driver_accepted') {
      msgTimer = setTimeout(() => {
        setHasUnreadDriverMsg(true);
        sound.playPop();
      }, 1500);

      timer = setTimeout(() => {
        setCurrentScreen('live_tracking');
      }, 4000);
    } else if (currentScreen === 'live_tracking') {
      timer = setTimeout(() => {
        sound.playSuccess();
        setCurrentScreen('driver_arrived');
      }, 6500);
    }
    return () => {
      clearTimeout(timer);
      clearTimeout(msgTimer);
    };
  }, [currentScreen]);

  // Confetti on Ride Complete
  useEffect(() => {
    if (currentScreen === 'ride_completed') {
      sound.playSuccess();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#84cc16', '#4d7c0f', '#a3e635', '#166534']
      });
    }
  }, [currentScreen]);

  // Re-book ride from History Page
  const handleRebookFromHistory = (ride: HistoryRide) => {
    const fromP = PESHAWAR_PLACES.find(p => p.name.includes(ride.from)) || PESHAWAR_PLACES[0];
    const toP = PESHAWAR_PLACES.find(p => p.name.includes(ride.to)) || PESHAWAR_PLACES[3];
    setFromPlace(fromP);
    setToPlace(toP);
    setSelectedCategory(ride.type);
    setActivePage('home');
    setCurrentScreen('categories');
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      
      {/* ======================================================== */}
      {/* 1. FIXED APPLE IOS GLASS HEADER                          */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 1. FIXED GLASS HEADER (Full Screen Edge-to-Edge)         */}
      {/* ======================================================== */}
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all ${
        activePage === 'home' && currentScreen === 'home'
          ? 'bg-transparent pointer-events-none p-4 flex items-center justify-end'
          : 'ios-glass-header px-4 sm:px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-white/90 border-b border-white/40 shadow-sm pointer-events-auto'
      }`}>
        {/* Left: App Logo (Hidden on Home screen to let Peshawar floating pill shine) */}
        {!(activePage === 'home' && currentScreen === 'home') && (
          <div 
            onClick={() => { setActivePage('home'); setCurrentScreen('home'); }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#22c55e] to-[#16a34a] p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <img 
                src="/safar-go-monogram-exact.png" 
                alt="SafarGo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Safar<span className="text-[#16a34a]">Go</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold -mt-0.5 hidden sm:block">
                Peshawar Rides
              </span>
            </div>
          </div>
        )}

        {/* Center: Live GPS / Active Trip Pill (Desktop) */}
        {activePage === 'home' && currentScreen !== 'home' && (
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white shadow-sm border border-white/10 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
            <span className="text-xs font-bold text-slate-100">
              {currentScreen === 'request_sent' && 'Dispatching Driver near Peshawar...'}
              {currentScreen === 'driver_accepted' && 'Driver Usman Accepted • 2 min away'}
              {currentScreen === 'live_tracking' && 'En-route to Pickup Point'}
              {currentScreen === 'driver_arrived' && 'Driver Arrived at Location'}
              {currentScreen === 'ride_in_progress' && 'Trip to Destination in Progress'}
              {currentScreen === 'ride_completed' && 'Trip Completed'}
            </span>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {!(activePage === 'home' && currentScreen === 'home') && (
            <button
              onClick={() => setActivePage('notifications')}
              title="Notifications"
              className="relative w-10 h-10 rounded-2xl bg-slate-100/80 hover:bg-white border border-slate-200/80 hover:border-emerald-400 flex items-center justify-center text-slate-700 hover:text-[#16a34a] hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-white"></span>
            </button>
          )}

          {/* Hamburger Drawer Menu Button */}
          <button
            onClick={() => setIsNavDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            title="Menu & Safety"
            className="w-10 h-10 rounded-2xl bg-white text-slate-800 hover:text-[#16a34a] border border-slate-100 shadow-md flex flex-col items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="w-5 h-0.5 bg-slate-800 rounded-full"></span>
            <span className="w-3.5 h-0.5 bg-[#16a34a] rounded-full self-start ml-2.5"></span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN VIEW SWITCHER (HOME, HISTORY, WALLET, NOTIFS)   */}
      {/* ======================================================== */}
      <main className="flex-1 w-full relative">
        {/* 1. Trip History & Receipts */}
        {activePage === 'history' && (
          <HistoryPage 
            onBackToHome={() => setActivePage('home')} 
            onRebookRide={handleRebookFromHistory}
            onReportRideIssue={(rideId) => {
              setDisputedRideId(rideId);
              setActivePage('report_issue');
            }}
          />
        )}

        {/* 2. Search Page */}
        {activePage === 'search' && (
          <SearchPage
            fromPlace={fromPlace}
            toPlace={toPlace}
            onSelectFrom={(place) => setFromPlace(place)}
            onSelectTo={(place) => setToPlace(place)}
            onConfirmTrip={(from, to) => {
              setFromPlace(from);
              setToPlace(to);
              setActivePage('home');
              setCurrentScreen('categories');
            }}
            onBackToHome={() => setActivePage('home')}
          />
        )}

        {/* 3. Personal Information / Profile Page */}
        {(activePage === 'personal_info' || activePage === 'profile') && (
          <PersonalInfoPage
            user={currentUser}
            onBack={() => setActivePage('home')}
            onUserUpdated={(updated) => setCurrentUser(updated)}
            onOpenAdminPanel={onOpenAdminPanel}
            onSwitchToDriver={handleSwitchToDriver}
          />
        )}

        {/* 4. Security & Privacy */}
        {activePage === 'security_privacy' && (
          <SecurityPrivacyPage
            user={currentUser}
            onBack={() => setActivePage('home')}
          />
        )}

        {/* 5. App Settings */}
        {activePage === 'app_settings' && (
          <AppSettingsPage
            onBack={() => setActivePage('home')}
            onNavigateToNotifications={() => setActivePage('notification_preferences')}
            onNavigateToAppVersion={() => setActivePage('app_version')}
          />
        )}

        {/* 6. Notification Preferences */}
        {activePage === 'notification_preferences' && (
          <NotificationPreferencesPage
            userId={currentUser.id}
            onBack={() => setActivePage('home')}
          />
        )}

        {/* 7. SafarGo Cash Wallet */}
        {activePage === 'wallet' && (
          <WalletPage 
            onBackToHome={() => setActivePage('home')} 
          />
        )}

        {/* 8. Saved Places */}
        {activePage === 'saved_places' && (
          <SavedPlacesPage
            userId={currentUser.id}
            onBack={() => setActivePage('home')}
            onSelectForTrip={(place) => {
              setToPlace(place);
              setActivePage('home');
              setCurrentScreen('categories');
            }}
          />
        )}

        {/* 9. Offers & Referral Rewards */}
        {activePage === 'offers_rewards' && (
          <OffersRewardsPage
            user={currentUser}
            onBack={() => setActivePage('home')}
          />
        )}

        {/* 10. Safety Center */}
        {activePage === 'safety_center' && (
          <SafetyCenterPage
            userId={currentUser.id}
            onBack={() => setActivePage('home')}
            onReportSafetyConcern={() => setActivePage('report_issue')}
          />
        )}

        {/* 11. Help & Support */}
        {activePage === 'help_support' && (
          <HelpSupportPage
            userId={currentUser.id}
            onBack={() => setActivePage('home')}
            onNavigateToReportIssue={() => setActivePage('report_issue')}
          />
        )}

        {/* 12. Report an Issue */}
        {activePage === 'report_issue' && (
          <ReportIssuePage
            userId={currentUser.id}
            initialRideId={disputedRideId}
            onBack={() => setActivePage('home')}
            onTicketSubmitted={() => setActivePage('help_support')}
          />
        )}

        {/* 13. About SafarGo */}
        {activePage === 'about' && (
          <AboutSafarGoPage
            onBack={() => setActivePage('home')}
            onNavigateToTerms={() => setActivePage('terms')}
            onNavigateToPrivacy={() => setActivePage('privacy')}
          />
        )}

        {/* 14. Terms & Conditions */}
        {activePage === 'terms' && (
          <TermsConditionsPage
            onBack={() => setActivePage('home')}
          />
        )}

        {/* 15. Privacy Policy */}
        {activePage === 'privacy' && (
          <PrivacyPolicyPage
            onBack={() => setActivePage('home')}
          />
        )}

        {/* 16. App Version */}
        {activePage === 'app_version' && (
          <AppVersionPage
            onBack={() => setActivePage('home')}
          />
        )}

        {/* Notifications Page (from Header/BottomNav) */}
        {activePage === 'notifications' && (
          <NotificationPage 
            onBackToHome={() => setActivePage('home')}
            onNavigateToWallet={() => setActivePage('wallet')}
          />
        )}

        {activePage === 'home' && (
          <div className="w-full h-[100dvh] relative overflow-hidden flex flex-col">
            
            {/* Real Interactive Leaflet Peshawar City Map (Edge-to-Edge) */}
            <div className="absolute inset-0 w-full h-full z-0">
              <PeshawarRealMap
                fromPlace={fromPlace}
                toPlace={toPlace}
                screenState={currentScreen}
                vehicleType={selectedCategory}
                isCustomPinMode={isCustomPinMode}
                pinModeType={pinModeType}
                onExitPinMode={() => setIsCustomPinMode(false)}
                onSelectPlace={(place, type) => {
                  if (type === 'from') setFromPlace(place);
                  else setToPlace(place);
                }}
              />
            </div>

            {/* ======================================================== */}
            {/* FLOATING RIDE BOOKING CARD / DRAWER                      */}
            {/* On Desktop: Top-Left Floating Panel                      */}
            {/* On Mobile: Bottom Floating Sheet Above Navbar            */}
            {/* ======================================================== */}
            <div className="relative z-30 pointer-events-none w-full h-full flex flex-col justify-end p-3 sm:p-5 pb-20 sm:pb-24 max-w-lg mx-auto">
              <div className="pointer-events-auto w-full max-h-[78vh] overflow-y-auto no-scrollbar rounded-[32px] bg-white p-4 sm:p-5 shadow-[0_12px_45px_rgba(0,0,0,0.13)] border border-slate-100 transition-all">
                
                {/* ---------------------------------------------------- */}
                {/* SCREEN 1: HOME SEARCH CARD (Exact Reference Design)   */}
                {/* ---------------------------------------------------- */}
                {currentScreen === 'home' && (
                  <div className="space-y-3">
                    {/* 1. From (Pickup) Box */}
                    <div
                      onClick={() => {
                        sound.playClick();
                        setPinModeType('from');
                        setIsCustomPinMode(true);
                      }}
                      className="bg-[#f8faf9] hover:bg-[#f0f4f2] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-colors border border-slate-100/80 group active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-[#16a34a] flex items-center justify-center text-white shrink-0 shadow-sm">
                          <MapPin className="w-5 h-5 fill-white text-white" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-[11px] font-bold text-[#16a34a] block leading-tight">
                            From
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate block">
                            {fromPlace ? fromPlace.name : 'Your current location'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-[#16a34a]">
                          <Navigation className="w-3.5 h-3.5 rotate-45 fill-[#16a34a] text-[#16a34a]" />
                        </div>
                      </div>
                    </div>

                    {/* 2. To (Destination) Box */}
                    <div
                      onClick={() => {
                        sound.playPop();
                        setActivePage('search');
                      }}
                      className="bg-[#f8faf9] hover:bg-[#f0f4f2] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-colors border border-slate-100/80 group active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-[#f43f5e] flex items-center justify-center text-white shrink-0 shadow-sm">
                          <MapPin className="w-5 h-5 fill-white text-white" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-[11px] font-bold text-[#f43f5e] block leading-tight">
                            To
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-400 group-hover:text-slate-700 truncate block">
                            {toPlace && toPlace.name ? toPlace.name : 'Where are you going?'}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>

                    {/* 3. Search Ride Button (Vibrant Green) */}
                    <button
                      onClick={() => {
                        sound.playSuccess();
                        setCurrentScreen('categories');
                      }}
                      className="w-full py-3.5 sm:py-4 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#16a34a]/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
                    >
                      <Search className="w-5 h-5 stroke-[2.5]" />
                      <span>Search Ride</span>
                    </button>

                    {/* 4. Safety Assurance Banner (Safe Rides • Trusted Drivers • Peshawar Only) */}
                    <div
                      onClick={() => {
                        sound.playClick();
                        setIsNavDrawerOpen(true);
                      }}
                      className="bg-[#f0fdf4] hover:bg-[#e7faed] border border-[#dcfce7] rounded-full py-2.5 px-4 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#16a34a] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                        <span>Safe Rides &nbsp;•&nbsp; Trusted Drivers &nbsp;•&nbsp; Peshawar Only</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#16a34a]" />
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SCREEN 2: RIDE CATEGORIES (Bike, Car, Cargo)         */}
                {/* ---------------------------------------------------- */}
                {currentScreen === 'categories' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <button
                        onClick={() => setCurrentScreen('home')}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <h3 className="text-sm font-extrabold text-slate-900">Choose Vehicle</h3>
                      <span className="text-xs font-bold text-lime-700 bg-lime-50 px-2 py-0.5 rounded-md border border-lime-200">
                        {metrics.distanceKm} km
                      </span>
                    </div>

                    {/* 3 Categories Options */}
                    <div className="space-y-2.5">
                      {[
                        { 
                          id: 'bike', 
                          title: 'Bike Ride', 
                          desc: 'Fastest through Peshawar traffic', 
                          fare: metrics.fares.bike,
                          time: '2 mins away',
                          icon: '🏍️' 
                        },
                        { 
                          id: 'car', 
                          title: 'Car Ride (AC)', 
                          desc: 'Comfortable air-conditioned ride', 
                          fare: metrics.fares.car,
                          time: '3 mins away',
                          icon: '🚗',
                          popular: true
                        },
                        { 
                          id: 'cargo', 
                          title: 'Cargo Delivery', 
                          desc: 'Packages & luggage transfer', 
                          fare: metrics.fares.cargo,
                          time: '5 mins away',
                          icon: '🚚' 
                        }
                      ].map(cat => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id as any);
                            sound.playPop();
                          }}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            selectedCategory === cat.id
                              ? 'border-lime-500 bg-lime-50/70 shadow-md ring-2 ring-lime-400/30'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 rounded-xl bg-slate-100">{cat.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-black text-slate-900">{cat.title}</h4>
                                {cat.popular && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-lime-500 text-slate-950 font-extrabold">
                                    POPULAR
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">{cat.desc}</p>
                              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                                • {cat.time}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-slate-900 block">
                              PKR {cat.fare}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Est. Total</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        sound.playSuccess();
                        setCurrentScreen('request_sent');
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-black text-sm shadow-lg shadow-lime-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <span>Confirm {selectedCategory.toUpperCase()} Ride (PKR {metrics.fares[selectedCategory]})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SCREEN 3: REQUEST SENT (FINDING DRIVER)               */}
                {/* ---------------------------------------------------- */}
                {currentScreen === 'request_sent' && (
                  <div className="space-y-4 text-center py-2">
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-lime-400/30 animate-ping"></div>
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-lime-500 text-white flex items-center justify-center shadow-lg text-2xl">
                        🚗
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Finding Driver Near You...
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Contacting verified drivers near {fromPlace.name.split(' ')[0]}
                      </p>
                    </div>

                    {/* Progress Stepper */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-2">
                      <div className="p-2 rounded-xl bg-lime-100 border border-lime-300 text-[10px] font-bold text-lime-800">
                        1. Request Sent
                      </div>
                      <div className="p-2 rounded-xl bg-lime-100 border border-lime-300 text-[10px] font-bold text-lime-800 animate-pulse">
                        2. Matching
                      </div>
                      <div className="p-2 rounded-xl bg-slate-100 text-[10px] font-bold text-slate-400">
                        3. Dispatch
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentScreen('categories')}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Cancel Request
                    </button>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SCREEN 4 & 5: DRIVER ACCEPTED & TRACKING             */}
                {/* ---------------------------------------------------- */}
                {(currentScreen === 'driver_accepted' || currentScreen === 'live_tracking') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Driver on the way • 2 mins away
                      </span>
                      <span className="text-xs font-black text-slate-900">PKR {metrics.fares[selectedCategory]}</span>
                    </div>

                    {/* Driver Profile Card */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center border-2 border-lime-400">
                          UK
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-extrabold text-slate-900">Usman Khan</h4>
                            <span className="text-xs font-bold text-amber-500 flex items-center">
                              ⭐ 4.8
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">Honda Civic • White</p>
                          <span className="text-[11px] font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                            PWA-7421
                          </span>
                        </div>
                      </div>

                      {/* Call & Chat Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            sound.playClick();
                            setIsCallOpen(true);
                          }}
                          title="Voice Call Driver Usman"
                          className="w-10 h-10 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            sound.playClick();
                            setIsChatOpen(true);
                            setHasUnreadDriverMsg(false);
                          }}
                          title="Chat with Driver Usman"
                          className="relative w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-lime-400 text-emerald-600 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {hasUnreadDriverMsg && (
                            <>
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white animate-ping"></span>
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white"></span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Sim trigger button for instant testing */}
                    <button
                      onClick={() => {
                        sound.playSuccess();
                        setCurrentScreen('driver_arrived');
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                    >
                      Simulate: Driver Has Arrived
                    </button>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SCREEN 6: DRIVER ARRIVED                             */}
                {/* ---------------------------------------------------- */}
                {currentScreen === 'driver_arrived' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                      <span className="text-xs font-black text-amber-800 block">
                        🚗 Usman has arrived at {fromPlace.name.split(' ')[0]}!
                      </span>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Vehicle: Honda Civic (PWA-7421). Share OTP: <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">5429</span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        sound.playSuccess();
                        setCurrentScreen('ride_in_progress');
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <span>Start Ride</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SCREEN 7: RIDE IN PROGRESS                           */}
                {/* ---------------------------------------------------- */}
                {currentScreen === 'ride_in_progress' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">Heading to</span>
                        <h4 className="text-sm font-black text-slate-900">{toPlace.name}</h4>
                      </div>
                      <span className="text-xs font-extrabold text-lime-700 bg-lime-100 px-2.5 py-1 rounded-full">
                        {metrics.durationMin} mins left
                      </span>
                    </div>

                    {/* Ride Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-lime-500 h-full w-2/3 rounded-full animate-pulse" />
                    </div>

                    {/* In-Trip Driver Contact Bar */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center border border-lime-400">
                          UK
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">Usman Khan (Driver)</p>
                          <p className="text-[10px] text-slate-500">Trip in progress</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            sound.playClick();
                            setIsCallOpen(true);
                          }}
                          className="w-9 h-9 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 flex items-center justify-center shadow-sm"
                          title="Call Driver"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            sound.playClick();
                            setIsChatOpen(true);
                          }}
                          className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-lime-400 text-emerald-600 flex items-center justify-center shadow-sm"
                          title="Chat with Driver"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentScreen('ride_completed');
                      }}
                      className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-md hover:bg-slate-800 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <span>Complete Trip</span>
                      <Check className="w-4 h-4 text-lime-400" />
                    </button>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* SCREEN 8: RIDE COMPLETED & RECEIPT                   */}
                {/* ---------------------------------------------------- */}
                {currentScreen === 'ride_completed' && (
                  <div className="space-y-4 text-center py-2">
                    <div className="w-14 h-14 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center mx-auto text-2xl border-2 border-lime-300">
                      🎉
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900">Trip Completed!</h3>
                      <p className="text-xs text-slate-500">Thank you for riding with SafarGo Peshawar</p>
                    </div>

                    {/* Receipt Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Distance Covered</span>
                        <span className="font-bold text-slate-800">{metrics.distanceKm} km</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Vehicle</span>
                        <span className="font-bold text-slate-800 capitalize">{selectedCategory} Ride</span>
                      </div>
                      <div className="flex justify-between text-slate-900 pt-2 border-t border-slate-200 text-sm font-black">
                        <span>Total Paid</span>
                        <span className="text-emerald-600">PKR {metrics.fares[selectedCategory]}</span>
                      </div>
                    </div>

                    {/* 5-Star Interactive Rating */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">Rate Usman Khan</span>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => {
                              setDriverRating(star);
                              sound.playPop();
                            }}
                            className={`p-1.5 rounded-lg text-lg transition-transform ${
                              driverRating >= star ? 'text-amber-400 scale-110' : 'text-slate-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sound.playPop();
                        setCurrentScreen('home');
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-black text-sm shadow-lg active:scale-95 transition-all"
                    >
                      Done / Back to Home
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 3. PREMIUM FLOATING GLASSMORPHISM PASSENGER NAVBAR       */}
      {/* ======================================================== */}
      <PassengerBottomNavigation
        activeTab={activePage}
        onNavigate={(tab: PassengerNavTab) => {
          if (tab === 'home') {
            setActivePage('home');
            setCurrentScreen('home');
          } else if (tab === 'history') {
            setActivePage('history');
          } else if (tab === 'book') {
            setActivePage('home');
            if (currentScreen === 'home') {
              setCurrentScreen('categories');
            }
          } else if (tab === 'wallet') {
            setActivePage('wallet');
          } else if (tab === 'profile') {
            setActivePage('personal_info');
          }
        }}
      />



      {/* ======================================================== */}
      {/* 5. SLIDING SIDE NAVIGATION DRAWER (OPENS FROM RIGHT)    */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 5. SLIDING SIDE NAVIGATION DRAWER (4 SECTIONS & LOGOUT) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isNavDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Sliding Drawer Panel from Right */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-84 max-w-[88vw] h-full bg-[#fafdf8] shadow-2xl flex flex-col justify-between z-10 border-l border-emerald-100"
            >
              {/* A. Passenger Account Header */}
              <div className="p-4 pb-3.5 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-50 border-2 border-[#16a34a] shadow-xs">
                        {currentUser.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-[#16a34a] font-bold text-sm">
                            {(currentUser.fullName || 'P').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#16a34a] border border-white flex items-center justify-center text-white text-[8px] font-bold">
                        ✓
                      </span>
                    </div>

                    <div className="space-y-0.5 overflow-hidden">
                      <h3 className="text-xs font-black text-slate-900 leading-tight truncate max-w-[155px]">
                        {currentUser.fullName || 'Passenger'}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate max-w-[155px]">
                        {currentUser.email || currentUser.phone || 'Verified Passenger'}
                      </p>
                      <div className="flex items-center gap-1 pt-0.5">
                        <span className="text-[9px] font-bold text-[#16a34a] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Passenger Account
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsNavDrawerOpen(false)}
                    aria-label="Close Drawer"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors active:scale-95 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit Profile Action */}
                <button
                  onClick={() => {
                    setIsNavDrawerOpen(false);
                    setActivePage('personal_info');
                    sound.playPop();
                  }}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-[#16a34a] text-xs font-bold flex items-center justify-between transition-colors active:scale-[0.99]"
                >
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" />
                    Edit Profile & Details
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* B, C, D, E. Scrollable Four Sections with Visible Custom Scrollbar */}
              <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 overscroll-contain [scrollbar-width:thin] [scrollbar-color:#86efac_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-emerald-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#16a34a]">
                {[
                  {
                    title: 'ACCOUNT',
                    items: [
                      { id: 'personal_info' as ActivePage, label: 'Personal Information', sub: 'Profile, phone & email', icon: UserIcon },
                      { id: 'security_privacy' as ActivePage, label: 'Security & Privacy', sub: 'Password & active devices', icon: Lock },
                      { id: 'app_settings' as ActivePage, label: 'App Settings', sub: 'Language, audio & map style', icon: Settings },
                      { id: 'notification_preferences' as ActivePage, label: 'Notification Preferences', sub: 'Ride alerts & updates', icon: Bell },
                    ]
                  },
                  {
                    title: 'RIDES & PAYMENTS',
                    items: [
                      { id: 'history' as ActivePage, label: 'Trip History & Receipts', sub: 'Past rides & fare breakdown', icon: Clock },
                      { id: 'wallet' as ActivePage, label: 'SafarGo Cash Wallet', sub: 'EasyPaisa & JazzCash', icon: Wallet },
                      { id: 'saved_places' as ActivePage, label: 'Saved Places', sub: 'Home, Work & Favorites', icon: MapPin },
                      { id: 'offers_rewards' as ActivePage, label: 'Offers & Referral Rewards', sub: 'Promo vouchers & referral code', icon: Tag },
                    ]
                  },
                  {
                    title: 'SAFETY & SUPPORT',
                    items: [
                      { id: 'safety_center' as ActivePage, label: 'Safety Center', sub: 'Peshawar 15, 1122 & SOS', icon: ShieldCheck },
                      { id: 'help_support' as ActivePage, label: 'Help & Support', sub: 'FAQs & support tickets', icon: HelpCircle },
                      { id: 'report_issue' as ActivePage, label: 'Report an Issue', sub: 'Submit a dispute or feedback', icon: AlertCircle },
                    ]
                  },
                  {
                    title: 'SAFARGO INFORMATION',
                    items: [
                      { id: 'about' as ActivePage, label: 'About SafarGo', sub: 'Peshawar ride-hailing vision', icon: Sparkles },
                      { id: 'terms' as ActivePage, label: 'Terms & Conditions', sub: 'Passenger service agreement', icon: FileText },
                      { id: 'privacy' as ActivePage, label: 'Privacy Policy', sub: 'Data & location privacy', icon: Shield },
                      { id: 'app_version' as ActivePage, label: 'App Version', sub: 'v2.4.0 (Build 2026.10)', icon: Smartphone },
                    ]
                  }
                ].map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block px-2">
                      {section.title}
                    </span>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            sound.playPop();
                            setIsNavDrawerOpen(false);
                            setActivePage(item.id);
                          }}
                          className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition-all group active:scale-[0.99] ${
                            activePage === item.id 
                              ? 'bg-emerald-50 text-[#16a34a] font-bold border border-emerald-200/80 shadow-xs' 
                              : 'text-slate-700 hover:bg-white hover:shadow-xs border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                              activePage === item.id 
                                ? 'bg-[#16a34a] text-white' 
                                : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-[#16a34a]'
                            }`}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <div className={`text-xs font-bold leading-tight ${activePage === item.id ? 'text-[#16a34a]' : 'text-slate-900'}`}>
                                {item.label}
                              </div>
                              <div className="text-[10px] text-slate-600 leading-tight mt-0.5">
                                {item.sub}
                              </div>
                            </div>
                          </div>

                          <ChevronRight className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                            activePage === item.id ? 'text-[#16a34a]' : 'text-slate-400 group-hover:text-slate-600'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* F. Logout Button */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <button
                  onClick={() => {
                    sound.playPop();
                    setShowLogoutConfirmModal(true);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
                <LogOut className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">Log Out of SafarGo?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to log out? You will need to sign in again to book rides across Peshawar.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirmModal(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirmModal(false);
                    setIsNavDrawerOpen(false);
                    sound.playPop();
                    onLogout();
                  }}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition-all"
                >
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive In-App Driver Chat Modal */}
      <DriverChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        driverName="Usman Khan"
        driverRating={4.8}
        vehicleModel="Honda Civic • White"
        vehiclePlate="PWA-7421"
        onOpenCall={() => {
          setIsChatOpen(false);
          setIsCallOpen(true);
        }}
      />

      {/* Interactive In-App Driver Voice Call Screen */}
      <DriverCallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        driverName="Usman Khan"
        vehicleModel="Honda Civic • White (PWA-7421)"
      />

      {/* Mandatory Device Location (GPS) Permission Modal */}
      <LocationPermissionModal
        isOpen={!isLocationGranted}
        onLocationGranted={(coords) => {
          setIsLocationGranted(true);
          if (coords) {
            const nearest = getNearestPeshawarPlace(coords.lat, coords.lng);
            setFromPlace(nearest);
          }
        }}
      />
    </div>
  );
};
