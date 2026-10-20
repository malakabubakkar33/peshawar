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

export type PlaceCategory = 
  | 'popular' 
  | 'sector' 
  | 'university' 
  | 'hospital' 
  | 'shopping' 
  | 'transport' 
  | 'historic' 
  | 'brt';

export interface PeshawarPlace {
  id: string;
  name: string;
  address: string;
  sector?: string;
  phase?: string;
  street?: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  popular?: boolean;
  searchedCount?: number;
  tags?: string[];
}

export const PESHAWAR_PLACES: PeshawarPlace[] = [
  // =========================================================================
  // HAYATABAD TOWNSHIP (ALL PHASES, SECTORS & STREETS)
  // =========================================================================
  {
    id: 'place-h-1',
    name: 'Hayatabad Phase 1 (Sector A-1 / B-1)',
    address: 'Near Jamrud Road Entrance & Phase 1 Market, Hayatabad',
    sector: 'Sector A-1, B-1',
    phase: 'Phase 1',
    street: 'Jamrud Road Entry',
    lat: 33.9965,
    lng: 71.4620,
    category: 'sector',
    popular: true,
    tags: ['hayatabad', 'phase 1', 'sector a', 'sector b', 'market']
  },
  {
    id: 'place-h-2',
    name: 'Hayatabad Phase 2 (Sector D-2 / Bilal Market)',
    address: 'Street 4, Sector D-2, Near Bilal Mosque, Hayatabad',
    sector: 'Sector D-2, E-2',
    phase: 'Phase 2',
    street: 'Street 4, Bilal Market',
    lat: 33.9942,
    lng: 71.4520,
    category: 'sector',
    popular: true,
    tags: ['hayatabad', 'phase 2', 'sector d', 'bilal market']
  },
  {
    id: 'place-h-3',
    name: 'Hayatabad Phase 3 (Tatara Park / Sector G-3)',
    address: 'Sector G-3, Near Tatara Park & Street 7, Hayatabad',
    sector: 'Sector G-3, H-3',
    phase: 'Phase 3',
    street: 'Tatara Park Road',
    lat: 33.9921,
    lng: 71.4389,
    category: 'popular',
    popular: true,
    tags: ['hayatabad', 'phase 3', 'tatara park', 'sector g3']
  },
  {
    id: 'place-h-4',
    name: 'Hayatabad Phase 4 (Bagh-e-Naran / Sector J-4)',
    address: 'Sector J-4, Main Bagh-e-Naran Gate, Hayatabad',
    sector: 'Sector J-4, K-4',
    phase: 'Phase 4',
    street: 'Bagh-e-Naran Boulevard',
    lat: 33.9855,
    lng: 71.4450,
    category: 'popular',
    popular: true,
    tags: ['hayatabad', 'phase 4', 'bagh e naran', 'sector j4']
  },
  {
    id: 'place-h-5',
    name: 'Hayatabad Phase 5 (Deans Heights / Sector B-2)',
    address: 'Commercial Hub, Sector B-2, Phase 5, Hayatabad',
    sector: 'Sector B-2, C-2',
    phase: 'Phase 5',
    street: 'RMI Boulevard',
    lat: 33.9825,
    lng: 71.4380,
    category: 'shopping',
    popular: true,
    tags: ['hayatabad', 'phase 5', 'deans heights', 'sector b2']
  },
  {
    id: 'place-h-6',
    name: 'Hayatabad Phase 6 (CECOS University / Sector F-6)',
    address: 'Sector F-6, CECOS Road, Near Phase 6 Central Park, Hayatabad',
    sector: 'Sector F-6, G-6',
    phase: 'Phase 6',
    street: 'CECOS Road',
    lat: 33.9780,
    lng: 71.4280,
    category: 'university',
    popular: true,
    tags: ['hayatabad', 'phase 6', 'cecos', 'sector f6']
  },
  {
    id: 'place-h-7',
    name: 'Hayatabad Phase 7 (KMU / Sector L-7)',
    address: 'Sector L-7, Near Khyber Medical University, Hayatabad',
    sector: 'Sector L-7, M-7',
    phase: 'Phase 7',
    street: 'KMU Road',
    lat: 33.9720,
    lng: 71.4190,
    category: 'university',
    popular: true,
    tags: ['hayatabad', 'phase 7', 'kmu', 'sector l7']
  },
  {
    id: 'place-h-8',
    name: 'Hayatabad Medical Complex (HMC)',
    address: 'Phase 4 Hospital Boulevard, Hayatabad, Peshawar',
    sector: 'Phase 4 Hospital Zone',
    phase: 'Phase 4',
    street: 'HMC Boulevard',
    lat: 33.9840,
    lng: 71.4420,
    category: 'hospital',
    popular: true,
    tags: ['hmc', 'hospital', 'hayatabad', 'emergency']
  },
  {
    id: 'place-h-9',
    name: 'Rehman Medical Institute (RMI)',
    address: 'Sector B-2, Phase 5, Hayatabad, Peshawar',
    sector: 'Sector B-2',
    phase: 'Phase 5',
    street: 'RMI Road',
    lat: 33.9875,
    lng: 71.4312,
    category: 'hospital',
    popular: true,
    tags: ['rmi', 'hospital', 'hayatabad', 'rehman medical']
  },
  {
    id: 'place-h-10',
    name: 'Northwest General Hospital & Research Centre',
    address: 'Sector A-3, Phase 5, Hayatabad, Peshawar',
    sector: 'Sector A-3',
    phase: 'Phase 5',
    street: 'Northwest Hospital Road',
    lat: 33.9890,
    lng: 71.4335,
    category: 'hospital',
    popular: true,
    tags: ['northwest', 'hospital', 'hayatabad']
  },
  {
    id: 'place-h-11',
    name: 'IM|Sciences Hayatabad',
    address: '1-A, Sector E-5, Phase 7, Hayatabad, Peshawar',
    sector: 'Sector E-5',
    phase: 'Phase 7',
    street: 'IM|Sciences Campus Road',
    lat: 33.9745,
    lng: 71.4225,
    category: 'university',
    popular: true,
    tags: ['imsciences', 'university', 'hayatabad']
  },
  {
    id: 'place-h-12',
    name: 'FAST-NUCES Peshawar Campus',
    address: 'Plot 160, Industrial Estate Road, Hayatabad, Peshawar',
    sector: 'Industrial Estate',
    phase: 'Phase 2 / Industrial',
    street: 'Industrial Estate Road',
    lat: 33.9880,
    lng: 71.4610,
    category: 'university',
    popular: true,
    tags: ['fast', 'nuces', 'university', 'industrial estate']
  },

  // =========================================================================
  // UNIVERSITY TOWN & UNIVERSITY CAMPUS
  // =========================================================================
  {
    id: 'place-u-1',
    name: 'Islamia College Peshawar (ICP)',
    address: 'Grand Trunk Road, University Campus, Peshawar',
    sector: 'University Campus',
    street: 'Main G.T. Road / Khyber Hall',
    lat: 34.0086,
    lng: 71.4820,
    category: 'university',
    popular: true,
    tags: ['islamia college', 'icp', 'university road', 'peshawar']
  },
  {
    id: 'place-u-2',
    name: 'University of Peshawar (UoP Main Campus)',
    address: 'Jamrud Road, University Campus, Peshawar',
    sector: 'Academic Complex',
    street: 'Administration Block Road',
    lat: 34.0048,
    lng: 71.4795,
    category: 'university',
    popular: true,
    tags: ['uop', 'university of peshawar', 'campus', 'jamrud road']
  },
  {
    id: 'place-u-3',
    name: 'UET Peshawar (Engineering University)',
    address: 'University Road, Near KTH Hospital, Peshawar',
    sector: 'Campus Zone',
    street: 'Engineering Avenue',
    lat: 34.0072,
    lng: 71.4870,
    category: 'university',
    popular: true,
    tags: ['uet', 'engineering', 'university road']
  },
  {
    id: 'place-u-4',
    name: 'Khyber Teaching Hospital (KTH)',
    address: 'Main University Road, Peshawar',
    sector: 'University Town / Campus',
    street: 'University Road Emergency Gate',
    lat: 34.0092,
    lng: 71.4925,
    category: 'hospital',
    popular: true,
    tags: ['kth', 'hospital', 'emergency', 'university road']
  },
  {
    id: 'place-u-5',
    name: 'University Town - Park Avenue',
    address: 'Park Avenue, Near Town Club & Cafe Crunch, University Town, Peshawar',
    sector: 'University Town',
    street: 'Park Avenue',
    lat: 34.0115,
    lng: 71.5030,
    category: 'popular',
    popular: true,
    tags: ['university town', 'park avenue', 'town club']
  },
  {
    id: 'place-u-6',
    name: 'University Town - Circular Road & Abdara Chowk',
    address: 'Circular Road, Near Jawad Tower & Abdara Chowk, Peshawar',
    sector: 'Abdara Road',
    street: 'Circular Road',
    lat: 34.0140,
    lng: 71.5080,
    category: 'sector',
    popular: true,
    tags: ['university town', 'circular road', 'abdara chowk']
  },
  {
    id: 'place-u-7',
    name: 'Board Bazar Jamrud Road',
    address: 'Jamrud Road, Near BISE Board of Intermediate, Peshawar',
    sector: 'Board Bazar',
    street: 'Jamrud Road',
    lat: 34.0075,
    lng: 71.4720,
    category: 'shopping',
    popular: true,
    tags: ['board bazar', 'bise peshawar', 'jamrud road']
  },

  // =========================================================================
  // SADDAR, CANTT & THE MALL ROAD
  // =========================================================================
  {
    id: 'place-s-1',
    name: 'Saddar Cantt Bazaar (Shafi Market & Electronic Market)',
    address: 'Saddar Road, Cantt, Peshawar',
    sector: 'Saddar Commercial',
    street: 'Saddar Road',
    lat: 34.0042,
    lng: 71.5430,
    category: 'shopping',
    popular: true,
    tags: ['saddar', 'cantt', 'shafi market', 'bazaar']
  },
  {
    id: 'place-s-2',
    name: 'The Mall Road Peshawar Cantt',
    address: 'The Mall Road, Near Peshawar Club & Garrison Ground, Cantt',
    sector: 'Peshawar Cantt',
    street: 'The Mall Road',
    lat: 34.0075,
    lng: 71.5410,
    category: 'popular',
    popular: true,
    tags: ['mall road', 'cantt', 'peshawar club', 'governor house']
  },
  {
    id: 'place-s-3',
    name: 'Deans Trade Center & Shopping Mall',
    address: 'Islamia Road, Peshawar Cantt',
    sector: 'Cantt Commercial',
    street: 'Islamia Road',
    lat: 34.0071,
    lng: 71.5492,
    category: 'shopping',
    popular: true,
    tags: ['deans', 'trade center', 'cantt', 'mall']
  },
  {
    id: 'place-s-4',
    name: 'Peshawar Cantt Railway Station',
    address: 'Railway Colony, Near Cantt Post Office, Peshawar',
    sector: 'Cantonment',
    street: 'Railway Road',
    lat: 34.0018,
    lng: 71.5472,
    category: 'transport',
    popular: true,
    tags: ['railway station', 'cantt', 'train']
  },
  {
    id: 'place-s-5',
    name: 'Sunehri Masjid Road Cantt',
    address: 'Sunehri Masjid Road, Cantt, Peshawar',
    sector: 'Cantt',
    street: 'Sunehri Masjid Road',
    lat: 34.0055,
    lng: 71.5460,
    category: 'sector',
    popular: false,
    tags: ['sunehri masjid', 'cantt', 'saddar']
  },
  {
    id: 'place-s-6',
    name: 'Peshawar Museum',
    address: 'Saddar Road, Cantt, Peshawar',
    sector: 'Cantt Heritage',
    street: 'Saddar Road',
    lat: 34.0135,
    lng: 71.5645,
    category: 'historic',
    popular: true,
    tags: ['museum', 'peshawar museum', 'heritage']
  },

  // =========================================================================
  // KARKHANO MARKETS (BORDER TRADE ZONE)
  // =========================================================================
  {
    id: 'place-k-1',
    name: 'Karkhano Market - Shaheen Market',
    address: 'Jamrud Road, Karkhano Market, Peshawar',
    sector: 'Karkhano Zone 1',
    street: 'Main Jamrud Road',
    lat: 34.0020,
    lng: 71.4120,
    category: 'shopping',
    popular: true,
    tags: ['karkhano', 'shaheen market', 'electronics', 'crockery']
  },
  {
    id: 'place-k-2',
    name: 'Karkhano Market - Sitara & United Plaza',
    address: 'Sitara Market, Karkhano Bazaar, Peshawar',
    sector: 'Karkhano Zone 2',
    street: 'Sitara Lane',
    lat: 34.0010,
    lng: 71.4085,
    category: 'shopping',
    popular: true,
    tags: ['karkhano', 'sitara plaza', 'united market']
  },
  {
    id: 'place-k-3',
    name: 'Bab-e-Khyber Gateway (Khyber Pass Entrance)',
    address: 'Jamrud Highway, Gateway to Khyber Pass, Peshawar',
    sector: 'Khyber Pass Border',
    street: 'Jamrud Highway',
    lat: 33.9985,
    lng: 71.3789,
    category: 'historic',
    popular: true,
    tags: ['bab e khyber', 'khyber pass', 'jamrud', 'gateway']
  },

  // =========================================================================
  // OLD CITY, HERITAGE & BAZAARS
  // =========================================================================
  {
    id: 'place-o-1',
    name: 'Qissa Khwani Bazaar (Storytellers Market)',
    address: 'Old Walled City, Khyber Bazar, Peshawar',
    sector: 'Old City',
    street: 'Khyber Bazar Road',
    lat: 34.0108,
    lng: 71.5714,
    category: 'historic',
    popular: true,
    tags: ['qissa khwani', 'bazaar', 'old city', 'kahwa', 'chappal']
  },
  {
    id: 'place-o-2',
    name: 'Chowk Yadgar',
    address: 'Chowk Yadgar, Central Old City, Peshawar',
    sector: 'Old City Core',
    street: 'Chowk Yadgar Roundabout',
    lat: 34.0145,
    lng: 71.5760,
    category: 'historic',
    popular: true,
    tags: ['chowk yadgar', 'old city', 'money market']
  },
  {
    id: 'place-o-3',
    name: 'Bala Hissar Fort',
    address: 'G.T. Road, Frontier Corps HQ, Peshawar',
    sector: 'Fortress Zone',
    street: 'Grand Trunk Road',
    lat: 34.0156,
    lng: 71.5719,
    category: 'historic',
    popular: true,
    tags: ['bala hissar', 'fort', 'frontier corps', 'gt road']
  },
  {
    id: 'place-o-4',
    name: 'Ghanta Ghar (Cunningham Clock Tower)',
    address: 'Ghanta Ghar Chowk, Old Heritage City, Peshawar',
    sector: 'Clock Tower Bazaar',
    street: 'Bazar Kalan',
    lat: 34.0128,
    lng: 71.5780,
    category: 'historic',
    popular: false,
    tags: ['ghanta ghar', 'clock tower', 'heritage']
  },
  {
    id: 'place-o-5',
    name: 'Lady Reading Hospital (LRH)',
    address: 'Soekarno Square, Old City, Peshawar',
    sector: 'LRH Complex',
    street: 'Soekarno Square',
    lat: 34.0142,
    lng: 71.5794,
    category: 'hospital',
    popular: true,
    tags: ['lrh', 'hospital', 'emergency', 'lady reading']
  },

  // =========================================================================
  // RING ROAD, GULBAHAR & TRANSPORT HUBS
  // =========================================================================
  {
    id: 'place-r-1',
    name: 'Ring Road - Hayatabad Toll Plaza',
    address: 'Northern Bypass & Ring Road Toll Interchange, Peshawar',
    sector: 'Ring Road West',
    street: 'Ring Road Toll Expressway',
    lat: 33.9710,
    lng: 71.4150,
    category: 'transport',
    popular: true,
    tags: ['ring road', 'toll plaza', 'bypass', 'hayatabad']
  },
  {
    id: 'place-r-2',
    name: 'Ring Road - Kohat Road Interchange',
    address: 'Ring Road at Kohat Road Overpass, Peshawar',
    sector: 'Ring Road South',
    street: 'Kohat Road Flyover',
    lat: 33.9850,
    lng: 71.5580,
    category: 'transport',
    popular: true,
    tags: ['ring road', 'kohat road', 'interchange']
  },
  {
    id: 'place-r-3',
    name: 'Ring Road - Charsadda Road Interchange',
    address: 'Ring Road at Charsadda Road Crossing, Peshawar',
    sector: 'Ring Road North',
    street: 'Charsadda Road Flyover',
    lat: 34.0410,
    lng: 71.6020,
    category: 'transport',
    popular: true,
    tags: ['ring road', 'charsadda road', 'flyover']
  },
  {
    id: 'place-r-4',
    name: 'Gulbahar No. 1, 2 & 3',
    address: 'Main G.T. Road, Gulbahar, Peshawar',
    sector: 'Gulbahar',
    street: 'Ishrat Cinema Road',
    lat: 34.0180,
    lng: 71.5880,
    category: 'sector',
    popular: true,
    tags: ['gulbahar', 'gt road', 'nishtarabad']
  },
  {
    id: 'place-r-5',
    name: 'Bacha Khan International Airport (PEW)',
    address: 'Civil Aviation Road, Peshawar',
    sector: 'Airport Zone',
    street: 'Aviation Way',
    lat: 33.9940,
    lng: 71.5146,
    category: 'transport',
    popular: true,
    tags: ['airport', 'bacha khan', 'pew', 'flight']
  },

  // =========================================================================
  // BRT PESHAWAR STATIONS (ZOO PESHWAR)
  // =========================================================================
  {
    id: 'place-brt-1',
    name: 'BRT Chamkani Terminal (BS-01)',
    address: 'G.T. Road, East Terminal Depot, Chamkani, Peshawar',
    sector: 'Chamkani',
    street: 'G.T. Road',
    lat: 34.0050,
    lng: 71.6420,
    category: 'brt',
    popular: true,
    tags: ['brt', 'chamkani', 'station', 'bus']
  },
  {
    id: 'place-brt-2',
    name: 'BRT Malik Saad Shaheed (BS-15)',
    address: 'Cinema Road & Khyber Bazar Intersection, Peshawar',
    sector: 'City Center',
    street: 'Cinema Road',
    lat: 34.0125,
    lng: 71.5682,
    category: 'brt',
    popular: true,
    tags: ['brt', 'malik saad', 'station', 'khyber bazar']
  },
  {
    id: 'place-brt-3',
    name: 'BRT Saddar Bazar Station (BS-17)',
    address: 'Saddar Road, Cantt, Peshawar',
    sector: 'Saddar Cantt',
    street: 'Saddar Road',
    lat: 34.0045,
    lng: 71.5435,
    category: 'brt',
    popular: true,
    tags: ['brt', 'saddar', 'station', 'cantt']
  },
  {
    id: 'place-brt-4',
    name: 'BRT University of Peshawar (BS-24)',
    address: 'Jamrud Road, Near Islamia College & UoP Main Gate',
    sector: 'University Campus',
    street: 'Jamrud Road',
    lat: 34.0080,
    lng: 71.4810,
    category: 'brt',
    popular: true,
    tags: ['brt', 'university', 'islamia college', 'station']
  },
  {
    id: 'place-brt-5',
    name: 'BRT Karkhano Market West Terminal (BS-31)',
    address: 'Jamrud Road, Karkhano West Terminal, Peshawar',
    sector: 'Karkhano',
    street: 'Jamrud Highway',
    lat: 34.0025,
    lng: 71.4110,
    category: 'brt',
    popular: true,
    tags: ['brt', 'karkhano', 'terminal', 'west station']
  }
];

// Helper: Calculate distance between coordinates in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Helper: Snap to closest real Peshawar Place
export function getNearestPeshawarPlace(lat: number, lng: number): PeshawarPlace {
  let closest = PESHAWAR_PLACES[0];
  let minDistance = 999999;

  for (const place of PESHAWAR_PLACES) {
    const d = calculateDistanceKm(lat, lng, place.lat, place.lng);
    if (d < minDistance) {
      minDistance = d;
      closest = place;
    }
  }

  // If within 1.5 km of a known sector/landmark, snap to it or customize
  if (minDistance <= 0.8) {
    return closest;
  }

  return {
    id: `gps-${Date.now()}`,
    name: `Current Location (${closest.sector || closest.name.split(' ')[0]})`,
    address: `Near ${closest.name}, Peshawar (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    sector: closest.sector,
    street: closest.street,
    lat,
    lng,
    category: 'popular'
  };
}

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
