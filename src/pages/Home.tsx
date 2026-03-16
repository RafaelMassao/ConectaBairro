import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Megaphone, Briefcase, AlertTriangle, SearchIcon, Plus, LayoutGrid, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AnnouncementCard from '@/components/AnnouncementCard';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';

interface AnuncioFromDB {
  id: string;
  titulo: string;
  descricao: string;
  preco: number | null;
  urgente: boolean;
  gratuito: boolean;
  status: string;
  categoria_id: string;
  subcategoria_id: string | null;
  regiao_id: string;
  bairro_id: string | null;
  localizacao_texto: string;
  usuario_id: string;
  visualizacoes: number;
  criado_em: string;
  fotos: { url: string; ordem: number }[];
  profiles: { id: string; nome: string; avatar_url: string | null; rating: number; total_avaliacoes: number; whatsapp: string } | null;
  categorias: { id: string; nome: string; slug: string; icone: string | null } | null;
}

const quickCategories = [
  { slug: '__all__', label: 'Geral', icon: LayoutGrid, color: 'bg-accent text-accent-foreground' },
  { slug: 'avisos', label: 'Avisos', icon: Megaphone, color: 'bg-accent text-accent-foreground' },
  { slug: 'vagas', label: 'Vagas', icon: Briefcase, color: 'bg-accent text-accent-foreground' },
  { slug: 'emergenciais', label: 'Emergenciais', icon: AlertTriangle, color: 'bg-secondary/10 text-secondary' },
  { slug: 'perdidos', label: 'Perdidos', icon: SearchIcon, color: 'bg-accent text-accent-foreground' },
];

const URGENT_FILTER = '__urgent__';

