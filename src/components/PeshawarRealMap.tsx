import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { 
  Locate, Layers, Plus, Minus, MapPin, ChevronDown, 
  Check, Move, Gauge
} from 'lucide-react';
import { type PeshawarPlace, PESHAWAR_PLACES, getNearestPeshawarPlace } from '../lib/peshawarData';
import { sound } from '../lib/sound';

interface PeshawarRealMapProps {
  fromPlace: PeshawarPlace;
  toPlace: PeshawarPlace;
  screenState: string;
  vehicleType: 'bike' | 'car' | 'cargo';
  driverName?: string;
  onSelectPlace?: (place: PeshawarPlace, type: 'from' | 'to') => void;
  className?: string;
  isCustomPinMode?: boolean;
  pinModeType?: 'from' | 'to';
  onExitPinMode?: () => void;
}

// Bearing angle calculation between two lat/lng points
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLng);
  const brng = Math.atan2(y, x) * (180 / Math.PI);
  return (brng + 360) % 360;
}

// Generate realistic polyline points along Peshawar road network (fallback)
function generateRouteCoordinates(from: { lat: number; lng: number }, to: { lat: number; lng: number }): [number, number][] {
  const steps = 24;
  const coords: [number, number][] = [];
  
  const midLat = (from.lat + to.lat) / 2 + 0.0035;
  const midLng = (from.lng + to.lng) / 2 - 0.0025;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) * (1 - t) * from.lat + 2 * (1 - t) * t * midLat + t * t * to.lat;
    const lng = (1 - t) * (1 - t) * from.lng + 2 * (1 - t) * t * midLng + t * t * to.lng;
    coords.push([lat, lng]);
  }
  return coords;
}

// In-Memory cache for OSRM real street routes
const roadRouteCache = new Map<string, { coordinates: [number, number][]; distanceKm: string; durationMin: string }>();

// Fetch 100% Real Road Navigation Route via OpenStreetMap / OSRM
async function fetchPeshawarRoadRoute(
  from: { lat: number; lng: number }, 
  to: { lat: number; lng: number }
): Promise<{ coordinates: [number, number][]; distanceKm: string; durationMin: string }> {
  const cacheKey = `${from.lat.toFixed(4)},${from.lng.toFixed(4)}_${to.lat.toFixed(4)},${to.lng.toFixed(4)}`;
  if (roadRouteCache.has(cacheKey)) {
    return roadRouteCache.get(cacheKey)!;
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Convert [lng, lat] to Leaflet [lat, lng]
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );
        const distanceKm = `${(route.distance / 1000).toFixed(1)} km`;
        const durationMin = `${Math.max(1, Math.round(route.duration / 60))} min`;

        const result = { coordinates, distanceKm, durationMin };
        roadRouteCache.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    // fallback if offline
  }

  const fallback = generateRouteCoordinates(from, to);
  const estKm = (Math.hypot(from.lat - to.lat, from.lng - to.lng) * 111 * 1.35).toFixed(1);
  return {
    coordinates: fallback,
    distanceKm: `${estKm} km`,
    durationMin: `${Math.max(3, Math.round(parseFloat(estKm) * 2.4))} min`
  };
}

// Find closest Peshawar Landmark for custom pinned coordinate
function findClosestPeshawarName(lat: number, lng: number): { name: string; address: string } {
  let closest = PESHAWAR_PLACES[0];
  let minDistance = 999999;

  for (const place of PESHAWAR_PLACES) {
    const d = Math.hypot(place.lat - lat, place.lng - lng);
    if (d < minDistance) {
      minDistance = d;
      closest = place;
    }
  }

  if (minDistance < 0.004) {
    return { name: closest.name, address: closest.address };
  } else {
    return { 
      name: `Custom Location (Near ${closest.name.split(' ')[0]})`, 
      address: `Peshawar City (${lat.toFixed(4)}, ${lng.toFixed(4)})` 
    };
  }
}

