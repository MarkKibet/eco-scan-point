-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create household feedback table
CREATE TABLE public.household_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.household_feedback ENABLE ROW LEVEL SECURITY;

-- Households can view their own feedback
CREATE POLICY "Households can view own feedback"
ON public.household_feedback
FOR SELECT
USING (auth.uid() = household_id);

-- Households can insert own feedback
CREATE POLICY "Households can insert own feedback"
ON public.household_feedback
FOR INSERT
WITH CHECK (auth.uid() = household_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON public.household_feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update feedback (to respond)
CREATE POLICY "Admins can update feedback"
ON public.household_feedback
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_household_feedback_updated_at
BEFORE UPDATE ON public.household_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();