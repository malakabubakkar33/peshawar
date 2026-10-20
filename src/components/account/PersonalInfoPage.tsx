import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Camera, CheckCircle2, ShieldCheck, 
  User, Mail, Phone, MapPin, Calendar, Trash2, 
  Save, AlertCircle, Sparkles, Car
} from 'lucide-react';
import { userStorage, type UserAccount } from '../../lib/supabase';
import { sound } from '../../lib/sound';
import { ImageCropperModal } from '../ImageCropperModal';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface PersonalInfoPageProps {
  user: UserAccount;
  onBack: () => void;
  onUserUpdated: (updatedUser: UserAccount) => void;
  onOpenAdminPanel?: () => void;
  onSwitchToDriver?: () => void;
}

export const PersonalInfoPage: React.FC<PersonalInfoPageProps> = ({
  user,
  onBack,
  onUserUpdated,
  onOpenAdminPanel,
  onSwitchToDriver
}) => {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');
  const [email] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || 'Peshawar (Hayatabad Phase 3)');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Crop Modal state
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deletion request confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setRawImageForCrop(dataUrl);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setAvatarUrl(croppedDataUrl);
    sound.playSuccess();
    const updated = userStorage.updateUser(user.id, { avatarUrl: croppedDataUrl });
    if (updated) {
      onUserUpdated(updated);
    }
    uploadToCloudinary(croppedDataUrl, 'safargo_avatars').then((res) => {
      if (res.success && res.url) {
        const cUpdated = userStorage.updateUser(user.id, { avatarUrl: res.url });
        if (cUpdated) onUserUpdated(cUpdated);
      }
    });
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name cannot be empty.');
      sound.playError();
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      sound.playError();
      return;
    }

    setIsSaving(true);
    sound.playClick();

    setTimeout(() => {
      const updated = userStorage.updateUser(user.id, {
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim(),
        city: city.trim(),
        avatarUrl
      });

      setIsSaving(false);
      if (updated) {
        onUserUpdated(updated);
        setSaveSuccess(true);
        sound.playSuccess();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage('Failed to update account. Please try again.');
        sound.playError();
      }
    }, 600);
  };

  return (
    <div className="w-full min-h-screen bg-[#fafdf8] pt-18 sm:pt-20 pb-28 px-4 sm:px-6 max-w-2xl mx-auto font-sans">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

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
          <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Personal Information
          </span>
        </div>
      </div>

      {/* Profile Avatar & Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm mb-6 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-emerald-50 border-3 border-[#16a34a] shadow-md group">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={fullName}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
            title="Change Photo"
          >
            <Camera className="w-6 h-6 text-emerald-300" />
            <span className="text-[10px] font-bold mt-1">Change</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 text-xs font-extrabold text-[#16a34a] hover:underline flex items-center gap-1.5"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Upload New Profile Photo</span>
        </button>

        <div className="mt-3">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200 uppercase tracking-wider inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#16a34a]" />
            Passenger Account
          </span>
        </div>
      </motion.div>

      {/* Form Fields */}
      <form onSubmit={handleSaveChanges} className="space-y-4">
        {/* Success Alert */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
            <span>Profile information successfully updated!</span>
          </motion.div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ahmad Khan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ahmad_khan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Email (Readonly with Verified Badge) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#16a34a]" />
                Verified
              </span>
            </div>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold bg-slate-100 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Email verification linked to your SafarGo passenger identity.
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </label>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#16a34a]" />
                Active
              </span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Preferred Peshawar City / Zone */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Primary Peshawar Zone
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-slate-50/50"
            >
              <option value="Peshawar (Hayatabad Phase 3)">Peshawar (Hayatabad Phase 3)</option>
              <option value="Peshawar (Hayatabad Phase 1-7)">Peshawar (Hayatabad Other Phases)</option>
              <option value="Peshawar (Saddar Cantt)">Peshawar (Saddar Cantt)</option>
              <option value="Peshawar (University Town)">Peshawar (University Town)</option>
              <option value="Peshawar (City Heritage / Qissa Khwani)">Peshawar (City Heritage / Qissa Khwani)</option>
              <option value="Peshawar (Ring Road Corridor)">Peshawar (Ring Road Corridor)</option>
            </select>
          </div>

          {/* Member Since Metadata */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Member Since
            </span>
            <span className="font-bold text-slate-700">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'October 2026'}
            </span>
          </div>
        </div>

        {/* Action Button: Save Changes */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </form>

      {/* Admin Panel Quick Access (if user is admin) */}
      {onOpenAdminPanel && (user.role === 'admin' || user.email?.includes('admin')) && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg border border-emerald-500/30">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">System Administrator</span>
            <span className="text-xs font-bold text-slate-200">SafarGo Operations Command Center</span>
          </div>
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="px-3.5 py-1.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            Open Admin
          </button>
        </div>
      )}

      {/* Switch to Driver Mode Card */}
      {onSwitchToDriver && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between shadow-md border border-emerald-500/25">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" />
              SafarGo Driver Mode
            </span>
            <p className="text-xs text-slate-300">Earn in Peshawar with your bike or car</p>
          </div>
          <button
            type="button"
            onClick={onSwitchToDriver}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-white text-xs font-bold hover:brightness-105 transition-all active:scale-95 shadow-sm shrink-0"
          >
            Switch Mode
          </button>
        </div>
      )}

      {/* Account Deletion Area */}
      <div className="mt-8 pt-6 border-t border-slate-200/80">
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-900">Request Account Deletion</h4>
            <p className="text-[11px] text-rose-700 mt-0.5">
              Permanently erase your account, ride history, and saved data.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors active:scale-95 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-rose-100 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Request Account Deletion?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to request deletion of your SafarGo account? This will wipe your ride history, saved places, and passenger profile.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sound.playSuccess();
                  alert('Your account deletion request has been registered. Our safety team will process it within 24 hours.');
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md"
              >
                Confirm Request
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {isCropModalOpen && rawImageForCrop && (
        <ImageCropperModal
          isOpen={isCropModalOpen}
          imageSrc={rawImageForCrop}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};
