
-- Notifications table for urgent announcements
CREATE TABLE public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anuncio_id uuid REFERENCES public.anuncios(id) ON DELETE CASCADE,
  tipo character varying NOT NULL DEFAULT 'urgente',
  titulo character varying NOT NULL,
  mensagem text,
  lida boolean NOT NULL DEFAULT false,
  criado_em timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notificacoes"
  ON public.notificacoes FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notificacoes"
  ON public.notificacoes FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- System/admin can insert notifications
CREATE POLICY "Admins can insert notificacoes"
  ON public.notificacoes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can delete own notifications
CREATE POLICY "Users can delete own notificacoes"
  ON public.notificacoes FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_id);

-- Trigger: auto-create notifications for all users when an urgent announcement is created
CREATE OR REPLACE FUNCTION public.notify_urgent_anuncio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.urgente = true AND (OLD IS NULL OR OLD.urgente = false) THEN
    INSERT INTO public.notificacoes (usuario_id, anuncio_id, tipo, titulo, mensagem)
    SELECT p.id, NEW.id, 'urgente', '🚨 Anúncio urgente: ' || NEW.titulo, NEW.descricao
    FROM public.profiles p
    WHERE p.id != NEW.usuario_id AND p.status = 'ativo';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_urgent_anuncio
AFTER INSERT OR UPDATE ON public.anuncios
FOR EACH ROW
EXECUTE FUNCTION public.notify_urgent_anuncio();

-- Admin RLS policies for managing announcements and users
-- Admins can update any announcement
CREATE POLICY "Admins can update any anuncio"
  ON public.anuncios FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any announcement
CREATE POLICY "Admins can delete any anuncio"
  ON public.anuncios FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any profile (for blocking)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any fotos
CREATE POLICY "Admins can delete any fotos"
  ON public.fotos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
