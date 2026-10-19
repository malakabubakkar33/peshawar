import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, User, Phone, Mail, 
  CreditCard, FileText, Camera, Upload, 
  Check, AlertCircle, Trash2, ShieldCheck, Sparkles
} from 'lucide-react';
import { type UserAccount } from '../lib/supabase';
import { adminManager } from '../lib/adminData';
import { sound } from '../lib/sound';

interface DriverApplicationPageProps {
  user: UserAccount | null;
  onBack: () => void;
  onSubmitApplication: (driverData: any) => void;
}

type DocKey = 'cnicFront' | 'cnicBack' | 'license' | 'plate' | 'selfie';

interface DocConfig {
  key: DocKey;
  title: string;
  subtitle: string;
  icon: any;
  cameraFacing: 'environment' | 'user';
}

const DOCUMENT_CONFIGS: DocConfig[] = [
  {
    key: 'cnicFront',
    title: 'CNIC (Front Side)',
    subtitle: 'Clear front photo showing CNIC number & name',
    icon: CreditCard,
    cameraFacing: 'environment'
  },
  {
    key: 'cnicBack',
    title: 'CNIC (Back Side)',
    subtitle: 'Clear back photo with address & issue date',
    icon: CreditCard,
    cameraFacing: 'environment'
  },
  {
    key: 'license',
    title: 'Driving License',
    subtitle: 'Valid Pakistani driving license photo',
    icon: FileText,
    cameraFacing: 'environment'
  },
  {
    key: 'plate',
    title: 'Vehicle Number Plate',
    subtitle: 'Clear photo of front or rear registration plate',
    icon: Camera,
    cameraFacing: 'environment'
  },
  {
    key: 'selfie',
    title: 'Personal Photo / Selfie',
    subtitle: 'Clear front-facing driver selfie without sunglasses',
    icon: User,
    cameraFacing: 'user'
  }
];

