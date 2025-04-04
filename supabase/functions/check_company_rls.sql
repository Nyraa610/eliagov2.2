
-- Function to check and create company RLS policies if they don't exist
DO $$
BEGIN
    -- Check if RLS is enabled on companies table
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'companies' 
        AND rowsecurity = TRUE
    ) THEN
        -- Enable RLS on companies table
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled Row Level Security on companies table';
    END IF;

    -- Check if company creation policy exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'companies' 
        AND policyname = 'enable_company_creation_for_authenticated_users'
    ) THEN
        -- Create policy for authenticated users to create companies
        CREATE POLICY "enable_company_creation_for_authenticated_users" ON public.companies
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
        RAISE NOTICE 'Created company creation policy';
    END IF;

    -- Check if company select policy exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'companies' 
        AND policyname = 'enable_company_select_for_authenticated_users'
    ) THEN
        -- Create policy for authenticated users to select companies
        CREATE POLICY "enable_company_select_for_authenticated_users" ON public.companies
            FOR SELECT
            TO authenticated
            USING (true);
        RAISE NOTICE 'Created company select policy';
    END IF;
    
    -- Check if company update policy exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'companies' 
        AND policyname = 'enable_company_update_for_company_members'
    ) THEN
        -- Create policy for company admins to update their companies
        CREATE POLICY "enable_company_update_for_company_members" ON public.companies
            FOR UPDATE
            TO authenticated
            USING (id IN (
                SELECT company_id
                FROM public.profiles
                WHERE id = auth.uid() AND is_company_admin = true
            ));
        RAISE NOTICE 'Created company update policy';
    END IF;
END $$;
