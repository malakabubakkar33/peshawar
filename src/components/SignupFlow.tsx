import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, User, Mail, Phone, 
  Camera, Upload, Check, Eye, EyeOff, 
  RotateCcw, KeyRound, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AVATAR_PRESETS } from '../lib/peshawarData';
import { userStorage, checkFieldUniqueness, registerUserWithSupabase, type UserAccount } from '../lib/supabase';
import { sound } from '../lib/sound';
import { sendVerificationOtpEmail, generateSixDigitOtp, verifyEnteredOtp } from '../lib/emailService';
import { ImageCropperModal } from './ImageCropperModal';
import { TopErrorToast } from './TopErrorToast';
import { uploadToCloudinary } from '../lib/cloudinary';

interface SignupFlowProps {
  onBackToLogin: () => void;
  onSignupComplete: (user: UserAccount) => void;
}

type SignupStep = 1 | 'otp' | 2 | 3 | 4 | 5;

export const SignupFlow: React.FC<SignupFlowProps> = ({
  onBackToLogin,
  onSignupComplete
}) => {
  // Steps: 1: Personal Info, 'otp': Email OTP Verification, 2: Security, 3: Profile Picture, 4: Review, 5: Account Created
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_PRESETS[0]?.url || '/passenger-real.jpg');
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

  // OTP Verification States
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimerSeconds, setOtpTimerSeconds] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [otpDispatchedEmail, setOtpDispatchedEmail] = useState('');

  // Password / Security States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Final submission & Modal states
  const [createdUser, setCreatedUser] = useState<UserAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUnique, setIsCheckingUnique] = useState(false);
  const [conflictField, setConflictField] = useState<'email' | 'phone' | 'username' | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  // Image Cropper State
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
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

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (currentStep === 'otp' && otpTimerSeconds > 0) {
      interval = setInterval(() => {
        setOtpTimerSeconds(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, otpTimerSeconds]);

  // Password Validation Rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Celebration on reaching Step 5
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

  // Step 1: Personal Information Validation & Real OTP Dispatch
  const handleStep1Next = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setStepError(null);
    setConflictField(null);

    if (!fullName.trim()) { 
      showTimedError('Please enter your full name.'); 
      return; 
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { 
      showTimedError('Please enter a valid email address.'); 
      return; 
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) { 
      showTimedError('Please enter a valid phone number (at least 10 digits).'); 
      return; 
    }

    if (!username.trim() || username.length < 3) { 
      showTimedError('Username must be at least 3 characters long.'); 
      return; 
    }

    setIsCheckingUnique(true);

    try {
      // Check whether email, phone, or username is already taken in Supabase/storage
      const check = await checkFieldUniqueness(email, phone, username);

      if (!check.valid) {
        setConflictField(check.field || null);
        showTimedError(check.message || 'This email, phone number, or username is already registered. Please use different details.');
        setIsCheckingUnique(false);
        return;
      }

      // Generate 6-digit OTP and send to user's real email via Resend API
      setIsSendingOtp(true);
      const generatedCode = generateSixDigitOtp();
      const sendRes = await sendVerificationOtpEmail(email, generatedCode, fullName);

      setIsCheckingUnique(false);
      setIsSendingOtp(false);

      if (!sendRes.success && sendRes.error) {
        showTimedError(sendRes.error);
        sound.playError();
        // Still proceed to OTP screen with generated code so user isn't stuck
      }

      setOtpDispatchedEmail(email);
      setOtpValues(['', '', '', '', '', '']);
      setOtpTimerSeconds(60);
      setCanResendOtp(false);
      setCurrentStep('otp');

      // Focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);

    } catch (err) {
      setIsCheckingUnique(false);
      setIsSendingOtp(false);
      setCurrentStep('otp');
    }
  };

  // OTP Input Handlers (Support typing, pasting, backspacing)
  const handleOtpChange = (index: number, val: string) => {
    // Only accept numbers
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const copy = [...otpValues];
      copy[index] = '';
      setOtpValues(copy);
      return;
    }

    // Single character input
    const copy = [...otpValues];
    copy[index] = clean.slice(-1);
    setOtpValues(copy);

    // Auto-advance to next box
    if (index < 5 && clean.length > 0) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasted) return;

    const copy = [...otpValues];
    for (let i = 0; i < 6; i++) {
      if (pasted[i]) {
        copy[i] = pasted[i];
      }
    }
    setOtpValues(copy);

    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (!canResendOtp || isSendingOtp) return;
    sound.playClick();
    setIsSendingOtp(true);
    setStepError(null);

    const newCode = generateSixDigitOtp();
    const res = await sendVerificationOtpEmail(email, newCode, fullName);
    setIsSendingOtp(false);

    if (res.success) {
      sound.playSuccess();
      setOtpTimerSeconds(60);
      setCanResendOtp(false);
      setOtpValues(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } else {
      showTimedError(res.error || 'Failed to resend code. Please try again.');
      sound.playError();
    }
  };

  // Verify OTP Action
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setStepError(null);

    const fullCode = otpValues.join('');
    if (fullCode.length < 6) {
      showTimedError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);

    setTimeout(() => {
      const verification = verifyEnteredOtp(otpDispatchedEmail || email, fullCode);

      if (!verification.valid) {
        setIsVerifyingOtp(false);
        showTimedError(verification.message || 'Invalid verification code. Please check your email and try again.');
        return;
      }

      setIsVerifyingOtp(false);
      sound.playSuccess();
      // Code verified successfully -> proceed to Step 2 (Security)
      setCurrentStep(2);
    }, 600);
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
      showTimedError('Passwords do not match. Please re-enter.'); 
      sound.playError(); 
      return; 
    }

    setCurrentStep(3);
  };

  // Step 3: Handle File Selected for Avatar -> Open In-App Cropper Modal
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showTimedError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showTimedError('Image size exceeds 15MB limit. Please select a smaller photo.');
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
    setCustomAvatarPreview(croppedDataUrl);
    sound.playSuccess();
    uploadToCloudinary(croppedDataUrl, 'safargo_signup_avatars').then((cRes) => {
      if (cRes.success && cRes.url) {
        setCustomAvatarPreview(cRes.url);
      }
    });
  };

  // Step 3: Next -> Step 4 Review
  const handleStep3Next = () => {
    sound.playClick();
    setCurrentStep(4);
  };

  // Step 4: Final Submit to Supabase / Storage
  const handleFinalSubmit = async () => {
    sound.playClick();
    setIsSubmitting(true);
    setStepError(null);

    const activeAvatar = customAvatarPreview || selectedAvatar;

    const newUser: UserAccount = {
      id: 'usr_' + Date.now().toString(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      username: username.trim(),
      avatarUrl: activeAvatar,
      role: 'passenger',
      city: 'Peshawar',
      walletBalance: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await registerUserWithSupabase(
        newUser,
        password
      );

      if (!res.success) {
        showTimedError(res.error || 'Failed to create account. Please try again.');
        setIsSubmitting(false);
        sound.playError();
        return;
      }

      setCreatedUser(res.user || newUser);
      setIsSubmitting(false);
      setCurrentStep(5); // Show Account Created Success Screen
    } catch (err: any) {
      console.error('Account creation error:', err);
      userStorage.addUser(newUser);
      userStorage.setSession(newUser);
      setCreatedUser(newUser);
      setIsSubmitting(false);
      setCurrentStep(5);
    }
  };

  // Step 5: Finish -> Continue to Dashboard
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
    <div className="relative w-full min-h-screen flex flex-col items-center px-4 pt-3 sm:pt-4 pb-8 sm:pb-12 overflow-hidden bg-[#fafdf8] selection:bg-[#3ebd19]/20 selection:text-slate-900">
      
      {/* Top Floating Notification Toast (Clean UI at Top of Screen) */}
      <TopErrorToast message={stepError} onDismiss={() => setStepError(null)} />
      
      {/* Background Corner Wave Graphics */}
      <div className="fixed top-0 left-0 w-[160px] sm:w-[200px] h-[160px] sm:h-[200px] pointer-events-none z-0 select-none opacity-75">
        <svg viewBox="0 0 360 360" fill="none" className="w-full h-full">
          <path d="M0 0 L0 320 C90 310 180 260 250 180 C310 110 340 50 350 0 Z" fill="#6fd622" fillOpacity="0.25" />
          <path d="M0 0 L0 250 C70 240 140 200 190 140 C240 80 270 30 280 0 Z" fill="#48bb13" fillOpacity="0.35" />
        </svg>
      </div>

      <div className="fixed bottom-0 right-0 w-[180px] sm:w-[240px] h-[180px] sm:h-[240px] pointer-events-none z-0 select-none opacity-60">
        <svg viewBox="0 0 360 360" fill="none" className="w-full h-full">
          <path d="M360 360 L360 40 C270 50 180 100 110 180 C50 250 20 310 10 360 Z" fill="#55c218" fillOpacity="0.3" />
        </svg>
      </div>

      {/* Main Form Container */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col mx-auto pt-1 sm:pt-2">

        {/* ========================================================================= */}
        {/* STEP 1: PERSONAL INFORMATION                                              */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            {/* Top Bar with Back Button & Step indicator */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-10 h-10 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to login"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Step 1 of 5
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Personal Information
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Tell us a little about yourself
              </p>
            </div>

            {/* Input Cards */}
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

              {/* Next Button with Dot Loading (No clunky text!) */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isCheckingUnique || isSendingOtp}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {isCheckingUnique || isSendingOtp ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
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
        {/* STEP OTP: 6-DIGIT EMAIL VERIFICATION (Dispatched via Resend API)          */}
        {/* ========================================================================= */}
        {currentStep === 'otp' && (
          <motion.div
            key="step-otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            {/* Top Bar with Back Button & Step indicator */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-10 h-10 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to personal details"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-lime-100 text-lime-800 border border-lime-200">
                Step 2 of 5
              </span>
            </div>

            {/* Title & Email Badge */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#e6f8d8] text-[#3ebd19] flex items-center justify-center mb-3 shadow-sm border border-lime-200">
                <KeyRound className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Verify Your Email
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                We sent a 6-digit verification code to <br />
                <strong className="text-slate-800">{otpDispatchedEmail || email}</strong>
              </p>
            </div>

            {/* 6-Digit OTP Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* Individual Input Boxes */}
              <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl bg-white border-2 border-slate-200 focus:border-[#3ebd19] focus:ring-4 focus:ring-[#3ebd19]/15 text-slate-900 shadow-sm transition outline-none"
                  />
                ))}
              </div>

              {/* Countdown & Resend Option */}
              <div className="text-center pt-1">
                {canResendOtp ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3ebd19] hover:text-[#2c980b] transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend Code to Email</span>
                  </button>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">
                    Resend code in <strong className="text-slate-700 font-bold">{otpTimerSeconds}s</strong>
                  </p>
                )}
              </div>

              {/* Verify Button with Dot Loading */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {isVerifyingOtp ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 p-3 rounded-2xl bg-[#f8faf7] border border-lime-200/80 text-[11px] text-slate-500 text-center">
              💡 Please check your Gmail inbox or spam folder. You can easily copy and paste the 6-digit code.
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SECURITY                                                          */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            {/* Top Bar with Back Button & Step indicator */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <button
                type="button"
                onClick={() => setCurrentStep('otp')}
                className="w-10 h-10 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to verification"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Step 3 of 5
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Security
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Set a strong password for your account
              </p>
            </div>

            <form onSubmit={handleStep2Next} className="space-y-4">
              {/* Password Input */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-sm transition-all focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10">
                <label className="block text-[11px] font-bold text-slate-700 leading-none mb-1">
                  Password
                </label>
                <div className="flex items-center justify-between">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (stepError) setStepError(null); }}
                    placeholder="Create a strong password"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition ml-2 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-sm transition-all focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10">
                <label className="block text-[11px] font-bold text-slate-700 leading-none mb-1">
                  Confirm Password
                </label>
                <div className="flex items-center justify-between">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (stepError) setStepError(null); }}
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 transition ml-2 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirement Badges */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Password must contain:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#2e8a11] font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-[#3ebd19]' : 'text-slate-300'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-[#2e8a11] font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'text-[#3ebd19]' : 'text-slate-300'}`} />
                    <span>1 uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-[#2e8a11] font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-[#3ebd19]' : 'text-slate-300'}`} />
                    <span>1 number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-[#2e8a11] font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-[#3ebd19]' : 'text-slate-300'}`} />
                    <span>1 special character</span>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-2">
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
        {/* STEP 3: PROFILE PICTURE (With Professional In-App Cropper)               */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            {/* Top Bar with Back Button & Step indicator */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-10 h-10 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to security"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Step 4 of 5
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Profile Picture
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Upload a photo or choose an avatar
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            {/* Current Active Avatar Preview */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center ring-4 ring-[#3ebd19]/25">
                  <img
                    src={activeAvatar}
                    alt="Active Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#3ebd19] text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {customAvatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setRawImageForCrop(customAvatarPreview);
                    setIsCropModalOpen(true);
                  }}
                  className="mt-3 text-xs font-bold text-[#3ebd19] hover:underline flex items-center gap-1"
                >
                  <span>Re-crop Photo</span>
                </button>
              )}
            </div>

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-white border border-dashed border-slate-300 hover:border-[#3ebd19] text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs hover:bg-slate-50 transition mb-5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#3ebd19]" />
              <span>Upload & Crop Custom Photo</span>
            </button>

            {/* Avatar Presets Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Or Choose from Presets
              </label>

              <div className="grid grid-cols-4 gap-2.5">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(preset.url);
                      setCustomAvatarPreview(null);
                    }}
                    className={`relative rounded-2xl overflow-hidden border-2 p-1 transition cursor-pointer ${
                      selectedAvatar === preset.url && !customAvatarPreview
                        ? 'border-[#3ebd19] ring-2 ring-[#3ebd19]/30 scale-105 bg-lime-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-14 object-cover rounded-xl"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleStep3Next}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: REVIEW & CONFIRM REGISTRATION                                     */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col"
          >
            {/* Top Bar with Back Button & Step indicator */}
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-10 h-10 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Back to profile photo"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Step 5 of 5
              </span>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0f172a] tracking-tight">
                Review Information
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Confirm your details before creating your account
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 mb-6">
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                <img
                  src={activeAvatar}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-2 border-lime-300"
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {fullName}
                  </h3>
                  <span className="text-xs text-[#3ebd19] font-bold">@{username}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Email Address:</span>
                  <span className="text-slate-800 font-bold">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Phone Number:</span>
                  <span className="text-slate-800 font-bold">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">City:</span>
                  <span className="text-slate-800 font-bold">Peshawar (PK)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Email Verification:</span>
                  <span className="text-[#2e8a11] font-bold">✓ 6-Digit Code Verified</span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-1.5 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: SUCCESS (Account Created Celebration!)                            */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#e6f8d8] text-[#3ebd19] flex items-center justify-center mb-4 shadow-lg shadow-lime-500/20 border-2 border-lime-200">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-[#2c980b] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Account Activated</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Welcome to SafarGo!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
              Assalam-o-Alaikum, <strong>{fullName}</strong>! Your account has been verified and registered successfully.
            </p>

            <button
              type="button"
              onClick={handleFinishSuccess}
              className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </motion.div>
        )}

      </div>

      {/* Professional In-App Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageSrc={rawImageForCrop}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
