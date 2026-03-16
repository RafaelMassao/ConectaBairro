ALTER TABLE public.anuncios
  ADD COLUMN condicao character varying NULL,
  ADD COLUMN salario character varying NULL,
  ADD COLUMN tipo_vaga character varying NULL,
  ADD COLUMN recompensa character varying NULL,
  ADD COLUMN ultima_vez_visto character varying NULL,
  ADD COLUMN data_evento timestamp with time zone NULL;