
-- Function to create a profile with admin privileges (bypassing RLS)
CREATE OR REPLACE FUNCTION public.admin_create_profile(
  p_id UUID,
  p_email TEXT,
  p_role TEXT
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate the role is valid for the user_role enum
  IF p_role NOT IN ('user', 'admin', 'client_admin', 'consultant') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Insert the profile
  RETURN QUERY
  INSERT INTO public.profiles (id, email, role)
  VALUES (p_id, p_email, p_role::user_role)
  RETURNING *;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_create_profile TO authenticated;
