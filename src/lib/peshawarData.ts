export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'avatar-1',
    name: 'Executive Rider',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-2',
    name: 'Peshawar Driver Pro',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-3',
    name: 'Cargo Fleet Master',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-4',
    name: 'Urban Commuter',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-5',
    name: 'Khyber Voyager',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-6',
    name: 'Student Commuter',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  }
];

export type PlaceCategory = 'popular' | 'university' | 'hospital' | 'shopping' | 'transport' | 'historic';

export interface PeshawarPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  popular?: boolean;
  searchedCount?: number;
}

export const PESHAWAR_PLACES: PeshawarPlace[] = [
  {
    id: 'place-1',
    name: 'Islamia College Peshawar',
    address: 'Grand Trunk Rd, University Campus, Peshawar',
    lat: 34.0086,
    lng: 71.4820,
    category: 'university',
    popular: true
  },
  {
    id: 'place-2',
    name: 'Qissa Khwani Bazaar',
    address: 'Old City, Khyber Bazar, Peshawar',
    lat: 34.0108,
    lng: 71.5714,
    category: 'historic',
    popular: true
  },
  {
    id: 'place-3',
    name: 'Peshawar Museum',
    address: 'Saddar Road, Cantt, Peshawar',
    lat: 34.0135,
    lng: 71.5645,
    category: 'historic',
    popular: true
  },
  {
    id: 'place-4',
    name: 'Saddar Cantt Bazaar',
    address: 'Saddar Road & Mall Road, Cantt, Peshawar',
    lat: 34.0042,
    lng: 71.5430,
    category: 'shopping',
    popular: true
  },
  {
    id: 'place-5',
    name: 'Hayatabad Phase 3',
    address: 'Near Tatara Park, Hayatabad, Peshawar',
    lat: 33.9921,
    lng: 71.4389,
    category: 'popular',
    popular: true
  },
  {
    id: 'place-6',
    name: 'Khyber Teaching Hospital (KTH)',
    address: 'University Road, Peshawar',
    lat: 34.0092,
    lng: 71.4925,
    category: 'hospital',
    popular: true
  },
  {
    id: 'place-7',
    name: 'BRT Station - Malik Saad',
    address: 'Cinema Road, Peshawar',
    lat: 34.0125,
    lng: 71.5682,
    category: 'transport',
    popular: false
  },
  {
    id: 'place-8',
    name: 'Bacha Khan Airport (PEW)',
    address: 'Civil Aviation Road, Peshawar',
    lat: 33.9940,
    lng: 71.5146,
    category: 'transport',
    popular: true
  },
  {
    id: 'place-9',
    name: 'Deans Shopping Mall',
    address: 'Saddar Road, Peshawar Cantt',
    lat: 34.0071,
    lng: 71.5492,
    category: 'shopping',
    popular: true
  },
  {
    id: 'place-10',
    name: 'Rehman Medical Institute (RMI)',
    address: 'Sector B-2, Phase 5, Hayatabad, Peshawar',
    lat: 33.9875,
    lng: 71.4312,
    category: 'hospital',
    popular: true
  },
  {
    id: 'place-11',
    name: 'Lady Reading Hospital (LRH)',
    address: 'Soekarno Square, Old City, Peshawar',
    lat: 34.0142,
    lng: 71.5794,
    category: 'hospital',
    popular: true
  },
  {
    id: 'place-12',
    name: 'University of Peshawar (UoP)',
    address: 'Jamrud Road, University Campus, Peshawar',
    lat: 34.0048,
    lng: 71.4795,
    category: 'university',
    popular: true
  },
  {
    id: 'place-13',
    name: 'Bala Hissar Fort',
    address: 'Khyber Pass Road, Peshawar',
    lat: 34.0156,
    lng: 71.5719,
    category: 'historic',
    popular: true
  },
  {
    id: 'place-14',
    name: 'Hayatabad Medical Complex (HMC)',
    address: 'Phase 4, Hayatabad, Peshawar',
    lat: 33.9840,
    lng: 71.4420,
    category: 'hospital',
    popular: false
  },
  {
    id: 'place-15',
    name: 'Peshawar Cantt Railway Station',
    address: 'Railway Colony, Peshawar Cantt',
    lat: 34.0018,
    lng: 71.5472,
    category: 'transport',
    popular: true
  },
  {
    id: 'place-16',
    name: 'Shahi Bagh & Stadium',
    address: 'Faiz Talab Road, Peshawar',
    lat: 34.0245,
    lng: 71.5830,
    category: 'historic',
    popular: false
  },
  {
    id: 'place-17',
    name: 'Board Bazar Jamrud Road',
    address: 'Jamrud Road, Near Board of Intermediate, Peshawar',
    lat: 34.0075,
    lng: 71.4720,
    category: 'shopping',
    popular: false
  },
  {
    id: 'place-18',
    name: 'Bab-e-Khyber Gateway',
    address: 'Jamrud Road, Khyber Pass entrance',
    lat: 33.9985,
    lng: 71.3789,
    category: 'historic',
    popular: true
  },
  {
    id: 'place-19',
    name: 'Ring Road Toll Plaza (Peshawar)',
    address: 'Northern Bypass & Ring Road, Peshawar',
    lat: 34.0410,
    lng: 71.6020,
    category: 'transport',
    popular: false
  },
  {
    id: 'place-20',
    name: 'Mega Mart & Food Court Hayatabad',
    address: 'Phase 5 Commercial Hub, Hayatabad',
    lat: 33.9825,
    lng: 71.4380,
    category: 'shopping',
    popular: false
  }
];

