-- Add bag_type to bags table with default 'recyclable'
ALTER TABLE public.bags ADD COLUMN IF NOT EXISTS bag_type text DEFAULT 'recyclable';

-- Update existing bags to recyclable type
UPDATE public.bags SET bag_type = 'recyclable' WHERE bag_type IS NULL;

-- Add check constraint for valid bag types
ALTER TABLE public.bags DROP CONSTRAINT IF EXISTS bags_bag_type_check;
ALTER TABLE public.bags ADD CONSTRAINT bags_bag_type_check CHECK (bag_type IN ('recyclable', 'organic'));

-- Add points column to bags for reference (though points are determined by type)
-- This is useful for tracking the actual points value at time of creation
ALTER TABLE public.bags ADD COLUMN IF NOT EXISTS points_value integer DEFAULT 15;

-- Enable realtime for bags table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bags;

-- Enable realtime for profiles table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for user_roles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;