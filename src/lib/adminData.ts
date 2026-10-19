import { userStorage } from './supabase';

export interface DriverApplication {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  email: string;
  vehicleType: 'bike' | 'car_ac' | 'car_non_ac' | 'rickshaw' | 'cargo';
  vehicleName: string;
  vehicleModel: string;
  vehicleNumber: string;
  vehicleColor: string;
  city: string;
  experience?: string;
  rating?: number;
  totalTrips?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documents?: {
    cnicFront?: string | null;
    cnicBack?: string | null;
    license?: string | null;
    plate?: string | null;
    selfie?: string | null;
  };
}

export interface LiveRide {
  id: string;
  riderName: string;
  riderPhone: string;
  driverName?: string;
  driverPhone?: string;
  pickupName: string;
  dropoffName: string;
  vehicleType: 'Bike' | 'Car AC' | 'Car Eco' | 'Rickshaw' | 'Cargo';
  fare: number;
  commission: number; // 15% platform cut
  status: 'searching' | 'accepted' | 'arriving' | 'in_trip' | 'completed' | 'cancelled';
  zone: 'Hayatabad' | 'University Town' | 'Saddar Cantt' | 'Ring Road' | 'Gulbahar' | 'Karkhano';
  distance: string;
  duration: string;
  startTime: string;
}

export interface SystemBroadcast {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  target: 'all' | 'drivers' | 'riders';
  sentAt: string;
  active: boolean;
}

const DRIVER_APPS_KEY = 'safargo_admin_driver_apps_v2';
const LIVE_RIDES_KEY = 'safargo_admin_live_rides_v2';
const BROADCASTS_KEY = 'safargo_admin_broadcasts_v2';

