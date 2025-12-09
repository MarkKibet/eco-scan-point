-- Allow admins to view all user_roles
CREATE POLICY "Admins can view all user_roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));