const HomePage = () => {
  const {
    regiaoSelecionada, setRegiao, searchQuery, setSearchQuery,
    categoriaFiltro, setCategoriaFiltro, clearFilters,
    filterGratuito, setFilterGratuito, filterRegiao, setFilterRegiao,
    filterCategoria, setFilterCategoria,
  } = useStore();
  const [anuncios, setAnuncios] = useState<AnuncioFromDB[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nome: string; slug: string }[]>([]);
  const [regioes, setRegioes] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);

  const activeFiltersCount = [filterGratuito, filterRegiao, filterCategoria].filter(Boolean).length;

  useEffect(() => {
    Promise.all([
      supabase.from('categorias').select('id, nome, slug').eq('ativa', true).order('ordem'),
      supabase.from('regioes').select('id, nome').eq('ativa', true),
    ]).then(([catRes, regRes]) => {
      if (catRes.data) setCategorias(catRes.data);
      if (regRes.data) setRegioes(regRes.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('anuncios')
      .select('*, fotos(url, ordem), profiles!anuncios_usuario_id_fkey(id, nome, avatar_url, rating, total_avaliacoes, whatsapp), categorias!anuncios_categoria_id_fkey(id, nome, slug, icone)')
      .eq('status', 'ativo')
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        setAnuncios((data as AnuncioFromDB[] | null) || []);
        setLoading(false);
      });
  }, []);

  const filteredAnuncios = useMemo(() => {
    return anuncios.filter((a) => {
      if (categoriaFiltro === URGENT_FILTER && !a.urgente) return false;

      if (categoriaFiltro && categoriaFiltro !== '__all__' && categoriaFiltro !== URGENT_FILTER) {
        const cat = categorias.find(c => c.id === categoriaFiltro);
        if (cat && a.categorias?.slug !== cat.slug && a.categoria_id !== categoriaFiltro) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.titulo.toLowerCase().includes(q) && !a.descricao.toLowerCase().includes(q)) return false;
      }
      if (filterGratuito && !a.gratuito) return false;
      if (filterRegiao && a.regiao_id !== filterRegiao) return false;
      if (filterCategoria && a.categoria_id !== filterCategoria) return false;
      return true;
    });
  }, [anuncios, categoriaFiltro, searchQuery, categorias, filterGratuito, filterRegiao, filterCategoria]);

  const clearAdvancedFilters = () => {
    setFilterGratuito(false);
    setFilterRegiao('');
    setFilterCategoria('');
    setMobileFiltersOpen(false);
    setDesktopFiltersOpen(false);
  };

  const toCardAnuncio = (a: AnuncioFromDB) => ({
    id: a.id,
    usuario_id: a.usuario_id,
    categoria_id: a.categoria_id,
    subcategoria_id: a.subcategoria_id || undefined,
    titulo: a.titulo,
    descricao: a.descricao,
    preco: a.gratuito ? undefined : (a.preco ?? undefined),
    gratuito: a.gratuito,
    regiao_id: a.regiao_id,
    bairro_id: a.bairro_id || undefined,
    localizacao_texto: a.localizacao_texto,
    status: a.status as 'ativo',
    visualizacoes: a.visualizacoes,
    urgente: a.urgente,
    criado_em: a.criado_em,
    fotos: a.fotos?.sort((x, y) => x.ordem - y.ordem).map(f => f.url) || [],
    usuario: a.profiles ? {
      id: a.profiles.id,
      nome: a.profiles.nome,
      email: '',
      whatsapp: a.profiles.whatsapp,
      regiao_id: a.regiao_id,
      rating: a.profiles.rating,
      total_avaliacoes: a.profiles.total_avaliacoes,
      avatar_url: a.profiles.avatar_url || undefined,
    } : undefined,
    categoria: a.categorias ? {
      id: a.categorias.id,
      nome: a.categorias.nome,
      slug: a.categorias.slug,
      icone: a.categorias.icone || undefined,
      ordem: 0,
    } : undefined,
  });

  return (
    <div className="pb-20 md:pb-8">
      <div className="page-container py-4 space-y-4 animate-fade-in">
        {/* Mobile region + search */}
        <div className="md:hidden space-y-3">
          <Select value={regiaoSelecionada} onValueChange={setRegiao}>
            <SelectTrigger className="w-full h-10">
              <MapPin className="h-4 w-4 mr-1 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regioes.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar anúncios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Popover
              open={mobileFiltersOpen}
              onOpenChange={(open) => {
                setMobileFiltersOpen(open);
                if (open) setDesktopFiltersOpen(false);
              }}
              modal
            >
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end" onInteractOutside={(e) => { const target = e.target as HTMLElement; if (target?.closest('[role="listbox"]') || target?.closest('[data-radix-select-viewport]') || target?.closest('[role="option"]')) { e.preventDefault(); } }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-semibold">Filtros</h4>
                    {activeFiltersCount > 0 && (
                      <button onClick={clearAdvancedFilters} className="text-xs text-primary hover:underline">Limpar</button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="filter-gratuito" checked={filterGratuito} onCheckedChange={(v) => setFilterGratuito(!!v)} />
                    <Label htmlFor="filter-gratuito" className="text-sm">Apenas gratuitos / doações</Label>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Região</Label>
                    <Select value={filterRegiao} onValueChange={setFilterRegiao}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Todas as regiões" /></SelectTrigger>
                      <SelectContent>
                        {regioes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Categoria</Label>
                    <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Desktop search with filters */}
        <div className="hidden md:flex gap-2">
          <Popover
            open={desktopFiltersOpen}
            onOpenChange={(open) => {
              setDesktopFiltersOpen(open);
              if (open) setMobileFiltersOpen(false);
            }}
            modal
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 relative">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">{activeFiltersCount}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start" onInteractOutside={(e) => { const target = e.target as HTMLElement; if (target?.closest('[role="listbox"]') || target?.closest('[data-radix-select-viewport]') || target?.closest('[role="option"]')) { e.preventDefault(); } }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-semibold">Filtros Avançados</h4>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearAdvancedFilters} className="text-xs text-primary hover:underline">Limpar</button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="filter-gratuito-d" checked={filterGratuito} onCheckedChange={(v) => setFilterGratuito(!!v)} />
                  <Label htmlFor="filter-gratuito-d" className="text-sm">Apenas gratuitos / doações</Label>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Região</Label>
                  <Select value={filterRegiao} onValueChange={setFilterRegiao}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Todas as regiões" /></SelectTrigger>
                    <SelectContent>
                      {regioes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Categoria</Label>
                  <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAdvancedFilters} className="gap-1 text-xs">
              <X className="h-3 w-3" /> Limpar filtros
            </Button>
          )}
        </div>

        {/* Quick categories */}
        <div>
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Categorias</h2>
          <div className="grid grid-cols-5 gap-2">
            {quickCategories.map(({ slug, label, icon: Icon, color }) => {
              const isAll = slug === '__all__';
              const isUrgentCategory = slug === 'emergenciais';
              const cat = !isAll ? categorias.find(c => c.slug === slug) : null;
              const catId = isAll ? '__all__' : (isUrgentCategory ? URGENT_FILTER : (cat?.id || slug));
              return (
            <button
              key={slug}
              onClick={() => slug === '__all__' ? clearFilters() : setCategoriaFiltro(categoriaFiltro === catId ? null : catId)}
              className={`flex flex-col items-center gap-1.5 rounded-lg p-3 text-xs font-medium transition-all duration-200 ${
                (slug === '__all__' && !categoriaFiltro) || categoriaFiltro === catId
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : color + ' hover:shadow-sm'
              }`}
            >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Announcements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {categoriaFiltro === '__all__'
                ? 'Todos os Anúncios'
                : categoriaFiltro === URGENT_FILTER
                  ? 'Emergências'
                : categoriaFiltro
                  ? `${categorias.find((c) => c.id === categoriaFiltro)?.nome || 'Anúncios'}`
                  : 'Anúncios Recentes'}
            </h2>
            {categoriaFiltro && (
              <button onClick={() => setCategoriaFiltro(null)} className="text-xs text-primary hover:underline">
                Limpar filtro
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredAnuncios.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-muted-foreground">Nenhum anúncio encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAnuncios.map((a) => (
                <AnnouncementCard key={a.id} anuncio={toCardAnuncio(a)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB - mobile */}
      <Link to="/novo" className="btn-float md:hidden">
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
};

export default HomePage;
