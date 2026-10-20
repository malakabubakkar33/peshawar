import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Settings, Globe, Sun, Map, 
  Volume2, Smartphone, Crosshair, CheckCircle2,
  Bell, ChevronRight, Info
} from 'lucide-react';
import { passengerStorage, type AppSettings } from '../../lib/passengerStorage';
import { sound } from '../../lib/sound';

interface AppSettingsPageProps {
  onBack: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToAppVersion?: () => void;
}

export const AppSettingsPage: React.FC<AppSettingsPageProps> = ({
  onBack,
  onNavigateToNotifications,
  onNavigateToAppVersion
}) => {
  const [settings, setSettings] = useState<AppSettings>(() => passengerStorage.getAppSettings());
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleUpdate = (partial: Partial<AppSettings>) => {
    sound.playPop();
    const updated = passengerStorage.saveAppSettings(partial);
    setSettings(updated);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#fafdf8] pt-18 sm:pt-20 pb-28 px-4 sm:px-6 max-w-2xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-[#16a34a] hover:border-emerald-300 font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#16a34a]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#16a34a]" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            App Settings
          </span>
        </div>
      </div>

      {showSavedFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
          <span>Settings saved and applied.</span>
        </motion.div>
      )}

      <div className="space-y-4">
        {/* 1. LANGUAGE SETTINGS */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16a34a] flex items-center justify-center border border-emerald-100">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Application Language</h3>
              <p className="text-xs text-slate-500">Choose your preferred display language</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
            <button
              onClick={() => handleUpdate({ language: 'en' })}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                settings.language === 'en'
                  ? 'bg-emerald-50/80 border-[#16a34a] text-[#16a34a] shadow-sm font-black'
                  : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
              }`}
            >
              <div>
                <span className="text-xs block">English</span>
                <span className="text-[10px] text-slate-400 font-normal">Default (US/UK)</span>
              </div>
              {settings.language === 'en' && <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />}
            </button>

            <button
              onClick={() => handleUpdate({ language: 'ur' })}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                settings.language === 'ur'
                  ? 'bg-emerald-50/80 border-[#16a34a] text-[#16a34a] shadow-sm font-black'
                  : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
              }`}
            >
              <div>
                <span className="text-xs block font-urdu">اردو (Urdu)</span>
                <span className="text-[10px] text-slate-400 font-normal">Pakistan</span>
              </div>
              {settings.language === 'ur' && <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />}
            </button>
          </div>
        </div>

        {/* 2. THEME & APPEARANCE */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">App Theme & Appearance</h3>
                <p className="text-xs text-slate-500">SafarGo clean green & white light design</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
              Light (Standard)
            </span>
          </div>
        </div>

        {/* 3. MAP RENDERING PREFERENCE */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Peshawar Map View</h3>
              <p className="text-xs text-slate-500">Select map layer aesthetic</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            {[
              { id: 'voyager', label: 'Clean Vector' },
              { id: 'streets', label: 'Streets OSM' },
              { id: 'satellite', label: 'Satellite' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleUpdate({ mapStyle: item.id as any })}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  settings.mapStyle === item.id
                    ? 'bg-emerald-50 border-[#16a34a] text-[#16a34a] font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="text-xs block">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. SOUNDS & HAPTICS */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16a34a] flex items-center justify-center border border-emerald-100">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Sound Effects</h4>
                <p className="text-[11px] text-slate-400">Audio feedback on button taps and ride status</p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) => handleUpdate({ soundEffects: e.target.checked })}
              className="w-5 h-5 accent-[#16a34a] cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Haptic Vibrations</h4>
                <p className="text-[11px] text-slate-400">Tactile buzz on trip acceptance and arrival</p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={settings.hapticFeedback}
              onChange={(e) => handleUpdate({ hapticFeedback: e.target.checked })}
              className="w-5 h-5 accent-[#16a34a] cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <Crosshair className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">High-Precision GPS</h4>
                <p className="text-[11px] text-slate-400">Continuous accuracy for Peshawar street routing</p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={settings.highAccuracyGps}
              onChange={(e) => handleUpdate({ highAccuracyGps: e.target.checked })}
              className="w-5 h-5 accent-[#16a34a] cursor-pointer"
            />
          </div>
        </div>

        {/* 5. SHORTCUTS */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-2 shadow-sm space-y-1">
          {onNavigateToNotifications && (
            <button
              onClick={() => {
                sound.playPop();
                onNavigateToNotifications();
              }}
              className="w-full p-3.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Notification Preferences</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {onNavigateToAppVersion && (
            <button
              onClick={() => {
                sound.playPop();
                onNavigateToAppVersion();
              }}
              className="w-full p-3.5 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">App Version & Build Details</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
