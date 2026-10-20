import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginPage } from './components/LoginPage';
import { SignupFlow } from './components/SignupFlow';
import { CategorySelectionPage, type CategoryType } from './components/CategorySelectionPage';
import { DriverApplicationPage } from './components/DriverApplicationPage';
import { DriverPendingReviewPage } from './components/DriverPendingReviewPage';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { DashboardPreview } from './components/DashboardPreview';
import { DriverPanel } from './components/DriverPanel';
import { AdminPanel } from './components/AdminPanel';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { OtpNotificationBanner } from './components/OtpNotificationBanner';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { userStorage, type UserAccount } from './lib/supabase';

export function App() {
  // Splash Screen: Shows on app launch
  const [showSplash, setShowSplash] = useState(true);

  // Onboarding Screen: Shows after splash screen when user is NOT logged in
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [currentView, setCurrentView] = useState<
    'login' | 'signup' | 'category' | 'driver-application' | 'driver-pending' | 'dashboard' | 'driver-panel' | 'admin-panel'
  >('login');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [submittedDriverData, setSubmittedDriverData] = useState<any>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Active usage tracking for 10-minute splash frequency
  useEffect(() => {
    const recordActive = () => {
      localStorage.setItem('safargo_last_active_time', Date.now().toString());
    };

    const interval = setInterval(recordActive, 30000);
    window.addEventListener('beforeunload', recordActive);
    document.addEventListener('visibilitychange', recordActive);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', recordActive);
      document.removeEventListener('visibilitychange', recordActive);
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    localStorage.setItem('safargo_last_active_time', Date.now().toString());
    const session = userStorage.getSession();
    if (!session) {
      // User is NOT logged in: ALWAYS display onboarding screen every time app is opened!
      setShowOnboarding(true);
    } else {
      // User IS logged in: never show onboarding, open active panel immediately!
      setShowOnboarding(false);
    }
  };

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
    setCurrentView('login');
  };

  // Persistent session: on launch, if already authenticated, check whether admin, driver or passenger mode was active!
  useEffect(() => {
    const session = userStorage.getSession();
    if (session) {
      setCurrentUser(session);
      const activeMode = localStorage.getItem(`safargo_active_mode_${session.id}`);
      const isDriverRegistered = localStorage.getItem(`safargo_driver_registered_${session.id}`) === 'true';
      if (userStorage.isUserAdmin(session)) {
        setCurrentView('admin-panel');
      } else if (activeMode === 'driver' || (session.role === 'driver' && activeMode !== 'passenger') || (isDriverRegistered && activeMode === 'driver')) {
        setCurrentView('driver-panel');
      } else {
        setCurrentView('dashboard');
      }
    }
  }, []);

  // Listen for Admin Driver Approval Event
  useEffect(() => {
    const handleDriverApprovedEvent = (e: any) => {
      const approvedApp = e.detail;
      if (currentUser && (approvedApp.userId === currentUser.id || approvedApp.phone === currentUser.phone)) {
        localStorage.setItem(`safargo_driver_registered_${currentUser.id}`, 'true');
        localStorage.setItem(`safargo_active_mode_${currentUser.id}`, 'driver');
        const updated = userStorage.updateRole(currentUser.id, 'driver');
        if (updated) {
          setCurrentUser(updated);
        }
        // Switch to driver-panel when admin officially approves!
        setCurrentView('driver-panel');
      }
    };

    window.addEventListener('safargo-driver-approved', handleDriverApprovedEvent);
    return () => window.removeEventListener('safargo-driver-approved', handleDriverApprovedEvent);
  }, [currentUser]);

  // Real In-App Push Notification Toast State & Listener
  const [activePushToast, setActivePushToast] = useState<{
    title: string;
    body: string;
    icon?: string;
    timestamp?: string;
  } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handlePushEvent = (e: any) => {
      setActivePushToast(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setActivePushToast(null);
      }, 5500);
    };

    window.addEventListener('safargo-inapp-push', handlePushEvent);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('safargo-inapp-push', handlePushEvent);
    };
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    userStorage.setSession(user);
    const activeMode = localStorage.getItem(`safargo_active_mode_${user.id}`);
    const isDriverRegistered = localStorage.getItem(`safargo_driver_registered_${user.id}`) === 'true';
    if (userStorage.isUserAdmin(user)) {
      setCurrentView('admin-panel');
    } else if (activeMode === 'driver' || (user.role === 'driver' && activeMode !== 'passenger') || (isDriverRegistered && activeMode === 'driver')) {
      setCurrentView('driver-panel');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleSignupSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    // When account is created, transition directly to the Category Selection Page
    setCurrentView('category');
  };

  const handleCategorySelected = (category: CategoryType) => {
    if (category === 'driver') {
      // Driver selected: open Driver Application registration page
      setCurrentView('driver-application');
      return;
    }

    // Passenger or Cargo selected:
    if (currentUser) {
      const updated = userStorage.updateRole(currentUser.id, category);
      if (updated) {
        setCurrentUser(updated);
        userStorage.setSession(updated);
      } else {
        const fallback: UserAccount = { ...currentUser, role: category };
        setCurrentUser(fallback);
        userStorage.setSession(fallback);
      }
    }
    // Direct navigation to Home Page
    setCurrentView('dashboard');
  };

  const handleDriverApplicationSubmitted = (driverData: any) => {
    setSubmittedDriverData(driverData);
    if (currentUser) {
      localStorage.setItem(`safargo_driver_registered_${currentUser.id}`, 'pending');
      localStorage.setItem(`safargo_driver_data_${currentUser.id}`, JSON.stringify(driverData));
    }
    // Form is now pending admin review! Only Admin can approve it.
    setCurrentView('driver-pending');
  };

  const handleDriverPendingToPassenger = () => {
    if (currentUser) {
      const fallback: UserAccount = { ...currentUser, role: 'passenger' };
      setCurrentUser(fallback);
      userStorage.setSession(fallback);
    }
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    userStorage.clearSession();
    setCurrentUser(null);
    setShowOnboarding(true);
    setCurrentView('login');
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  const isAuthView = 
    currentView === 'login' || 
    currentView === 'signup' || 
    currentView === 'category' ||
    currentView === 'driver-application' || 
    currentView === 'driver-pending';

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center selection:bg-lime-300 selection:text-slate-900 font-sans ${isAuthView ? 'bg-[#fafdf8]' : currentView === 'admin-panel' ? 'bg-slate-950' : currentView === 'dashboard' ? 'bg-slate-900' : 'mesh-bg'}`}>
      {/* Real Inbound OTP Notification Toast Listener */}
      <OtpNotificationBanner />

      {/* Background Animated Glowing Ambient Orbs for non-auth, non-dashboard, non-admin views */}
      {!isAuthView && currentView !== 'dashboard' && currentView !== 'admin-panel' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-lime-300/20 blur-[130px] animate-float"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-lime-400/15 blur-[150px] animate-pulse-slow"></div>
          <div className="absolute top-[40%] right-[15%] w-[350px] h-[350px] rounded-full bg-emerald-300/15 blur-[120px]"></div>
        </div>
      )}

      {/* Full Screen Content */}
      <main className={`relative z-10 w-full flex items-center justify-center ${isAuthView || currentView === 'dashboard' ? 'p-0 w-full min-h-screen' : 'p-4 sm:p-6'}`}>
        <AnimatePresence mode="wait">
          {currentView === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full flex items-center justify-center"
            >
              <LoginPage
                onSuccessLogin={handleLoginSuccess}
                onNavigateToSignup={() => setCurrentView('signup')}
                onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
                onBack={() => setShowOnboarding(true)}
              />
            </motion.div>
          )}

          {currentView === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full flex items-center justify-center"
            >
              <SignupFlow
                onBackToLogin={() => setCurrentView('login')}
                onSignupComplete={handleSignupSuccess}
              />
            </motion.div>
          )}

          {currentView === 'category' && currentUser && (
            <motion.div
              key="category"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <CategorySelectionPage
                userName={currentUser.fullName}
                onSelectCategory={handleCategorySelected}
              />
            </motion.div>
          )}

          {currentView === 'driver-application' && (
            <motion.div
              key="driver-application"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full"
            >
              <DriverApplicationPage
                user={currentUser}
                onBack={() => setCurrentView('dashboard')}
                onSubmitApplication={handleDriverApplicationSubmitted}
              />
            </motion.div>
          )}

          {currentView === 'driver-pending' && (
            <motion.div
              key="driver-pending"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <DriverPendingReviewPage
                user={currentUser}
                driverData={submittedDriverData}
                onGoToPassengerHome={handleDriverPendingToPassenger}
                onEnterDriverPanel={() => {
                  if (currentUser) {
                    localStorage.setItem(`safargo_active_mode_${currentUser.id}`, 'driver');
                  }
                  setCurrentView('driver-panel');
                }}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && currentUser && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full min-h-screen"
            >
              <DashboardPreview
                user={currentUser}
                onLogout={handleLogout}
                onOpenDriverApplication={() => setCurrentView('driver-application')}
                onOpenDriverPanel={() => {
                  if (currentUser) {
                    localStorage.setItem(`safargo_active_mode_${currentUser.id}`, 'driver');
                  }
                  setCurrentView('driver-panel');
                }}
                onOpenAdminPanel={() => setCurrentView('admin-panel')}
              />
            </motion.div>
          )}

          {currentView === 'driver-panel' && (
            <motion.div
              key="driver-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full min-h-screen"
            >
              <DriverPanel
                user={currentUser}
                driverData={submittedDriverData || (currentUser ? JSON.parse(localStorage.getItem(`safargo_driver_data_${currentUser.id}`) || 'null') : null)}
                onSwitchToPassenger={() => {
                  if (currentUser) {
                    localStorage.setItem(`safargo_active_mode_${currentUser.id}`, 'passenger');
                  }
                  setCurrentView('dashboard');
                }}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

          {currentView === 'admin-panel' && (
            <motion.div
              key="admin-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full min-h-screen"
            >
              <AdminPanel
                user={currentUser}
                onSwitchToPassenger={() => setCurrentView('dashboard')}
                onSwitchToDriver={() => setCurrentView('driver-panel')}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Forgot Password OTP Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccessReset={() => {
          setIsForgotPasswordOpen(false);
          setCurrentView('login');
        }}
      />

      {/* Real In-App Security OTP Floating Banner */}
      <OtpNotificationBanner />

      {/* PWA Offline Network Detection Toast */}
      <OfflineIndicator />

      {/* PWA Add to Home Screen Glassmorphic Banner */}
      <PwaInstallBanner />

      {/* Real In-App Push Notification Floating Banner */}
      <AnimatePresence>
        {activePushToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-4 inset-x-4 max-w-md mx-auto z-50 pointer-events-auto"
          >
            <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-lime-500/30 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3ebd19] to-lime-300 p-0.5 shrink-0 flex items-center justify-center shadow-md">
                <img src="/safar-go-monogram-exact.png" alt="SafarGo" className="w-full h-full object-contain rounded-[10px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-lime-400 truncate">{activePushToast.title}</h4>
                  <span className="text-[10px] text-slate-400">{activePushToast.timestamp || 'Now'}</span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{activePushToast.body}</p>
              </div>
              <button
                onClick={() => setActivePushToast(null)}
                className="text-slate-400 hover:text-white p-1 transition cursor-pointer text-sm font-bold"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
