import { supabase, isSupabaseConfigured } from './supabase';

export interface ActiveRide {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderAvatar?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverAvatar?: string;
  driverRating?: number;
  vehicleType: 'bike' | 'car' | 'cargo';
  vehicleName?: string;
  vehicleModel?: string;
  vehicleNumber?: string;
  vehicleColor?: string;
  pickupName: string;
  dropoffName: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  fare: number;
  distanceKm: string;
  durationMin: string;
  status: 'searching' | 'driver_accepted' | 'driver_arrived' | 'ride_in_progress' | 'ride_completed' | 'cancelled';
  createdAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface OnlineDriver {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverAvatar?: string;
  driverRating?: number;
  vehicleType: 'bike' | 'car' | 'cargo';
  vehicleName: string;
  vehicleModel: string;
  vehicleNumber: string;
  vehicleColor: string;
  isOnline: boolean;
  lastSeen: number;
}

const STORAGE_RIDES_KEY = 'safargo_real_active_rides_v1';
const STORAGE_DRIVERS_KEY = 'safargo_online_drivers_v1';

// Cross-tab broadcast channel
const ridesChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('safargo_rides_sync_bus') 
  : null;

// Supabase Realtime channel setup
const supabaseRidesChannel = isSupabaseConfigured 
  ? supabase.channel('safargo-rides-realtime') 
  : null;

class RideService {
  private rideListeners: Map<string, Set<(ride: ActiveRide) => void>> = new Map();
  private incomingRideListeners: Set<(ride: ActiveRide) => void> = new Set();
  private driverListeners: Set<(drivers: OnlineDriver[]) => void> = new Set();

  constructor() {
    this.initCrossTabListeners();
    this.initSupabaseRealtime();
  }

  // Cross-Tab & Storage sync
  private initCrossTabListeners() {
    if (typeof window === 'undefined') return;

    if (ridesChannel) {
      ridesChannel.onmessage = (event) => {
        const { type, data } = event.data || {};
        if (type === 'ride-update' && data) {
          this.handleLocalRideUpdate(data, false);
        } else if (type === 'driver-update') {
          this.notifyDriverListeners();
        }
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_RIDES_KEY && e.newValue) {
        try {
          const rides: ActiveRide[] = JSON.parse(e.newValue);
          rides.forEach(r => this.handleLocalRideUpdate(r, false));
        } catch {}
      } else if (e.key === STORAGE_DRIVERS_KEY) {
        this.notifyDriverListeners();
      }
    });

    window.addEventListener('safargo-internal-ride-update', ((e: CustomEvent) => {
      if (e.detail) {
        this.handleLocalRideUpdate(e.detail, false);
      }
    }) as EventListener);
  }

