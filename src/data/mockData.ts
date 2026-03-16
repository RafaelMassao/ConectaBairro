import type { Regiao, Bairro, Categoria, Subcategoria, Usuario, Anuncio, Avaliacao } from '@/types';

export const regioes: Regiao[] = [
  { id: '1', nome: 'Zona Central', descricao: 'Centro da cidade' },
  { id: '2', nome: 'Zona Norte', descricao: 'Região norte' },
  { id: '3', nome: 'Zona Sul', descricao: 'Região sul' },
  { id: '4', nome: 'Zona Leste', descricao: 'Região leste' },
  { id: '5', nome: 'Zona Oeste', descricao: 'Região oeste' },
];

export const bairros: Bairro[] = [
  { id: '1', regiao_id: '1', nome: 'Bairro Central' },
  { id: '2', regiao_id: '1', nome: 'Centro Histórico' },
  { id: '3', regiao_id: '2', nome: 'Vila Norte' },
  { id: '4', regiao_id: '2', nome: 'Jardim Esperança' },
  { id: '5', regiao_id: '3', nome: 'Parque Sul' },
];

export const categorias: Categoria[] = [
  { id: '1', nome: 'Avisos Gerais', slug: 'avisos', icone: 'Megaphone', ordem: 1 },
  { id: '2', nome: 'Vagas de Emprego', slug: 'vagas', icone: 'Briefcase', ordem: 2 },
  { id: '3', nome: 'Emergenciais', slug: 'emergenciais', icone: 'AlertTriangle', ordem: 3 },
  { id: '4', nome: 'Perdidos e Achados', slug: 'perdidos', icone: 'Search', ordem: 4 },
  { id: '5', nome: 'Eletrônicos', slug: 'eletronicos', icone: 'Smartphone', ordem: 5 },
  { id: '6', nome: 'Serviços', slug: 'servicos', icone: 'Wrench', ordem: 6 },
  { id: '7', nome: 'Móveis', slug: 'moveis', icone: 'Sofa', ordem: 7 },
  { id: '8', nome: 'Doações', slug: 'doacoes', icone: 'Heart', ordem: 8 },
];

export const subcategorias: Subcategoria[] = [
  { id: '1', categoria_id: '5', nome: 'Celulares', slug: 'celulares' },
  { id: '2', categoria_id: '5', nome: 'Computadores', slug: 'computadores' },
  { id: '3', categoria_id: '5', nome: 'Acessórios', slug: 'acessorios' },
  { id: '4', categoria_id: '2', nome: 'CLT', slug: 'clt' },
  { id: '5', categoria_id: '2', nome: 'Freelancer', slug: 'freelancer' },
  { id: '6', categoria_id: '6', nome: 'Elétrica', slug: 'eletrica' },
  { id: '7', categoria_id: '6', nome: 'Encanamento', slug: 'encanamento' },
];

export const currentUser: Usuario = {
  id: 'u1',
  email: 'joao@email.com',
  nome: 'João Silva',
  whatsapp: '11999887766',
  regiao_id: '1',
  avatar_url: undefined,
  bio: 'Morador do Bairro Central há 10 anos.',
  rating: 4.8,
  total_avaliacoes: 12,
};

const users: Usuario[] = [
  currentUser,
  { id: 'u2', email: 'maria@email.com', nome: 'Maria Santos', whatsapp: '11988776655', regiao_id: '1', rating: 4.5, total_avaliacoes: 8 },
  { id: 'u3', email: 'carlos@email.com', nome: 'Carlos Oliveira', whatsapp: '11977665544', regiao_id: '2', rating: 4.9, total_avaliacoes: 20 },
  { id: 'u4', email: 'ana@email.com', nome: 'Ana Pereira', whatsapp: '11966554433', regiao_id: '1', rating: 4.2, total_avaliacoes: 5 },
];

