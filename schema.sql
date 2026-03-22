-- Supabase Database Schema

-- Custom users table for tracking
-- Note: In Supabase, authentication (including passwords, email verification, etc.)
-- is handled automatically in the private `auth.users` table.
-- We never store raw or hashed passwords in the public schema for security reasons.
-- This `public.users` table acts as a "Profile" table that references the authenticated user.
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to log scan executions
CREATE TABLE public.scan_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  sector TEXT,
  location TEXT,
  radius_km INTEGER, -- Added for Sprint 2
  lat NUMERIC,       -- Added for Sprint 2
  lng NUMERIC,       -- Added for Sprint 2
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_executions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (example)
-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own scan logs
CREATE POLICY "Users can insert their own scan logs"
  ON public.scan_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own scan logs
CREATE POLICY "Users can view their own scan logs"
  ON public.scan_executions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Optional: Create a trigger to automatically create a public.users profile
-- whenever a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