export const PESHAWAR_HOTSPOTS = PESHAWAR_PLACES.map(p => p.name);

// Recent Searches LocalStorage Manager
const RECENT_SEARCHES_KEY = 'safargo_recent_searches_v2';

export function getRecentSearches(): PeshawarPlace[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  // Default recent searches if none stored yet
  return [
    PESHAWAR_PLACES[0], // Islamia College
    PESHAWAR_PLACES[3], // Saddar Cantt
    PESHAWAR_PLACES[4], // Hayatabad Phase 3
    PESHAWAR_PLACES[7], // Bacha Khan Airport
    PESHAWAR_PLACES[8]  // Deans Shopping Mall
  ];
}

export function saveRecentSearch(place: PeshawarPlace) {
  try {
    const current = getRecentSearches();
    const filtered = current.filter(p => p.id !== place.id);
    const updated = [place, ...filtered].slice(0, 8); // Keep top 8
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

// Calculate realistic distance and fares
export function calculateTripMetrics(fromName: string, toName: string) {
  const from = PESHAWAR_PLACES.find(p => p.name.toLowerCase().includes(fromName.toLowerCase())) || PESHAWAR_PLACES[0];
  const to = PESHAWAR_PLACES.find(p => p.name.toLowerCase().includes(toName.toLowerCase())) || PESHAWAR_PLACES[1];

  // Haversine distance in km
  const R = 6371;
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const rawDist = R * c;
  const distanceKm = Math.max(1.8, Math.round(rawDist * 1.35 * 10) / 10); // add road winding factor

  const durationMin = Math.max(4, Math.round(distanceKm * 2.5));

  return {
    distanceKm,
    durationMin,
    fares: {
      bike: Math.round(60 + distanceKm * 22),
      car: Math.round(150 + distanceKm * 38),
      cargo: Math.round(280 + distanceKm * 55)
    }
  };
}

// History Ride Item Interface
export interface HistoryRide {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  type: 'bike' | 'car' | 'cargo';
  distance: string;
  duration: string;
  fare: number;
  driverName: string;
  driverVehicle: string;
  rating: number;
  status: 'Completed' | 'Cancelled';
}

export const SAMPLE_RIDE_HISTORY: HistoryRide[] = [
  {
    id: 'RIDE-8942',
    from: 'Islamia College Peshawar',
    to: 'Saddar Cantt Bazaar',
    date: 'Today',
    time: '4:15 PM',
    type: 'car',
    distance: '6.4 km',
    duration: '16 min',
    fare: 280,
    driverName: 'Usman Khan',
    driverVehicle: 'Honda Civic (PWA-7421)',
    rating: 5,
    status: 'Completed'
  },
  {
    id: 'RIDE-8819',
    from: 'Hayatabad Phase 3',
    to: 'Khyber Teaching Hospital (KTH)',
    date: 'Yesterday',
    time: '11:30 AM',
    type: 'bike',
    distance: '4.8 km',
    duration: '12 min',
    fare: 140,
    driverName: 'Shahid Afridi',
    driverVehicle: 'Honda 125 (PK-9912)',
    rating: 5,
    status: 'Completed'
  },
  {
    id: 'RIDE-8702',
    from: 'Deans Shopping Mall',
    to: 'Bacha Khan Airport (PEW)',
    date: '16 Oct 2026',
    time: '2:40 PM',
    type: 'car',
    distance: '5.2 km',
    duration: '14 min',
    fare: 230,
    driverName: 'Kamran Akmal',
    driverVehicle: 'Toyota Corolla (LES-4509)',
    rating: 4,
    status: 'Completed'
  },
  {
    id: 'RIDE-8591',
    from: 'Qissa Khwani Bazaar',
    to: 'Rehman Medical Institute (RMI)',
    date: '14 Oct 2026',
    time: '1:10 PM',
    type: 'cargo',
    distance: '11.5 km',
    duration: '28 min',
    fare: 620,
    driverName: 'Gulzar Ahmad',
    driverVehicle: 'Suzuki Bolan Cargo (PES-3101)',
    rating: 5,
    status: 'Completed'
  }
];

// Wallet Transaction Interface
export interface WalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  method: string;
}

export const SAMPLE_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TX-4091',
    title: 'EasyPaisa Top Up',
    subtitle: 'Added to SafarGo Balance',
    amount: 1000,
    type: 'credit',
    date: 'Today, 2:30 PM',
    method: 'EasyPaisa 0345-XXXX992'
  },
  {
    id: 'TX-4082',
    title: 'Ride Payment - Usman Khan',
    subtitle: 'Trip to Saddar Cantt',
    amount: 280,
    type: 'debit',
    date: 'Today, 4:32 PM',
    method: 'SafarGo Wallet'
  },
  {
    id: 'TX-4015',
    title: 'JazzCash Top Up',
    subtitle: 'Wallet reload',
    amount: 1500,
    type: 'credit',
    date: '15 Oct 2026',
    method: 'JazzCash 0300-XXXX118'
  },
  {
    id: 'TX-3990',
    title: 'Ride Payment - Shahid Afridi',
    subtitle: 'Trip to KTH University Rd',
    amount: 140,
    type: 'debit',
    date: 'Yesterday, 11:45 AM',
    method: 'SafarGo Wallet'
  }
];