  // Supabase WebSocket Realtime sync
  private initSupabaseRealtime() {
    if (!supabaseRidesChannel) return;

    supabaseRidesChannel
      .on('broadcast', { event: 'ride-event' }, ({ payload }) => {
        if (payload) {
          this.handleLocalRideUpdate(payload, false);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, (payload) => {
        if (payload.new) {
          const mapped = this.mapDbRowToRide(payload.new);
          if (mapped) this.handleLocalRideUpdate(mapped, false);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('SafarGo Realtime: Connected to live rides network');
        }
      });
  }

  private mapDbRowToRide(row: any): ActiveRide | null {
    if (!row || !row.id) return null;
    return {
      id: row.id,
      riderId: row.rider_id || '',
      riderName: row.rider_name || 'Passenger',
      riderPhone: row.rider_phone || '',
      driverId: row.driver_id,
      driverName: row.driver_name,
      driverPhone: row.driver_phone,
      driverAvatar: row.driver_avatar,
      vehicleType: (row.vehicle_type as any) || 'car',
      vehicleName: row.vehicle_name,
      vehicleNumber: row.vehicle_number,
      vehicleColor: row.vehicle_color,
      pickupName: row.pickup_name || '',
      dropoffName: row.dropoff_name || '',
      pickupLat: parseFloat(row.pickup_lat) || 34.0151,
      pickupLng: parseFloat(row.pickup_lng) || 71.5349,
      dropoffLat: parseFloat(row.dropoff_lat) || 34.0042,
      dropoffLng: parseFloat(row.dropoff_lng) || 71.5430,
      fare: parseFloat(row.fare) || 0,
      distanceKm: row.distance_km || '3 km',
      durationMin: row.duration_min || '10 min',
      status: row.status || 'searching',
      createdAt: row.created_at || new Date().toISOString()
    };
  }

  // Retrieve stored rides from cache
  public getStoredRides(): ActiveRide[] {
    try {
      if (typeof window === 'undefined') return [];
      const raw = localStorage.getItem(STORAGE_RIDES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveStoredRides(rides: ActiveRide[]) {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_RIDES_KEY, JSON.stringify(rides.slice(0, 30)));
    } catch (e) {
      console.warn('LocalStorage save rides quota warning:', e);
    }
  }

  public getRide(rideId: string): ActiveRide | null {
    const rides = this.getStoredRides();
    return rides.find(r => r.id === rideId) || null;
  }

  // 1. Passenger creates a real ride request
  public createRideRequest(params: Omit<ActiveRide, 'id' | 'status' | 'createdAt'>): ActiveRide {
    const newRide: ActiveRide = {
      ...params,
      id: 'SG-RIDE-' + Math.floor(100000 + Math.random() * 900000),
      status: 'searching',
      createdAt: new Date().toISOString()
    };

    const rides = this.getStoredRides();
    rides.unshift(newRide);
    this.saveStoredRides(rides);

    // Save to PostgreSQL if Supabase is active
    if (isSupabaseConfigured) {
      supabase.from('rides').upsert({
        id: newRide.id,
        rider_id: newRide.riderId,
        pickup_name: newRide.pickupName,
        dropoff_name: newRide.dropoffName,
        pickup_lat: newRide.pickupLat,
        pickup_lng: newRide.pickupLng,
        dropoff_lat: newRide.dropoffLat,
        dropoff_lng: newRide.dropoffLng,
        vehicle_type: newRide.vehicleType,
        fare: newRide.fare,
        status: newRide.status,
        created_at: newRide.createdAt,
        updated_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.warn('Supabase ride insert error:', error.message);
      });
    }

    this.broadcastRideUpdate(newRide);
    return newRide;
  }

  // 2. Real Driver accepts ride
  public acceptRide(
    rideId: string, 
    driver: {
      driverId: string;
      driverName: string;
      driverPhone: string;
      driverAvatar?: string;
      driverRating?: number;
      vehicleName?: string;
      vehicleModel?: string;
      vehicleNumber?: string;
      vehicleColor?: string;
    }
  ): ActiveRide | null {
    const rides = this.getStoredRides();
    const index = rides.findIndex(r => r.id === rideId);
    if (index === -1) return null;

    const updated: ActiveRide = {
      ...rides[index],
      driverId: driver.driverId,
      driverName: driver.driverName,
      driverPhone: driver.driverPhone,
      driverAvatar: driver.driverAvatar,
      driverRating: driver.driverRating || 5.0,
      vehicleName: driver.vehicleName,
      vehicleModel: driver.vehicleModel,
      vehicleNumber: driver.vehicleNumber,
      vehicleColor: driver.vehicleColor,
      status: 'driver_accepted',
      acceptedAt: new Date().toISOString()
    };

    rides[index] = updated;
    this.saveStoredRides(rides);

    // Sync to Supabase DB
    if (isSupabaseConfigured) {
      supabase.from('rides').update({
        driver_id: driver.driverId,
        status: 'driver_accepted',
        updated_at: new Date().toISOString()
      }).eq('id', rideId);
    }

    this.broadcastRideUpdate(updated);
    return updated;
  }

  // 3. Driver progresses status: 'driver_arrived' | 'ride_in_progress' | 'ride_completed'
  public updateRideStatus(rideId: string, status: ActiveRide['status']): ActiveRide | null {
    const rides = this.getStoredRides();
    const index = rides.findIndex(r => r.id === rideId);
    if (index === -1) return null;

    const updated: ActiveRide = {
      ...rides[index],
      status
    };

    const now = new Date().toISOString();
    if (status === 'driver_arrived') updated.arrivedAt = now;
    if (status === 'ride_in_progress') updated.startedAt = now;
    if (status === 'ride_completed') updated.completedAt = now;

    rides[index] = updated;
    this.saveStoredRides(rides);

    // Sync to Supabase DB
    if (isSupabaseConfigured) {
      supabase.from('rides').update({
        status,
        updated_at: now
      }).eq('id', rideId);
    }

    this.broadcastRideUpdate(updated);
    return updated;
  }

  // 4. Cancel ride
  public cancelRide(rideId: string): ActiveRide | null {
    return this.updateRideStatus(rideId, 'cancelled');
  }

  // Broadcast ride updates to all tabs & Supabase subscribers
  private broadcastRideUpdate(ride: ActiveRide) {
    this.handleLocalRideUpdate(ride, true);

    // Cross-tab broadcast
    if (ridesChannel) {
      try {
        ridesChannel.postMessage({ type: 'ride-update', data: ride });
      } catch {}
    }

    // Supabase broadcast to other devices
    if (supabaseRidesChannel) {
      try {
        supabaseRidesChannel.send({
          type: 'broadcast',
          event: 'ride-event',
          payload: ride
        });
      } catch {}
    }

    // Local custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('safargo-internal-ride-update', { detail: ride }));
    }
  }

  private handleLocalRideUpdate(ride: ActiveRide, _broadcastToOthers?: boolean) {
    // Notify specific ride listeners (passenger screen)
    const listeners = this.rideListeners.get(ride.id);
    if (listeners) {
      listeners.forEach(fn => fn(ride));
    }

    // Notify driver incoming request listeners if ride is 'searching'
    if (ride.status === 'searching') {
      this.incomingRideListeners.forEach(fn => fn(ride));
    }
  }

  // Subscribe to updates for a specific ride (Passenger Side)
  public subscribeToRide(rideId: string, callback: (ride: ActiveRide) => void): () => void {
    if (!this.rideListeners.has(rideId)) {
      this.rideListeners.set(rideId, new Set());
    }
    this.rideListeners.get(rideId)!.add(callback);

    // Initial emit if ride exists
    const current = this.getRide(rideId);
    if (current) callback(current);

    return () => {
      const set = this.rideListeners.get(rideId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.rideListeners.delete(rideId);
      }
    };
  }

  // Subscribe to all incoming pending ride requests (Driver Panel Side)
  public subscribeToIncomingRides(callback: (ride: ActiveRide) => void): () => void {
    this.incomingRideListeners.add(callback);

    // Immediately send any existing active searching ride
    const pending = this.getPendingRides();
    if (pending.length > 0) {
      callback(pending[0]);
    }

    return () => {
      this.incomingRideListeners.delete(callback);
    };
  }

  public getPendingRides(vehicleType?: string): ActiveRide[] {
    const rides = this.getStoredRides();
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    return rides.filter(r => {
      const isRecent = new Date(r.createdAt).getTime() > tenMinutesAgo;
      const isSearching = r.status === 'searching';
      const matchesVehicle = !vehicleType || r.vehicleType === vehicleType || vehicleType === 'all';
      return isSearching && isRecent && matchesVehicle;
    });
  }

  // -------------------------------------------------------------
  // Real Driver Presence & Online Status Tracking
  // -------------------------------------------------------------
  public registerOnlineDriver(driver: OnlineDriver) {
    if (typeof window === 'undefined') return;
    try {
      const drivers = this.getOnlineDrivers();
      const idx = drivers.findIndex(d => d.driverId === driver.driverId);
      const updatedDriver = { ...driver, isOnline: true, lastSeen: Date.now() };

      if (idx !== -1) {
        drivers[idx] = updatedDriver;
      } else {
        drivers.push(updatedDriver);
      }

      localStorage.setItem(STORAGE_DRIVERS_KEY, JSON.stringify(drivers));
      this.notifyDriverListeners();

      if (ridesChannel) {
        ridesChannel.postMessage({ type: 'driver-update', data: drivers });
      }
    } catch {}
  }

  public setDriverOffline(driverId: string) {
    if (typeof window === 'undefined') return;
    try {
      const drivers = this.getOnlineDrivers();
      const updated = drivers.filter(d => d.driverId !== driverId);
      localStorage.setItem(STORAGE_DRIVERS_KEY, JSON.stringify(updated));
      this.notifyDriverListeners();

      if (ridesChannel) {
        ridesChannel.postMessage({ type: 'driver-update', data: updated });
      }
    } catch {}
  }

  public getOnlineDrivers(vehicleType?: string): OnlineDriver[] {
    try {
      if (typeof window === 'undefined') return [];
      const raw = localStorage.getItem(STORAGE_DRIVERS_KEY);
      if (!raw) return [];
      const drivers: OnlineDriver[] = JSON.parse(raw);
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

      return drivers.filter(d => {
        const isFresh = d.lastSeen > fiveMinutesAgo;
        const matchesCategory = !vehicleType || d.vehicleType === vehicleType || vehicleType === 'all';
        return d.isOnline && isFresh && matchesCategory;
      });
    } catch {
      return [];
    }
  }

  public subscribeToOnlineDrivers(callback: (drivers: OnlineDriver[]) => void): () => void {
    this.driverListeners.add(callback);
    callback(this.getOnlineDrivers());
    return () => {
      this.driverListeners.delete(callback);
    };
  }

  private notifyDriverListeners() {
    const list = this.getOnlineDrivers();
    this.driverListeners.forEach(fn => fn(list));
  }
}

export const rideService = new RideService();
