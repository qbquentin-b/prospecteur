-- Supabase Database Schema

-- Custom users table for tracking
-- Note: In a full Supabase Auth setup, you might rely on auth.users,
-- but this table is used to track basic user profiles for the app.
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