// Notification Item Interface
export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'ride' | 'promo' | 'security' | 'system';
  read: boolean;
  actionText?: string;
}

export const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-1',
    title: '🎉 20% Off Weekend Promo in Peshawar!',
    description: 'Use code "PESHAWAR20" on your next 3 car or bike rides anywhere in Peshawar.',
    time: '10 mins ago',
    type: 'promo',
    read: false,
    actionText: 'Apply Code'
  },
  {
    id: 'NOTIF-2',
    title: 'Trip Completed Successfully',
    description: 'You completed your ride to Saddar Cantt Bazaar. Receipt of PKR 280 has been sent to your email.',
    time: '1 hour ago',
    type: 'ride',
    read: false,
    actionText: 'View Receipt'
  },
  {
    id: 'NOTIF-3',
    title: 'New Feature: Live Peshawar City Map',
    description: 'Explore Peshawar landmarks, live driver GPS routing, and instant fare estimations.',
    time: 'Yesterday',
    type: 'system',
    read: true
  },
  {
    id: 'NOTIF-4',
    title: 'Wallet Reload Credited (PKR 1,000)',
    description: 'EasyPaisa transfer confirmed. Your new wallet balance is PKR 1,450.00.',
    time: '2 days ago',
    type: 'system',
    read: true
  }
];

// OTP Event Dispatcher for interactive realistic simulation
export interface OtpNotification {
  code: string;
  email: string;
  timestamp: string;
}

export const emitOtpNotification = (email: string, code: string) => {
  const detail: OtpNotification = {
    code,
    email,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
  window.dispatchEvent(new CustomEvent('safargo-otp-received', { detail }));
};
