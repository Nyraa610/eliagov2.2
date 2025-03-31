
-- Function to increment the activity counter for a user
CREATE OR REPLACE FUNCTION public.increment_activity_counter(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_engagement_stats (user_id, activity_count, total_points)
  VALUES (user_id_param, 1, 0)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    activity_count = user_engagement_stats.activity_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
