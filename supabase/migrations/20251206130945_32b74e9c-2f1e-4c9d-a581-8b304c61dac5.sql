-- Add disapproval_reason column to bag_reviews table
ALTER TABLE public.bag_reviews ADD COLUMN IF NOT EXISTS disapproval_reason text;

-- Update RLS policy to allow admins full access to bags
CREATE POLICY "Admins can manage all bags" 
ON public.bags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to view all reviews
CREATE POLICY "Admins can view all reviews" 
ON public.bag_reviews 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));