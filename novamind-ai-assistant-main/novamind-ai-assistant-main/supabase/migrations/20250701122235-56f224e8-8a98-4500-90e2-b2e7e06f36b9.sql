
-- Create enum for user plans
CREATE TYPE public.user_plan AS ENUM ('free', 'pro', 'premium', 'pay_as_you_go');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for payment methods
CREATE TYPE public.payment_method AS ENUM ('mtn_mobile_money', 'orange_money', 'lonestar_money');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  plan user_plan NOT NULL DEFAULT 'free',
  tokens_remaining INTEGER DEFAULT 0,
  messages_remaining INTEGER DEFAULT 50,
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create usage tracking table
CREATE TABLE public.usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  model_used TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  message_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment requests table
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_requested user_plan NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  receipt_url TEXT,
  status payment_status DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create file uploads table
CREATE TABLE public.file_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  analyzed BOOLEAN DEFAULT FALSE,
  analysis_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create RLS policies for usage_logs
CREATE POLICY "Users can view their own usage logs" 
  ON public.usage_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage logs" 
  ON public.usage_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for payment_requests
CREATE POLICY "Users can view their own payment requests" 
  ON public.payment_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment requests" 
  ON public.payment_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for file_uploads
CREATE POLICY "Users can view their own files" 
  ON public.file_uploads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files" 
  ON public.file_uploads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan, messages_remaining)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    'free',
    50
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to check user plan access
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

-- Function to get allowed model for user
CREATE OR REPLACE FUNCTION public.get_user_allowed_model(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE plan
      WHEN 'free' THEN 'gpt-3.5-turbo'
      WHEN 'pro' THEN 'gpt-4o-mini'
      WHEN 'premium' THEN 'gpt-4o'
      WHEN 'pay_as_you_go' THEN 'gpt-4o'
      ELSE 'gpt-3.5-turbo'
    END
  FROM public.profiles
  WHERE id = user_id;
$$;
