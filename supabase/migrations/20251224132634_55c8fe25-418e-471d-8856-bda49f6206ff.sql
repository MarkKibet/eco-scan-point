-- Create receiver_reviews table to track receiver verification of collector reviews
CREATE TABLE public.receiver_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bag_review_id UUID NOT NULL REFERENCES public.bag_reviews(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'disapproved')),
  notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.receiver_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for receiver_reviews
CREATE POLICY "Receivers can insert reviews"
ON public.receiver_reviews
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'receiver'));

CREATE POLICY "Receivers can view all receiver reviews"
ON public.receiver_reviews
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'receiver'));

CREATE POLICY "Admins can view all receiver reviews"
ON public.receiver_reviews
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Collectors can view reviews of their work"
ON public.receiver_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bag_reviews br
    WHERE br.id = receiver_reviews.bag_review_id
    AND br.collector_id = auth.uid()
  )
);

-- Function to handle receiver disapproval - removes points from household
CREATE OR REPLACE FUNCTION public.handle_receiver_disapproval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_bag_id UUID;
  v_household_id UUID;
  v_points_awarded INTEGER;
BEGIN
  IF NEW.status = 'disapproved' THEN
    -- Get the bag_id and points from the original bag_review
    SELECT br.bag_id, br.points_awarded INTO v_bag_id, v_points_awarded
    FROM public.bag_reviews br
    WHERE br.id = NEW.bag_review_id;
    
    -- Get the household_id from the bag
    SELECT b.household_id INTO v_household_id
    FROM public.bags b
    WHERE b.id = v_bag_id;
    
    -- Subtract the points from the household
    UPDATE public.profiles
    SET total_points = GREATEST(0, total_points - COALESCE(v_points_awarded, 0))
    WHERE id = v_household_id;
    
    -- Update bag status to receiver_disapproved
    UPDATE public.bags
    SET status = 'receiver_disapproved'
    WHERE id = v_bag_id;
  ELSIF NEW.status = 'approved' THEN
    -- Update bag status to receiver_approved
    UPDATE public.bags
    SET status = 'receiver_approved'
    WHERE id = (
      SELECT br.bag_id FROM public.bag_reviews br WHERE br.id = NEW.bag_review_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for receiver disapproval
CREATE TRIGGER on_receiver_review_created
  AFTER INSERT ON public.receiver_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_receiver_disapproval();

-- Allow receivers to view bags
CREATE POLICY "Receivers can view all bags"
ON public.bags
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'receiver'));

-- Allow receivers to view all bag reviews
CREATE POLICY "Receivers can view all bag reviews"
ON public.bag_reviews
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'receiver'));

-- Allow receivers to view profiles (for household info)
CREATE POLICY "Receivers can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'receiver'));