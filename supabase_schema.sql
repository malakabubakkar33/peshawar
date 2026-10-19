-- ==============================================================================
-- SAFAR GO PESHAWAR - SUPABASE POSTGRESQL SCHEMA & REALTIME SETUP
-- Run this script in your Supabase Dashboard:
-- 1. Go to https://supabase.com/dashboard/project/luprerxqwizmddewpwmw
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this SQL, and click "Run"
-- ==============================================================================

-- 1. Create Profiles Table with Unique Constraints
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '/passenger-real.jpg',
  role TEXT DEFAULT 'passenger',
  city TEXT DEFAULT 'Peshawar',
  wallet_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Unique Indexes (Case-Insensitive for Email & Username)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (LOWER(username));
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_idx ON public.profiles (phone);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies: Allow read access to all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- 5. Policies: Allow insert for anyone creating an account
DROP POLICY IF EXISTS "Anyone can insert a profile" ON public.profiles;
CREATE POLICY "Anyone can insert a profile" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- 6. Policies: Allow users to update their profile
DROP POLICY IF EXISTS "Anyone can update their profile" ON public.profiles;
CREATE POLICY "Anyone can update their profile" 
ON public.profiles FOR UPDATE 
USING (true);

-- 7. Enable Realtime on profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- 8. Rides Table for Realtime Booking (Optional / Ready for live rides)
CREATE TABLE IF NOT EXISTS public.rides (
  id TEXT PRIMARY KEY,
  rider_id TEXT,
  driver_id TEXT,
  pickup_name TEXT NOT NULL,
  dropoff_name TEXT NOT NULL,
  pickup_lat NUMERIC,
  pickup_lng NUMERIC,
  dropoff_lat NUMERIC,
  dropoff_lng NUMERIC,
  vehicle_type TEXT DEFAULT 'ride_ac',
  fare NUMERIC NOT NULL,
  status TEXT DEFAULT 'searching', -- searching, accepted, arriving, started, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rides viewable by everyone" ON public.rides;
CREATE POLICY "Rides viewable by everyone" ON public.rides FOR ALL USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
