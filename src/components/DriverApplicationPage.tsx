import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, 
  CreditCard, FileText, Camera, Upload, 
  Check, AlertCircle, Trash2, ShieldCheck, Copy, 
  Receipt, Wallet, CheckCircle2, ChevronRight
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
  // Steps: 'form' (Vehicle & Docs) -> 'payment' (EasyPaisa Gateway)
  const [currentStep, setCurrentStep] = useState<'form' | 'payment'>('form');

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Vehicle Details
  const [vehicleType, setVehicleType] = useState<'bike' | 'car_ac' | 'car_non_ac' | 'rickshaw'>('bike');
  const [vehicleName, setVehicleName] = useState('Honda CG 125');
  const [vehicleModel, setVehicleModel] = useState('2023');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleColor, setVehicleColor] = useState('Black');

  // Documents
  const [documents, setDocuments] = useState<Record<DocKey, string | null>>({
    cnicFront: null,
    cnicBack: null,
    license: null,
    plate: null,
    selfie: null
  });

  // EasyPaisa Payment Screenshot State
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deviceInputRefs = {
    cnicFront: useRef<HTMLInputElement>(null),
    cnicBack: useRef<HTMLInputElement>(null),
    license: useRef<HTMLInputElement>(null),
    plate: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
  };

  const paymentScreenshotInputRef = useRef<HTMLInputElement>(null);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    sound.playError();
    setTimeout(() => setErrorMsg(null), 4500);
  };

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

    e.target.value = '';
  };

  const handlePaymentScreenshotSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload a valid payment screenshot (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPaymentScreenshot(dataUrl);
      sound.playSuccess();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeDoc = (key: DocKey) => {
    sound.playClick();
    setDocuments(prev => ({ ...prev, [key]: null }));
  };

  const handleCopyEasyPaisaNumber = () => {
    navigator.clipboard.writeText('03328888249');
    sound.playClick();
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 3000);
  };

  // Step 1: Validate Vehicle Info & Documents -> Proceed to Payment Gateway
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMsg(null);

    if (!fullName.trim()) return showError('Baraye meharbani apna mukammal naam darj karein.');
    if (!phone.trim()) return showError('Baraye meharbani apna phone number darj karein.');
    if (!email.trim()) return showError('Baraye meharbani apna email address darj karein.');
    if (!vehicleName.trim()) return showError('Baraye meharbani vehicle name (e.g. Honda CG 125, Corolla) darj karein.');
    if (!vehicleModel.trim()) return showError('Baraye meharbani vehicle model year (e.g. 2023) darj karein.');
    if (!vehicleNumber.trim()) return showError('Baraye meharbani vehicle number plate darj karein.');

    const missingDocs: string[] = [];
    if (!documents.cnicFront) missingDocs.push('CNIC Front');
    if (!documents.cnicBack) missingDocs.push('CNIC Back');
    if (!documents.license) missingDocs.push('Driving License');
    if (!documents.plate) missingDocs.push('Vehicle Plate');
    if (!documents.selfie) missingDocs.push('Selfie Photo');

    if (missingDocs.length > 0) {
      return showError(`Baraye meharbani ye documents upload karein: ${missingDocs.slice(0, 2).join(', ')}${missingDocs.length > 2 ? '...' : ''}`);
    }

    // Move to EasyPaisa Local Payment Gateway Step
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Final Submit with EasyPaisa Payment Screenshot
  const handleFinalSubmitWithPayment = () => {
    sound.playClick();
    setErrorMsg(null);

    if (!paymentScreenshot) {
      return showError('Baraye meharbani EasyPaisa payment ka screenshot upload karein.');
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      sound.playSuccess();

      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        vehicleType,
        vehicleName: vehicleName.trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleNumber: vehicleNumber.trim(),
        vehicleColor: vehicleColor.trim() || 'Black',
        driverId: 'SGD' + Math.floor(10000 + Math.random() * 90000),
        rating: 5.0,
        totalRides: 0,
        documents: {
          ...documents,
          paymentScreenshot
        },
        paymentReceipt: paymentScreenshot,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Add to Admin Review Queue with Status 'pending' and Payment Screenshot
      adminManager.addDriverApplication({
        id: `drv-app-${Date.now()}`,
        userId: user?.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        vehicleType,
        vehicleName: vehicleName.trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleNumber: vehicleNumber.trim(),
        vehicleColor: vehicleColor.trim() || 'Black',
        city: user?.city || 'Peshawar',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        documents: {
          ...documents,
          paymentScreenshot
        }
      });

      // Submit to App state -> will display DriverPendingReviewPage
      onSubmitApplication(payload);
    }, 800);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#fafdf8] px-4 py-6 sm:py-8 flex flex-col items-center selection:bg-[#3ebd19]/20 selection:text-slate-900">
      
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
            onClick={currentStep === 'payment' ? () => setCurrentStep('form') : onBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Peshawar Driver Registration</span>
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* STEP 1: VEHICLE INFORMATION & DOCUMENTS                                   */}
        {/* ========================================================================= */}
        {currentStep === 'form' && (
          <motion.div
            key="driver-form"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
          >
            <div className="mb-5">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Driver Registration
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Provide your vehicle details and official documents
              </p>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              
              {/* Personal Details */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Personal Information
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#3ebd19]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#3ebd19]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#3ebd19]"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Type Selection */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Select Vehicle Category
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bike', label: 'Bike / Motorbike' },
                    { id: 'car_ac', label: 'Car (AC Comfort)' },
                    { id: 'car_non_ac', label: 'Car (Economy)' },
                    { id: 'rickshaw', label: 'Peshawar Auto Rickshaw' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVehicleType(v.id as any)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-bold transition ${
                        vehicleType === v.id
                          ? 'bg-lime-50 border-[#3ebd19] text-[#2c980b] shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Vehicle Specifications
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Make / Model Name</label>
                    <input
                      type="text"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      placeholder="e.g. Honda CG 125"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#3ebd19]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Model Year</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. 2023"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#3ebd19]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Number Plate</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. PWA-7421"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:border-[#3ebd19]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Vehicle Color</label>
                    <input
                      type="text"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      placeholder="e.g. Black / White"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#3ebd19]"
                    />
                  </div>
                </div>
              </div>

              {/* Required Documents Upload */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Required Verification Documents
                </h4>

                <div className="space-y-2.5">
                  {DOCUMENT_CONFIGS.map((doc) => {
                    const isUploaded = !!documents[doc.key];

                    return (
                      <div
                        key={doc.key}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                          isUploaded
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isUploaded ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
                          }`}>
                            {isUploaded ? <Check className="w-4 h-4 stroke-[3]" /> : <doc.icon className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">{doc.title}</p>
                            <p className="text-[10px] text-slate-500 truncate">{doc.subtitle}</p>
                          </div>
                        </div>

                        {/* Hidden input */}
                        <input
                          ref={deviceInputRefs[doc.key]}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileSelected(doc.key, e)}
                        />

                        {isUploaded ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc({ title: doc.title, url: documents[doc.key]! })}
                              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDoc(doc.key)}
                              className="p-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => deviceInputRefs[doc.key].current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shadow-2xs transition"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#3ebd19]" />
                            <span>Upload</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue to Payment Gateway Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer"
                >
                  <span>Proceed to Payment Gateway</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: EASYPAISA LOCAL PAYMENT GATEWAY                                   */}
        {/* ========================================================================= */}
        {currentStep === 'payment' && (
          <motion.div
            key="payment-gateway"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="w-full flex flex-col"
          >
            {/* Header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <Wallet className="w-3.5 h-3.5" />
                <span>Local Payment Gateway</span>
              </div>
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Driver Registration Fee
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Complete your fee payment via EasyPaisa to activate your account
              </p>
            </div>

            {/* Official EasyPaisa Branded Card */}
            <div className="w-full rounded-3xl bg-gradient-to-br from-[#008f4c] via-[#00a859] to-[#027a41] text-white p-5 sm:p-6 shadow-xl relative overflow-hidden mb-5">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black text-sm shadow-md">
                      EP
                    </div>
                    <div>
                      <span className="text-xs font-black tracking-wider uppercase block text-white">
                        EasyPaisa
                      </span>
                      <span className="text-[10px] text-emerald-100 font-medium">
                        Instant Mobile Account
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black border border-white/30 text-white">
                    Fee: PKR 500
                  </span>
                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 mb-4">
                  <span className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider block mb-1">
                    EasyPaisa Account Number:
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-mono font-black tracking-wider text-white">
                      03328888249
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEasyPaisaNumber}
                      className="px-3 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-extrabold flex items-center gap-1 shadow-sm hover:bg-emerald-50 transition cursor-pointer"
                    >
                      {copiedNumber ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-100 font-medium">Account Title:</span>
                  <span className="font-extrabold text-white text-sm">Malik Abubakkar</span>
                </div>
              </div>
            </div>

            {/* Step-by-Step Payment Instructions */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3 mb-5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#3ebd19]" />
                <span>Payment Instructions</span>
              </h4>

              <ol className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-lime-100 text-[#2c980b] font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Open your <strong>EasyPaisa App</strong> (or dial *786#).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-lime-100 text-[#2c980b] font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Select <strong>Send Money</strong> &bull; <strong>EasyPaisa Mobile Account</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-lime-100 text-[#2c980b] font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Enter account number: <strong>03328888249</strong> and verify name: <strong>Malik Abubakkar</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-lime-100 text-[#2c980b] font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                  <span>Transfer <strong>PKR 500</strong> and take a clear screenshot of the transaction receipt.</span>
                </li>
              </ol>
            </div>

            {/* Payment Screenshot Upload Zone */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm mb-6">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Upload Payment Screenshot
              </h4>

              <input
                ref={paymentScreenshotInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePaymentScreenshotSelected}
              />

              {paymentScreenshot ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={paymentScreenshot}
                      alt="Payment Screenshot"
                      className="w-14 h-14 object-cover rounded-xl border border-emerald-200 shadow-xs"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-emerald-950">Payment Receipt Uploaded</p>
                      <p className="text-[11px] text-emerald-700">Receipt ready for Admin review</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaymentScreenshot(null)}
                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => paymentScreenshotInputRef.current?.click()}
                  className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#3ebd19] bg-slate-50 hover:bg-lime-50/50 flex flex-col items-center justify-center gap-2 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-[#3ebd19]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-extrabold text-slate-800 block">
                      Click to Upload EasyPaisa Screenshot
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Supports JPG, PNG, WebP up to 15MB
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Final Submit Application Action */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={isSubmitting || !paymentScreenshot}
                onClick={handleFinalSubmitWithPayment}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <>
                    <span>Submit Application & Receipt</span>
                    <Check className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('form')}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                Back to Vehicle Details
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* Document Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl flex flex-col items-center">
              <h4 className="text-sm font-extrabold text-slate-900 mb-3">{previewDoc.title}</h4>
              <img
                src={previewDoc.url}
                alt="Document preview"
                className="max-h-72 w-auto object-contain rounded-2xl mb-4 border border-slate-200"
              />
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-full py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
