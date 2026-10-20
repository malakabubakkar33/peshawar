// Real Push Notification Service for SafarGo Peshawar
import { sound } from './sound';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  data?: any;
}

class PushNotificationManager {
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Request native browser push notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Push Notifications are not supported in this browser.');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem('safargo_push_permission', permission);
      return permission;
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return 'denied';
    }
  }

  /**
   * Check current permission state
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  /**
   * Send a push notification (Native Browser OS Notification + In-App Event)
   */
  sendNotification(payload: PushNotificationPayload): void {
    const defaultIcon = '/safar-go-monogram-exact.png';

    // 1. Play chime sound
    sound.playSuccess();

    // 2. Dispatch custom in-app event for immediate interactive toast
    window.dispatchEvent(
      new CustomEvent('safargo-inapp-push', {
        detail: {
          ...payload,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      })
    );

    // 3. Trigger native OS Push Notification if permitted
    if (this.isSupported && Notification.permission === 'granted') {
      try {
        const notif = new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || defaultIcon,
          badge: defaultIcon,
          tag: payload.tag || 'safargo-alert',
          silent: false
        });

        notif.onclick = () => {
          window.focus();
          if (payload.url) {
            window.location.href = payload.url;
          }
          notif.close();
        };
      } catch (err) {
        console.warn('Native Notification constructor failed (common in some restricted iframes):', err);
      }
    }
  }
}

export const pushNotificationService = new PushNotificationManager();
