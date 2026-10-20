import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Logo } from './Logo';
import { TopErrorToast } from './TopErrorToast';
import { loginUserWithSupabase, type UserAccount } from '../lib/supabase';
import { sound } from '../lib/sound';

interface LoginPageProps {
  onSuccessLogin: (user: UserAccount) => void;
  onNavigateToSignup: () => void;
  onOpenForgotPassword: () => void;
  onBack?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccessLogin,
  onNavigateToSignup,
  onOpenForgotPassword,
  onBack
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const errorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTimedError = (msg: string) => {
    setErrorMessage(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => {
      setErrorMessage(null);
    }, 4000);
  };

  React.useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    const cleanPass = password;

    if (!cleanId) { 
      showTimedError('Please enter your email, phone number, or username.'); 
      return; 
    }
    if (!cleanPass) { 
      showTimedError('Please enter your password to continue.'); 
      return; 
    }

    setLoading(true);

    try {
      const res = await loginUserWithSupabase(cleanId, cleanPass);
      if (!res.success || !res.user) {
        setLoading(false);
        showTimedError(res.error || 'Invalid credentials. Please verify your account details or reset your password.');
        return;
      }

      setLoading(false);
      sound.playSuccess();
      onSuccessLogin(res.user);
    } catch (err: any) {
      setLoading(false);
      showTimedError('A technical connection error occurred during login. Please try again.');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    sound.playClick();
    setSocialLoading(provider);

    setTimeout(() => {
      setSocialLoading(null);
      showTimedError(`${provider === 'google' ? 'Google' : 'Facebook'} login will be available soon. Please use email or phone to sign in.`);
    }, 1000);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between px-4 pt-3 sm:pt-4 pb-8 sm:pb-10 overflow-hidden bg-[#fafdf8] selection:bg-[#3ebd19]/20 selection:text-slate-900">
      
      {/* Top Floating Notification Toast (Clean UI at Top of Screen) */}
      <TopErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      
      {/* ===== BACKGROUND DECORATIVE GRAPHICS (Exact Reference Match) ===== */}
      
      {/* Top-Left Organic Curved Wave (compact & adjusted so logo remains fully visible on scroll) */}
      <div className="fixed top-0 left-0 w-[160px] sm:w-[210px] h-[160px] sm:h-[210px] pointer-events-none z-0 select-none opacity-80">
        <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#48bb13" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#6fd622" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9be738" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="80%" y2="80%">
              <stop offset="0%" stopColor="#55c218" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#82de29" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="70%" y2="70%">
              <stop offset="0%" stopColor="#3ca80d" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#59c719" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Outer soft wave */}
          <path d="M0 0 L0 320 C90 310 180 260 250 180 C310 110 340 50 350 0 Z" fill="url(#waveGrad1)" />
          {/* Middle wave */}
          <path d="M0 0 L0 250 C70 240 140 200 190 140 C240 80 270 30 280 0 Z" fill="url(#waveGrad2)" />
          {/* Core deep wave */}
          <path d="M0 0 L0 180 C50 170 100 140 140 95 C180 50 200 20 210 0 Z" fill="url(#waveGrad3)" />
        </svg>
      </div>

      {/* Top-Right Dotted Route Line with Map Pins */}
      <div className="fixed top-4 right-4 sm:top-8 sm:right-8 w-44 sm:w-56 h-44 sm:h-56 pointer-events-none z-0 select-none opacity-85">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Dotted travel trajectory */}
          <path 
            d="M 180 25 C 130 35 150 90 95 110 C 65 120 75 160 50 175" 
            stroke="#94d82d" 
            strokeWidth="2.5" 
            strokeDasharray="5 6" 
            strokeLinecap="round"
            fill="none" 
          />
          {/* Map Pin 1 (Top) */}
          <g transform="translate(150, 18) scale(0.9)">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#b8e986" />
            <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
          </g>
          {/* Map Pin 2 (Middle) */}
          <g transform="translate(85, 95) scale(0.95)">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#a4e262" />
            <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Bottom-Right Organic Curved Wave */}
      <div className="fixed bottom-0 right-0 w-[240px] sm:w-[320px] md:w-[400px] h-[240px] sm:h-[320px] md:h-[400px] pointer-events-none z-0 select-none">
        <svg viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="waveBottomGrad1" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#48bb13" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#6fd622" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#9be738" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="waveBottomGrad2" x1="100%" y1="100%" x2="20%" y2="20%">
              <stop offset="0%" stopColor="#55c218" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#82de29" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d="M360 360 L360 40 C270 50 180 100 110 180 C50 250 20 310 10 360 Z" fill="url(#waveBottomGrad1)" />
          <path d="M360 360 L360 110 C290 120 220 160 170 220 C120 280 90 330 80 360 Z" fill="url(#waveBottomGrad2)" />
        </svg>
      </div>

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[440px] flex flex-col items-center mx-auto"
      >
        {/* Top Header Bar with Back Button & Brand Badge */}
        <div className="w-full flex items-center justify-between mb-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-lime-100/80 text-lime-800 border border-lime-200/90 shadow-2xs">
            SafarGo Peshawar
          </span>
        </div>

