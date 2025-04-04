
-- Function to create a new user with proper permissions
CREATE OR REPLACE FUNCTION public.create_new_user(
  user_email TEXT,
  user_role TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  temp_password TEXT;
  result RECORD;
BEGIN
  -- Check if caller has admin privileges
  IF NOT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can create new users';
  END IF;

  -- Check if user with this email already exists
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    -- User exists, so we'll just update their role in profiles
    UPDATE public.profiles 
    SET role = user_role::user_role 
    WHERE id = new_user_id;
    
    RETURN json_build_object(
      'id', new_user_id,
      'email', user_email,
      'role', user_role,
      'status', 'updated'
    );
  END IF;
  
  -- Generate a secure random password
  temp_password := encode(gen_random_bytes(12), 'base64');
  
  -- Use the private create_user_with_role function to create the user
  new_user_id := auth.uid(); -- Placeholder
  
  -- Note: We can't create auth.users directly from SQL
  -- This function would need to be supported by an edge function call
  
  RETURN json_build_object(
    'id', new_user_id,
    'email', user_email,
    'role', user_role,
    'status', 'needs_edge_function'
  );
END;
$$;

-- Grant execute permission to authenticated users (admin check happens inside the function)
GRANT EXECUTE ON FUNCTION public.create_new_user TO authenticated;
