-- Drop the old constraints
ALTER TABLE public.bags DROP CONSTRAINT IF EXISTS bags_status_check;
ALTER TABLE public.bags DROP CONSTRAINT IF EXISTS bags_bag_type_check;

-- Add new constraints with all valid values
ALTER TABLE public.bags ADD CONSTRAINT bags_status_check 
CHECK (status = ANY (ARRAY['activated', 'approved', 'disapproved', 'receiver_approved', 'receiver_disapproved']));

ALTER TABLE public.bags ADD CONSTRAINT bags_bag_type_check 
CHECK (bag_type = ANY (ARRAY['recyclable', 'organic', 'biodegradable', 'residual']));