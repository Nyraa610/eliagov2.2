
-- Create tables for the ESG Launchpad feature

-- Table for sector profiles
CREATE TABLE IF NOT EXISTS public.sector_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  key_risks TEXT[] NOT NULL DEFAULT '{}',
  key_opportunities TEXT[] NOT NULL DEFAULT '{}',
  procurement_impacts TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_ai_generated BOOLEAN DEFAULT FALSE
);

-- Table for peer snapshots
CREATE TABLE IF NOT EXISTS public.peer_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id TEXT REFERENCES public.sector_profiles(id),
  company_size TEXT NOT NULL,
  initiative_title TEXT NOT NULL,
  initiative_description TEXT NOT NULL,
  impact_area TEXT NOT NULL,
  results TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sector_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for sector_profiles
CREATE POLICY "Anyone can read sector profiles"
  ON public.sector_profiles
  FOR SELECT
  USING (true);
  
CREATE POLICY "Only admins can insert sector profiles"
  ON public.sector_profiles
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
  );
  
CREATE POLICY "Only admins can update sector profiles"
  ON public.sector_profiles
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
  );
  
CREATE POLICY "Only admins can delete sector profiles"
  ON public.sector_profiles
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
  );

-- Create policies for peer_snapshots
CREATE POLICY "Anyone can read peer snapshots"
  ON public.peer_snapshots
  FOR SELECT
  USING (true);
  
CREATE POLICY "Only admins can insert peer snapshots"
  ON public.peer_snapshots
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
  );
  
CREATE POLICY "Only admins can update peer snapshots"
  ON public.peer_snapshots
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
  );
  
CREATE POLICY "Only admins can delete peer snapshots"
  ON public.peer_snapshots
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
  );
