
-- Add gratuito column to anuncios
ALTER TABLE public.anuncios ADD COLUMN IF NOT EXISTS gratuito boolean NOT NULL DEFAULT false;

-- Allow authenticated users to insert subcategorias (user-created categories)
CREATE POLICY "Auth users can insert subcategorias"
ON public.subcategorias
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow admins to manage categorias
CREATE POLICY "Admins can insert categorias"
ON public.categorias
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can update categorias"
ON public.categorias
FOR UPDATE
TO authenticated
USING (is_admin_or_super(auth.uid()))
WITH CHECK (is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can delete categorias"
ON public.categorias
FOR DELETE
TO authenticated
USING (is_admin_or_super(auth.uid()));

-- Allow admins to manage regioes
CREATE POLICY "Admins can insert regioes"
ON public.regioes
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can update regioes"
ON public.regioes
FOR UPDATE
TO authenticated
USING (is_admin_or_super(auth.uid()))
WITH CHECK (is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can delete regioes"
ON public.regioes
FOR DELETE
TO authenticated
USING (is_admin_or_super(auth.uid()));

-- Allow admins to manage bairros
CREATE POLICY "Admins can insert bairros"
ON public.bairros
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can update bairros"
ON public.bairros
FOR UPDATE
TO authenticated
USING (is_admin_or_super(auth.uid()))
WITH CHECK (is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can delete bairros"
ON public.bairros
FOR DELETE
TO authenticated
USING (is_admin_or_super(auth.uid()));

-- Allow admins to manage subcategorias
CREATE POLICY "Admins can update subcategorias"
ON public.subcategorias
FOR UPDATE
TO authenticated
USING (is_admin_or_super(auth.uid()))
WITH CHECK (is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can delete subcategorias"
ON public.subcategorias
FOR DELETE
TO authenticated
USING (is_admin_or_super(auth.uid()));

-- Allow admins to delete avaliacoes
CREATE POLICY "Admins can delete avaliacoes"
ON public.avaliacoes
FOR DELETE
TO authenticated
USING (is_admin_or_super(auth.uid()));
