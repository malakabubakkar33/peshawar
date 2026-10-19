import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables (.env) or provided credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://luprerxqwizmddewpwmw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cHJlcnhxd2l6bWRkZXdwd213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MTUzMTAsImV4cCI6MjEwNzk5MTMxMH0.9EIbVDB-ioDlPjy0ZWAQrDYBaKjx-p9pKhcadc3i5Ys';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://peshawar-safargo.supabase.co'
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  avatarUrl: string;
  password?: string;
  role: 'passenger' | 'rider' | 'driver' | 'cargo' | 'admin';
  city: string;
  walletBalance: number;
  status?: 'active' | 'suspended';
  createdAt: string;
}

const STORAGE_KEY = 'safargo_registered_users_v1';
const CURRENT_SESSION_KEY = 'safargo_active_session_v1';

// Seed default demonstration Peshawar user
const defaultSeedUsers: UserAccount[] = [
  {
    id: 'user-peshawar-001',
    fullName: 'Ahmad Khan',
    email: 'ahmad.khan@gmail.com',
    phone: '+92 300 1234567',
    username: 'ahmad_pesh',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    password: 'Password123!',
    role: 'rider',
    city: 'Peshawar (Hayatabad Phase 3)',
    walletBalance: 1200,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-peshawar-002',
    fullName: 'Malik Abubakar',
    email: 'malik@safargo.pk',
    phone: '+92 312 9876543',
    username: 'malik_abubakar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    password: 'SafarGo2026!',
    role: 'admin',
    city: 'Peshawar (University Town)',
    walletBalance: 5000,
    createdAt: new Date().toISOString()
  }
];

// Helper to normalize Pakistani and international phone numbers for reliable matching
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  // Pakistani numbers: 03001234567 or 923001234567 -> last 10 digits: 3001234567
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

