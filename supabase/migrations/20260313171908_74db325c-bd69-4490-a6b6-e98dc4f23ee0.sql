
-- Functions
CREATE OR REPLACE FUNCTION public.is_admin_or_super(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role::text IN ('admin', 'super_admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role::text = 'super_admin'
  );
END;
$$;

-- Update handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  
  IF NEW.email = 'admin@email.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update existing admin to super_admin
UPDATE public.user_roles SET role = 'super_admin' WHERE user_id IN (
  SELECT id FROM public.profiles WHERE email = 'admin@email.com'
) AND role = 'admin';

-- Policies on user_roles
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Super admin can manage roles" ON public.user_roles;
CREATE POLICY "Super admin can manage roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin can delete roles" ON public.user_roles;
CREATE POLICY "Super admin can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- Update existing policies to use is_admin_or_super
DROP POLICY IF EXISTS "Admins can delete any anuncio" ON public.anuncios;
CREATE POLICY "Admins can delete any anuncio" ON public.anuncios
FOR DELETE TO authenticated USING (is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can update any anuncio" ON public.anuncios;
CREATE POLICY "Admins can update any anuncio" ON public.anuncios
FOR UPDATE TO authenticated 
USING (is_admin_or_super(auth.uid()))
WITH CHECK (is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (is_admin_or_super(auth.uid()))
WITH CHECK (is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete any fotos" ON public.fotos;
CREATE POLICY "Admins can delete any fotos" ON public.fotos
FOR DELETE TO authenticated USING (is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert notificacoes" ON public.notificacoes;
CREATE POLICY "Admins can insert notificacoes" ON public.notificacoes
FOR INSERT TO authenticated
WITH CHECK (is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all denuncias" ON public.denuncias;
CREATE POLICY "Admins can read all denuncias" ON public.denuncias
FOR SELECT TO authenticated USING (is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can update denuncias" ON public.denuncias;
CREATE POLICY "Admins can update denuncias" ON public.denuncias
FOR UPDATE TO authenticated
USING (is_admin_or_super(auth.uid()))
WITH CHECK (is_admin_or_super(auth.uid()));
