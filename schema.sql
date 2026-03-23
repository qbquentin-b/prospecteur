-- Supabase Database Schema

-- Custom users table for tracking
-- Note: In Supabase, authentication (including passwords, email verification, etc.)
-- is handled automatically in the private `auth.users` table.
-- We never store raw or hashed passwords in the public schema for security reasons.
-- This `public.users` table acts as a "Profile" table that references the authenticated user.
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tokens INTEGER DEFAULT 100, -- Nouveauté: tokens de recherche alloués par défaut
  is_admin BOOLEAN DEFAULT FALSE, -- Nouveauté: contrôle d'accès au dashboard admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des favoris
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL,
  lead_data JSONB NOT NULL, -- Pour sauvegarder un snapshot des données du prospect
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lead_id)
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
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

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

-- Allow anyone to lookup email by username (needed for login by username)
-- Security Definer function to allow unauthenticated users to lookup an email
-- by username during the login flow without exposing the entire users table.
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_email TEXT;
BEGIN
  SELECT email INTO found_email
  FROM public.users
  WHERE username = p_username;

  RETURN found_email;
END;
$$;

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

-- Favoris RLS
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin RLS (Les administrateurs peuvent voir tous les profils et logs)
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can view all logs"
  ON public.scan_executions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Optional: Create a trigger to automatically create a public.users profile
-- whenever a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to sync email updates from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_updated_user()
RETURNS TRIGGER AS $$
BEGIN
  IF old.email <> new.email THEN
    UPDATE public.users
    SET email = new.email
    WHERE id = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_user();
