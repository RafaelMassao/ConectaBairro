import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AnnouncementCard from '@/components/AnnouncementCard';
import { supabase } from '@/integrations/supabase/client';
import { categorias, subcategorias } from '@/data/mockData';
import * as LucideIcons from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Megaphone: LucideIcons.Megaphone,
  Briefcase: LucideIcons.Briefcase,
  AlertTriangle: LucideIcons.AlertTriangle,
  Search: LucideIcons.Search,
  Smartphone: LucideIcons.Smartphone,
  Wrench: LucideIcons.Wrench,
  Sofa: LucideIcons.Sofa,
  Heart: LucideIcons.Heart,
};

const CategoriesPage = () => {
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    supabase
      .from('anuncios')
      .select('*, fotos(url, ordem)')
      .eq('status', 'ativo')
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setAnuncios(data.map((a) => ({
            ...a,
            fotos: (a.fotos || []).sort((x: any, y: any) => x.ordem - y.ordem).map((f: any) => f.url),
          })));
        }
      });
  }, []);

  const filteredCats = categorias.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  const catSubcats = subcategorias.filter((s) => s.categoria_id === selectedCat);

  const catAnuncios = useMemo(() => {
    let ads = anuncios.filter((a) => a.status === 'ativo');
    if (selectedCat) ads = ads.filter((a) => a.categoria_id === selectedCat);
    if (selectedSubcat) ads = ads.filter((a) => a.subcategoria_id === selectedSubcat);
    if (sortBy === 'price-low') ads.sort((a, b) => (a.preco || 0) - (b.preco || 0));
    if (sortBy === 'price-high') ads.sort((a, b) => (b.preco || 0) - (a.preco || 0));
    if (sortBy === 'popular') ads.sort((a, b) => b.visualizacoes - a.visualizacoes);
    return ads;
  }, [anuncios, selectedCat, selectedSubcat, sortBy]);

  const countForCat = (catId: string) => anuncios.filter((a) => a.categoria_id === catId && a.status === 'ativo').length;

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4 space-y-4">
        <h1 className="font-display text-xl font-bold">Explorar Categorias</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar categorias..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recentes</SelectItem>
              <SelectItem value="price-low">Preço: Menor</SelectItem>
              <SelectItem value="price-high">Preço: Maior</SelectItem>
              <SelectItem value="popular">Populares</SelectItem>
            </SelectContent>
          </Select>
          {selectedCat && (
            <button onClick={() => { setSelectedCat(null); setSelectedSubcat(null); }} className="text-xs text-primary hover:underline">
              Limpar filtro
            </button>
          )}
        </div>

        {/* Category list */}
        <div className="space-y-2">
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categorias</h2>
          {filteredCats.map((cat) => {
            const Icon = iconMap[cat.icone] || LucideIcons.Tag;
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCat(isSelected ? null : cat.id); setSelectedSubcat(null); }}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 ${
                  isSelected ? 'border-primary bg-accent' : 'bg-card hover:shadow-sm'
                }`}
              >
                <Icon className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{cat.nome}</p>
                  <p className="text-xs text-muted-foreground">{countForCat(cat.id)} anúncios</p>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Subcategory chips */}
        {catSubcats.length > 0 && (
          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Subcategorias</h3>
            <div className="flex flex-wrap gap-2">
              {catSubcats.map((sub) => (
                <Badge
                  key={sub.id}
                  variant={selectedSubcat === sub.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedSubcat(selectedSubcat === sub.id ? null : sub.id)}
                >
                  {sub.nome}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filtered announcements */}
        {selectedCat && (
          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {catAnuncios.length} anúncio(s)
            </h3>
            {catAnuncios.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-lg border bg-card p-6 text-center">Nenhum anúncio nesta categoria.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catAnuncios.map((a) => (
                  <AnnouncementCard key={a.id} anuncio={a} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
