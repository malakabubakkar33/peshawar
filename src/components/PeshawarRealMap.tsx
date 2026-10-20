import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { 
  Locate, Layers, Plus, Minus, MapPin, ChevronDown, 
  Check, Move, Gauge
} from 'lucide-react';
import { type PeshawarPlace, PESHAWAR_PLACES } from '../lib/peshawarData';
import { sound } from '../lib/sound';

interface PeshawarRealMapProps {
  fromPlace: PeshawarPlace;
  toPlace: PeshawarPlace;
  screenState: string;
  vehicleType: 'bike' | 'car' | 'cargo';
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

// Generate realistic polyline points along Peshawar road network
function generateRouteCoordinates(from: PeshawarPlace, to: PeshawarPlace): [number, number][] {
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

export const PeshawarRealMap: React.FC<PeshawarRealMapProps> = ({
  fromPlace,
  toPlace,
  screenState,
  vehicleType,
  onSelectPlace,
  className = '',
  isCustomPinMode = false,
  pinModeType = 'from',
  onExitPinMode
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{
    from?: L.Marker;
    to?: L.Marker;
    driver?: L.Marker;
    centerUser?: L.Marker;
    cityLabel?: L.Marker;
    landmarks: L.Marker[];
    routeLine?: L.Polyline;
  }>({ landmarks: [] });

  // Animation and vehicle telemetry states
  const [vehicleSpeed, setVehicleSpeed] = useState(42);
  const [distanceRemaining, setDistanceRemaining] = useState('1.8 km');
  const [etaRemaining, setEtaRemaining] = useState('3 min');
  const [selectedCity, setSelectedCity] = useState('Peshawar');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [mapLayerStyle, setMapLayerStyle] = useState<'voyager' | 'streets' | 'satellite'>('voyager');
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

  // Automatically track real physical user location on map mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLiveCoords([lat, lng]);
          sessionStorage.setItem('safargo_user_lat', lat.toString());
          sessionStorage.setItem('safargo_user_lng', lng.toString());

          if (mapInstanceRef.current && screenState === 'home') {
            mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.4 });
          }
        },
        (err) => {
          console.warn('Map live GPS auto-track note:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    }
  }, [screenState]);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered at Peshawar city river/hub as in screenshot
    const map = L.map(mapContainerRef.current, {
      center: [34.0151, 71.5349],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    const tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = tile;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Toggle Map Style: Cycle between Voyager (Clean Vector) -> Streets (OSM) -> Satellite (Esri Imagery)
  const toggleMapStyle = () => {
    if (!mapInstanceRef.current) return;
    
    let nextStyle: 'voyager' | 'streets' | 'satellite' = 'streets';
    if (mapLayerStyle === 'voyager') nextStyle = 'streets';
    else if (mapLayerStyle === 'streets') nextStyle = 'satellite';
    else nextStyle = 'voyager';

    setMapLayerStyle(nextStyle);

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const mapboxToken = (import.meta as any).env?.VITE_MAPBOX_TOKEN;
    const googleKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY;

    let newUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let maxZoom = 19;
    let subdomains = 'abcd';

    if (nextStyle === 'satellite') {
      newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 19;
      subdomains = '';
    } else if (nextStyle === 'streets') {
      if (mapboxToken) {
        newUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`;
        subdomains = '';
      } else if (googleKey) {
        newUrl = `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleKey}`;
        subdomains = '';
      } else {
        newUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        subdomains = 'abc';
      }
    }

    tileLayerRef.current = L.tileLayer(newUrl, {
      maxZoom,
      ...(subdomains ? { subdomains } : {})
    }).addTo(mapInstanceRef.current);
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
    markersRef.current.landmarks.forEach(m => m.remove());
    markersRef.current.landmarks = [];

    // 1. Center User Location Indicator (Blue Dot + Pulsing Dual Green Radar Rings)
    const userLocationCoord: [number, number] = userLiveCoords;
    const centerUserIcon = L.divIcon({
      className: 'user-location-pulse-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 72px; height: 72px;">
          <div class="absolute inset-0 rounded-full bg-[#16a34a]/25 border border-[#16a34a]/40 animate-ping"></div>
          <div class="absolute inset-2 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/50 animate-pulse"></div>
          <div class="relative w-5 h-5 rounded-full bg-[#0284c7] border-2 border-white shadow-xl flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [72, 72],
      iconAnchor: [36, 36]
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

    // 4. If booking flow is in progress (categories, request_sent, driver_accepted, tracking, etc.),
    // show the active route and pickup/drop markers
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
            id: `drag-${Date.now()}`,
            name: details.name,
            address: details.address,
            lat: pos.lat,
            lng: pos.lng,
            category: 'popular'
          }, 'from');
        });
      }
      markersRef.current.from = fromMarker;

      // To Marker (Rose / Red)
      const toIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-9 h-9 rounded-full bg-[#f43f5e] border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
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
            id: `drag-${Date.now()}`,
            name: details.name,
            address: details.address,
            lat: pos.lat,
            lng: pos.lng,
            category: 'popular'
          }, 'to');
        });
      }
      markersRef.current.to = toMarker;

      // Route coordinates
      const routeCoords = generateRouteCoordinates(fromPlace, toPlace);
      const routeLine = L.polyline(routeCoords, {
        color: '#16a34a',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: screenState === 'request_sent' ? '8, 8' : undefined
      }).addTo(map);
      markersRef.current.routeLine = routeLine;

      // Fit Bounds during active ride
      const bounds = L.latLngBounds([
        [fromPlace.lat, fromPlace.lng],
        [toPlace.lat, toPlace.lng]
      ]);
      map.flyToBounds(bounds, {
        padding: [90, 90],
        maxZoom: 15,
        duration: 1.2
      });
    } else {
      // Home screen default focus centered on Peshawar
      map.flyTo(userLocationCoord, 13, { duration: 1 });
    }

    // Driver Marker if accepted, tracking, arrived, or in trip
    const showDriver = ['driver_accepted', 'live_tracking', 'driver_arrived', 'ride_in_progress'].includes(screenState);
    if (showDriver) {
      const routeCoords = generateRouteCoordinates(fromPlace, toPlace);
      const vehicleEmoji = vehicleType === 'bike' ? '🏍️' : vehicleType === 'cargo' ? '🚚' : '🚗';

      const driverIcon = L.divIcon({
        className: 'custom-leaflet-driver',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 rounded-full bg-lime-400/30 animate-ping"></div>
            <div class="w-11 h-11 rounded-full bg-slate-900 border-2 border-[#16a34a] shadow-2xl flex items-center justify-center text-xl text-white transform rotate-0" id="driver-vehicle-rotator">
              ${vehicleEmoji}
            </div>
            <div class="absolute -top-6 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#16a34a] text-white font-black text-[9px] shadow-sm">
              Usman (${etaRemaining})
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const driverMarker = L.marker(routeCoords[0], { icon: driverIcon }).addTo(map);
      markersRef.current.driver = driverMarker;
    }

  }, [fromPlace, toPlace, screenState, vehicleType, isCustomPinMode, pinModeType, onSelectPlace]);

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
      routeCoords = generateRouteCoordinates(fromPlace, toPlace);
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
  }, [screenState, fromPlace, toPlace]);

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
          mapInstanceRef.current?.flyTo([lat, lng], 15, { duration: 1.2 });
        },
        () => {
          mapInstanceRef.current?.flyTo(userLiveCoords, 15, { duration: 1 });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      mapInstanceRef.current?.flyTo(userLiveCoords, 15, { duration: 1 });
    }
  };

  const handleZoomIn = () => {
    sound.playClick();
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    sound.playClick();
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Interactive Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 1. TOP-LEFT FLOATING CITY DROPDOWN PILL (Exact match to reference image) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <button
          onClick={() => {
            sound.playPop();
            setIsCityDropdownOpen(!isCityDropdownOpen);
          }}
          className="px-3.5 py-2 rounded-2xl bg-white shadow-md hover:shadow-lg border border-slate-100 flex items-center gap-2 active:scale-95 transition-all"
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

      {/* 2. RIGHT-SIDE FLOATING MAP TOOLS (Exact match to reference image) */}
      <div className="absolute right-4 top-24 sm:top-28 z-20 flex flex-col items-center gap-2.5 pointer-events-auto">
        {/* Locate / Crosshair Target */}
        <button
          onClick={handleLocateMe}
          title="Current Location"
          className="w-11 h-11 rounded-full bg-white shadow-md hover:shadow-lg border border-slate-100/90 flex items-center justify-center text-[#16a34a] hover:bg-emerald-50 active:scale-95 transition-all"
        >
          <Locate className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Map Layers Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            toggleMapStyle();
          }}
          title="Toggle Map Style"
          className="w-11 h-11 rounded-full bg-white shadow-md hover:shadow-lg border border-slate-100/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Combined Zoom Controls Pill (+ / -) */}
        <div className="w-11 rounded-2xl bg-white shadow-md border border-slate-100/90 flex flex-col items-center divide-y divide-slate-100 overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-11 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 font-bold" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-11 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4 font-bold" />
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
