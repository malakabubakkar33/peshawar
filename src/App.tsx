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
import { OtpNotificationBanner } from './components/OtpNotificationBanner';
import { userStorage, type UserAccount } from './lib/supabase';

export function App() {
  const [currentView, setCurrentView] = useState<
    'login' | 'signup' | 'category' | 'driver-application' | 'driver-pending' | 'dashboard' | 'driver-panel' | 'admin-panel'
  >('login');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [submittedDriverData, setSubmittedDriverData] = useState<any>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

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
      localStorage.setItem(`safargo_driver_registered_${currentUser.id}`, 'true');
      localStorage.setItem(`safargo_driver_data_${currentUser.id}`, JSON.stringify(driverData));
      localStorage.setItem(`safargo_active_mode_${currentUser.id}`, 'driver');
      const updated = userStorage.updateRole(currentUser.id, 'driver');
      if (updated) {
        setCurrentUser(updated);
      }
    }
    setCurrentView('driver-panel');
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
    setCurrentView('login');
  };

  const isAuthView = 
    currentView === 'login' || 
    currentView === 'signup' || 
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
    </div>
  );
}

export default App;
