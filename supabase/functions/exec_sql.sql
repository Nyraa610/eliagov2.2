
-- Create a function to execute SQL (only available to service role)
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Secure the function so only service_role can access it
REVOKE ALL ON FUNCTION public.exec_sql FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_sql TO service_role;