export const DriverApplicationPage: React.FC<DriverApplicationPageProps> = ({
  user,
  onBack,
  onSubmitApplication
}) => {
  const [fullName, setFullName] = useState(user?.fullName || 'Usman Khan');
  const [phone, setPhone] = useState(user?.phone || '0300-1234567');
  const [email, setEmail] = useState(user?.email || 'usman.driver@safargo.pk');

  // Vehicle Details (Manual Inputs as requested)
  const [vehicleType, setVehicleType] = useState<'bike' | 'car_ac' | 'car_non_ac' | 'rickshaw'>('bike');
  const [vehicleName, setVehicleName] = useState('Honda CG 125');
  const [vehicleModel, setVehicleModel] = useState('2023');
  const [vehicleNumber, setVehicleNumber] = useState('PWA-7421');
  const [vehicleColor, setVehicleColor] = useState('Black');

  // Real Uploaded Document Base64 Data URLs
  const [documents, setDocuments] = useState<Record<DocKey, string | null>>({
    cnicFront: null,
    cnicBack: null,
    license: null,
    plate: null,
    selfie: null
  });

  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separate refs for Camera and Device file inputs for each doc
  const cameraInputRefs = {
    cnicFront: useRef<HTMLInputElement>(null),
    cnicBack: useRef<HTMLInputElement>(null),
    license: useRef<HTMLInputElement>(null),
    plate: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
  };

  const deviceInputRefs = {
    cnicFront: useRef<HTMLInputElement>(null),
    cnicBack: useRef<HTMLInputElement>(null),
    license: useRef<HTMLInputElement>(null),
    plate: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    sound.playError();
    setTimeout(() => setErrorMsg(null), 4000);
  };

  // Real Image File Processing
  const handleFileSelected = (key: DocKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showError('Image size exceeds 15MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setDocuments(prev => ({ ...prev, [key]: dataUrl }));
      sound.playSuccess();
    };
    reader.onerror = () => {
      showError('Failed to read photo. Please try again.');
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same photo triggers onChange
    e.target.value = '';
  };

  const removeDoc = (key: DocKey) => {
    sound.playClick();
    setDocuments(prev => ({ ...prev, [key]: null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    if (!fullName.trim()) return showError('Please enter your full name.');
    if (!phone.trim()) return showError('Please enter your phone number.');
    if (!email.trim()) return showError('Please enter your email address.');
    if (!vehicleName.trim()) return showError('Please manually enter Vehicle Name (e.g. Honda CG 125, Toyota Corolla).');
    if (!vehicleModel.trim()) return showError('Please manually enter Vehicle Model Year (e.g. 2023).');
    if (!vehicleNumber.trim()) return showError('Please enter Vehicle Registration Number (e.g. PWA-7421).');

    // Verification check for uploaded documents
    const missingDocs: string[] = [];
    if (!documents.cnicFront) missingDocs.push('CNIC Front');
    if (!documents.cnicBack) missingDocs.push('CNIC Back');
    if (!documents.license) missingDocs.push('Driving License');
    if (!documents.plate) missingDocs.push('Vehicle Number Plate');
    if (!documents.selfie) missingDocs.push('Personal Photo / Selfie');

    if (missingDocs.length > 0) {
      return showError(`Please upload required documents: ${missingDocs.slice(0, 2).join(', ')}${missingDocs.length > 2 ? '...' : ''}`);
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      sound.playSuccess();
      const payload = {
        fullName,
        phone,
        email,
        vehicleType,
        vehicleName,
        vehicleModel,
        vehicleNumber,
        vehicleColor: vehicleColor.trim() || 'Black',
        driverId: 'SGD' + Math.floor(10000 + Math.random() * 90000),
        rating: 4.8,
        totalRides: 124,
        documents,
        submittedAt: new Date().toISOString()
      };

      // Add to Admin Review Queue
      adminManager.addDriverApplication({
        id: `drv-app-${Date.now()}`,
        userId: user?.id,
        fullName,
        phone,
        email,
        vehicleType,
        vehicleName,
        vehicleModel,
        vehicleNumber,
        vehicleColor: vehicleColor.trim() || 'Black',
        city: user?.city || 'Peshawar',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        documents
      });

      onSubmitApplication(payload);
    }, 800);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#f8faf7] px-4 py-5 sm:py-7 flex flex-col items-center selection:bg-[#3ebd19]/20 selection:text-slate-900">
      
      {/* Background Subtle Corner Waves */}
      <div className="fixed top-0 left-0 w-44 h-44 pointer-events-none z-0 select-none opacity-60">
        <svg viewBox="0 0 360 360" fill="none" className="w-full h-full">
          <path d="M0 0 L0 300 C90 280 180 230 250 160 C310 90 330 30 340 0 Z" fill="#6fd622" fillOpacity="0.2" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[440px] flex flex-col mx-auto pb-10">
        
        {/* Top Bar with Back Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Driver Onboarding</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
            Driver Registration
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Fill your details, set vehicle specs manually & upload real document photos.
          </p>
        </div>

        {/* Error Toast */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-semibold">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section: Personal Info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#3ebd19]" />
              Personal Details
            </h3>

            {/* 1. Full Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600">
                Full Name
              </label>
              <div className="relative flex items-center bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-sm focus-within:bg-white focus-within:border-[#3ebd19] focus-within:ring-2 focus-within:ring-[#3ebd19]/10">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Usman Khan"
                  className="w-full bg-transparent text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Phone & Email in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">
                  Phone Number
                </label>
                <div className="flex items-center bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-sm focus-within:bg-white focus-within:border-[#3ebd19]">
                  <Phone className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">
                  Email Address
                </label>
                <div className="flex items-center bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-sm focus-within:bg-white focus-within:border-[#3ebd19]">
                  <Mail className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@safargo.pk"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Vehicle Details (Manual Inputs as requested) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3ebd19]" />
                Vehicle Information (Manual Input)
              </h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Custom Specs
              </span>
            </div>

            {/* Vehicle Type Selection */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600">
                Vehicle Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bike', label: '🏍️ Bike', desc: 'Motorcycle' },
                  { id: 'car_ac', label: '🚗 Car AC', desc: 'Sedan / Hatch' },
                  { id: 'car_non_ac', label: '🚙 Car Economy', desc: 'Non-AC' },
                  { id: 'rickshaw', label: '🛺 Rickshaw', desc: 'Auto City' },
                ].map((item) => {
                  const isSelected = vehicleType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setVehicleType(item.id as any);
                        if (item.id === 'bike' && vehicleName === 'Toyota Corolla GLi') {
                          setVehicleName('Honda CG 125');
                        } else if (item.id.startsWith('car') && vehicleName === 'Honda CG 125') {
                          setVehicleName('Toyota Corolla');
                        }
                      }}
                      className={`py-2 px-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected 
                          ? 'border-[#3ebd19] bg-[#f2fbf0] text-slate-900 shadow-sm' 
                          : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Car Name & Car Model Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Vehicle / Car Name <span className="text-emerald-600 font-normal">(User set)</span>
                </label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="e.g. Honda CG 125, Toyota Corolla"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#3ebd19]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Model / Year <span className="text-emerald-600 font-normal">(User set)</span>
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. 2023 or 2024"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#3ebd19]"
                />
              </div>
            </div>

            {/* Registration Number & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Registration Plate No.
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. PWA-7421"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 font-bold uppercase tracking-wider focus:bg-white focus:outline-none focus:border-[#3ebd19]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Vehicle Color
                </label>
                <input
                  type="text"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  placeholder="e.g. Black, White, Silver"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#3ebd19]"
                />
              </div>
            </div>
          </div>

          {/* Section: Upload Documents (With 2 Buttons: Camera & Device Gallery per Session) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#3ebd19]" />
                  Upload Documents (Real Photos)
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Camera + Upload
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Each document requires real image upload via device camera or local gallery.
              </p>
            </div>

            <div className="space-y-3">
              {DOCUMENT_CONFIGS.map((doc) => {
                const docUrl = documents[doc.key];
                const isUploaded = !!docUrl;
                const IconComponent = doc.icon;

                return (
                  <div 
                    key={doc.key}
                    className={`p-3 rounded-2xl border transition ${
                      isUploaded 
                        ? 'border-emerald-300 bg-[#f4fbf2]' 
                        : 'border-slate-200/90 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Hidden Native File Inputs */}
                    {/* 1. Camera Input */}
                    <input
                      type="file"
                      accept="image/*"
                      capture={doc.cameraFacing}
                      ref={cameraInputRefs[doc.key]}
                      onChange={(e) => handleFileSelected(doc.key, e)}
                      className="hidden"
                    />
                    {/* 2. Device / Gallery Picker Input */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={deviceInputRefs[doc.key]}
                      onChange={(e) => handleFileSelected(doc.key, e)}
                      className="hidden"
                    />

                    <div className="flex items-start justify-between gap-2.5">
                      {/* Left info & Icon */}
                      <div className="flex items-start gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isUploaded ? 'bg-emerald-600 text-white' : 'bg-[#e9f8e4] text-[#2ea80c]'
                        }`}>
                          {isUploaded ? <Check className="w-5 h-5 stroke-[3]" /> : <IconComponent className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-800">
                              {doc.title}
                            </h4>
                            {isUploaded && (
                              <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                                ✔ Verified
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                            {doc.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Right Preview thumbnail if uploaded */}
                      {isUploaded && docUrl && (
                        <div className="relative group shrink-0">
                          <img
                            src={docUrl}
                            alt={doc.title}
                            onClick={() => setPreviewDoc({ title: doc.title, url: docUrl })}
                            className="w-12 h-12 object-cover rounded-xl border border-emerald-300 cursor-pointer shadow-sm group-hover:brightness-90 transition"
                          />
                          <button
                            type="button"
                            onClick={() => removeDoc(doc.key)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 2 Distinct Action Buttons: Camera & Device Upload */}
                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-100">
                      {/* Button 1: Camera */}
                      <button
                        type="button"
                        onClick={() => cameraInputRefs[doc.key].current?.click()}
                        className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#3ebd19] hover:bg-[#f6fcf4] text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#3ebd19]" />
                        <span>Camera</span>
                      </button>

                      {/* Button 2: Upload from Device */}
                      <button
                        type="button"
                        onClick={() => deviceInputRefs[doc.key].current?.click()}
                        className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#3ebd19] hover:bg-[#f6fcf4] text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#3ebd19]" />
                        <span>Upload Device</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* SUBMIT APPLICATION Button */}
          <div className="pt-2 pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>SUBMITTING & VERIFYING...</span>
                </div>
              ) : (
                <>
                  <span>SUBMIT APPLICATION</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* Fullscreen Photo Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div 
            onClick={() => setPreviewDoc(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-800">{previewDoc.title}</h4>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 max-h-[60vh] flex items-center justify-center bg-slate-900">
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
