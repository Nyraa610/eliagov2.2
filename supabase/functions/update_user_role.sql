
CREATE OR REPLACE FUNCTION public.update_user_role(user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  calling_user_id uuid;
  calling_user_role text;
BEGIN
  -- Get the ID of the calling user
  calling_user_id := auth.uid();
  
  -- Get the role of the calling user
  SELECT role INTO calling_user_role FROM public.profiles WHERE id = calling_user_id;
  
  -- Check if the calling user is an admin
  IF calling_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can update user roles';
  END IF;
  
  -- Validate the role is valid
  IF new_role NOT IN ('user', 'admin', 'client_admin', 'consultant') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Update the user's role
  UPDATE public.profiles 
  SET role = new_role::user_role 
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;
