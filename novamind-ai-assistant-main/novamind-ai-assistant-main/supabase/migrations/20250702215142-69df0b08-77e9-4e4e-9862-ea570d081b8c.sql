
-- First, drop the dependent function
DROP FUNCTION IF EXISTS public.has_plan_access(uuid, user_plan);

-- Update payment_requests table column to text temporarily
ALTER TABLE public.payment_requests ALTER COLUMN plan_requested TYPE text;

-- Now we can safely drop and recreate the enum
DROP TYPE IF EXISTS public.user_plan CASCADE;
CREATE TYPE public.user_plan AS ENUM ('free', 'pro', 'premium', 'pay_as_you_go');

-- Update profiles table
ALTER TABLE public.profiles ALTER COLUMN plan DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN plan TYPE text;
ALTER TABLE public.profiles ALTER COLUMN plan TYPE public.user_plan USING plan::public.user_plan;
ALTER TABLE public.profiles ALTER COLUMN plan SET DEFAULT 'free'::public.user_plan;

-- Update payment_requests table back to enum
ALTER TABLE public.payment_requests 
  ALTER COLUMN plan_requested TYPE public.user_plan USING plan_requested::public.user_plan;

-- Remove plan expiration since plans are now lifetime
ALTER TABLE public.profiles DROP COLUMN IF EXISTS plan_expires_at;

-- Add plan purchase date for tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_purchased_at TIMESTAMP WITH TIME ZONE;

-- Update payment requests table for one-time payments
ALTER TABLE public.payment_requests 
  ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Recreate the has_plan_access function
CREATE OR REPLACE FUNCTION public.has_plan_access(user_id UUID, required_plan user_plan)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE required_plan
      WHEN 'free' THEN TRUE
      WHEN 'pro' THEN plan IN ('pro', 'premium', 'pay_as_you_go')
      WHEN 'premium' THEN plan IN ('premium')
      WHEN 'pay_as_you_go' THEN plan IN ('pay_as_you_go', 'premium')
      ELSE FALSE
    END
  FROM public.profiles
  WHERE id = user_id;
$$;

-- Update get_user_allowed_model function for new model access
CREATE OR REPLACE FUNCTION public.get_user_allowed_model(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE plan
      WHEN 'free' THEN 'gpt-3.5-turbo'
      WHEN 'pro' THEN 'gpt-4o'
      WHEN 'premium' THEN 'gpt-4.1-preview'
      WHEN 'pay_as_you_go' THEN 'gpt-4o'
      ELSE 'gpt-3.5-turbo'
    END
  FROM public.profiles
  WHERE id = user_id;
$$;

-- Update message limits for new plans
CREATE OR REPLACE FUNCTION public.get_user_message_limit(user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE plan
      WHEN 'free' THEN 50
      WHEN 'pro' THEN 500
      WHEN 'premium' THEN -1  -- Unlimited
      WHEN 'pay_as_you_go' THEN -1  -- Token-based, not message-based
      ELSE 50
    END
  FROM public.profiles
  WHERE id = user_id;
$$;

-- Function to check if user has file upload access
CREATE OR REPLACE FUNCTION public.can_upload_files(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    plan IN ('pro', 'premium', 'pay_as_you_go')
  FROM public.profiles
  WHERE id = user_id;
$$;

-- Function to check if user has document analysis access
CREATE OR REPLACE FUNCTION public.can_analyze_documents(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    plan = 'premium'
  FROM public.profiles
  WHERE id = user_id;
$$;

-- Update handle_new_user function to set proper defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan, messages_remaining, tokens_remaining)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    'free'::public.user_plan,
    50,
    0
  );
  RETURN new;
END;
$$;