        {/* 1. TOP LOGO SECTION (Safar Go with exact monogram) */}
        <motion.div variants={itemVariants} className="pt-1 pb-4 flex flex-col items-center">
          <Logo size="md" showSubtitle={true} />
        </motion.div>

        {/* 2. WELCOME BACK HEADLINE & SUBTITLE (Left-aligned matching design) */}
        <motion.div variants={itemVariants} className="w-full px-1 mb-5 text-left">
          <h2 className="text-2xl sm:text-[30px] font-extrabold text-slate-800 tracking-tight leading-tight">
            Welcome <span className="text-[#3ebd19]">Back!</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-[13px] font-normal mt-1 leading-relaxed">
            Login to your SafarGo account and continue your journey.
          </p>
        </motion.div>

        {/* 3. WHITE FORM CARD */}
        <motion.div 
          variants={itemVariants}
          className="w-full bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_12px_45px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] border border-slate-100"
        >

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Field 1: Email or Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-[13px] font-bold text-slate-700 pl-0.5">
                Email or Phone Number
              </label>
              <div className="relative flex items-center bg-[#f8faf7] border border-slate-200/90 rounded-2xl px-3 py-2.5 sm:py-3 transition-all duration-200 focus-within:bg-white focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10">
                {/* Green Circular Badge with User Icon */}
                <div className="w-8 h-8 rounded-full bg-[#e3f8d3] flex items-center justify-center shrink-0 mr-3 text-[#38b415]">
                  <User className="w-4 h-4 fill-current stroke-none" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your email or phone number"
                  disabled={loading}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none disabled:opacity-50"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-0.5 pr-0.5">
                <label className="text-xs sm:text-[13px] font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { sound.playClick(); onOpenForgotPassword(); }}
                  className="text-xs font-bold text-[#3ebd19] hover:text-[#2fa212] inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Forgot Password?</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="relative flex items-center bg-[#f8faf7] border border-slate-200/90 rounded-2xl px-3 py-2.5 sm:py-3 transition-all duration-200 focus-within:bg-white focus-within:border-[#3ebd19] focus-within:ring-4 focus-within:ring-[#3ebd19]/10">
                {/* Green Circular Badge with Lock Icon */}
                <div className="w-8 h-8 rounded-full bg-[#e3f8d3] flex items-center justify-center shrink-0 mr-3 text-[#38b415]">
                  <Lock className="w-4 h-4 fill-current stroke-none" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none pr-2 disabled:opacity-50"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => { sound.playClick(); setShowPassword(!showPassword); }}
                  className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2.5 pt-1 select-none">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition cursor-pointer ${
                  rememberMe 
                    ? 'bg-[#3ebd19] text-white shadow-sm' 
                    : 'border border-slate-300 bg-white hover:border-[#3ebd19]'
                }`}
              >
                {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
              <span 
                onClick={() => setRememberMe(!rememberMe)}
                className="text-xs sm:text-[13px] text-slate-600 font-medium cursor-pointer"
              >
                Remember me
              </span>
            </div>

            {/* SIGN IN Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5bc522] via-[#45b719] to-[#30a111] hover:from-[#51be19] hover:to-[#28920b] text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(69,183,25,0.38)] hover:shadow-[0_12px_28px_rgba(69,183,25,0.48)] hover:brightness-105 active:scale-[0.99] transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>SIGNING IN...</span>
                  </div>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 'or continue with' Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200/90"></div>
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap px-1">
              or continue with
            </span>
            <div className="h-px flex-1 bg-slate-200/90"></div>
          </div>

          {/* Social Buttons (Google & Facebook) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full bg-white hover:bg-slate-50/90 border border-slate-200 shadow-sm text-xs sm:text-sm font-semibold text-slate-700 transition duration-200 group cursor-pointer disabled:opacity-60"
            >
              {socialLoading === 'google' ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Google</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              disabled={socialLoading !== null}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full bg-white hover:bg-slate-50/90 border border-slate-200 shadow-sm text-xs sm:text-sm font-semibold text-slate-700 transition duration-200 group cursor-pointer disabled:opacity-60"
            >
              {socialLoading === 'facebook' ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              <span>Facebook</span>
            </button>
          </div>

          {/* Don't have an account? Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { sound.playClick(); onNavigateToSignup(); }}
                className="font-bold text-[#3ebd19] hover:text-[#2fa212] inline-flex items-center gap-1 transition ml-1 cursor-pointer"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        </motion.div>

        {/* 4. BOTTOM PESHAWAR LANDMARK SKYLINE (Bab-e-Khyber Heritage) */}
        <motion.div 
          variants={itemVariants}
          className="w-full mt-6 flex flex-col items-center justify-center select-none"
        >
          <img 
            src="/peshawar-skyline-clean.png" 
            alt="Peshawar Heritage Skyline" 
            className="w-full max-w-[400px] h-auto object-contain pointer-events-none drop-shadow-sm opacity-95" 
          />
        </motion.div>

      </motion.div>
    </div>
  );
};
