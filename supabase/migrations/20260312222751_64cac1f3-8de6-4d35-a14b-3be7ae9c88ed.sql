
-- Seed regiões
INSERT INTO public.regioes (nome, descricao) VALUES
  ('Zona Central', 'Centro da cidade'),
  ('Zona Norte', 'Região norte'),
  ('Zona Sul', 'Região sul'),
  ('Zona Leste', 'Região leste'),
  ('Zona Oeste', 'Região oeste');

-- Seed categorias
INSERT INTO public.categorias (nome, slug, icone, ordem) VALUES
  ('Avisos Gerais', 'avisos', 'Megaphone', 1),
  ('Vagas de Emprego', 'vagas', 'Briefcase', 2),
  ('Emergenciais', 'emergenciais', 'AlertTriangle', 3),
  ('Perdidos e Achados', 'perdidos', 'Search', 4),
  ('Eletrônicos', 'eletronicos', 'Smartphone', 5),
  ('Serviços', 'servicos', 'Wrench', 6),
  ('Móveis', 'moveis', 'Sofa', 7),
  ('Doações', 'doacoes', 'Heart', 8);

-- Seed bairros (need regiao ids)
INSERT INTO public.bairros (regiao_id, nome)
SELECT r.id, b.nome FROM public.regioes r, (VALUES
  ('Zona Central', 'Bairro Central'),
  ('Zona Central', 'Centro Histórico'),
  ('Zona Norte', 'Vila Norte'),
  ('Zona Norte', 'Jardim Esperança'),
  ('Zona Sul', 'Parque Sul')
) AS b(regiao_nome, nome)
WHERE r.nome = b.regiao_nome;

-- Seed subcategorias
INSERT INTO public.subcategorias (categoria_id, nome, slug, ordem)
SELECT c.id, s.nome, s.slug, s.ordem FROM public.categorias c, (VALUES
  ('Eletrônicos', 'Celulares', 'celulares', 1),
  ('Eletrônicos', 'Computadores', 'computadores', 2),
  ('Eletrônicos', 'Acessórios', 'acessorios', 3),
  ('Vagas de Emprego', 'CLT', 'clt', 1),
  ('Vagas de Emprego', 'Freelancer', 'freelancer', 2),
  ('Serviços', 'Elétrica', 'eletrica', 1),
  ('Serviços', 'Encanamento', 'encanamento', 2)
) AS s(cat_nome, nome, slug, ordem)
WHERE c.nome = s.cat_nome;
