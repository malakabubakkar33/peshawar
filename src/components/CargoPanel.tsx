import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Truck, MapPin, ArrowRight, FileText, User, Search,
  Download, Share2, Navigation, Layers, ArrowLeft,
  Building2, ShoppingBag, Sofa, Wrench, Apple
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../lib/sound';
import { type UserAccount } from '../lib/supabase';
import { PESHAWAR_PLACES, calculateTripMetrics, type PeshawarPlace } from '../lib/peshawarData';
import { rideService, type ActiveRide } from '../lib/rideService';
import { PeshawarRealMap } from './PeshawarRealMap';

interface CargoPanelProps {
  user: UserAccount;
  onBackToPassenger: () => void;
  onOpenDriverPanel?: () => void;
  onOpenAdminPanel?: () => void;
}

export type CargoVehicleId = 'rickshaw' | 'bolan' | 'ravi' | 'shehzore' | 'mazda';

interface CargoVehicleOption {
  id: CargoVehicleId;
  name: string;
  nameUrdu: string;
  capacityKg: number;
  capacityText: string;
  baseFare: number;
  perKm: number;
  icon: string;
  badge: string;
  description: string;
}

const CARGO_VEHICLES: CargoVehicleOption[] = [
  {
    id: 'rickshaw',
    name: 'Loader Rickshaw',
    nameUrdu: 'لوڈر رکشہ',
    capacityKg: 350,
    capacityText: 'Up to 350 KG',
    baseFare: 200,
    perKm: 35,
    icon: '🛺',
    badge: 'Best for Narrow Bazaars',
    description: 'Qissa Khwani, Namak Mandi & Saddar narrow lanes'
  },
  {
    id: 'bolan',
    name: 'Suzuki Bolan / Carry',
    nameUrdu: 'کیری ڈبہ / بولان کارگو',
    capacityKg: 500,
    capacityText: 'Up to 500 KG',
    baseFare: 300,
    perKm: 45,
    icon: '🚐',
    badge: 'Covered & Weatherproof',
    description: 'Rain & dust protected boxes, garments, packages'
  },
  {
    id: 'ravi',
    name: 'Suzuki Ravi Pickup',
    nameUrdu: 'سوزوکی راوی پک اپ',
    capacityKg: 850,
    capacityText: 'Up to 850 KG',
    baseFare: 450,
    perKm: 55,
    icon: '🛻',
    badge: 'Most Popular',
    description: 'Home furniture, appliances, electronics, wholesale crates'
  },
  {
    id: 'shehzore',
    name: 'Hyundai Shehzore 1-Ton',
    nameUrdu: 'ہیونڈائی شہزور',
    capacityKg: 1800,
    capacityText: 'Up to 1.8 Tons',
    baseFare: 900,
    perKm: 85,
    icon: '🚚',
    badge: 'Heavy Commercial',
    description: 'Industrial goods, construction steel, market stock'
  },
  {
    id: 'mazda',
    name: 'Mazda / Master Truck',
    nameUrdu: 'مازدا / ماسٹر ٹرک',
    capacityKg: 3500,
    capacityText: 'Up to 3.5 Tons',
    baseFare: 1800,
    perKm: 120,
    icon: '🚛',
    badge: 'Full Home Shifting',
    description: 'Complete home relocation, machinery & bulk timber'
  }
];

const PESHAWAR_CARGO_HUBS = [
  { name: 'Karkhano Market (کارخانو مارکیٹ)', address: 'Jamrud Road, Peshawar', lat: 33.9985, lng: 71.4150, type: 'electronics_fabrics' },
  { name: 'Hayatabad Industrial Estate (انڈسٹریل اسٹیٹ)', address: 'Phase 7, Hayatabad, Peshawar', lat: 33.9720, lng: 71.4280, type: 'factories' },
  { name: 'Shoba Bazaar (شوبہ بازار آٹو مارکیٹ)', address: 'Near Railway Station, Peshawar', lat: 34.0090, lng: 71.5580, type: 'auto_machinery' },
  { name: 'Chamkani Fruit & Grain Mandi (چمکنی غلہ منڈی)', address: 'GT Road Chamkani, Peshawar', lat: 34.0040, lng: 71.6320, type: 'wholesale_produce' },
  { name: 'Namak Mandi Wholesale (نمک منڈی)', address: 'Inside City, Peshawar', lat: 34.0110, lng: 71.5720, type: 'spices_goods' },
  { name: 'Saddar Cantt Commercial (صدر بازار)', address: 'Mall Road, Peshawar Cantt', lat: 34.0042, lng: 71.5430, type: 'retail_hub' },
  { name: 'Ring Road Toll & Logistics Hub', address: 'Southern Bypass, Peshawar', lat: 33.9820, lng: 71.5200, type: 'highway_transit' },
];

