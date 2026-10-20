export interface SavedPlace {
  id: string;
  label: 'Home' | 'Work' | 'Favorite' | 'Other';
  name: string;
  address: string;
  lat: number;
  lng: number;
  isCustom?: boolean;
}

export interface AppSettings {
  language: 'en' | 'ur';
  appearance: 'light'; // Light is default and standard for SafarGo
  mapStyle: 'voyager' | 'streets' | 'satellite';
  soundEffects: boolean;
  hapticFeedback: boolean;
  highAccuracyGps: boolean;
  appVersion: string;
  buildNumber: string;
}

export interface NotificationPreferences {
  rideBookingUpdates: boolean;
  driverAcceptance: boolean;
  driverArrival: boolean;
  tripCompletion: boolean;
  paymentRefunds: boolean;
  accountSecurityAlerts: boolean;
  promotionsOffers: boolean;
}

export interface PromoOffer {
  id: string;
  code: string;
  title: string;
  discount: string;
  description: string;
  expiryDate: string;
  minFare?: number;
  validZones?: string[];
  terms: string;
}

export interface SupportTicket {
  id: string;
  category: 'Rides' | 'Fares & Payments' | 'Driver Conduct' | 'Lost Item' | 'Account & Security' | 'App Feedback';
  subject: string;
  description: string;
  relatedRideId?: string;
  status: 'Open' | 'In Review' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
  responseMessage?: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const SAVED_PLACES_KEY_PREFIX = 'safargo_saved_places_';
const APP_SETTINGS_KEY = 'safargo_app_settings_v1';
const NOTIF_PREFS_KEY_PREFIX = 'safargo_notif_prefs_';
const SUPPORT_TICKETS_KEY_PREFIX = 'safargo_support_tickets_';
const TRUSTED_CONTACTS_KEY_PREFIX = 'safargo_trusted_contacts_';

// 1. SAVED PLACES STORAGE
export const passengerStorage = {
  getSavedPlaces(userId: string): SavedPlace[] {
    try {
      const raw = localStorage.getItem(`${SAVED_PLACES_KEY_PREFIX}${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }

    // Default Seeded Peshawar places
    const defaultPlaces: SavedPlace[] = [
      {
        id: 'place-home',
        label: 'Home',
        name: 'Hayatabad Phase 3',
        address: 'Sector G-3, Near Tatara Park & Street 7, Hayatabad, Peshawar',
        lat: 33.9921,
        lng: 71.4389
      },
      {
        id: 'place-work',
        label: 'Work',
        name: 'Islamia College Peshawar (ICP)',
        address: 'Grand Trunk Road, University Campus, Peshawar',
        lat: 34.0086,
        lng: 71.4820
      },
      {
        id: 'place-fav-1',
        label: 'Favorite',
        name: 'Deans Shopping Mall Saddar',
        address: 'Main Sunhari Masjid Road, Saddar Cantt, Peshawar',
        lat: 34.0035,
        lng: 71.5420
      }
    ];
    this.saveSavedPlaces(userId, defaultPlaces);
    return defaultPlaces;
  },

  saveSavedPlaces(userId: string, places: SavedPlace[]): void {
    try {
      localStorage.setItem(`${SAVED_PLACES_KEY_PREFIX}${userId}`, JSON.stringify(places));
    } catch (e) {
      console.warn('Failed to save places to localStorage:', e);
    }
  },

  addSavedPlace(userId: string, place: Omit<SavedPlace, 'id'>): SavedPlace {
    const list = this.getSavedPlaces(userId);
    const newPlace: SavedPlace = {
      ...place,
      id: `saved-${Date.now()}`
    };
    const updated = [newPlace, ...list];
    this.saveSavedPlaces(userId, updated);
    return newPlace;
  },

  deleteSavedPlace(userId: string, placeId: string): void {
    const list = this.getSavedPlaces(userId);
    const updated = list.filter(p => p.id !== placeId);
    this.saveSavedPlaces(userId, updated);
  },

  updateSavedPlace(userId: string, placeId: string, updates: Partial<SavedPlace>): void {
    const list = this.getSavedPlaces(userId);
    const updated = list.map(p => (p.id === placeId ? { ...p, ...updates } : p));
    this.saveSavedPlaces(userId, updated);
  },

  // 2. APP SETTINGS
  getAppSettings(): AppSettings {
    const defaults: AppSettings = {
      language: 'en',
      appearance: 'light',
      mapStyle: 'voyager',
      soundEffects: true,
      hapticFeedback: true,
      highAccuracyGps: true,
      appVersion: '2.4.0',
      buildNumber: '2026.10.20'
    };
    try {
      const raw = localStorage.getItem(APP_SETTINGS_KEY);
      if (raw) return { ...defaults, ...JSON.parse(raw) };
    } catch {
      // fallback
    }
    return defaults;
  },

  saveAppSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getAppSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
    return updated;
  },

  // 3. NOTIFICATION PREFERENCES
  getNotificationPreferences(userId: string): NotificationPreferences {
    const defaults: NotificationPreferences = {
      rideBookingUpdates: true,
      driverAcceptance: true,
      driverArrival: true,
      tripCompletion: true,
      paymentRefunds: true,
      accountSecurityAlerts: true, // Crucial security notification
      promotionsOffers: true
    };
    try {
      const raw = localStorage.getItem(`${NOTIF_PREFS_KEY_PREFIX}${userId}`);
      if (raw) return { ...defaults, ...JSON.parse(raw) };
    } catch {
      // fallback
    }
    return defaults;
  },

  saveNotificationPreferences(userId: string, prefs: NotificationPreferences): void {
    try {
      // Security notifications must always be true for account safety
      const safePrefs = { ...prefs, accountSecurityAlerts: true };
      localStorage.setItem(`${NOTIF_PREFS_KEY_PREFIX}${userId}`, JSON.stringify(safePrefs));
    } catch (e) {
      console.warn('Failed to save notification preferences:', e);
    }
  },

  // 4. OFFERS & PROMOS
  getActiveOffers(): PromoOffer[] {
    return [
      {
        id: 'promo-1',
        code: 'PESHAWAR50',
        title: '50% Off First 3 Rides',
        discount: '50% OFF',
        description: 'Enjoy 50% discount up to PKR 150 on your rides across Peshawar.',
        expiryDate: 'Valid till 30 Nov 2026',
        minFare: 100,
        terms: 'Applicable on Bike, Car and Comfort rides in Hayatabad, Saddar, and University Town.'
      },
      {
        id: 'promo-2',
        code: 'SAFARGO20',
        title: 'Hayatabad to Saddar Special',
        discount: '20% OFF',
        description: 'Get 20% discount on trips between Hayatabad Phases and Saddar Cantt.',
        expiryDate: 'Valid till 15 Nov 2026',
        minFare: 150,
        terms: 'Valid on both Car and Bike bookings throughout peak hours.'
      },
      {
        id: 'promo-3',
        code: 'CAMPUS100',
        title: 'Student Commuter Discount',
        discount: 'PKR 100 FLAT',
        description: 'PKR 100 flat discount for students visiting UoP, ICP, UET, and IM|Sciences.',
        expiryDate: 'Valid till 31 Dec 2026',
        minFare: 200,
        terms: 'Must select University Campus as pickup or drop point.'
      }
    ];
  },

  // 5. SUPPORT TICKETS
  getSupportTickets(userId: string): SupportTicket[] {
    try {
      const raw = localStorage.getItem(`${SUPPORT_TICKETS_KEY_PREFIX}${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    const defaultTickets: SupportTicket[] = [
      {
        id: 'TCK-9281',
        category: 'Fares & Payments',
        subject: 'Overcharge query on Saddar Cantt trip',
        description: 'Fare showed PKR 250 on booking, but driver took PKR 280.',
        relatedRideId: 'RIDE-8942',
        status: 'Resolved',
        priority: 'Medium',
        createdAt: '18 Oct 2026',
        updatedAt: '19 Oct 2026',
        responseMessage: 'PKR 30 difference has been refunded back to your SafarGo Cash Wallet.'
      }
    ];
    return defaultTickets;
  },

  createSupportTicket(userId: string, ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): SupportTicket {
    const list = this.getSupportTickets(userId);
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Open',
      createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedAt: 'Just now'
    };
    const updated = [newTicket, ...list];
    try {
      localStorage.setItem(`${SUPPORT_TICKETS_KEY_PREFIX}${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save support ticket:', e);
    }
    return newTicket;
  },

  // 6. TRUSTED CONTACTS
  getTrustedContacts(userId: string): TrustedContact[] {
    try {
      const raw = localStorage.getItem(`${TRUSTED_CONTACTS_KEY_PREFIX}${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'contact-1',
        name: 'Family Home',
        phone: '+92 300 9876543',
        relationship: 'Family'
      }
    ];
  },

  addTrustedContact(userId: string, contact: Omit<TrustedContact, 'id'>): TrustedContact {
    const list = this.getTrustedContacts(userId);
    const newContact: TrustedContact = {
      ...contact,
      id: `contact-${Date.now()}`
    };
    const updated = [...list, newContact];
    try {
      localStorage.setItem(`${TRUSTED_CONTACTS_KEY_PREFIX}${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save trusted contact:', e);
    }
    return newContact;
  },

  deleteTrustedContact(userId: string, id: string): void {
    const list = this.getTrustedContacts(userId);
    const updated = list.filter(c => c.id !== id);
    try {
      localStorage.setItem(`${TRUSTED_CONTACTS_KEY_PREFIX}${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete trusted contact:', e);
    }
  }
};
