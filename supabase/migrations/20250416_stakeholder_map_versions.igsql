
-- Create stakeholder_map_versions table
CREATE TABLE IF NOT EXISTS public.stakeholder_map_versions (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_stakeholder_map_versions_company_id ON public.stakeholder_map_versions(company_id);

-- Enable RLS
ALTER TABLE public.stakeholder_map_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company's stakeholder map versions"
ON public.stakeholder_map_versions
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create stakeholder map versions for their company"
ON public.stakeholder_map_versions
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Create deliverables table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  assessment_type TEXT,
  assessment_id UUID,
  category TEXT,
  status TEXT DEFAULT 'completed',
  metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_deliverables_company_id ON public.deliverables(company_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_assessment_type ON public.deliverables(assessment_type);
CREATE INDEX IF NOT EXISTS idx_deliverables_category ON public.deliverables(category);

-- Enable RLS
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company's deliverables"
ON public.deliverables
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create deliverables for their company"
ON public.deliverables
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Modify stakeholder_assessments table if needed to store visual map
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stakeholder_assessments' 
    AND column_name = 'visual_map'
  ) THEN
    ALTER TABLE public.stakeholder_assessments 
    ADD COLUMN visual_map JSONB;
  END IF;
END$$;