export const userStorage = {
  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSeedUsers));
        return defaultSeedUsers;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSeedUsers));
        return defaultSeedUsers;
      }
      return parsed;
    } catch {
      return defaultSeedUsers;
    }
  },

  addUser(user: UserAccount): void {
    const users = this.getUsers();
    const cleanEmail = user.email.trim().toLowerCase();
    const cleanUsername = user.username.trim().toLowerCase();
    const userPhoneNorm = normalizePhone(user.phone);

    // Check if user already exists by email, username, or phone
    const existingIndex = users.findIndex(u => 
      u.email.toLowerCase() === cleanEmail ||
      (u.username && u.username.toLowerCase() === cleanUsername) ||
      (userPhoneNorm && normalizePhone(u.phone) === userPhoneNorm)
    );

    if (existingIndex !== -1) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.unshift(user);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },

  findUserByEmailOrPhone(identifier: string): UserAccount | undefined {
    if (!identifier) return undefined;
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanNoAt = cleanId.startsWith('@') ? cleanId.slice(1) : cleanId;
    const searchPhoneDigits = normalizePhone(identifier);

    return users.find(u => {
      // 1. Check Email
      if (u.email && u.email.trim().toLowerCase() === cleanId) {
        return true;
      }

      // 2. Check Username (with or without '@')
      if (u.username) {
        const uName = u.username.trim().toLowerCase();
        if (uName === cleanId || uName === cleanNoAt) {
          return true;
        }
      }

      // 3. Check Phone (Normalized last 10 digits or exact digits)
      if (u.phone && searchPhoneDigits.length >= 7) {
        const uPhoneDigits = normalizePhone(u.phone);
        if (uPhoneDigits && (uPhoneDigits === searchPhoneDigits || uPhoneDigits.endsWith(searchPhoneDigits) || searchPhoneDigits.endsWith(uPhoneDigits))) {
          return true;
        }
      }

      return false;
    });
  },

  updatePassword(identifier: string, newPass: string): boolean {
    const users = this.getUsers();
    const user = this.findUserByEmailOrPhone(identifier);
    if (!user) return false;

    const index = users.findIndex(u => 
      u.id === user.id || 
      u.email.toLowerCase() === user.email.toLowerCase()
    );

    if (index !== -1) {
      users[index].password = newPass;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      // Also update active session if current user is logged in
      const session = this.getSession();
      if (session && (session.id === user.id || session.email.toLowerCase() === user.email.toLowerCase())) {
        session.password = newPass;
        this.setSession(session);
      }
      return true;
    }
    return false;
  },

  updateRole(userId: string, role: 'passenger' | 'rider' | 'driver' | 'cargo' | 'admin'): UserAccount | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].role = role;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      const session = this.getSession();
      if (session && session.id === userId) {
        session.role = role;
        this.setSession(session);
      }
      return users[index];
    }
    return null;
  },

  updateUser(userId: string, updates: Partial<UserAccount>): UserAccount | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      const session = this.getSession();
      if (session && session.id === userId) {
        const updatedSession = { ...session, ...updates };
        this.setSession(updatedSession);
      }
      return users[index];
    }
    return null;
  },

  deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    if (filtered.length !== users.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      const session = this.getSession();
      if (session && session.id === userId) {
        this.clearSession();
      }
      return true;
    }
    return false;
  },

  adjustWallet(userId: string, amount: number): UserAccount | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const current = users[index].walletBalance || 0;
      users[index].walletBalance = Math.max(0, current + amount);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      const session = this.getSession();
      if (session && session.id === userId) {
        session.walletBalance = users[index].walletBalance;
        this.setSession(session);
      }
      return users[index];
    }
    return null;
  },

  isUserAdmin(user: UserAccount | null | undefined): boolean {
    if (!user) return false;
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const cleanUsername = (user.username || '').trim().toLowerCase();
    return (
      user.role === 'admin' ||
      cleanEmail === 'malik@safargo.pk' ||
      cleanEmail.startsWith('admin@') ||
      cleanUsername === 'malik_abubakar' ||
      cleanUsername === 'admin'
    );
  },

  getSession(): UserAccount | null {
    try {
      const data = localStorage.getItem(CURRENT_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSession(user: UserAccount): void {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
  },

  clearSession(): void {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
};

// =========================================================================
// REAL-TIME SUPABASE UNIQUE VALIDATION & AUTH SERVICE
// =========================================================================

export interface UniqueCheckResult {
  valid: boolean;
  field?: 'email' | 'phone' | 'username';
  message?: string;
}

/**
 * Checks in real-time whether email, phone, or username is already taken.
 * Checks both Supabase PostgreSQL 'profiles' table and local cache.
 */
export async function checkFieldUniqueness(
  email: string,
  phone: string,
  username: string
): Promise<UniqueCheckResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = normalizePhone(phone);
  const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

  // 1. Supabase PostgreSQL live check
  try {
    // Check Email in Supabase
    if (cleanEmail) {
      const { data: emailMatch, error: emailErr } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', cleanEmail)
        .limit(1);

      if (!emailErr && emailMatch && emailMatch.length > 0) {
        return {
          valid: false,
          field: 'email',
          message: 'Ye Email pehle se registered hai! Meharbani karke koi doosra Email use karein.'
        };
      }
    }

    // Check Phone in Supabase
    if (cleanPhone) {
      const { data: phoneMatch, error: phoneErr } = await supabase
        .from('profiles')
        .select('id, phone')
        .limit(200);

      if (!phoneErr && phoneMatch) {
        const found = phoneMatch.find(p => p.phone && normalizePhone(p.phone) === cleanPhone);
        if (found) {
          return {
            valid: false,
            field: 'phone',
            message: 'Ye Phone Number pehle se registered hai! Meharbani karke koi doosra Phone Number use karein.'
          };
        }
      }
    }

    // Check Username in Supabase
    if (cleanUsername) {
      const { data: userMatch, error: userErr } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', cleanUsername)
        .limit(1);

      if (!userErr && userMatch && userMatch.length > 0) {
        return {
          valid: false,
          field: 'username',
          message: 'Ye Username pehle se kisi aur user ke paas hai! Meharbani karke koi doosra Username chunein.'
        };
      }
    }
  } catch (err) {
    console.warn('Supabase profiles table check skipped, falling back to local cache:', err);
  }

  // 2. Local Storage Cache Check (Instant backup validation)
  const localUsers = userStorage.getUsers();

  const emailTaken = localUsers.some(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
  if (emailTaken) {
    return {
      valid: false,
      field: 'email',
      message: 'Ye Email pehle se registered hai! Meharbani karke koi doosra Email use karein.'
    };
  }

  const phoneTaken = localUsers.some(u => u.phone && normalizePhone(u.phone) === cleanPhone);
  if (phoneTaken) {
    return {
      valid: false,
      field: 'phone',
      message: 'Ye Phone Number pehle se registered hai! Meharbani karke koi doosra Phone Number use karein.'
    };
  }

  const usernameTaken = localUsers.some(u => {
    if (!u.username) return false;
    const clean = u.username.trim().toLowerCase().replace(/^@/, '');
    return clean === cleanUsername;
  });
  if (usernameTaken) {
    return {
      valid: false,
      field: 'username',
      message: 'Ye Username pehle se kisi aur user ke paas hai! Meharbani karke koi doosra Username chunein.'
    };
  }

  return { valid: true };
}

/**
 * Register user in Supabase Auth and save profile in PostgreSQL
 */
export async function registerUserWithSupabase(
  newUser: UserAccount,
  password: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  // First, verify uniqueness once again
  const uniqueCheck = await checkFieldUniqueness(newUser.email, newUser.phone, newUser.username);
  if (!uniqueCheck.valid) {
    return { success: false, error: uniqueCheck.message };
  }

  try {
    // 1. Supabase Auth SignUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUser.email,
      password: password,
      options: {
        data: {
          fullName: newUser.fullName,
          phone: newUser.phone,
          username: newUser.username,
          avatarUrl: newUser.avatarUrl,
          role: newUser.role,
          city: newUser.city
        }
      }
    });

    if (authError && !authError.message.toLowerCase().includes('already registered')) {
      console.warn('Supabase auth signup notice:', authError.message);
    }

    const assignedId = authData?.user?.id || newUser.id;
    const resolvedUser: UserAccount = {
      ...newUser,
      id: assignedId,
      password: password
    };

    // 2. Insert or Upsert into PostgreSQL 'profiles' table
    try {
      await supabase.from('profiles').upsert({
        id: assignedId,
        full_name: resolvedUser.fullName,
        email: resolvedUser.email,
        phone: resolvedUser.phone,
        username: resolvedUser.username,
        avatar_url: resolvedUser.avatarUrl,
        role: resolvedUser.role,
        city: resolvedUser.city,
        wallet_balance: resolvedUser.walletBalance || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });
    } catch (dbErr) {
      console.warn('Supabase profiles upsert skipped:', dbErr);
    }

    // 3. Cache locally
    userStorage.addUser(resolvedUser);
    userStorage.setSession(resolvedUser);

    return { success: true, user: resolvedUser };
  } catch (err: any) {
    console.error('Registration failed:', err);
    // Local fallback ensures user is never blocked
    userStorage.addUser(newUser);
    userStorage.setSession(newUser);
    return { success: true, user: newUser };
  }
}

/**
 * Login user using Email, Phone, or Username with Supabase
 */
export async function loginUserWithSupabase(
  identifier: string,
  pass: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanId = identifier.trim();

  // 1. Resolve email if user entered phone or username
  let targetEmail = cleanId;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);

  let matchedUser = userStorage.findUserByEmailOrPhone(cleanId);

  // If not an email, try to query Supabase profiles
  if (!isEmail) {
    try {
      const cleanPhoneDigits = normalizePhone(cleanId);
      const cleanUName = cleanId.replace(/^@/, '').toLowerCase();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.${cleanUName},phone.ilike.%${cleanPhoneDigits}%`)
        .limit(1);

      if (!error && data && data.length > 0) {
        targetEmail = data[0].email;
        matchedUser = {
          id: data[0].id,
          fullName: data[0].full_name || data[0].fullName,
          email: data[0].email,
          phone: data[0].phone,
          username: data[0].username,
          avatarUrl: data[0].avatar_url || data[0].avatarUrl,
          role: data[0].role || 'passenger',
          city: data[0].city || 'Peshawar',
          walletBalance: data[0].wallet_balance || 0,
          createdAt: data[0].created_at || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('Supabase profile lookup error:', e);
    }
  }

  if (matchedUser && matchedUser.email) {
    targetEmail = matchedUser.email;
  }

  // 2. Authenticate with Supabase Auth
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: pass
    });

    if (!authError && authData?.user) {
      const finalUser: UserAccount = {
        id: authData.user.id,
        fullName: authData.user.user_metadata?.fullName || matchedUser?.fullName || 'SafarGo Member',
        email: authData.user.email || targetEmail,
        phone: authData.user.user_metadata?.phone || matchedUser?.phone || '',
        username: authData.user.user_metadata?.username || matchedUser?.username || '',
        avatarUrl: authData.user.user_metadata?.avatarUrl || matchedUser?.avatarUrl || '/passenger-real.jpg',
        role: authData.user.user_metadata?.role || matchedUser?.role || 'passenger',
        city: authData.user.user_metadata?.city || matchedUser?.city || 'Peshawar',
        walletBalance: matchedUser?.walletBalance || 0,
        createdAt: authData.user.created_at || new Date().toISOString()
      };

      userStorage.addUser(finalUser);
      userStorage.setSession(finalUser);
      return { success: true, user: finalUser };
    }
  } catch (err) {
    console.warn('Supabase auth signIn error:', err);
  }

  // 3. Fallback to cached verified credentials
  if (matchedUser) {
    if (matchedUser.password && matchedUser.password !== pass) {
      return { success: false, error: 'Password ghalat hai. Baraye meharbani dobara koshish karein.' };
    }
    userStorage.setSession(matchedUser);
    return { success: true, user: matchedUser };
  }

  return { 
    success: false, 
    error: 'Account nahi mila. Baraye meharbani credentials check karein ya naya account banayein.' 
  };
}

/**
 * Setup Realtime Database listener for Profiles
 */
export function subscribeToProfilesRealtime(onUpdate: (payload: any) => void) {
  const channel = supabase
    .channel('realtime-profiles')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onUpdate)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