export const anuncios: Anuncio[] = [
  {
    id: 'a1', usuario_id: 'u1', categoria_id: '5', subcategoria_id: '1',
    titulo: 'iPhone 12 em perfeito estado',
    descricao: 'Vendo iPhone 12 em perfeito estado de conservação. Apenas 2 meses de uso. Acompanha carregador original e caixa. Bateria com 95% de saúde. Sem arranhões.',
    preco: 1500, regiao_id: '1', bairro_id: '1', localizacao_texto: 'Bairro Central',
    status: 'ativo', visualizacoes: 45, urgente: false, criado_em: '2026-03-10T14:00:00Z',
    fotos: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
    usuario: currentUser, categoria: categorias[4],
  },
  {
    id: 'a2', usuario_id: 'u2', categoria_id: '2', subcategoria_id: '4',
    titulo: 'Vaga de Atendente - Padaria Central',
    descricao: 'Padaria no centro busca atendente com experiência. Horário: 6h às 14h. Salário: R$ 1.800 + benefícios. Preferência para moradores da região.',
    preco: 1800, regiao_id: '1', bairro_id: '1', localizacao_texto: 'Bairro Central',
    status: 'ativo', visualizacoes: 120, urgente: true, criado_em: '2026-03-11T09:00:00Z',
    fotos: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400'],
    usuario: users[1], categoria: categorias[1],
  },
  {
    id: 'a3', usuario_id: 'u3', categoria_id: '3',
    titulo: '🚨 Cachorro perdido - Golden Retriever',
    descricao: 'Meu cachorro Max fugiu ontem à noite. É um Golden Retriever de 3 anos, castanho claro, com coleira azul. Por favor, se virem entrem em contato!',
    regiao_id: '2', bairro_id: '3', localizacao_texto: 'Vila Norte',
    status: 'ativo', visualizacoes: 230, urgente: true, criado_em: '2026-03-12T06:00:00Z',
    fotos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
    usuario: users[2], categoria: categorias[2],
  },
  {
    id: 'a4', usuario_id: 'u4', categoria_id: '6', subcategoria_id: '6',
    titulo: 'Eletricista disponível - Serviço rápido',
    descricao: 'Faço serviços elétricos em geral: instalação de tomadas, chuveiros, lustres, quadro de disjuntores. Atendimento rápido e preço justo.',
    regiao_id: '1', bairro_id: '2', localizacao_texto: 'Centro Histórico',
    status: 'ativo', visualizacoes: 67, urgente: false, criado_em: '2026-03-09T11:00:00Z',
    fotos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400'],
    usuario: users[3], categoria: categorias[5],
  },
  {
    id: 'a5', usuario_id: 'u2', categoria_id: '8',
    titulo: 'Doação de roupas infantis',
    descricao: 'Doando roupas infantis em bom estado, tamanhos de 2 a 6 anos. Temos camisetas, shorts, vestidos e casacos. Retirar no local.',
    regiao_id: '1', bairro_id: '1', localizacao_texto: 'Bairro Central',
    status: 'ativo', visualizacoes: 89, urgente: false, criado_em: '2026-03-08T16:00:00Z',
    fotos: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400'],
    usuario: users[1], categoria: categorias[7],
  },
  {
    id: 'a6', usuario_id: 'u3', categoria_id: '7',
    titulo: 'Sofá 3 lugares - Seminovo',
    descricao: 'Sofá de 3 lugares cor cinza, tecido suede. Em ótimo estado, sem manchas. Motivo da venda: mudança. Buscar no local.',
    preco: 450, regiao_id: '2', bairro_id: '3', localizacao_texto: 'Vila Norte',
    status: 'ativo', visualizacoes: 34, urgente: false, criado_em: '2026-03-07T13:00:00Z',
    fotos: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
    usuario: users[2], categoria: categorias[6],
  },
  {
    id: 'a7', usuario_id: 'u1', categoria_id: '1',
    titulo: 'Reunião de moradores - Sábado',
    descricao: 'Convocamos todos os moradores para reunião sobre segurança do bairro. Sábado, 15h, no salão comunitário. Presença importante!',
    regiao_id: '1', bairro_id: '1', localizacao_texto: 'Bairro Central',
    status: 'ativo', visualizacoes: 156, urgente: true, criado_em: '2026-03-11T18:00:00Z',
    fotos: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400'],
    usuario: currentUser, categoria: categorias[0],
  },
  {
    id: 'a8', usuario_id: 'u4', categoria_id: '5', subcategoria_id: '2',
    titulo: 'Notebook Dell i5 - Bom estado',
    descricao: 'Notebook Dell Inspiron, processador i5, 8GB RAM, SSD 256GB. Ideal para estudo e trabalho. Bateria dura 4h.',
    preco: 1200, regiao_id: '1', bairro_id: '2', localizacao_texto: 'Centro Histórico',
    status: 'ativo', visualizacoes: 52, urgente: false, criado_em: '2026-03-10T10:00:00Z',
    fotos: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'],
    usuario: users[3], categoria: categorias[4],
  },
];

export const avaliacoes: Avaliacao[] = [
  { id: 'av1', usuario_id: 'u2', anunciante_id: 'u1', rating: 5, comentario: 'Excelente vendedor, produto como descrito!', criado_em: '2026-03-01T10:00:00Z', usuario: users[1] },
  { id: 'av2', usuario_id: 'u3', anunciante_id: 'u1', rating: 4, comentario: 'Bom atendimento, recomendo.', criado_em: '2026-02-20T15:00:00Z', usuario: users[2] },
  { id: 'av3', usuario_id: 'u4', anunciante_id: 'u1', rating: 5, comentario: 'Pessoa de confiança, entrega rápida.', criado_em: '2026-02-15T12:00:00Z', usuario: users[3] },
];
