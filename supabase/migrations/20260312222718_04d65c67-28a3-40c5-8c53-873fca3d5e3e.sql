
-- Enums
CREATE TYPE public.status_usuario AS ENUM ('ativo', 'inativo', 'bloqueado');
CREATE TYPE public.status_anuncio AS ENUM ('ativo', 'pausado', 'expirado', 'removido');
CREATE TYPE public.status_denuncia AS ENUM ('pendente', 'revisado', 'resolvido');

-- 1. Regiões
CREATE TABLE public.regioes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Bairros
CREATE TABLE public.bairros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regiao_id UUID NOT NULL REFERENCES public.regioes(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(regiao_id, nome)
);

-- 3. Categorias
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icone VARCHAR(50),
  ordem INTEGER NOT NULL DEFAULT 0,
  ativa BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Subcategorias
CREATE TABLE public.subcategorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativa BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(categoria_id, slug)
);

-- 5. Perfis (profiles - linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nome VARCHAR(150) NOT NULL DEFAULT '',
  whatsapp VARCHAR(20) NOT NULL DEFAULT '',
  regiao_id UUID REFERENCES public.regioes(id),
  avatar_url TEXT,
  bio TEXT,
  status status_usuario NOT NULL DEFAULT 'ativo',
  email_verificado BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_avaliacoes INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  deletado_em TIMESTAMPTZ
);

-- 6. Anúncios
CREATE TABLE public.anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id),
  subcategoria_id UUID REFERENCES public.subcategorias(id),
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  preco DECIMAL(10,2),
  regiao_id UUID NOT NULL REFERENCES public.regioes(id),
  bairro_id UUID REFERENCES public.bairros(id),
  localizacao_texto VARCHAR(255) NOT NULL DEFAULT '',
  status status_anuncio NOT NULL DEFAULT 'ativo',
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  urgente BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  deletado_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ
);

-- 7. Fotos
CREATE TABLE public.fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anuncio_id UUID NOT NULL REFERENCES public.anuncios(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  url_thumbnail TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Favoritos
CREATE TABLE public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anuncio_id UUID NOT NULL REFERENCES public.anuncios(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, anuncio_id)
);

-- 9. Avaliações
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anunciante_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comentario TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, anunciante_id)
);

-- 10. Denúncias
CREATE TABLE public.denuncias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anuncio_id UUID NOT NULL REFERENCES public.anuncios(id) ON DELETE CASCADE,
  motivo VARCHAR(255) NOT NULL,
  descricao TEXT,
  status status_denuncia NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. User Roles (security best practice)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- ============ INDEXES ============
CREATE INDEX idx_anuncios_usuario ON public.anuncios(usuario_id);
CREATE INDEX idx_anuncios_categoria ON public.anuncios(categoria_id);
CREATE INDEX idx_anuncios_regiao ON public.anuncios(regiao_id);
CREATE INDEX idx_anuncios_status ON public.anuncios(status);
CREATE INDEX idx_anuncios_criado_em ON public.anuncios(criado_em DESC);
CREATE INDEX idx_bairros_regiao ON public.bairros(regiao_id);
CREATE INDEX idx_subcategorias_categoria ON public.subcategorias(categoria_id);
CREATE INDEX idx_fotos_anuncio ON public.fotos(anuncio_id);
CREATE INDEX idx_favoritos_usuario ON public.favoritos(usuario_id);
CREATE INDEX idx_favoritos_anuncio ON public.favoritos(anuncio_id);
CREATE INDEX idx_avaliacoes_anunciante ON public.avaliacoes(anunciante_id);
CREATE INDEX idx_denuncias_anuncio ON public.denuncias(anuncio_id);

-- ============ VALIDATION TRIGGERS ============

-- Rating must be 1-5
CREATE OR REPLACE FUNCTION public.validate_avaliacao_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  IF NEW.usuario_id = NEW.anunciante_id THEN
    RAISE EXCEPTION 'Cannot rate yourself';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_avaliacao
  BEFORE INSERT OR UPDATE ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.validate_avaliacao_rating();

-- Auto-update atualizado_em
CREATE OR REPLACE FUNCTION public.update_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

CREATE TRIGGER trg_anuncios_updated
  BEFORE UPDATE ON public.anuncios
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update average rating on anunciante
CREATE OR REPLACE FUNCTION public.update_anunciante_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  avg_rating NUMERIC;
  total INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*) INTO avg_rating, total
  FROM public.avaliacoes
  WHERE anunciante_id = COALESCE(NEW.anunciante_id, OLD.anunciante_id);

  UPDATE public.profiles
  SET rating = COALESCE(avg_rating, 0), total_avaliacoes = COALESCE(total, 0)
  WHERE id = COALESCE(NEW.anunciante_id, OLD.anunciante_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_anunciante_rating();

-- Increment views
CREATE OR REPLACE FUNCTION public.increment_visualizacoes(anuncio_uuid UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.anuncios SET visualizacoes = visualizacoes + 1 WHERE id = anuncio_uuid;
END;
$$;

-- Has role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ RLS POLICIES ============

-- Regiões: public read
ALTER TABLE public.regioes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read regioes" ON public.regioes FOR SELECT USING (true);

-- Bairros: public read
ALTER TABLE public.bairros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read bairros" ON public.bairros FOR SELECT USING (true);

-- Categorias: public read
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read categorias" ON public.categorias FOR SELECT USING (true);

-- Subcategorias: public read
ALTER TABLE public.subcategorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read subcategorias" ON public.subcategorias FOR SELECT USING (true);

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Anúncios
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active anuncios" ON public.anuncios FOR SELECT USING (status = 'ativo' OR usuario_id = auth.uid());
CREATE POLICY "Auth users can create anuncios" ON public.anuncios FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own anuncios" ON public.anuncios FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own anuncios" ON public.anuncios FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Fotos
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read fotos" ON public.fotos FOR SELECT USING (true);
CREATE POLICY "Auth users can insert fotos" ON public.fotos FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.anuncios WHERE id = anuncio_id AND usuario_id = auth.uid())
);
CREATE POLICY "Users can delete own fotos" ON public.fotos FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.anuncios WHERE id = anuncio_id AND usuario_id = auth.uid())
);

-- Favoritos
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own favoritos" ON public.favoritos FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Users can insert own favoritos" ON public.favoritos FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own favoritos" ON public.favoritos FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Avaliações
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read avaliacoes" ON public.avaliacoes FOR SELECT USING (true);
CREATE POLICY "Auth users can create avaliacoes" ON public.avaliacoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own avaliacoes" ON public.avaliacoes FOR UPDATE TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Denúncias
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own denuncias" ON public.denuncias FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
CREATE POLICY "Auth users can create denuncias" ON public.denuncias FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

-- User Roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
