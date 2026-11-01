import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, CheckCircle2, RotateCw, X } from 'lucide-react';
import { sound } from '../lib/sound';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onLocationGranted: (coords: { lat: number; lng: number }) => void;
  onClose?: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onLocationGranted,
  onClose
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check initial permission status if supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          setPermissionState('granted');
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              onLocationGranted({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => {},
            { timeout: 5000 }
          );
        } else if (result.state === 'denied') {
          setPermissionState('denied');
        }

        result.onchange = () => {
          if (result.state === 'granted') {
            setPermissionState('granted');
            navigator.geolocation.getCurrentPosition((pos) => {
              onLocationGranted({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
          } else if (result.state === 'denied') {
            setPermissionState('denied');
          }
        };
      }).catch(() => {});
    }
  }, [onLocationGranted]);

  const handleRequestLocation = () => {
    sound.playClick();
    setIsRequesting(true);
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setIsRequesting(false);
      setErrorMessage('Geolocation is not supported by your browser.');
      sound.playError();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequesting(false);
        setPermissionState('granted');
        sound.playSuccess();
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        sessionStorage.setItem('safargo_user_lat', coords.lat.toString());
        sessionStorage.setItem('safargo_user_lng', coords.lng.toString());
        onLocationGranted(coords);
      },
      (error) => {
        setIsRequesting(false);
        sound.playError();
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState('denied');
          setErrorMessage('Location permission was denied. Please allow location access in your browser or device settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMessage('GPS location unavailable. Please make sure Location / GPS is turned ON in your device settings.');
        } else {
          setErrorMessage('Location request timed out. Please retry.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  if (!isOpen || permissionState === 'granted') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none selection:bg-[#3ebd19]/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-center flex flex-col items-center overflow-hidden"
        >
          {/* Close button if provided */}
          {onClose && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Background Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Smooth Non-Shaking Icon */}
          <div className="relative mb-4 mt-2">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-[#16a34a] shadow-lg shadow-emerald-500/10 relative border-2 border-emerald-200">
              <MapPin className="w-10 h-10 stroke-[2.2]" />
              <div className="absolute inset-0 rounded-full bg-[#16a34a]/15 radar-soft-pulse pointer-events-none" />
            </div>
          </div>

          {/* Badge */}
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Navigation className="w-3.5 h-3.5 text-[#16a34a]" />
              <span>Real-Time GPS</span>
            </span>
          </div>

          {/* Heading & Subtitle */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Enable Live Location
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mb-4 font-medium">
            Allow location access so SafarGo can track your exact pickup point in Peshawar and connect you with nearby drivers.
          </p>

          {/* Benefits Checklist */}
          <div className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 mb-4 text-left text-xs space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3ebd19] shrink-0" />
              <span className="text-slate-700 font-bold">Auto-detect your current live address</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3ebd19] shrink-0" />
              <span className="text-slate-700 font-bold">Fastest driver dispatch across Peshawar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3ebd19] shrink-0" />
              <span className="text-slate-700 font-bold">Accurate route metering & transparent fares</span>
            </div>
          </div>

          {/* Error / Denied Instructions Alert */}
          {errorMessage && (
            <div className="w-full p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs text-left mb-4 space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Permission Blocked in Settings</span>
              </div>
              <p className="text-[11px] text-red-700 leading-relaxed">
                Location is blocked. Please allow Location in your browser address bar (tap the 🔒 icon) and click retry.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-2">
            <button
              type="button"
              disabled={isRequesting}
              onClick={handleRequestLocation}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer disabled:opacity-75"
            >
              {isRequesting ? (
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Finding GPS Location...</span>
                </div>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Turn On Location / Allow GPS</span>
                </>
              )}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Continue with Peshawar City Center
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};