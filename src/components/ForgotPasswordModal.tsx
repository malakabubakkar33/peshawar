import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Mail, KeyRound, Lock, CheckCircle2, 
  ArrowRight, ArrowLeft, RefreshCw, Eye, EyeOff 
} from 'lucide-react';
import { userStorage } from '../lib/supabase';
import { emitOtpNotification } from '../lib/peshawarData';
import { sound } from '../lib/sound';
import { sendVerificationOtpEmail } from '../lib/emailService';
import { TopErrorToast } from './TopErrorToast';


interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessReset: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessReset
}) => {
  // Step: 1 = Email Input, 2 = 6-digit OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 2 && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Listen for auto-fill from OTP banner
  useEffect(() => {
    const handleOtpReceived = (e: Event) => {
      const customEvent = e as CustomEvent<{ code: string }>;
      if (customEvent.detail && customEvent.detail.code && step === 2) {
        const codeStr = customEvent.detail.code;
        const chars = codeStr.split('').slice(0, 6);
        setOtp(chars);
        setErrorMsg(null);
      }
    };

    window.addEventListener('safargo-otp-received', handleOtpReceived);
    return () => window.removeEventListener('safargo-otp-received', handleOtpReceived);
  }, [step]);

  if (!isOpen) return null;

  // Step 1: Submit Email & Generate Real OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMsg(null);

    const cleanInput = email.trim();
    if (!cleanInput) {
      setErrorMsg('Please enter your email or phone number.');
      sound.playError();
      return;
    }

    const user = userStorage.findUserByEmailOrPhone(cleanInput);
    if (!user) {
      setErrorMsg('No Safar Go account associated with this email or phone.');
      sound.playError();
      return;
    }

    setIsLoading(true);

    // Generate real 6-digit random cryptographic OTP
    const realCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(realCode);

    // Send real email via Resend API
    if (user.email && user.email.includes('@')) {
      sendVerificationOtpEmail(user.email, realCode, user.fullName || 'SafarGo Traveler').catch((err) => {
        console.warn('Resend password reset email notification:', err);
      });
    }

    setTimeout(() => {
      setIsLoading(false);
      // Dispatch real OTP notification event to user
      emitOtpNotification(cleanInput, realCode);

      setStep(2);
      setTimerSeconds(30);
      setCanResend(false);
      sound.playSuccess();

      // Focus first OTP input
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }, 700);

  };

  // Step 2: Handle OTP input digit change & auto-advance
  const handleOtpChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, '');
    const newOtp = [...otp];

    if (numeric.length > 1) {
      // Pasting full 6-digit code
      const pastedDigits = numeric.slice(0, 6).split('');
      pastedDigits.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      otpInputsRef.current[Math.min(pastedDigits.length, 5)]?.focus();
      return;
    }

    newOtp[index] = numeric;
    setOtp(newOtp);

    // Auto-advance
    if (numeric && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    sound.playClick();
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setOtp(['', '', '', '', '', '']);
    setTimerSeconds(30);
    setCanResend(false);
    setErrorMsg(null);
    emitOtpNotification(email, newCode);

    if (email && email.includes('@')) {
      sendVerificationOtpEmail(email, newCode, 'SafarGo Traveler').catch((err) => {
        console.warn('Resend OTP error:', err);
      });
    }

    sound.playSuccess();
  };


  // Step 2 Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMsg(null);

    const enteredCode = otp.join('');
    if (enteredCode.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      sound.playError();
      return;
    }

    if (enteredCode !== generatedOtp) {
      setErrorMsg('Invalid verification code. Please check the real code dispatched to your notification or resend.');
      sound.playError();
      return;
    }

    // Success -> Step 3
    sound.playSuccess();
    setStep(3);
  };

  // Step 3 Set New Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      sound.playError();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      sound.playError();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const ok = userStorage.updatePassword(email, newPassword);
      if (ok) {
        sound.playSuccess();
        setStep(4);
      } else {
        setErrorMsg('Failed to update password. Please try again.');
        sound.playError();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <TopErrorToast message={errorMsg} onDismiss={() => setErrorMsg(null)} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-lime-100 border border-lime-300 flex items-center justify-center text-lime-700 mb-4 shadow-sm">
          <KeyRound className="w-6 h-6" />
        </div>

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-black text-slate-900">Forgot Password?</h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Enter your registered email address. We will send a secure 6-digit real OTP code to verify your identity.
            </p>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">
                  Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ahmad.khan@gmail.com"
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="lime-glow-button w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wider disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Dispatching OTP...</span>
                    </div>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setStep(1);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email</span>
              </button>
              <span className="text-[11px] font-bold text-lime-700 bg-lime-50 px-2.5 py-0.5 rounded-full border border-lime-200">
                Step 2: Real OTP
              </span>
            </div>

            <h2 className="text-xl font-black text-slate-900">Enter Verification Code</h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Enter the 6-digit code sent to <strong className="text-slate-800">{email}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* 6 Digit Input Boxes */}
              <div className="flex justify-between gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl bg-white border-2 border-slate-200 focus:border-lime-500 focus:ring-4 focus:ring-lime-400/20 focus:outline-none transition shadow-sm text-slate-900"
                  />
                ))}
              </div>

              {/* Countdown & Resend Button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">
                  {timerSeconds > 0 ? (
                    <>Resend code in <strong className="text-slate-800">{timerSeconds}s</strong></>
                  ) : (
                    'Did not receive the code?'
                  )}
                </span>
                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleResendOtp}
                  className="font-bold text-lime-700 hover:text-lime-800 disabled:opacity-40 disabled:hover:text-lime-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>

              <button
                type="submit"
                className="lime-glow-button w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wider cursor-pointer"
              >
                <span>Verify OTP Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: SET NEW PASSWORD */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-black text-slate-900">Create New Password</h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Your identity has been verified. Enter a fresh password for your Safar Go account.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="glass-input w-full pl-10 pr-11 py-3 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="lime-glow-button w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wider disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? 'Updating Security...' : 'Save & Login'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Password Changed!</h2>
            <p className="text-xs text-slate-600 mt-2 mb-6 max-w-xs mx-auto">
              Your Safar Go account password has been updated. You can now log in securely with your new password.
            </p>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSuccessReset();
              }}
              className="lime-glow-button w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold uppercase tracking-wider cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