// Seed default demonstration driver applications in Peshawar
const defaultDriverApps: DriverApplication[] = [
  {
    id: 'drv-app-101',
    userId: 'user-drv-01',
    fullName: 'Tariq Afridi',
    phone: '+92 301 5551234',
    email: 'tariq.afridi@safargo.pk',
    vehicleType: 'car_ac',
    vehicleName: 'Toyota Corolla GLi',
    vehicleModel: '2023',
    vehicleNumber: 'PWA-9921',
    vehicleColor: 'Super White',
    city: 'Peshawar (University Town)',
    experience: '5 years',
    rating: 4.9,
    totalTrips: 342,
    status: 'approved',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    reviewedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    documents: {
      cnicFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      license: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      plate: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80',
      selfie: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'drv-app-102',
    userId: 'user-drv-02',
    fullName: 'Usman Ali Khan',
    phone: '+92 333 9123888',
    email: 'usman.ali@gmail.com',
    vehicleType: 'bike',
    vehicleName: 'Honda CG 125',
    vehicleModel: '2024',
    vehicleNumber: 'KHY-4402',
    vehicleColor: 'Black & Red',
    city: 'Peshawar (Hayatabad Phase 4)',
    experience: '3 years',
    rating: 4.8,
    totalTrips: 180,
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    documents: {
      cnicFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      license: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      plate: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=80',
      selfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'drv-app-103',
    userId: 'user-drv-03',
    fullName: 'Junaid Durrani',
    phone: '+92 345 7712999',
    email: 'junaid.pesh@yahoo.com',
    vehicleType: 'rickshaw',
    vehicleName: 'Sazgar 4-Stroke CNG',
    vehicleModel: '2022',
    vehicleNumber: 'PR-8812',
    vehicleColor: 'Green & Yellow',
    city: 'Peshawar (Gulbahar No. 2)',
    experience: '7 years',
    rating: 4.7,
    totalTrips: 512,
    status: 'approved',
    submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    documents: {
      cnicFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      license: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      plate: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80',
      selfie: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'drv-app-104',
    userId: 'user-drv-04',
    fullName: 'Bilal Shinwari',
    phone: '+92 313 8882311',
    email: 'bilal.shinwari@gmail.com',
    vehicleType: 'cargo',
    vehicleName: 'Suzuki Bolan Pickup',
    vehicleModel: '2021',
    vehicleNumber: 'CP-3210',
    vehicleColor: 'White',
    city: 'Peshawar (Karkhano Market)',
    experience: '4 years',
    rating: 4.9,
    totalTrips: 220,
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    documents: {
      cnicFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      license: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      plate: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80',
      selfie: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80'
    }
  }
];

// Seed live real-time active trips in Peshawar
const defaultLiveRides: LiveRide[] = [
  {
    id: 'RIDE-PWA-401',
    riderName: 'Ahmad Khan',
    riderPhone: '+92 300 1234567',
    driverName: 'Tariq Afridi',
    driverPhone: '+92 301 5551234',
    pickupName: 'Hayatabad Phase 3 (Tatara Park)',
    dropoffName: 'Islamia College Peshawar',
    vehicleType: 'Car AC',
    fare: 450,
    commission: 67.5,
    status: 'in_trip',
    zone: 'Hayatabad',
    distance: '6.4 km',
    duration: '14 min',
    startTime: '10 mins ago'
  },
  {
    id: 'RIDE-PWA-402',
    riderName: 'Dr. Saira Begum',
    riderPhone: '+92 334 9871122',
    driverName: 'Junaid Durrani',
    driverPhone: '+92 345 7712999',
    pickupName: 'Saddar Cantt (Deans Mall)',
    dropoffName: 'Lady Reading Hospital (LRH)',
    vehicleType: 'Rickshaw',
    fare: 260,
    commission: 39.0,
    status: 'arriving',
    zone: 'Saddar Cantt',
    distance: '3.8 km',
    duration: '9 min',
    startTime: '3 mins ago'
  },
  {
    id: 'RIDE-PWA-403',
    riderName: 'Kamran Mohmand',
    riderPhone: '+92 315 2201991',
    pickupName: 'Karkhano Market (Sitara Mall)',
    dropoffName: 'Board Bazar, University Road',
    vehicleType: 'Bike',
    fare: 210,
    commission: 31.5,
    status: 'searching',
    zone: 'Karkhano',
    distance: '5.1 km',
    duration: '11 min',
    startTime: 'Just now'
  },
  {
    id: 'RIDE-PWA-404',
    riderName: 'Farhan Bangash',
    riderPhone: '+92 302 9901144',
    driverName: 'Usman Ali Khan',
    driverPhone: '+92 333 9123888',
    pickupName: 'Peshawar Museum',
    dropoffName: 'Qissa Khwani Bazaar',
    vehicleType: 'Bike',
    fare: 150,
    commission: 22.5,
    status: 'completed',
    zone: 'Saddar Cantt',
    distance: '2.1 km',
    duration: '6 min',
    startTime: '35 mins ago'
  }
];

const defaultBroadcasts: SystemBroadcast[] = [
  {
    id: 'bc-01',
    message: 'Notice: BRT corridor special traffic protocol in effect near Saddar. Drive carefully.',
    type: 'info',
    target: 'all',
    sentAt: 'Today, 2:30 PM',
    active: true
  },
  {
    id: 'bc-02',
    message: 'Peak Demand Alert: Hayatabad Phase 3 & 4 has +25% bonus surge active for next 2 hours!',
    type: 'urgent',
    target: 'drivers',
    sentAt: 'Today, 5:15 PM',
    active: true
  }
];

export const adminManager = {
  // 1. Driver Applications
  getDriverApplications(): DriverApplication[] {
    try {
      const data = localStorage.getItem(DRIVER_APPS_KEY);
      if (!data) {
        localStorage.setItem(DRIVER_APPS_KEY, JSON.stringify(defaultDriverApps));
        return defaultDriverApps;
      }
      return JSON.parse(data);
    } catch {
      return defaultDriverApps;
    }
  },

  addDriverApplication(app: DriverApplication): void {
    const apps = this.getDriverApplications();
    const existingIdx = apps.findIndex(a => a.id === app.id || a.phone === app.phone);
    if (existingIdx !== -1) {
      apps[existingIdx] = { ...apps[existingIdx], ...app };
    } else {
      apps.unshift(app);
    }
    localStorage.setItem(DRIVER_APPS_KEY, JSON.stringify(apps));
  },

  approveDriver(id: string): DriverApplication | null {
    const apps = this.getDriverApplications();
    const target = apps.find(a => a.id === id);
    if (target) {
      target.status = 'approved';
      target.reviewedAt = new Date().toISOString();
      localStorage.setItem(DRIVER_APPS_KEY, JSON.stringify(apps));

      // Also ensure user role is updated in userStorage
      if (target.userId) {
        userStorage.updateRole(target.userId, 'driver');
      } else {
        const found = userStorage.findUserByEmailOrPhone(target.phone) || userStorage.findUserByEmailOrPhone(target.email);
        if (found) {
          userStorage.updateRole(found.id, 'driver');
        }
      }
      return target;
    }
    return null;
  },

  rejectDriver(id: string, reason: string): DriverApplication | null {
    const apps = this.getDriverApplications();
    const target = apps.find(a => a.id === id);
    if (target) {
      target.status = 'rejected';
      target.rejectionReason = reason;
      target.reviewedAt = new Date().toISOString();
      localStorage.setItem(DRIVER_APPS_KEY, JSON.stringify(apps));
      return target;
    }
    return null;
  },

  // 2. Live Rides
  getLiveRides(): LiveRide[] {
    try {
      const data = localStorage.getItem(LIVE_RIDES_KEY);
      if (!data) {
        localStorage.setItem(LIVE_RIDES_KEY, JSON.stringify(defaultLiveRides));
        return defaultLiveRides;
      }
      return JSON.parse(data);
    } catch {
      return defaultLiveRides;
    }
  },

  updateRideStatus(rideId: string, status: LiveRide['status']): void {
    const rides = this.getLiveRides();
    const ride = rides.find(r => r.id === rideId);
    if (ride) {
      ride.status = status;
      localStorage.setItem(LIVE_RIDES_KEY, JSON.stringify(rides));
    }
  },

  cancelRide(rideId: string): void {
    this.updateRideStatus(rideId, 'cancelled');
  },

  // 3. Broadcast Notifications
  getBroadcasts(): SystemBroadcast[] {
    try {
      const data = localStorage.getItem(BROADCASTS_KEY);
      if (!data) {
        localStorage.setItem(BROADCASTS_KEY, JSON.stringify(defaultBroadcasts));
        return defaultBroadcasts;
      }
      return JSON.parse(data);
    } catch {
      return defaultBroadcasts;
    }
  },

  createBroadcast(message: string, type: 'info' | 'warning' | 'urgent', target: 'all' | 'drivers' | 'riders'): SystemBroadcast {
    const broadcasts = this.getBroadcasts();
    const newBc: SystemBroadcast = {
      id: `bc-${Date.now()}`,
      message,
      type,
      target,
      sentAt: 'Just now',
      active: true
    };
    broadcasts.unshift(newBc);
    localStorage.setItem(BROADCASTS_KEY, JSON.stringify(broadcasts));
    return newBc;
  },

  deleteBroadcast(id: string): void {
    const broadcasts = this.getBroadcasts().filter(b => b.id !== id);
    localStorage.setItem(BROADCASTS_KEY, JSON.stringify(broadcasts));
  },

  // 4. Aggregated KPIs
  getKPIs() {
    const rides = this.getLiveRides();
    const driverApps = this.getDriverApplications();
    const allUsers = userStorage.getUsers();

    const totalGrossRevenue = rides.reduce((acc, r) => acc + (r.fare || 0), 128500);
    const platformCommission = Math.round(totalGrossRevenue * 0.15);
    const activeLiveRidesCount = rides.filter(r => r.status === 'in_trip' || r.status === 'arriving' || r.status === 'searching').length;
    const verifiedDriversCount = driverApps.filter(d => d.status === 'approved').length;
    const pendingDriversCount = driverApps.filter(d => d.status === 'pending').length;

    return {
      totalGrossRevenue,
      platformCommission,
      activeLiveRidesCount,
      totalUsersCount: allUsers.length + 120, // includes registered platform passengers
      verifiedDriversCount: verifiedDriversCount + 45,
      pendingDriversCount
    };
  }
};
