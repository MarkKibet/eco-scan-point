
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('household', 'collector');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create bags table for household bag activation
CREATE TABLE public.bags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT UNIQUE NOT NULL,
  household_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'activated' CHECK (status IN ('activated', 'approved', 'disapproved'))
);

-- Create bag_reviews table for collector approvals
CREATE TABLE public.bag_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id UUID REFERENCES public.bags(id) ON DELETE CASCADE NOT NULL,
  collector_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'disapproved')),
  points_awarded INTEGER DEFAULT 0,
  notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bag_reviews ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Collectors can view household profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'collector'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bags policies
CREATE POLICY "Households can view own bags" ON public.bags
  FOR SELECT USING (auth.uid() = household_id);

CREATE POLICY "Households can insert own bags" ON public.bags
  FOR INSERT WITH CHECK (auth.uid() = household_id);

CREATE POLICY "Households can update own bags" ON public.bags
  FOR UPDATE USING (auth.uid() = household_id);

CREATE POLICY "Collectors can view all bags" ON public.bags
  FOR SELECT USING (public.has_role(auth.uid(), 'collector'));

CREATE POLICY "Collectors can update bags" ON public.bags
  FOR UPDATE USING (public.has_role(auth.uid(), 'collector'));

-- Bag reviews policies
CREATE POLICY "Collectors can insert reviews" ON public.bag_reviews
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'collector'));

CREATE POLICY "Collectors can view all reviews" ON public.bag_reviews
  FOR SELECT USING (public.has_role(auth.uid(), 'collector'));

CREATE POLICY "Households can view reviews of own bags" ON public.bag_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bags 
      WHERE bags.id = bag_reviews.bag_id 
      AND bags.household_id = auth.uid()
    )
  );

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'location', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data ->> 'role')::app_role
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update points when bag is approved
CREATE OR REPLACE FUNCTION public.update_points_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE public.profiles
    SET total_points = total_points + NEW.points_awarded
    WHERE id = (SELECT household_id FROM public.bags WHERE id = NEW.bag_id);
    
    UPDATE public.bags
    SET status = 'approved'
    WHERE id = NEW.bag_id;
  ELSIF NEW.status = 'disapproved' THEN
    UPDATE public.bags
    SET status = 'disapproved'
    WHERE id = NEW.bag_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for points update
CREATE TRIGGER on_bag_review_created
  AFTER INSERT ON public.bag_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_points_on_approval();
