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
-- Allow authenticated users to update their own profile (with column restrictions)
-- To prevent users from updating their own tokens or is_admin flags,
-- we must restrict the policy to specific columns or handle updates via secure RPC.
-- In Supabase/PostgreSQL, column-level privileges (REVOKE UPDATE ON public.users(tokens, is_admin))
-- are best, but you can also use a trigger or a more complex policy.
-- A simple approach without triggers is limiting the columns via REVOKE:
REVOKE UPDATE (tokens, is_admin) ON public.users FROM authenticated;

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

-- Security Definer function to allow authenticated users to safely deduct tokens
-- Since UPDATE on `tokens` is revoked for security reasons, we use a controlled RPC.
CREATE OR REPLACE FUNCTION public.deduct_tokens(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to deduct their own tokens, or if they are admin
  IF auth.uid() = p_user_id OR public.is_admin() THEN
    UPDATE public.users
    SET tokens = GREATEST(tokens - p_amount, 0)
    WHERE id = p_user_id;
  ELSE
    RAISE EXCEPTION 'Not authorized to deduct tokens for this user';
  END IF;
END;
$$;

-- Security Definer function to check if the current user is an admin
-- This prevents the infinite recursion '42P17' error that occurs when a policy
-- on the users table queries the users table itself.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO is_admin_status
  FROM public.users
  WHERE id = auth.uid();

  RETURN COALESCE(is_admin_status, FALSE);
END;
$$;

-- Admin RLS (Les administrateurs peuvent voir tous les profils et logs)
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all logs"
  ON public.scan_executions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

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