// Reliable 100% free tile providers that need NO API key and load fast in Pakistan
function getTileLayerConfig(style: 'streets' | 'osm' | 'satellite' | 'google'): { url: string; options: L.TileLayerOptions } {
  if (style === 'satellite') {
    return {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: {
        maxZoom: 19,
        attribution: '&copy; Esri World Imagery'
      }
    };
  } else if (style === 'osm') {
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors'
      }
    };
  } else if (style === 'google') {
    return {
      url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      options: {
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps'
      }
    };
  }
  // Default 'streets': Ultra-reliable CARTO Voyager with retina support & Fastly CDN
  return {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c', 'd'],
      attribution: '&copy; CARTO &copy; OpenStreetMap'
    }
  };
}

export const PeshawarRealMap: React.FC<PeshawarRealMapProps> = ({
  fromPlace,
  toPlace,
  screenState,
  vehicleType,
  driverName,
  onSelectPlace,
  className = '',
  isCustomPinMode = false,
  pinModeType = 'from',
  onExitPinMode
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const hasCenteredInitialRef = useRef(false);
  const markersRef = useRef<{
    from?: L.Marker;
    to?: L.Marker;
    driver?: L.Marker;
    centerUser?: L.Marker;
    cityLabel?: L.Marker;
    landmarks: L.Marker[];
    routeLine?: L.Polyline;
    routeCasing?: L.Polyline;
  }>({ landmarks: [] });

  // Animation and vehicle telemetry states
  const [vehicleSpeed, setVehicleSpeed] = useState(42);
  const [distanceRemaining, setDistanceRemaining] = useState('1.8 km');
  const [etaRemaining, setEtaRemaining] = useState('3 min');
  const [realRouteCoords, setRealRouteCoords] = useState<[number, number][]>([]);
  const [selectedCity, setSelectedCity] = useState('Peshawar');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [mapLayerStyle, setMapLayerStyle] = useState<'streets' | 'osm' | 'satellite' | 'google'>('streets');
  const animationFrameRef = useRef<number | null>(null);

  // Live User GPS coordinates tracking
  const [userLiveCoords, setUserLiveCoords] = useState<[number, number]>(() => {
    const lat = typeof window !== 'undefined' ? sessionStorage.getItem('safargo_user_lat') : null;
    const lng = typeof window !== 'undefined' ? sessionStorage.getItem('safargo_user_lng') : null;
    if (lat && lng) {
      return [parseFloat(lat), parseFloat(lng)];
    }
    return [fromPlace.lat || 34.0151, fromPlace.lng || 71.5349];
  });

  // Automatically track real physical passenger location on mount and watch position
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    let isMounted = true;

    // 1. Immediate GPS detection on open
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!isMounted) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLiveCoords([lat, lng]);
        sessionStorage.setItem('safargo_user_lat', lat.toString());
        sessionStorage.setItem('safargo_user_lng', lng.toString());

        // Update passenger's pickup location to where they are
        const nearest = getNearestPeshawarPlace(lat, lng);
        onSelectPlace?.(nearest, 'from');

        // Only center map automatically ONCE on initial load so user zoom is never interrupted
        if (mapInstanceRef.current && !hasCenteredInitialRef.current && screenState === 'home') {
          hasCenteredInitialRef.current = true;
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
        }
      },
      (err) => {
        console.warn('Real GPS auto-detect note:', err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );

    // 2. Continuous real live tracking as user moves (updates blue dot only)
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!isMounted) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLiveCoords([lat, lng]);
        sessionStorage.setItem('safargo_user_lat', lat.toString());
        sessionStorage.setItem('safargo_user_lng', lng.toString());
      },
      (err) => console.warn('Real GPS live tracking note:', err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => {
      isMounted = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [screenState]);

  // Helper to safely attach tile layer
  const attachTileLayer = (map: L.Map, style: 'streets' | 'osm' | 'satellite' | 'google') => {
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    const config = getTileLayerConfig(style);
    const layer = L.tileLayer(config.url, config.options);
    layer.addTo(map);
    tileLayerRef.current = layer;
  };

  // 1. Fetch Real Road Navigation Polyline via OSRM whenever locations change
  useEffect(() => {
    if (screenState === 'home') {
      setRealRouteCoords([]);
      return;
    }

    let isCurrent = true;
    fetchPeshawarRoadRoute(fromPlace, toPlace).then((route) => {
      if (!isCurrent) return;
      setRealRouteCoords(route.coordinates);
      setDistanceRemaining(route.distanceKm);
      setEtaRemaining(route.durationMin);
    });

    return () => {
      isCurrent = false;
    };
  }, [fromPlace.lat, fromPlace.lng, toPlace.lat, toPlace.lng, screenState]);

  // 2. Continuous User Live Coordinates Update (Updates Blue Dot without resetting map zoom!)
  useEffect(() => {
    if (markersRef.current.centerUser) {
      markersRef.current.centerUser.setLatLng(userLiveCoords);
    }
    if (markersRef.current.cityLabel) {
      markersRef.current.cityLabel.setLatLng([userLiveCoords[0] + 0.003, userLiveCoords[1]]);
    }
  }, [userLiveCoords]);

  // Initialize Map Once with size guarantees and full zoom/drag capability
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = [userLiveCoords[0] || 34.0151, userLiveCoords[1] || 71.5349];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      minZoom: 10,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      dragging: true,
      attributionControl: false
    });

    attachTileLayer(map, mapLayerStyle);
    mapInstanceRef.current = map;

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    // Prevent blank white screen: invalidateSize multiple times after layout renders
    map.whenReady(() => {
      handleResize();
      setTimeout(handleResize, 100);
      setTimeout(handleResize, 300);
      setTimeout(handleResize, 700);
      setTimeout(handleResize, 1200);
    });

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(mapContainerRef.current);

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate size whenever screenState changes (e.g. from search sheet expanding or collapsing)
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [screenState]);

  // Toggle Map Style: Cycle between Streets (CARTO) -> Google Roads -> Satellite -> OSM
  const toggleMapStyle = () => {
    if (!mapInstanceRef.current) return;
    
    let nextStyle: 'streets' | 'osm' | 'satellite' | 'google' = 'google';
    if (mapLayerStyle === 'streets') nextStyle = 'google';
    else if (mapLayerStyle === 'google') nextStyle = 'satellite';
    else if (mapLayerStyle === 'satellite') nextStyle = 'osm';
    else nextStyle = 'streets';

    setMapLayerStyle(nextStyle);
    attachTileLayer(mapInstanceRef.current, nextStyle);
  };

  // Handle Map Click in Custom Pin Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isCustomPinMode || !onSelectPlace) return;

      const { lat, lng } = e.latlng;
      sound.playPop();

      const details = findClosestPeshawarName(lat, lng);
      const newPlace: PeshawarPlace = {
        id: `custom-${Date.now()}`,
        name: details.name,
        address: details.address,
        lat,
        lng,
        category: 'popular'
      };

      onSelectPlace(newPlace, pinModeType);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isCustomPinMode, pinModeType, onSelectPlace]);

  // Update Markers, Center Blue Dot, Landmarks, and Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing dynamic markers
    if (markersRef.current.from) markersRef.current.from.remove();
    if (markersRef.current.to) markersRef.current.to.remove();
    if (markersRef.current.driver) markersRef.current.driver.remove();
    if (markersRef.current.centerUser) markersRef.current.centerUser.remove();
    if (markersRef.current.cityLabel) markersRef.current.cityLabel.remove();
    if (markersRef.current.routeLine) markersRef.current.routeLine.remove();
    if (markersRef.current.routeCasing) markersRef.current.routeCasing.remove();
    markersRef.current.landmarks.forEach(m => m.remove());
    markersRef.current.landmarks = [];

    // 1. Center User Location Indicator (Clean Blue Dot + Smooth Radar Pulse, NO shaking)
    const userLocationCoord: [number, number] = userLiveCoords;
    const centerUserIcon = L.divIcon({
      className: 'user-location-pulse-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 56px; height: 56px;">
          <div class="absolute inset-0 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/35 radar-soft-pulse pointer-events-none"></div>
          <div class="relative w-5 h-5 rounded-full bg-[#0284c7] border-2 border-white shadow-xl flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [56, 56],
      iconAnchor: [28, 28]
    });
    markersRef.current.centerUser = L.marker(userLocationCoord, { icon: centerUserIcon }).addTo(map);

    // 2. Peshawar / پشاور City Watermark Label right above the central blue dot
    const cityLabelIcon = L.divIcon({
      className: 'peshawar-city-label',
      html: `
        <div class="text-center select-none pointer-events-none -translate-x-1/2 -translate-y-full mb-3">
          <span class="text-slate-800 font-extrabold text-sm tracking-wider drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">Peshawar Live</span>
          <span class="text-slate-600 font-bold text-xs -mt-1 block font-urdu">پشاور</span>
        </div>
      `,
      iconSize: [90, 40],
      iconAnchor: [45, 20]
    });
    markersRef.current.cityLabel = L.marker([userLocationCoord[0] + 0.003, userLocationCoord[1]], { icon: cityLabelIcon }).addTo(map);

    // 3. Authentic Peshawar Landmark Pins across the City
    const REFERENCE_LANDMARKS = [
      {
        name: 'Islamia College Peshawar',
        lat: 34.0086,
        lng: 71.4820,
        icon: '🎓',
        bg: 'bg-emerald-700'
      },
      {
        name: 'Khyber Teaching Hospital (KTH)',
        lat: 34.0092,
        lng: 71.4925,
        icon: '🏥',
        bg: 'bg-rose-700'
      },
      {
        name: 'Tatara Park Phase 3',
        lat: 33.9921,
        lng: 71.4389,
        icon: '🌳',
        bg: 'bg-emerald-600'
      },
      {
        name: 'Mall Road Saddar Cantt',
        lat: 34.0042,
        lng: 71.5430,
        icon: '🏬',
        bg: 'bg-slate-800'
      },
      {
        name: 'Peshawar Museum',
        lat: 34.0135,
        lng: 71.5645,
        icon: '🏛️',
        bg: 'bg-purple-700'
      },
      {
        name: 'Karkhano Market Jamrud Rd',
        lat: 33.9985,
        lng: 71.4150,
        icon: '🛍️',
        bg: 'bg-amber-700'
      },
      {
        name: 'BRT Hayatabad Terminal',
        lat: 33.9995,
        lng: 71.4280,
        icon: '🚌',
        bg: 'bg-sky-700'
      }
    ];

    REFERENCE_LANDMARKS.forEach(place => {
      const pinIcon = L.divIcon({
        className: 'landmark-ref-pin',
        html: `
          <div class="group flex items-center gap-1.5 cursor-pointer">
            <div class="w-6 h-6 rounded-full ${place.bg} text-white text-[11px] flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
              ${place.icon}
            </div>
            <span class="text-[11px] font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-200/60 whitespace-nowrap pointer-events-none">
              ${place.name}
            </span>
          </div>
        `,
        iconSize: [140, 30],
        iconAnchor: [12, 15]
      });

      const landmarkMarker = L.marker([place.lat, place.lng], { icon: pinIcon })
        .addTo(map)
        .on('click', () => {
          sound.playClick();
          const target = PESHAWAR_PLACES.find(p => p.name.includes(place.name.split(' ')[0])) || PESHAWAR_PLACES[0];
          onSelectPlace?.(target, isCustomPinMode ? pinModeType : 'to');
        });

      markersRef.current.landmarks.push(landmarkMarker);
    });

    // 4. If booking flow is in progress, show active route and pickup/drop markers
    if (screenState !== 'home') {
      // From Marker (Green)
      const fromIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-9 h-9 rounded-full bg-[#16a34a] border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
              A
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-semibold shadow-md pointer-events-none">
              ${fromPlace.name.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const isFromDraggable = isCustomPinMode && pinModeType === 'from';
      const fromMarker = L.marker([fromPlace.lat, fromPlace.lng], { 
        icon: fromIcon,
        draggable: isFromDraggable
      }).addTo(map);

      if (isFromDraggable) {
        fromMarker.on('dragend', () => {
          const pos = fromMarker.getLatLng();
          sound.playPop();
          const details = findClosestPeshawarName(pos.lat, pos.lng);
          onSelectPlace?.({
            id: `pinned-${Date.now()}`,
            name: details.name,
            address: details.address,
            lat: pos.lat,
            lng: pos.lng,
            category: 'popular'
          }, 'from');
        });
      }
      markersRef.current.from = fromMarker;

      // To Marker (Red)
      const toIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-9 h-9 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
              B
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-semibold shadow-md pointer-events-none">
              ${toPlace.name.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const isToDraggable = isCustomPinMode && pinModeType === 'to';
      const toMarker = L.marker([toPlace.lat, toPlace.lng], { 
        icon: toIcon,
        draggable: isToDraggable
      }).addTo(map);

      if (isToDraggable) {
        toMarker.on('dragend', () => {
          const pos = toMarker.getLatLng();
          sound.playPop();
          const details = findClosestPeshawarName(pos.lat, pos.lng);
          onSelectPlace?.({
            id: `pinned-to-${Date.now()}`,
            name: details.name,
            address: details.address,
            lat: pos.lat,
            lng: pos.lng,
            category: 'popular'
          }, 'to');
        });
      }
      markersRef.current.to = toMarker;

      // Route coordinates (Real Road Navigation from OSRM or smooth Peshawar road fallback)
      const activeCoords: [number, number][] = realRouteCoords.length > 0
        ? realRouteCoords
        : generateRouteCoordinates(fromPlace, toPlace);

      // Casing polyline (dark green contrast border like Google Maps)
      const routeCasing = L.polyline(activeCoords, {
        color: '#064e3b',
        weight: 8,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      markersRef.current.routeCasing = routeCasing;

      // Real road navigation polyline
      const routeLine = L.polyline(activeCoords, {
        color: '#16a34a',
        weight: 5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: screenState === 'request_sent' ? '8, 8' : undefined
      }).addTo(map);
      markersRef.current.routeLine = routeLine;

      // Smart framing: auto-fit bounds with bottom padding for UI sheets so From & To are both clearly visible
      const bounds = L.latLngBounds(activeCoords);
      map.fitBounds(bounds, {
        paddingTopLeft: [70, 70],
        paddingBottomRight: [70, 220],
        maxZoom: 16
      });
    }

    // Driver Marker if accepted, tracking, arrived, or in trip
    const showDriver = ['driver_accepted', 'live_tracking', 'driver_arrived', 'ride_in_progress'].includes(screenState);
    if (showDriver) {
      const activeCoords = realRouteCoords.length > 0 ? realRouteCoords : generateRouteCoordinates(fromPlace, toPlace);
      const vehicleEmoji = vehicleType === 'bike' ? '🏍️' : vehicleType === 'cargo' ? '🚚' : '🚗';

      const driverIcon = L.divIcon({
        className: 'custom-leaflet-driver',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-11 h-11 rounded-full bg-slate-900 border-2 border-[#16a34a] shadow-2xl flex items-center justify-center text-xl text-white transform rotate-0" id="driver-vehicle-rotator">
              ${vehicleEmoji}
            </div>
            <div class="absolute -top-6 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#16a34a] text-white font-black text-[9px] shadow-sm">
              ${driverName || 'Driver'} (${etaRemaining})
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const driverMarker = L.marker(activeCoords[0], { icon: driverIcon }).addTo(map);
      markersRef.current.driver = driverMarker;
    }

  }, [fromPlace.id, fromPlace.lat, fromPlace.lng, toPlace.id, toPlace.lat, toPlace.lng, screenState, vehicleType, isCustomPinMode, pinModeType, onSelectPlace, realRouteCoords]);

  // Real-Time Animated Movement of Driver along Route
  useEffect(() => {
    const showDriver = ['driver_accepted', 'live_tracking', 'driver_arrived', 'ride_in_progress'].includes(screenState);
    if (!showDriver || !markersRef.current.driver) return;

    let routeCoords: [number, number][];

    if (screenState === 'driver_accepted' || screenState === 'live_tracking') {
      const driverStartLat = fromPlace.lat + 0.006;
      const driverStartLng = fromPlace.lng + 0.007;
      routeCoords = [
        [driverStartLat, driverStartLng],
        [fromPlace.lat + 0.003, fromPlace.lng + 0.003],
        [fromPlace.lat, fromPlace.lng]
      ];
    } else if (screenState === 'driver_arrived') {
      routeCoords = [[fromPlace.lat, fromPlace.lng]];
      setDistanceRemaining('0 m');
      setEtaRemaining('Arrived');
      setVehicleSpeed(0);
      markersRef.current.driver.setLatLng([fromPlace.lat, fromPlace.lng]);
      return;
    } else {
      routeCoords = realRouteCoords.length > 0 ? realRouteCoords : generateRouteCoordinates(fromPlace, toPlace);
    }

    let startTimestamp: number | null = null;
    const duration = screenState === 'live_tracking' ? 14000 : 18000;

    const animateDriver = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      const totalSegments = routeCoords.length - 1;
      const currentSegment = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
      const segmentProgress = (progress * totalSegments) - currentSegment;

      const p1 = routeCoords[currentSegment];
      const p2 = routeCoords[currentSegment + 1];

      if (p1 && p2) {
        const curLat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
        const curLng = p1[1] + (p2[1] - p1[1]) * segmentProgress;

        markersRef.current.driver?.setLatLng([curLat, curLng]);

        const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);
        const rotator = document.getElementById('driver-vehicle-rotator');
        if (rotator) {
          rotator.style.transform = `rotate(${bearing}deg)`;
        }

        const remainingKm = Math.max(0.1, (1.8 * (1 - progress))).toFixed(1);
        setDistanceRemaining(`${remainingKm} km`);
        setEtaRemaining(`${Math.ceil((duration - elapsed) / 4000)} min`);
        setVehicleSpeed(Math.floor(38 + Math.sin(progress * 10) * 8));
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateDriver);
      } else {
        setVehicleSpeed(0);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateDriver);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [screenState, fromPlace.id, fromPlace.lat, fromPlace.lng, toPlace.id, toPlace.lat, toPlace.lng, realRouteCoords]);

  // Controls Handlers
  const handleLocateMe = () => {
    sound.playClick();
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLiveCoords([lat, lng]);
          sessionStorage.setItem('safargo_user_lat', lat.toString());
          sessionStorage.setItem('safargo_user_lng', lng.toString());

          const nearest = getNearestPeshawarPlace(lat, lng);
          onSelectPlace?.(nearest, 'from');

          sound.playSuccess();
          mapInstanceRef.current?.flyTo([lat, lng], 16, { duration: 1.2 });
        },
        () => {
          sound.playPop();
          mapInstanceRef.current?.flyTo(userLiveCoords, 15, { duration: 1 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      mapInstanceRef.current?.flyTo(userLiveCoords, 15, { duration: 1 });
    }
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    sound.playClick();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(1);
    }
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    sound.playClick();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(1);
    }
  };

  return (
    <div className={`relative w-full h-full min-h-full overflow-hidden bg-slate-100 ${className}`} style={{ width: '100%', height: '100%' }}>
      {/* Interactive Leaflet Container */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full z-0 touch-pan-x touch-pan-y" 
        style={{ width: '100%', height: '100%' }}
      />

      {/* 1. TOP-LEFT FLOATING CITY DROPDOWN PILL */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <button
          onClick={() => {
            sound.playPop();
            setIsCityDropdownOpen(!isCityDropdownOpen);
          }}
          className="px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-md hover:shadow-lg border border-slate-200/80 flex items-center gap-2 active:scale-95 transition-all"
        >
          <div className="w-4 h-4 text-[#16a34a] flex items-center justify-center">
            <MapPin className="w-4 h-4 fill-[#16a34a] text-[#16a34a]" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
            {selectedCity}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {/* City Dropdown Menu */}
        <AnimatePresence>
          {isCityDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className="absolute top-12 left-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-30"
            >
              <span className="text-[10px] font-extrabold text-slate-400 px-2.5 py-1 block uppercase tracking-wider">
                Peshawar Region
              </span>
              {[
                { name: 'Peshawar', lat: 34.0151, lng: 71.5349 },
                { name: 'Hayatabad', lat: 33.9921, lng: 71.4389 },
                { name: 'Saddar Cantt', lat: 34.0042, lng: 71.5430 },
                { name: 'University Campus', lat: 34.0086, lng: 71.4820 },
                { name: 'Qissa Khwani', lat: 34.0108, lng: 71.5714 }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => {
                    setSelectedCity(item.name);
                    setIsCityDropdownOpen(false);
                    sound.playClick();
                    mapInstanceRef.current?.flyTo([item.lat, item.lng], 14, { duration: 1 });
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedCity === item.name
                      ? 'bg-emerald-50 text-[#16a34a] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.name}</span>
                  {selectedCity === item.name && <Check className="w-3.5 h-3.5 text-[#16a34a]" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. RIGHT-SIDE FLOATING MAP TOOLS (Locate, Layers, Zoom In +, Zoom Out -) */}
      <div className="absolute right-3.5 sm:right-4 top-20 sm:top-24 z-20 flex flex-col items-center gap-2.5 pointer-events-auto select-none">
        {/* Locate / Crosshair Target */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLocateMe();
          }}
          title="Current GPS Location"
          className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl border border-slate-200/90 flex items-center justify-center text-[#16a34a] hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
        >
          <Locate className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Map Layers Toggle (CARTO Streets -> Google -> Satellite -> OSM) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            toggleMapStyle();
          }}
          title={`Active Style: ${mapLayerStyle.toUpperCase()} (Tap to switch)`}
          className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl border border-slate-200/90 flex flex-col items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span className="text-[8px] font-black uppercase text-slate-500 leading-none mt-0.5">
            {mapLayerStyle === 'streets' ? 'Map' : mapLayerStyle === 'google' ? 'Ggl' : mapLayerStyle === 'satellite' ? 'Sat' : 'OSM'}
          </span>
        </button>

        {/* Combined Zoom Controls Pill (+ / -) */}
        <div className="w-11 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 flex flex-col items-center divide-y divide-slate-100 overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom In"
            className="w-11 h-11 flex items-center justify-center text-slate-800 hover:text-[#16a34a] hover:bg-emerald-50 active:scale-90 transition-all cursor-pointer font-black"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            aria-label="Zoom Out"
            className="w-11 h-11 flex items-center justify-center text-slate-800 hover:text-[#16a34a] hover:bg-emerald-50 active:scale-90 transition-all cursor-pointer font-black"
          >
            <Minus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Custom Pin Placement Mode Banner */}
      <AnimatePresence>
        {isCustomPinMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#16a34a] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#16a34a] text-white flex items-center justify-center font-black">
                <Move className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Adjusting {pinModeType === 'from' ? 'Pickup (Pin A)' : 'Destination (Pin B)'}
                </p>
                <p className="text-[10px] text-lime-400">
                  Tap anywhere on Peshawar map or drag pin
                </p>
              </div>
            </div>

            {onExitPinMode && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  onExitPinMode();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#16a34a] text-white font-black text-xs hover:bg-emerald-600 transition-colors flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                Done
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Telemetry HUD Bar during active tracking */}
      {['live_tracking', 'ride_in_progress'].includes(screenState) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-4 z-20 pointer-events-auto"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 shadow-xl border border-slate-200 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-[#16a34a] text-white flex items-center justify-center font-black shadow-sm">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">{vehicleSpeed} km/h</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-emerald-600">Live GPS</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {distanceRemaining} • {etaRemaining} remaining
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
