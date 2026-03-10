
-- Add weight_kg column to bag_reviews for recording trash weight
ALTER TABLE public.bag_reviews ADD COLUMN weight_kg numeric(10,2) DEFAULT NULL;

-- Add household_code to profiles for unique household identification
ALTER TABLE public.profiles ADD COLUMN household_code text DEFAULT NULL;

-- Create unique index on household_code (only for non-null values)
CREATE UNIQUE INDEX idx_profiles_household_code ON public.profiles (household_code) WHERE household_code IS NOT NULL;
