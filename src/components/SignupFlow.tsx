import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, User, Mail, Phone, 
  Camera, Upload, Check, Eye, EyeOff, 
  Shield, ShieldCheck, AlertCircle, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AVATAR_PRESETS } from '../lib/peshawarData';
import { userStorage, checkFieldUniqueness, registerUserWithSupabase, type UserAccount } from '../lib/supabase';
import { sound } from '../lib/sound';

interface SignupFlowProps {
  onBackToLogin: () => void;
  onSignupComplete: (user: UserAccount) => void;
}

export const SignupFlow: React.FC<SignupFlowProps> = ({
  onBackToLogin,
  onSignupComplete
}) => {
  // Steps: 1: Personal Info, 2: Security, 3: Profile Picture, 4: Review, 5: Success (Account Created!)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_PRESETS[0]?.url || '/passenger-real.jpg');
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [createdUser, setCreatedUser] = useState<UserAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUnique, setIsCheckingUnique] = useState(false);
  const [conflictField, setConflictField] = useState<'email' | 'phone' | 'username' | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTimedError = (msg: string) => {
    setStepError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setStepError(null);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  // Password Validation Rules (as shown in reference image)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Trigger celebration on reaching Step 5
  useEffect(() => {
    if (currentStep === 5) {
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#44b718', '#84cc16', '#bef264', '#15803d']
      });
    }
  }, [currentStep]);

  // Step 1: Personal Information Validation with Real-time Supabase Uniqueness Check
  const handleStep1Next = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setStepError(null);
    setConflictField(null);

    if (!fullName.trim()) { 
      showTimedError('Baraye meharbani apna mukammal naam darj karein.'); 
      sound.playError(); 
      return; 
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { 
      showTimedError('Baraye meharbani durust email address darj karein.'); 
      sound.playError(); 
      return; 
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) { 
      showTimedError('Baraye meharbani durust phone number (kam az kam 10 digits) darj karein.'); 
      sound.playError(); 
      return; 
    }

    if (!username.trim() || username.length < 3) { 
      showTimedError('Username kam az kam 3 characters ka hona chahiye.'); 
      sound.playError(); 
      return; 
    }

    setIsCheckingUnique(true);

    try {
      // Check whether email, phone, or username is already taken
      const check = await checkFieldUniqueness(email, phone, username);

      if (!check.valid) {
        setConflictField(check.field || null);
        showTimedError(check.message || 'Ye data pehle se mojood hai. Baraye meharbani tabdeel karein.');
        sound.playError();
        setIsCheckingUnique(false);
        return;
      }

      setIsCheckingUnique(false);
      setCurrentStep(2);
    } catch (err) {
      setIsCheckingUnique(false);
      setCurrentStep(2);
    }
  };

  // Step 2: Security Validation
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setStepError(null);

    if (!hasMinLength) { 
      showTimedError('Password must be at least 8 characters.'); 
      sound.playError(); 
      return; 
    }
    if (!hasUppercase) { 
      showTimedError('Password must include at least one uppercase letter.'); 
      sound.playError(); 
      return; 
    }
    if (!hasNumber) { 
      showTimedError('Password must include at least one number.'); 
      sound.playError(); 
      return; 
    }
    if (!hasSpecial) { 
      showTimedError('Password must include at least one special character.'); 
      sound.playError(); 
      return; 
    }
    if (password !== confirmPassword) { 
      showTimedError('Passwords do not match.'); 
      sound.playError(); 
      return; 
    }

    setCurrentStep(3);
  };

  // Step 3: Profile Picture with auto-compression to prevent localStorage quota issues
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showTimedError('Image size exceeds 8MB limit.');
        sound.playError();
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawUrl = reader.result as string;
        // Use an offscreen image & canvas to resize to compact 180x180 thumbnail
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 180;
          canvas.height = 180;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 180, 180);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            setCustomAvatarPreview(compressed);
          } else {
            setCustomAvatarPreview(rawUrl);
          }
          sound.playClick();
        };
        img.onerror = () => {
          setCustomAvatarPreview(rawUrl);
          sound.playClick();
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStep3Next = () => {
    sound.playClick();
    setCurrentStep(4);
  };

  // Step 4: Final Account Creation with Supabase Sync
  const handleCreateAccount = async () => {
    sound.playClick();
    setIsSubmitting(true);
    setStepError(null);

    const avatarUrl = customAvatarPreview || selectedAvatar || '/passenger-real.jpg';
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      fullName: fullName.trim() || 'SafarGo User',
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      username: username.trim().toLowerCase(),
      avatarUrl,
      password: password,
      role: 'passenger',
      city: 'Peshawar',
      walletBalance: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await registerUserWithSupabase(newUser, password);
      if (!res.success) {
        showTimedError(res.error || 'Account banate waqt masla aya. Baraye meharbani dobara koshish karein.');
        sound.playError();
        setIsSubmitting(false);
        return;
      }

      setCreatedUser(res.user || newUser);
      setIsSubmitting(false);
      setCurrentStep(5); // Show Account Created Success Screen!
    } catch (err: any) {
      console.error('Account creation error:', err);
      userStorage.addUser(newUser);
      userStorage.setSession(newUser);
      setCreatedUser(newUser);
      setIsSubmitting(false);
      setCurrentStep(5);
    }
  };

  // Step 5: Continue to Dashboard
  const handleFinishSuccess = () => {
    sound.playClick();
    if (createdUser) {
      userStorage.setSession(createdUser);
      onSignupComplete(createdUser);
    } else {
      onBackToLogin();
    }
  };

  const activeAvatar = customAvatarPreview || selectedAvatar;

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between px-4 py-6 sm:py-8 overflow-hidden bg-[#fafdf8] selection:bg-[#3ebd19]/20 selection:text-slate-900">
      
      {/* Background Corner Wave Graphics matching SafarGo Theme */}
      <div className="fixed top-0 left-0 w-[160px] sm:w-[200px] h-[160px] sm:h-[200px] pointer-events-none z-0 select-none opacity-75">
        <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M0 0 L0 320 C90 310 180 260 250 180 C310 110 340 50 350 0 Z" fill="#6fd622" fillOpacity="0.25" />
          <path d="M0 0 L0 250 C70 240 140 200 190 140 C240 80 270 30 280 0 Z" fill="#48bb13" fillOpacity="0.35" />
        </svg>
      </div>

      <div className="fixed bottom-0 right-0 w-[180px] sm:w-[240px] h-[180px] sm:h-[240px] pointer-events-none z-0 select-none opacity-60">
        <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M360 360 L360 40 C270 50 180 100 110 180 C50 250 20 310 10 360 Z" fill="#55c218" fillOpacity="0.3" />
        </svg>
      </div>

      {/* Main Form Container */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col mx-auto my-auto">
        
        {/* Error Notification Toast */}
        <AnimatePresence>
          {stepError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium">{stepError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* STEP 1: PERSONAL INFORMATION (Image 1)                                    */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            {/* Top Back Button */}
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Personal Information
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Tell us a little about yourself
              </p>
            </div>

            {/* Input Cards with Light Green Circular Badges */}
            <form onSubmit={handleStep1Next} className="space-y-3.5">
              
              {/* Full Name */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-sm transition-all focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10">
                <div className="w-10 h-10 rounded-full bg-[#e6f8d8] flex items-center justify-center shrink-0 text-[#3bb516]">
                  <User className="w-5 h-5 fill-current stroke-none" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-bold text-slate-700 leading-none mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); if (stepError) setStepError(null); }}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className={`bg-white border rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-sm transition-all ${
                conflictField === 'email' 
                  ? 'border-red-500 ring-4 ring-red-500/10' 
                  : 'border-slate-200/90 focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  conflictField === 'email' ? 'bg-red-100 text-red-600' : 'bg-[#e6f8d8] text-[#3bb516]'
                }`}>
                  <Mail className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 leading-none mb-1">
                      Email Address
                    </label>
                    {conflictField === 'email' && (
                      <span className="text-[10px] font-semibold text-red-600 animate-pulse">Pehle se mojood hai!</span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { 
                      setEmail(e.target.value); 
                      if (conflictField === 'email') setConflictField(null);
                      if (stepError) setStepError(null); 
                    }}
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className={`bg-white border rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-sm transition-all ${
                conflictField === 'phone' 
                  ? 'border-red-500 ring-4 ring-red-500/10' 
                  : 'border-slate-200/90 focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  conflictField === 'phone' ? 'bg-red-100 text-red-600' : 'bg-[#e6f8d8] text-[#3bb516]'
                }`}>
                  <Phone className="w-5 h-5 fill-current stroke-none" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 leading-none mb-1">
                      Phone Number
                    </label>
                    {conflictField === 'phone' && (
                      <span className="text-[10px] font-semibold text-red-600 animate-pulse">Pehle se mojood hai!</span>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { 
                      setPhone(e.target.value); 
                      if (conflictField === 'phone') setConflictField(null);
                      if (stepError) setStepError(null); 
                    }}
                    placeholder="Enter your phone number (e.g. 03001234567)"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Username */}
              <div className={`bg-white border rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-sm transition-all ${
                conflictField === 'username' 
                  ? 'border-red-500 ring-4 ring-red-500/10' 
                  : 'border-slate-200/90 focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  conflictField === 'username' ? 'bg-red-100 text-red-600' : 'bg-[#e6f8d8] text-[#3bb516]'
                }`}>
                  <User className="w-5 h-5 fill-current stroke-none" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 leading-none mb-1">
                      Username
                    </label>
                    {conflictField === 'username' && (
                      <span className="text-[10px] font-semibold text-red-600 animate-pulse">Pehle se mojood hai!</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { 
                      setUsername(e.target.value); 
                      if (conflictField === 'username') setConflictField(null);
                      if (stepError) setStepError(null); 
                    }}
                    placeholder="Choose a username"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isCheckingUnique}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {isCheckingUnique ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking with Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Link: Already have an account? Sign In */}
            <div className="mt-8 text-center">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="font-bold text-[#3ebd19] hover:text-[#2fa212] ml-1 cursor-pointer transition"
                >
                  Sign In
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SECURITY (Image 2)                                                */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            {/* Top Back Button */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Security
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Set a strong password to keep your account safe
              </p>
            </div>

            <form onSubmit={handleStep2Next} className="space-y-4">
              
              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 pl-0.5">
                  Password
                </label>
                <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3 shadow-sm transition-all focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (stepError) setStepError(null); }}
                    placeholder="Create a strong password"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none pr-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 pl-0.5">
                  Confirm Password
                </label>
                <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl px-4 py-3 shadow-sm transition-all focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (stepError) setStepError(null); }}
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none pr-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirement Helper Card (Exact Image 2 Match) */}
              <div className="bg-[#f2faf0] border border-[#d2f0cc] rounded-2xl p-4 flex gap-3.5 shadow-sm mt-3">
                <div className="shrink-0 pt-0.5 text-[#3bb516]">
                  <Shield className="w-6 h-6 fill-[#3bb516]/20 text-[#3bb516]" />
                </div>
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-[#20630d]">
                    Password must have:
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 font-medium">
                      <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-[#3ebd19] stroke-[3]' : 'text-slate-400'}`} />
                      <span className={hasMinLength ? 'text-slate-800 font-semibold' : 'text-slate-500'}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-[#3ebd19] stroke-[3]' : 'text-slate-400'}`} />
                      <span className={hasUppercase ? 'text-slate-800 font-semibold' : 'text-slate-500'}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-[#3ebd19] stroke-[3]' : 'text-slate-400'}`} />
                      <span className={hasNumber ? 'text-slate-800 font-semibold' : 'text-slate-500'}>One number</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-[#3ebd19] stroke-[3]' : 'text-slate-400'}`} />
                      <span className={hasSpecial ? 'text-slate-800 font-semibold' : 'text-slate-500'}>One special character</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PROFILE PICTURE (Image 3)                                         */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            {/* Top Back Button */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Profile Picture
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Upload a clear photo of yourself
              </p>
            </div>

            {/* Center Big Circular Avatar with Green Ring & Camera Icon */}
            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-[3px] border-[#3ebd19] p-1 shadow-sm flex items-center justify-center bg-white">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#e6eae6] flex items-center justify-center">
                    {activeAvatar ? (
                      <img 
                        src={activeAvatar} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-slate-400 fill-current" />
                    )}
                  </div>
                </div>

                {/* Camera Icon Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#1e293b] text-white flex items-center justify-center shadow-md hover:bg-slate-900 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {/* Dotted Upload Photo Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="my-5 border-2 border-dashed border-[#86efac] hover:border-[#3ebd19] bg-[#f8fdf6] rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 group"
            >
              <div className="flex items-center gap-2 text-[#3bb516] font-bold text-sm">
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                JPG, PNG (Max 5MB)
              </p>
            </div>

            {/* 3 Circular Avatar Presets */}
            <div className="flex items-center justify-center gap-4 my-2">
              {AVATAR_PRESETS.slice(0, 3).map((preset) => {
                const isSelected = selectedAvatar === preset.url && !customAvatarPreview;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCustomAvatarPreview(null);
                      setSelectedAvatar(preset.url);
                      sound.playClick();
                    }}
                    className={`w-14 h-14 rounded-full p-0.5 transition-all cursor-pointer ${
                      isSelected 
                        ? 'ring-2 ring-[#3ebd19] ring-offset-2 scale-105' 
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img 
                      src={preset.url} 
                      alt={preset.name} 
                      className="w-full h-full rounded-full object-cover shadow-sm"
                    />
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleStep3Next}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: REVIEW & COMPLETE (Image 4)                                       */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            {/* Top Back Button */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Review & Complete
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Please check your information before creating your account.
              </p>
            </div>

            {/* Review Card with Clean Rows and 'Edit' Links */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
              
              {/* Full Name */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#e6f8d8] flex items-center justify-center shrink-0 text-[#3bb516]">
                    <User className="w-4 h-4 fill-current stroke-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700">Full Name</p>
                    <p className="text-xs font-semibold text-slate-900 truncate">{fullName || 'Malik Abubakkar'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-[#3ebd19] hover:text-[#2fa212] ml-2 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Email Address */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#e6f8d8] flex items-center justify-center shrink-0 text-[#3bb516]">
                    <Mail className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700">Email Address</p>
                    <p className="text-xs font-semibold text-slate-900 truncate">{email || 'malik@gmail.com'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-[#3ebd19] hover:text-[#2fa212] ml-2 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Phone Number */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#e6f8d8] flex items-center justify-center shrink-0 text-[#3bb516]">
                    <Phone className="w-4 h-4 fill-current stroke-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700">Phone Number</p>
                    <p className="text-xs font-semibold text-slate-900 truncate">{phone || '+92 312 3456789'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-[#3ebd19] hover:text-[#2fa212] ml-2 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Username */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#e6f8d8] flex items-center justify-center shrink-0 text-[#3bb516]">
                    <User className="w-4 h-4 fill-current stroke-none" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700">Username</p>
                    <p className="text-xs font-semibold text-slate-900 truncate">{username || 'malik123'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-[#3ebd19] hover:text-[#2fa212] ml-2 cursor-pointer"
                >
                  Edit
                </button>
              </div>

            </div>

            {/* Information Security Banner */}
            <div className="bg-[#f2faf0] border border-[#d2f0cc] rounded-2xl p-3.5 flex items-center gap-3 mt-4 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#3bb516] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#1f5f0d]">
                  Your information is secure
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  and will only be used for your account.
                </p>
              </div>
            </div>

            {/* Create Account Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>CREATING ACCOUNT...</span>
                  </div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: ACCOUNT CREATED SUCCESS SCREEN (Image 5)                          */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full flex flex-col items-center justify-center text-center py-6"
          >
            {/* Animated Celebratory Badge with Confetti Halo */}
            <div className="relative my-4">
              {/* Soft Pulsing Green Glow Backdrop */}
              <div className="absolute inset-0 w-28 h-28 -m-2 rounded-full bg-[#3ebd19]/20 blur-xl animate-pulse"></div>
              
              {/* Main Badge */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#31a312] via-[#42b617] to-[#60cc23] flex items-center justify-center shadow-[0_12px_30px_rgba(62,189,25,0.4)] text-white">
                <Check className="w-12 h-12 stroke-[3.5]" />
              </div>
            </div>

            {/* Headline & Subtitle */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight mt-6">
              Account Created!
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
              Your SafarGo account has been successfully created.
            </p>

            {/* Continue Button */}
            <div className="w-full pt-8">
              <button
                type="button"
                onClick={handleFinishSuccess}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Bottom Bab-e-Khyber Peshawar Landmark Heritage Illustration */}
            <div className="w-full mt-12 flex flex-col items-center justify-center select-none pointer-events-none opacity-90">
              <img 
                src="/peshawar-skyline-clean.png" 
                alt="Peshawar Heritage Skyline" 
                className="w-full max-w-[380px] h-auto object-contain" 
              />
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
