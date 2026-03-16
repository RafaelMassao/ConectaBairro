export interface Regiao {
  id: string;
  nome: string;
  descricao?: string;
}

export interface Bairro {
  id: string;
  regiao_id: string;
  nome: string;
}

export interface Categoria {
  id: string;
  nome: string;
  slug: string;
  icone: string;
  ordem: number;
}

export interface Subcategoria {
  id: string;
  categoria_id: string;
  nome: string;
  slug: string;
}

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  whatsapp: string;
  regiao_id: string;
  avatar_url?: string;
  bio?: string;
  rating: number;
  total_avaliacoes: number;
}

export interface Anuncio {
  id: string;
  usuario_id: string;
  categoria_id: string;
  subcategoria_id?: string;
  titulo: string;
  descricao: string;
  preco?: number;
  gratuito?: boolean;
  regiao_id: string;
  bairro_id?: string;
  localizacao_texto: string;
  status: 'ativo' | 'pausado' | 'expirado' | 'removido';
  visualizacoes: number;
  urgente: boolean;
  criado_em: string;
  fotos: string[];
  usuario?: Usuario;
  categoria?: Categoria;
}

export interface Favorito {
  id: string;
  usuario_id: string;
  anuncio_id: string;
}

export interface Avaliacao {
  id: string;
  usuario_id: string;
  anunciante_id: string;
  rating: number;
  comentario?: string;
  criado_em: string;
  usuario?: Usuario;
}

export interface Denuncia {
  id: string;
  usuario_id: string;
  anuncio_id: string;
  motivo: string;
  descricao?: string;
  status: 'pendente' | 'revisado' | 'resolvido';
}