const CARGO_CATEGORIES = [
  { id: 'furniture', label: 'Furniture & Home', urdu: 'سامان گھر و فرنیچر', icon: Sofa, color: 'text-amber-600 bg-amber-50' },
  { id: 'commercial', label: 'Shop & Market Goods', urdu: 'دکان و تجارتی مال', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
  { id: 'electronics', label: 'Electronics & Appliances', urdu: 'الیکٹرانکس و آلات', icon: Package, color: 'text-purple-600 bg-purple-50' },
  { id: 'machinery', label: 'Hardware & Machinery', urdu: 'ہارڈ ویئر و مشینری', icon: Wrench, color: 'text-slate-600 bg-slate-50' },
  { id: 'produce', label: 'Fruits & Food Stock', urdu: 'خوراک و پھل', icon: Apple, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'other', label: 'General Goods', urdu: 'متفرق پارسل', icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
];

export const CargoPanel: React.FC<CargoPanelProps> = ({
  user,
  onBackToPassenger,
  onOpenDriverPanel,
  onOpenAdminPanel
}) => {
  // Main Panel Active Tab: 'send' (Book Cargo) | 'carrier' (Cargo Driver Mode) | 'tracking' (Bilty Record) | 'rates' (Peshawar Tariff)
  const [activeTab, setActiveTab] = useState<'send' | 'carrier' | 'tracking' | 'rates'>('send');

  // Locations State
  const [fromPlace, setFromPlace] = useState<PeshawarPlace>(() => {
    return PESHAWAR_PLACES.find(p => p.name.includes('Karkhano')) || PESHAWAR_PLACES[0];
  });
  const [toPlace, setToPlace] = useState<PeshawarPlace>(() => {
    return PESHAWAR_PLACES.find(p => p.name.includes('Saddar')) || PESHAWAR_PLACES[3];
  });

  // Cargo Booking Form State
  const [selectedVehicle, setSelectedVehicle] = useState<CargoVehicleId>('ravi');
  const [cargoCategory, setCargoCategory] = useState<string>('commercial');
  const [cargoDescription, setCargoDescription] = useState<string>('Retail garments cartons from Karkhano');
  const [estimatedWeight, setEstimatedWeight] = useState<string>('350 kg');
  const [helpersCount, setHelpersCount] = useState<number>(1); // 0 = self, 1 = 1 loader, 2 = 2 loaders
  const [receiverName, setReceiverName] = useState<string>('');
  const [receiverPhone, setReceiverPhone] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'cash_pickup' | 'cash_delivery' | 'wallet'>('cash_delivery');
  const [isFragile, setIsFragile] = useState<boolean>(false);

  // Active Cargo Ride State
  const [activeCargoRide, setActiveCargoRide] = useState<ActiveRide | null>(null);
  const [trackingSearchCode, setTrackingSearchCode] = useState<string>('');
  const [foundBilty, setFoundBilty] = useState<ActiveRide | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Carrier Mode States (For Cargo Driver/Carrier)
  const [isCarrierOnline, setIsCarrierOnline] = useState<boolean>(true);
  const [carrierVehicleName] = useState<string>('Suzuki Ravi Pickup (PES-8910)');
  const [incomingCargoAlert, setIncomingCargoAlert] = useState<ActiveRide | null>(null);
  const [incomingCountdown, setIncomingCountdown] = useState<number>(45);

  // Calculate Distance & Dynamic Trip Metrics
  const tripMetrics = calculateTripMetrics(fromPlace.name, toPlace.name);
  const vehicleConfig = CARGO_VEHICLES.find(v => v.id === selectedVehicle) || CARGO_VEHICLES[2];
  
  // Custom Cargo Price Calculation
  const helperCost = helpersCount * 450;
  const fragileSurcharge = isFragile ? 150 : 0;
  const cargoCalculatedFare = Math.round(vehicleConfig.baseFare + (tripMetrics.distanceKm * vehicleConfig.perKm) + helperCost + fragileSurcharge);

  // Subscribe to real-time incoming cargo rides
  useEffect(() => {
    const checkExisting = () => {
      const pending = rideService.getPendingRides('cargo');
      if (pending.length > 0 && isCarrierOnline) {
        setIncomingCargoAlert(pending[0]);
      }
    };
    checkExisting();

    const unsubscribe = rideService.subscribeToIncomingRides((ride) => {
      if (ride.vehicleType === 'cargo' && ride.status === 'searching' && isCarrierOnline) {
        sound.playSuccess();
        setIncomingCargoAlert(ride);
        setIncomingCountdown(45);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isCarrierOnline]);

  // Incoming Cargo Countdown
  useEffect(() => {
    if (!incomingCargoAlert) return;
    const timer = setInterval(() => {
      setIncomingCountdown(prev => {
        if (prev <= 1) {
          setIncomingCargoAlert(null);
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [incomingCargoAlert]);

  // Subscribe to active cargo ride updates
  useEffect(() => {
    if (!activeCargoRide) return;
    const unsub = rideService.subscribeToRide(activeCargoRide.id, (updated) => {
      setActiveCargoRide(updated);
      if (updated.status === 'ride_completed') {
        sound.playSuccess();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 }
        });
      }
    });
    return () => unsub();
  }, [activeCargoRide?.id]);

  // Booking Action
  const handleBookCargo = () => {
    sound.playSuccess();
    const biltyCode = `CRG-${Math.floor(100000 + Math.random() * 900000)}`;
    const newCargoRide = rideService.createRideRequest({
      riderId: user.id,
      riderName: user.fullName,
      riderPhone: user.phone,
      riderAvatar: user.avatarUrl,
      vehicleType: 'cargo',
      vehicleName: vehicleConfig.name,
      pickupName: fromPlace.name,
      dropoffName: toPlace.name,
      pickupLat: fromPlace.lat,
      pickupLng: fromPlace.lng,
      dropoffLat: toPlace.lat,
      dropoffLng: toPlace.lng,
      fare: cargoCalculatedFare,
      distanceKm: `${tripMetrics.distanceKm} km`,
      durationMin: `${tripMetrics.durationMin} min`,
      cargoDetails: {
        cargoType: CARGO_CATEGORIES.find(c => c.id === cargoCategory)?.label || 'General Goods',
        weightKg: estimatedWeight,
        description: cargoDescription || 'Peshawar Commercial Goods',
        helpersCount,
        receiverName: receiverName || 'Consignee Peshawar',
        receiverPhone: receiverPhone || '0300-1234567',
        paymentMode,
        biltyNumber: biltyCode
      }
    });

    setActiveCargoRide(newCargoRide);
    setFoundBilty(newCargoRide);
    setActiveTab('tracking');
  };

  // Carrier Accept Action
  const handleCarrierAccept = () => {
    if (!incomingCargoAlert) return;
    sound.playSuccess();
    const accepted = rideService.acceptRide(incomingCargoAlert.id, {
      driverId: user.id,
      driverName: user.fullName,
      driverPhone: user.phone,
      driverAvatar: user.avatarUrl,
      driverRating: 4.9,
      vehicleName: carrierVehicleName,
      vehicleModel: '2023',
      vehicleNumber: 'PES-8910',
      vehicleColor: 'White'
    });

    if (accepted) {
      setActiveCargoRide(accepted);
      setIncomingCargoAlert(null);
    }
  };

  // Copy Bilty code
  const handleCopyBilty = (code: string) => {
    sound.playPop();
    navigator.clipboard?.writeText(code);
    setCopyFeedback('Copied to clipboard!');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none pb-12">
      
      {/* ======================================================== */}
      {/* 1. TOP CARGO BRANDING & MODE HEADER                       */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Brand & Return */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onBackToPassenger();
              }}
              className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors active:scale-95 border border-slate-700/60"
              title="Return to Passenger App"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-amber-500">SafarGo</span> Cargo
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold text-[10px] tracking-wide">
                  پشاور کارگو
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Logistics, Bazaars & Heavy Transport System
              </p>
            </div>
          </div>

          {/* Right: User Role Switchers & Profile */}
          <div className="flex items-center gap-2">
            {onOpenDriverPanel && (
              <button
                onClick={() => {
                  sound.playPop();
                  onOpenDriverPanel();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
              >
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                Driver Panel
              </button>
            )}

            {onOpenAdminPanel && (
              <button
                onClick={() => {
                  sound.playPop();
                  onOpenAdminPanel();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
              >
                Admin Panel
              </button>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                {user.fullName ? user.fullName[0].toUpperCase() : 'C'}
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-6xl mx-auto flex items-center gap-2 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('send');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'send'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Send Cargo (کارگو بھیجیں)
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('carrier');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'carrier'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            Carrier Mode (ڈرائیور پینل)
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('tracking');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'tracking'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Bilty & Tracking (بلٹی ٹریکنگ)
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('rates');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'rates'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Peshawar Tariffs (نرخ نامہ)
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-3 sm:px-4 pt-4 flex-1">
        
        {/* ======================================================== */}
        {/* TAB 1: SEND CARGO BOOKING WIZARD                          */}
        {/* ======================================================== */}
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Form Setup */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* 1. Route Selector (Pickup & Destination) */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> 1. Peshawar Route & Commercial Hubs
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {tripMetrics.durationMin} mins • {tripMetrics.distanceKm} km
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* From Place */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Loading Point (کہاں سے سامان لوڈ ہوگا؟)
                    </label>
                    <select
                      value={fromPlace.name}
                      onChange={(e) => {
                        sound.playPop();
                        const found = PESHAWAR_PLACES.find(p => p.name === e.target.value);
                        if (found) setFromPlace(found);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    >
                      {PESHAWAR_PLACES.map(p => (
                        <option key={p.id} value={p.name}>📍 {p.name} — {p.sector || p.address}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Commercial Hub Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <span className="text-[10px] font-bold text-slate-500 shrink-0">Hubs:</span>
                    {PESHAWAR_CARGO_HUBS.map((hub, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          const targetPlace: PeshawarPlace = {
                            id: `hub-${idx}`,
                            name: hub.name,
                            address: hub.address,
                            lat: hub.lat,
                            lng: hub.lng,
                            category: 'popular'
                          };
                          setFromPlace(targetPlace);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 whitespace-nowrap active:scale-95 transition"
                      >
                        {hub.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* To Place */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Delivery Point (کہاں پہنچانا ہے؟)
                    </label>
                    <select
                      value={toPlace.name}
                      onChange={(e) => {
                        sound.playPop();
                        const found = PESHAWAR_PLACES.find(p => p.name === e.target.value);
                        if (found) setToPlace(found);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    >
                      {PESHAWAR_PLACES.map(p => (
                        <option key={p.id} value={p.name}>🏁 {p.name} — {p.sector || p.address}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Cargo Vehicle Selection */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> 2. Choose Cargo Fleet Vehicle
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CARGO_VEHICLES.map((vehicle) => {
                    const isSelected = selectedVehicle === vehicle.id;
                    const estPrice = Math.round(vehicle.baseFare + (tripMetrics.distanceKm * vehicle.perKm) + helperCost);
                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => {
                          sound.playPop();
                          setSelectedVehicle(vehicle.id);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                            : 'bg-slate-900/70 border-slate-700/70 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{vehicle.icon}</span>
                            <div>
                              <div className="text-xs font-extrabold text-white">{vehicle.name}</div>
                              <div className="text-[10px] text-amber-400 font-bold">{vehicle.nameUrdu}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-300 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                            {vehicle.capacityText}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 py-1.5 leading-snug">
                          {vehicle.description}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                          <span className="text-[10px] text-slate-400 font-medium">Est. Freight:</span>
                          <span className="text-sm font-black text-amber-400">PKR {estPrice}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Cargo Details & Helpers */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> 3. Cargo Consignment Details
                </span>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CARGO_CATEGORIES.map((cat) => {
                    const isCatSelected = cargoCategory === cat.id;
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setCargoCategory(cat.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition active:scale-95 ${
                          isCatSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                            : 'bg-slate-900 border-slate-700/70 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isCatSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className="text-[11px] font-bold leading-tight">{cat.label}</span>
                        <span className="text-[9px] text-slate-400">{cat.urdu}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Description & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Description of Goods (سامان کی تفصیل)
                    </label>
                    <input
                      type="text"
                      value={cargoDescription}
                      onChange={(e) => setCargoDescription(e.target.value)}
                      placeholder="e.g. 5 Cartons Cloth, 1 Deep Freezer"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Estimated Weight (وزن کا اندازہ)
                    </label>
                    <input
                      type="text"
                      value={estimatedWeight}
                      onChange={(e) => setEstimatedWeight(e.target.value)}
                      placeholder="e.g. 400 KG or 20 Maunds"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Loaders / Helpers selector */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Loaders / Helpers Required (مزدور / ہیلپرز کی ضرورت)</span>
                    <span className="text-amber-400 text-[10px] font-extrabold">+PKR 450 per helper</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { count: 0, label: 'No Helper', sub: 'Driver only' },
                      { count: 1, label: '1 Helper', sub: 'Loading assistance' },
                      { count: 2, label: '2 Helpers', sub: 'Heavy shifting' },
                    ].map((opt) => (
                      <button
                        key={opt.count}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setHelpersCount(opt.count);
                        }}
                        className={`py-2 px-3 rounded-xl border text-center transition active:scale-95 ${
                          helpersCount === opt.count
                            ? 'bg-amber-500 text-slate-950 font-extrabold border-amber-500'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className={`text-[9px] ${helpersCount === opt.count ? 'text-slate-800' : 'text-slate-400'}`}>{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fragile Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFragile}
                      onChange={(e) => setIsFragile(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      Fragile / Glass Goods (نازک سامان — خصوصی احتیاط)
                    </span>
                  </label>
                  {isFragile && <span className="text-[10px] text-amber-400 font-bold">+Rs 150 Care</span>}
                </div>
              </div>

              {/* 4. Receiver Info */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> 4. Consignee / Receiver Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Receiver Name (وصول کنندہ کا نام)
                    </label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="e.g. Haji Shafiullah"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Receiver Phone (موبائل نمبر برائے ڈیلیوری)
                    </label>
                    <input
                      type="tel"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Payment Mode Selection */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Payment Method (ادائیگی کا طریقہ)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cash_delivery', label: 'Cash on Delivery', urdu: 'منزل پر نقد' },
                      { id: 'cash_pickup', label: 'Cash on Pickup', urdu: 'لوڈنگ پر نقد' },
                      { id: 'wallet', label: 'SafarGo Wallet', urdu: 'ایزی پیسہ / والٹ' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setPaymentMode(mode.id as any);
                        }}
                        className={`py-2 px-2 rounded-xl border text-center transition active:scale-95 ${
                          paymentMode === mode.id
                            ? 'bg-amber-500 text-slate-950 font-extrabold border-amber-500'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{mode.label}</div>
                        <div className={`text-[9px] ${paymentMode === mode.id ? 'text-slate-800' : 'text-slate-400'}`}>{mode.urdu}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Live Map & Dispatch Summary */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Map Preview Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-3 shadow-lg overflow-hidden">
                <div className="flex items-center justify-between pb-2 px-2">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-amber-400" /> Peshawar Commercial Transit Map
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                    Live Road Route
                  </span>
                </div>

                <div className="w-full h-64 rounded-2xl overflow-hidden relative border border-slate-700">
                  <PeshawarRealMap
                    fromPlace={fromPlace}
                    toPlace={toPlace}
                    screenState="categories"
                    vehicleType="cargo"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 px-2 text-[11px] text-slate-400">
                  <span>From: <strong className="text-white">{fromPlace.name.split(' ')[0]}</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>To: <strong className="text-white">{toPlace.name.split(' ')[0]}</strong></span>
                </div>
              </div>

              {/* Total Freight & Book Button */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-850 border-2 border-amber-500/40 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400">Total Calculated Freight</span>
                    <div className="text-2xl font-black text-amber-400">
                      PKR {cargoCalculatedFare}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>{tripMetrics.distanceKm} km transit</div>
                    <div className="text-emerald-400 font-bold">No hidden charges</div>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
                  <div className="flex justify-between">
                    <span>Base Freight ({vehicleConfig.name})</span>
                    <span className="font-bold">PKR {vehicleConfig.baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Road Distance ({tripMetrics.distanceKm} km × PKR {vehicleConfig.perKm})</span>
                    <span className="font-bold">PKR {Math.round(tripMetrics.distanceKm * vehicleConfig.perKm)}</span>
                  </div>
                  {helpersCount > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>{helpersCount} Loader Helper(s)</span>
                      <span className="font-bold">+PKR {helperCost}</span>
                    </div>
                  )}
                  {isFragile && (
                    <div className="flex justify-between text-amber-400">
                      <span>Fragile Goods Handling</span>
                      <span className="font-bold">+PKR 150</span>
                    </div>
                  )}
                </div>

                {/* Instant Book & Generate Bilty Action */}
                <button
                  onClick={handleBookCargo}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Package className="w-5 h-5 stroke-[2.5]" />
                  Book Cargo & Generate Bilty (بلٹی بنائیں)
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  Instant broadcast to active Suzuki Ravi, Bolan & Shehzore carriers in Peshawar.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CARGO CARRIER MODE (Driver/Owner Panel)            */}
        {/* ======================================================== */}
        {activeTab === 'carrier' && (
          <div className="space-y-5">
            
            {/* Carrier Online/Offline Bar */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                  isCarrierOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-700 text-slate-400'
                }`}>
                  🚚
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">Cargo Carrier Portal</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isCarrierOnline ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {isCarrierOnline ? 'ONLINE (آن لائن)' : 'OFFLINE (آف لائن)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Registered Vehicle: <strong className="text-slate-200">{carrierVehicleName}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsCarrierOnline(!isCarrierOnline);
                }}
                className={`py-2.5 px-6 rounded-2xl font-black text-xs transition active:scale-95 shadow-md ${
                  isCarrierOnline
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isCarrierOnline ? 'Go Offline' : 'Go Online & Receive Jobs'}
              </button>
            </div>

            {/* Incoming Real-Time Cargo Job Alert */}
            <AnimatePresence>
              {incomingCargoAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  className="bg-gradient-to-r from-amber-500/20 via-slate-800 to-amber-500/10 border-2 border-amber-500 rounded-3xl p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        🚨 New Cargo Delivery Job Received!
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-white px-2.5 py-1 rounded-full bg-amber-500 text-slate-950">
                      {incomingCountdown}s
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Consignment</span>
                      <strong className="text-xs text-white">{incomingCargoAlert.cargoDetails?.cargoType || 'Commercial Goods'}</strong>
                      <div className="text-[11px] text-slate-300">{incomingCargoAlert.cargoDetails?.description}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Pickup (لوڈنگ پوائنٹ)</span>
                      <strong className="text-xs text-emerald-400">{incomingCargoAlert.pickupName}</strong>
                      <div className="text-[10px] text-slate-400">Sender: {incomingCargoAlert.riderName}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Dropoff (منزل)</span>
                      <strong className="text-xs text-rose-400">{incomingCargoAlert.dropoffName}</strong>
                      <div className="text-[10px] text-slate-400">Distance: {incomingCargoAlert.distanceKm}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Fare (کرایہ)</span>
                      <strong className="text-lg font-black text-amber-400">PKR {incomingCargoAlert.fare}</strong>
                      <div className="text-[10px] text-slate-400">{incomingCargoAlert.cargoDetails?.paymentMode === 'cash_delivery' ? 'Cash on Delivery' : 'Direct Cash'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleCarrierAccept}
                      className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95"
                    >
                      Accept Cargo Job (قبول کریں)
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIncomingCargoAlert(null);
                      }}
                      className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-600 transition active:scale-95"
                    >
                      Decline (مسترد کریں)
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Carrier Active Ride Handling & Telemetry */}
            {activeCargoRide && (
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[10px]">
                      Active Job: {activeCargoRide.id}
                    </span>
                    <span className="text-xs font-bold text-white">Status: {activeCargoRide.status}</span>
                  </div>
                  <span className="text-xs font-black text-amber-400">PKR {activeCargoRide.fare}</span>
                </div>

                {/* Steps control */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      rideService.updateRideStatus(activeCargoRide.id, 'driver_arrived');
                    }}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-left transition"
                  >
                    <div className="text-[10px] text-slate-400">Step 1</div>
                    <div className="text-xs font-bold text-white">At Pickup (پک اپ پہنچ گیا)</div>
                  </button>

                  <button
                    onClick={() => {
                      sound.playSuccess();
                      rideService.updateRideStatus(activeCargoRide.id, 'ride_in_progress');
                    }}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-left transition"
                  >
                    <div className="text-[10px] text-slate-400">Step 2</div>
                    <div className="text-xs font-bold text-white">Goods Loaded (سامان لوڈ)</div>
                  </button>

                  <button
                    onClick={() => {
                      sound.playSuccess();
                      rideService.updateRideStatus(activeCargoRide.id, 'ride_in_progress');
                    }}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-left transition"
                  >
                    <div className="text-[10px] text-slate-400">Step 3</div>
                    <div className="text-xs font-bold text-white">In Transit (روڈ پر روانہ)</div>
                  </button>

                  <button
                    onClick={() => {
                      sound.playSuccess();
                      rideService.updateRideStatus(activeCargoRide.id, 'ride_completed');
                    }}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-left transition"
                  >
                    <div className="text-[10px] text-emerald-200">Step 4</div>
                    <div className="text-xs font-black">Delivered & Collected</div>
                  </button>
                </div>
              </div>
            )}

            {/* Carrier Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Today's Freight</span>
                <span className="text-xl font-black text-amber-400">PKR 7,450</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Deliveries Done</span>
                <span className="text-xl font-black text-white">4 Trips</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Rating</span>
                <span className="text-xl font-black text-emerald-400">4.9 ★</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Acceptance Rate</span>
                <span className="text-xl font-black text-sky-400">96%</span>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DIGITAL BILTY & CARGO TRACKING                    */}
        {/* ======================================================== */}
        {activeTab === 'tracking' && (
          <div className="space-y-5 max-w-3xl mx-auto">
            
            {/* Search Bilty Bar */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-4 shadow-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400 ml-1" />
              <input
                type="text"
                value={trackingSearchCode}
                onChange={(e) => setTrackingSearchCode(e.target.value)}
                placeholder="Enter Bilty or Consignment # (e.g. CRG-481902)"
                className="w-full bg-transparent text-sm font-bold text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  sound.playPop();
                  const targetRide = activeCargoRide || {
                    id: trackingSearchCode || 'CRG-782910',
                    riderId: user.id,
                    riderName: user.fullName || 'Tariq Mehmood',
                    riderPhone: user.phone || '0333-9123456',
                    vehicleType: 'cargo',
                    vehicleName: 'Suzuki Ravi Pickup (PES-8910)',
                    pickupName: 'Karkhano Market Jamrud Rd, Peshawar',
                    dropoffName: 'Mall Road Saddar Cantt, Peshawar',
                    pickupLat: 33.9985,
                    pickupLng: 71.4150,
                    dropoffLat: 34.0042,
                    dropoffLng: 71.5430,
                    fare: 950,
                    distanceKm: '11.4 km',
                    durationMin: '22 min',
                    status: 'ride_in_progress',
                    createdAt: new Date().toISOString(),
                    cargoDetails: {
                      cargoType: 'Commercial Garments & Fabric Rolls',
                      weightKg: '450 KG',
                      description: '6 Large Packed Cartons',
                      helpersCount: 1,
                      receiverName: 'Haji Gulzar Khan',
                      receiverPhone: '0301-8877665',
                      paymentMode: 'cash_delivery',
                      biltyNumber: trackingSearchCode || 'CRG-782910'
                    }
                  } as ActiveRide;
                  setFoundBilty(targetRide);
                }}
                className="py-2 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition active:scale-95"
              >
                Track
              </button>
            </div>

            {/* Official Digital Bilty Document Card */}
            {foundBilty && (
              <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-500/80 relative overflow-hidden space-y-5">
                
                {/* Watermark Logo in background */}
                <div className="absolute right-4 top-24 opacity-5 pointer-events-none text-8xl font-black select-none">
                  SAFARGO
                </div>

                {/* Bilty Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-950">SAFARGO CARGO BILTY</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                        OFFICIAL CONSIGNMENT
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">
                      Peshawar Goods Transport & Commercial Logistics System (حکومت خیبر پختونخوا سروس)
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold">Bilty Number</div>
                    <div className="text-base font-black text-amber-600 font-mono tracking-wider">
                      {foundBilty.cargoDetails?.biltyNumber || foundBilty.id}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Date: {new Date(foundBilty.createdAt).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>

                {/* Sender & Receiver Dual Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Sender (ارسال کنندہ)
                    </span>
                    <div className="text-sm font-black text-slate-900">{foundBilty.riderName}</div>
                    <div className="text-xs text-slate-600">{foundBilty.riderPhone}</div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{foundBilty.pickupName}</span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:border-l sm:pl-4 border-slate-200">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Consignee / Receiver (وصول کنندہ)
                    </span>
                    <div className="text-sm font-black text-slate-900">
                      {foundBilty.cargoDetails?.receiverName || 'Consignee'}
                    </div>
                    <div className="text-xs text-slate-600">
                      {foundBilty.cargoDetails?.receiverPhone || 'Phone on delivery'}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{foundBilty.dropoffName}</span>
                    </div>
                  </div>
                </div>

                {/* Cargo Consignment Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5">Weight</th>
                        <th className="p-2.5">Carrier Vehicle</th>
                        <th className="p-2.5 text-right">Freight (کرایہ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800">
                          {foundBilty.cargoDetails?.cargoType} — {foundBilty.cargoDetails?.description}
                        </td>
                        <td className="p-2.5 text-slate-600 font-semibold">{foundBilty.cargoDetails?.weightKg || 'Standard'}</td>
                        <td className="p-2.5 text-slate-600">{foundBilty.vehicleName || 'Suzuki Ravi'}</td>
                        <td className="p-2.5 text-right font-black text-slate-900">PKR {foundBilty.fare}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Status Stamp & Summary */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl border-2 border-emerald-600 text-emerald-700 font-black text-xs tracking-wider uppercase transform -rotate-1 shadow-sm">
                      ✓ STATUS: {foundBilty.status.toUpperCase()}
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Payment: <strong>Cash on Delivery (COD)</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyBilty(foundBilty.cargoDetails?.biltyNumber || foundBilty.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {copyFeedback || 'Copy Bilty Code'}
                    </button>
                    <button
                      onClick={() => {
                        sound.playSuccess();
                        window.print();
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Print Bilty
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: PESHAWAR COMMERCIAL TARIFF RATES                   */}
        {/* ======================================================== */}
        {activeTab === 'rates' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 shadow-lg space-y-2">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                SafarGo Peshawar Cargo Fleet Standard Tariffs (سرکاری نرخ نامہ)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard, transparent freight rates approved for Peshawar municipal boundaries, including Karkhano Market, Hayatabad Industrial Estate, Shoba Bazaar, and Ring Road wholesale markets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CARGO_VEHICLES.map((v) => (
                <div key={v.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{v.icon}</span>
                      <div>
                        <h4 className="text-sm font-extrabold text-white">{v.name}</h4>
                        <span className="text-[10px] text-amber-400 font-bold">{v.nameUrdu}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800">
                      {v.capacityText}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{v.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Base Loading Fare</span>
                      <strong className="text-white">PKR {v.baseFare}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Per Road Kilometer</span>
                      <strong className="text-amber-400">PKR {v.perKm} / km</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hub-to-Hub Estimated Rate Table */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider text-amber-400">
                Estimated Transit Rates Between Major Peshawar Hubs (Suzuki Ravi)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left divide-y divide-slate-700">
                  <thead className="text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="py-2">From Commercial Hub</th>
                      <th className="py-2">To Destination</th>
                      <th className="py-2">Avg. Distance</th>
                      <th className="py-2 text-right">Approx. Freight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-slate-200">
                    <tr>
                      <td className="py-2.5 font-bold">Karkhano Market Jamrud Rd</td>
                      <td className="py-2.5">Saddar Cantt Wholesale</td>
                      <td className="py-2.5 text-slate-400">12.5 km</td>
                      <td className="py-2.5 text-right font-black text-amber-400">PKR 1,150</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Hayatabad Industrial Estate</td>
                      <td className="py-2.5">Chamkani Fruit & Grain Mandi</td>
                      <td className="py-2.5 text-slate-400">22.0 km</td>
                      <td className="py-2.5 text-right font-black text-amber-400">PKR 1,650</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Shoba Bazaar Auto Market</td>
                      <td className="py-2.5">Ring Road Toll Plaza</td>
                      <td className="py-2.5 text-slate-400">7.8 km</td>
                      <td className="py-2.5 text-right font-black text-amber-400">PKR 880</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Namak Mandi Food Hub</td>
                      <td className="py-2.5">University Town / Campus</td>
                      <td className="py-2.5 text-slate-400">8.2 km</td>
                      <td className="py-2.5 text-right font-black text-amber-400">PKR 900</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
};
