import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Car, MapPin, DollarSign, Activity, 
  Search, X, Eye, Plus, 
  Trash2, Bell, Radio, Database, LogOut, ArrowUpRight, 
  Send, CheckCircle2, UserCheck, 
  Smartphone, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { userStorage, type UserAccount } from '../lib/supabase';
import { 
  adminManager, type DriverApplication, type LiveRide, type SystemBroadcast 
} from '../lib/adminData';
import { sound } from '../lib/sound';

interface AdminPanelProps {
  user: UserAccount | null;
  onSwitchToPassenger: () => void;
  onSwitchToDriver: () => void;
  onLogout: () => void;
}

type AdminTab = 'overview' | 'rides' | 'drivers' | 'users' | 'broadcast' | 'system';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  user,
  onSwitchToPassenger,
  onSwitchToDriver,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Live state
  const [kpis, setKpis] = useState(adminManager.getKPIs());
  const [usersList, setUsersList] = useState<UserAccount[]>(userStorage.getUsers());
  const [driverApps, setDriverApps] = useState<DriverApplication[]>(adminManager.getDriverApplications());
  const [liveRides, setLiveRides] = useState<LiveRide[]>(adminManager.getLiveRides());
  const [broadcasts, setBroadcasts] = useState<SystemBroadcast[]>(adminManager.getBroadcasts());

  // Search & Filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [rideFilter, setRideFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Modals state
  const [selectedDocApp, setSelectedDocApp] = useState<DriverApplication | null>(null);
  const [walletModalUser, setWalletModalUser] = useState<UserAccount | null>(null);
  const [walletAdjustment, setWalletAdjustment] = useState<number>(500);
  const [rejectModalApp, setRejectModalApp] = useState<DriverApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('Documents incomplete or blurred');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'passenger' | 'driver' | 'admin'>('passenger');
  const [newUserPassword, setNewUserPassword] = useState('SafarGo123!');

  // Broadcast Form State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'urgent'>('info');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'drivers' | 'riders'>('all');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reloadData = () => {
    setKpis(adminManager.getKPIs());
    setUsersList(userStorage.getUsers());
    setDriverApps(adminManager.getDriverApplications());
    setLiveRides(adminManager.getLiveRides());
    setBroadcasts(adminManager.getBroadcasts());
  };

  useEffect(() => {
    reloadData();
    const interval = setInterval(reloadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // 1. Driver Actions
  const handleApproveDriver = (appId: string) => {
    sound.playSuccess();
    const approved = adminManager.approveDriver(appId);
    if (approved) {
      showToast(`Driver ${approved.fullName} approved successfully! Account activated.`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      reloadData();
    }
  };

  const handleRejectDriver = () => {
    if (!rejectModalApp) return;
    sound.playClick();
    adminManager.rejectDriver(rejectModalApp.id, rejectReason);
    showToast(`Application for ${rejectModalApp.fullName} rejected.`);
    setRejectModalApp(null);
    reloadData();
  };

  // 2. User Actions
  const handleWalletAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalUser) return;
    sound.playSuccess();
    userStorage.adjustWallet(walletModalUser.id, walletAdjustment);
    showToast(`PKR ${walletAdjustment} adjusted for ${walletModalUser.fullName}.`);
    setWalletModalUser(null);
    reloadData();
  };

  const handleToggleUserSuspend = (targetUser: UserAccount) => {
    sound.playClick();
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    userStorage.updateUser(targetUser.id, { status: newStatus });
    showToast(`User ${targetUser.fullName} is now ${newStatus.toUpperCase()}.`);
    reloadData();
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user ${name}?`)) {
      sound.playClick();
      userStorage.deleteUser(userId);
      showToast(`User ${name} deleted.`);
      reloadData();
    }
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Please enter full name and email.');
      return;
    }
    sound.playSuccess();
    const created: UserAccount = {
      id: `usr-${Date.now()}`,
      fullName: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      phone: newUserPhone.trim() || '+92 300 0000000',
      username: newUserEmail.split('@')[0],
      avatarUrl: '/passenger-real.jpg',
      password: newUserPassword,
      role: newUserRole,
      city: 'Peshawar',
      walletBalance: 1000,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    userStorage.addUser(created);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    showToast(`New user ${created.fullName} added successfully.`);
    reloadData();
  };

  // 3. Ride Actions
  const handleCancelRide = (rideId: string) => {
    sound.playClick();
    adminManager.cancelRide(rideId);
    showToast(`Ride ${rideId} cancelled by Admin override.`);
    reloadData();
  };

  const handleCompleteRide = (rideId: string) => {
    sound.playSuccess();
    adminManager.updateRideStatus(rideId, 'completed');
    showToast(`Ride ${rideId} marked as completed.`);
    reloadData();
  };

  // 4. Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    sound.playSuccess();
    adminManager.createBroadcast(broadcastMsg.trim(), broadcastType, broadcastTarget);
    setBroadcastMsg('');
    showToast('System announcement broadcasted live to all devices!');
    reloadData();
  };

  // Filtered lists
  const filteredUsers = usersList.filter(u => {
    const matchSearch = 
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch)) ||
      (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase()));
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredDriverApps = driverApps.filter(d => {
    if (driverFilter === 'all') return true;
    return d.status === driverFilter;
  });

  const filteredRides = liveRides.filter(r => {
    if (rideFilter === 'all') return true;
    return r.status === rideFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-lime-500/30 selection:text-white">
      
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs sm:text-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-500 to-emerald-400 p-0.5 shadow-lg shadow-lime-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-lime-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                SAFAR<span className="text-lime-400">GO</span>
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-lime-500/10 text-lime-400 border border-lime-500/30">
                Command Suite
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span>Peshawar Live Operations</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Switchers */}
          <button
            onClick={onSwitchToPassenger}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
            title="Open Passenger App Dashboard"
          >
            <Smartphone className="w-3.5 h-3.5 text-lime-400" />
            <span>Passenger App</span>
          </button>

          <button
            onClick={onSwitchToDriver}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
            title="Open Driver Partner Panel"
          >
            <Car className="w-3.5 h-3.5 text-emerald-400" />
            <span>Driver Panel</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Admin Tag */}
          <div className="flex items-center gap-2 pl-1">
            <img 
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} 
              alt="Admin" 
              className="w-8 h-8 rounded-full border border-lime-500/40 object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-white leading-tight">
                {user?.fullName || 'Malik Abubakar'}
              </p>
              <p className="text-[10px] text-lime-400 font-mono">Master Administrator</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 sm:gap-2 py-2 min-w-max">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: Activity },
            { id: 'rides', label: `Live Rides (${liveRides.length})`, icon: Radio },
            { id: 'drivers', label: `Driver Verification (${driverApps.filter(d => d.status === 'pending').length})`, icon: Car },
            { id: 'users', label: `User Directory (${usersList.length})`, icon: Users },
            { id: 'broadcast', label: 'Broadcast Alerts', icon: Bell },
            { id: 'system', label: 'System & Database', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { sound.playClick(); setActiveTab(tab.id as AdminTab); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive 
                    ? 'bg-lime-500 text-slate-950 shadow-md shadow-lime-500/20 font-black' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & KPIS                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Gross Booking Volume */}
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 rounded-full blur-2xl group-hover:bg-lime-500/10 transition" />
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-bold">Gross Bookings</span>
                  <DollarSign className="w-4 h-4 text-lime-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  PKR {kpis.totalGrossRevenue.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+18.4% this week</span>
                </div>
              </div>

              {/* Platform Net Cut */}
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-bold">Platform Cut (15%)</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  PKR {kpis.platformCommission.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Net Peshawar profit margin</p>
              </div>

              {/* Active Live Rides */}
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition" />
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-bold">Active Live Trips</span>
                  <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {kpis.activeLiveRidesCount} Trips
                </div>
                <div className="flex items-center gap-1 text-[11px] text-sky-400 font-bold mt-1">
                  <span>Hayatabad, Saddar, Cantt</span>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-bold">Pending Drivers</span>
                  <Car className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  {driverApps.filter(d => d.status === 'pending').length} Drivers
                </div>
                <button
                  onClick={() => setActiveTab('drivers')}
                  className="text-[11px] text-lime-400 hover:underline font-bold mt-1 block"
                >
                  Review verification queue →
                </button>
              </div>
            </div>

            {/* Middle Section: Peshawar Zone Hotspots & Live Traffic Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Zone Distribution */}
              <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-lime-400" />
                      <span>Peshawar Operational Zones & Live Heatmap</span>
                    </h3>
                    <p className="text-xs text-slate-400">Real-time driver availability & demand distribution</p>
                  </div>
                  <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-mono">
                    6 Main Sectors
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    { name: 'Hayatabad (Phases 1-7, Tatara & Industrial)', demand: 'Very High', drivers: 28, pct: 85, color: 'bg-lime-500' },
                    { name: 'University Town & Campus', demand: 'High', drivers: 19, pct: 70, color: 'bg-emerald-500' },
                    { name: 'Saddar Bazar & Mall Road Cantt', demand: 'Peak', drivers: 24, pct: 92, color: 'bg-amber-500' },
                    { name: 'Ring Road & GT Road Hub', demand: 'Medium', drivers: 14, pct: 55, color: 'bg-sky-500' },
                    { name: 'Gulbahar & City Old Quarters', demand: 'High', drivers: 16, pct: 68, color: 'bg-emerald-400' },
                    { name: 'Karkhano Market & Jamrud Corridor', demand: 'Medium', drivers: 11, pct: 45, color: 'bg-indigo-500' }
                  ].map(zone => (
                    <div key={zone.name} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-white">{zone.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400">{zone.drivers} Drivers Active</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-lime-400">
                            {zone.demand}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${zone.color} rounded-full`} style={{ width: `${zone.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions & Recent Broadcasts */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-lime-400" />
                    <span>Quick Admin Operations</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Direct commands & instant actions</p>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => { sound.playClick(); setShowAddUserModal(true); }}
                      className="w-full py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-between border border-slate-700 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-lime-400" />
                        <span>Register New User / Driver</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Manual Entry</span>
                    </button>

                    <button
                      onClick={() => { sound.playClick(); setActiveTab('drivers'); setDriverFilter('pending'); }}
                      className="w-full py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-between border border-slate-700 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        <span>Review Pending Documents</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">
                        {driverApps.filter(d => d.status === 'pending').length}
                      </span>
                    </button>

                    <button
                      onClick={() => { sound.playClick(); setActiveTab('broadcast'); }}
                      className="w-full py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-between border border-slate-700 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-sky-400" />
                        <span>Send App Broadcast Alert</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Instant</span>
                    </button>
                  </div>
                </div>

                {/* System Pill */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Supabase DB Sync:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      Active & Live
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Cluster:</span>
                    <span className="font-mono">luprerxqwizmddewpwmw</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE RIDES MONITORING                                              */}
        {/* ========================================================================= */}
        {activeTab === 'rides' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-white">Live Rides Dispatch & Radar</h2>
                <p className="text-xs text-slate-400">Real-time trip telemetry, fares, and administrative overrides</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs">
                {['all', 'in_trip', 'arriving', 'searching', 'completed'].map(f => (
                  <button
                    key={f}
                    onClick={() => setRideFilter(f)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition cursor-pointer ${
                      rideFilter === f ? 'bg-lime-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Rides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRides.map(ride => (
                <div key={ride.id} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-lime-400">{ride.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {ride.vehicleType}
                      </span>
                    </div>

                    {/* Status badge */}
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      ride.status === 'in_trip' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                      ride.status === 'arriving' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      ride.status === 'searching' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                      ride.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {ride.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-1.5 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-lime-400 shrink-0" />
                      <span className="text-slate-400 text-[11px]">From:</span>
                      <span className="font-bold text-white truncate">{ride.pickupName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-400 text-[11px]">To:</span>
                      <span className="font-bold text-white truncate">{ride.dropoffName}</span>
                    </div>
                  </div>

                  {/* Passenger & Driver Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <p className="text-slate-500 font-bold uppercase text-[9px]">Passenger</p>
                      <p className="font-bold text-white truncate">{ride.riderName}</p>
                      <p className="text-slate-400 font-mono text-[10px]">{ride.riderPhone}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <p className="text-slate-500 font-bold uppercase text-[9px]">Driver</p>
                      <p className="font-bold text-white truncate">{ride.driverName || 'Searching...'}</p>
                      <p className="text-slate-400 font-mono text-[10px]">{ride.driverPhone || '—'}</p>
                    </div>
                  </div>

                  {/* Fare & Overrides */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400">Total Fare: </span>
                      <span className="font-black text-lime-400 text-sm">PKR {ride.fare}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">(Cut: PKR {ride.commission})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => handleCompleteRide(ride.id)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancelRide(ride.id)}
                            className="px-2.5 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DRIVER REGISTRATION & VERIFICATION QUEUE                           */}
        {/* ========================================================================= */}
        {activeTab === 'drivers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-white">Driver Partner Verification Queue</h2>
                <p className="text-xs text-slate-400">Verify CNIC, Driving License, Plate photos & manually approve or reject</p>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setDriverFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition cursor-pointer ${
                      driverFilter === st ? 'bg-lime-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Drivers Application Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDriverApps.map(app => (
                <div key={app.id} className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={app.documents?.selfie || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} 
                        alt={app.fullName} 
                        className="w-11 h-11 rounded-2xl border border-slate-700 object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-extrabold text-white leading-tight">{app.fullName}</h4>
                        <p className="text-xs text-slate-400 font-mono">{app.phone}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      app.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' :
                      'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Vehicle details */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Vehicle</span>
                      <span className="font-bold text-white">{app.vehicleName} ({app.vehicleModel})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Registration Plate</span>
                      <span className="font-mono font-bold text-lime-400">{app.vehicleNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Category & Color</span>
                      <span className="font-bold text-slate-300 capitalize">{app.vehicleType.replace('_', ' ')} • {app.vehicleColor}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Operating Zone</span>
                      <span className="font-bold text-slate-300">{app.city}</span>
                    </div>
                  </div>

                  {/* Document Thumbnails & Inspection Trigger */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => { sound.playClick(); setSelectedDocApp(app); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-lime-400" />
                      <span>Inspect Documents & Photos</span>
                    </button>

                    {/* Action buttons */}
                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { sound.playClick(); setRejectModalApp(app); }}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveDriver(app.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 text-slate-950 font-black text-xs hover:brightness-105 transition cursor-pointer"
                        >
                          Approve Driver
                        </button>
                      </div>
                    )}
                  </div>

                  {app.rejectionReason && (
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                      <strong>Rejection Reason:</strong> {app.rejectionReason}
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: USERS DIRECTORY & CONTROL                                          */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-white">User Accounts & Access Control</h2>
                <p className="text-xs text-slate-400">Total {usersList.length} registered profiles. Ban, modify balance or change roles.</p>
              </div>

              <button
                onClick={() => { sound.playClick(); setShowAddUserModal(true); }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime-500 text-slate-950 font-black text-xs hover:brightness-105 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User / Driver</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, phone, or @username..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs">
                {['all', 'passenger', 'rider', 'driver', 'admin'].map(r => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition cursor-pointer ${
                      userRoleFilter === r ? 'bg-lime-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Wallet</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={u.avatarUrl || '/passenger-real.jpg'} 
                            alt={u.fullName} 
                            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                          />
                          <div>
                            <p className="font-bold text-white">{u.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">@{u.username || 'user'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-300 font-mono text-[11px]">{u.email}</p>
                        <p className="text-slate-500 text-[10px]">{u.phone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                          u.role === 'driver' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-lime-500/10 text-lime-400 border-lime-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white font-mono">
                          PKR {u.walletBalance || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { sound.playClick(); setWalletModalUser(u); }}
                            className="px-2 py-1 rounded-lg bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/20 text-[10px] font-bold transition cursor-pointer"
                            title="Adjust wallet balance"
                          >
                            Wallet ±
                          </button>
                          <button
                            onClick={() => handleToggleUserSuspend(u)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              u.status === 'suspended' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: BROADCAST NOTIFICATIONS                                            */}
        {/* ========================================================================= */}
        {activeTab === 'broadcast' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Form */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-lime-400" />
                  <span>Send Real-Time Push Broadcast</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Instantly sends notification banner across all active Passenger & Driver apps in Peshawar.
                </p>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Announcement Message
                  </label>
                  <textarea
                    rows={3}
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="e.g. Heavy rain in Hayatabad. 20% extra surge bonus active for drivers for the next 3 hours."
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Alert Priority
                    </label>
                    <select
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                    >
                      <option value="info">Informational</option>
                      <option value="warning">Traffic / Caution</option>
                      <option value="urgent">Urgent / Emergency Surge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Target Audience
                    </label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                    >
                      <option value="all">All Users (Passengers & Drivers)</option>
                      <option value="drivers">Drivers Only</option>
                      <option value="riders">Passengers Only</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-105 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Now</span>
                </button>
              </form>
            </div>

            {/* Broadcasts History */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-extrabold text-white flex items-center justify-between">
                <span>Active Broadcasts</span>
                <span className="text-[10px] text-slate-500 font-mono">{broadcasts.length} Active</span>
              </h3>

              <div className="space-y-2.5">
                {broadcasts.map(bc => (
                  <div key={bc.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          bc.type === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          bc.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-sky-500/20 text-sky-400'
                        }`}>
                          {bc.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold capitalize">Target: {bc.target}</span>
                        <span className="text-[10px] text-slate-500">• {bc.sentAt}</span>
                      </div>
                      <p className="text-xs text-slate-200">{bc.message}</p>
                    </div>

                    <button
                      onClick={() => adminManager.deleteBroadcast(bc.id)}
                      className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SYSTEM, DATABASE & BACKEND CONNECTIONS                              */}
        {/* ========================================================================= */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-lime-400" />
                <span>Backend, Database & Real-Time Sync Status</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Supabase PostgreSQL */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Supabase Postgres</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono break-all">
                    https://luprerxqwizmddewpwmw.supabase.co
                  </p>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Latency:</span>
                    <span className="text-emerald-400 font-mono">24 ms</span>
                  </div>
                </div>

                {/* Realtime WebSocket */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Realtime WebSocket</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      Subscribed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Listening to `profiles` & `rides` publication channels.
                  </p>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Channel:</span>
                    <span className="text-lime-400 font-mono">supabase_realtime</span>
                  </div>
                </div>

                {/* Authentication Engine */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Auth Engine</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Email, Phone, & Username unique constraints enforced.
                  </p>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Algorithm:</span>
                    <span className="text-slate-300 font-mono">JWT / HS256</span>
                  </div>
                </div>

              </div>

              {/* Database Schema Guide */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
                <p className="font-bold text-lime-400">PostgreSQL Schema Deployment Note:</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Your project includes the complete deployment migration script in <code className="text-white">supabase_schema.sql</code>. Run it directly in the Supabase SQL Editor if you ever need to recreate or reset the live cloud tables.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: DRIVER DOCUMENTS INSPECTION                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedDocApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedDocApp(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <img 
                  src={selectedDocApp.documents?.selfie || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} 
                  alt="Driver" 
                  className="w-12 h-12 rounded-2xl border border-slate-700 object-cover"
                />
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedDocApp.fullName}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedDocApp.vehicleName} • {selectedDocApp.vehicleNumber} ({selectedDocApp.city})
                  </p>
                </div>
              </div>

              {/* Photos Gallery including EasyPaisa Payment Receipt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'CNIC Front Side', url: selectedDocApp.documents?.cnicFront },
                  { label: 'CNIC Back Side', url: selectedDocApp.documents?.cnicBack || selectedDocApp.documents?.cnicFront },
                  { label: 'Driving License', url: selectedDocApp.documents?.license },
                  { label: 'Vehicle Number Plate', url: selectedDocApp.documents?.plate },
                  { label: 'EasyPaisa Payment Screenshot (Fee Receipt)', url: selectedDocApp.documents?.paymentScreenshot }
                ].map((doc, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 ${doc.label.includes('Payment') ? 'sm:col-span-2 border-emerald-500/40 bg-emerald-950/20' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 block">{doc.label}</span>
                      {doc.label.includes('Payment') && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          EasyPaisa &bull; 03328888249
                        </span>
                      )}
                    </div>
                    <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {doc.url ? (
                        <img src={doc.url} alt={doc.label} className="w-full h-full object-contain hover:scale-105 transition" />
                      ) : (
                        <span className="text-slate-600 text-xs">No document photo uploaded</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Applied: {new Date(selectedDocApp.submittedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {selectedDocApp.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          const target = selectedDocApp;
                          setSelectedDocApp(null);
                          setRejectModalApp(target);
                        }}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition cursor-pointer"
                      >
                        Reject Application
                      </button>
                      <button
                        onClick={() => {
                          handleApproveDriver(selectedDocApp.id);
                          setSelectedDocApp(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 text-slate-950 font-black text-xs hover:brightness-105 transition cursor-pointer"
                      >
                        Approve & Verify
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: ADJUST WALLET                                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {walletModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setWalletModalUser(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-extrabold text-white mb-1">Adjust Wallet Balance</h3>
              <p className="text-xs text-slate-400 mb-4">
                User: <span className="text-white font-bold">{walletModalUser.fullName}</span> (Current: PKR {walletModalUser.walletBalance || 0})
              </p>

              <form onSubmit={handleWalletAdjustSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Adjustment Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={walletAdjustment}
                    onChange={(e) => setWalletAdjustment(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-lime-400 focus:outline-none"
                    placeholder="e.g. 500 or -200"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Positive adds credit, negative deducts.
                  </span>
                </div>

                <div className="flex gap-2">
                  {[200, 500, 1000, -200].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWalletAdjustment(amt)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-300 transition cursor-pointer"
                    >
                      {amt > 0 ? `+${amt}` : amt}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-lime-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-105 transition cursor-pointer"
                >
                  Confirm Adjustment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: REJECT DRIVER REASON                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rejectModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="text-base font-extrabold text-white mb-1">Reject Driver Application</h3>
              <p className="text-xs text-slate-400 mb-4">
                State reason for rejecting <span className="text-white font-bold">{rejectModalApp.fullName}</span>:
              </p>

              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none focus:outline-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRejectModalApp(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectDriver}
                    className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: ADD NEW USER                                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddUserModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-extrabold text-white mb-4">Register New Member</h3>

              <form onSubmit={handleCreateNewUser} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Asad Ullah"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="asad@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                    >
                      <option value="passenger">Passenger</option>
                      <option value="driver">Driver</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Temporary Password</label>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-lime-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-105 transition cursor-pointer"
                  >
                    Save User to Database
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
