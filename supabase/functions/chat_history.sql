
-- Create a table for chat history
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own chat history
CREATE POLICY "Users can view their own chat history"
  ON public.chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only the function can insert chat history
CREATE POLICY "Service role can insert chat history"
  ON public.chat_history
  FOR INSERT
  WITH CHECK (true);
