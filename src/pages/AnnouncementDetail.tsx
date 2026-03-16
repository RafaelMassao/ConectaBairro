import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Eye, Clock, Heart, Share2, Flag, Star, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AnuncioDetail {
  id: string;
  titulo: string;
  descricao: string;
  preco: number | null;
  urgente: boolean;
  gratuito: boolean;
  status: string;
  categoria_id: string;
  regiao_id: string;
  localizacao_texto: string;
  usuario_id: string;
  visualizacoes: number;
  criado_em: string;
  fotos: { url: string; ordem: number }[];
  profiles: { id: string; nome: string; avatar_url: string | null; rating: number; total_avaliacoes: number; whatsapp: string } | null;
  categorias: { id: string; nome: string; slug: string } | null;
}

const AnnouncementDetailPage = () => {
  const { id } = useParams();
  const { favoritos, toggleFavorito } = useStore();
  const [anuncio, setAnuncio] = useState<AnuncioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [relatedAds, setRelatedAds] = useState<AnuncioDetail[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('anuncios')
      .select('*, fotos(url, ordem), profiles!anuncios_usuario_id_fkey(id, nome, avatar_url, rating, total_avaliacoes, whatsapp), categorias!anuncios_categoria_id_fkey(id, nome, slug)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setAnuncio(data as AnuncioDetail | null);
        setLoading(false);

        supabase.rpc('increment_visualizacoes', { anuncio_uuid: id });

        if (data) {
          supabase
            .from('anuncios')
            .select('*, fotos(url, ordem), profiles!anuncios_usuario_id_fkey(id, nome, avatar_url, rating, total_avaliacoes, whatsapp), categorias!anuncios_categoria_id_fkey(id, nome, slug)')
            .eq('status', 'ativo')
            .eq('categoria_id', data.categoria_id)
            .neq('id', id)
            .limit(3)
            .then(({ data: related }) => {
              setRelatedAds((related as AnuncioDetail[] | null) || []);
            });
        }
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="page-container py-12 text-center">
        <p className="text-muted-foreground">Anúncio não encontrado.</p>
        <Link to="/home" className="mt-4 inline-block text-primary hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  const fotos = anuncio.fotos?.sort((a, b) => a.ordem - b.ordem).map(f => f.url) || [];
  const isFav = favoritos.includes(anuncio.id);

  const timeAgo = () => {
    const diff = Date.now() - new Date(anuncio.criado_em).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Agora';
    if (hours < 24) return `Há ${hours}h`;
    return `Há ${Math.floor(hours / 24)} dias`;
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Olá! Vi seu anúncio "${anuncio.titulo}" no ConectaBairro e tenho interesse.`);
    const phone = anuncio.profiles?.whatsapp || '';
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container flex items-center gap-3 py-3">
        <Link to="/home" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>

      <div className="page-container space-y-5">
        {/* Photo gallery */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
          {fotos[photoIndex] ? (
            <img src={fotos[photoIndex]} alt={anuncio.titulo} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Sem foto</div>
          )}
          {fotos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIndex((i) => (i === 0 ? fotos.length - 1 : i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1.5 backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPhotoIndex((i) => (i === fotos.length - 1 ? 0 : i + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1.5 backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          {fotos.length > 0 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-card/80 px-2 py-0.5 text-xs backdrop-blur-sm">
              {photoIndex + 1}/{fotos.length}
            </div>
          )}
        </div>

        {/* Title & price */}
        <div>
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">{anuncio.titulo}</h1>
          {anuncio.gratuito ? (
            <div className="mt-1 flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              <p className="font-display text-2xl font-bold text-green-600">Doação / Voluntário</p>
            </div>
          ) : anuncio.preco != null ? (
            <p className="mt-1 font-display text-2xl font-bold text-primary">
              R$ {anuncio.preco.toLocaleString('pt-BR')}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {anuncio.categorias && <Badge variant="outline">{anuncio.categorias.nome}</Badge>}
            {anuncio.gratuito && <Badge className="bg-green-600 text-white gap-1"><Gift className="h-3 w-3" />Grátis</Badge>}
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo()}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{anuncio.visualizacoes} visualizações</span>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Localização</h3>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{anuncio.localizacao_texto}</span>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Descrição</h3>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{anuncio.descricao}</p>
        </div>

        {/* Advertiser card */}
        {anuncio.profiles && (
          <Link to={`/user/${anuncio.profiles.id}`} className="block rounded-lg border bg-card p-4 card-hover">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Anunciante</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground overflow-hidden">
                {anuncio.profiles.avatar_url ? (
                  <img src={anuncio.profiles.avatar_url} alt={anuncio.profiles.nome} className="h-full w-full object-cover" />
                ) : (
                  anuncio.profiles.nome.split(' ').map(n => n[0]).join('').slice(0, 2)
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{anuncio.profiles.nome}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-secondary text-secondary" />
                  <span>{anuncio.profiles.rating}</span>
                  <span>({anuncio.profiles.total_avaliacoes} avaliações)</span>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
            </div>
          </Link>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button className="flex-1 gap-2" onClick={handleWhatsApp}>
            <MessageCircle className="h-4 w-4" />
            Conversar no WhatsApp
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => { toggleFavorito(anuncio.id); toast.success(isFav ? 'Removido dos favoritos' : 'Adicionado aos favoritos'); }}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-secondary text-secondary' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copiado!');
          }}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => toast.info('Função de denúncia estará disponível em breve.')}>
            <Flag className="h-4 w-4" />
          </Button>
        </div>

        {/* Security tips */}
        <div className="rounded-lg border border-primary/20 bg-accent p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-primary">Dicas de Segurança</h3>
          </div>
          <ul className="space-y-1 text-xs text-accent-foreground">
            <li>• Sempre marque encontros em locais públicos</li>
            <li>• Verifique o produto antes de pagar</li>
            <li>• Desconfie de preços muito abaixo do mercado</li>
          </ul>
        </div>

        {/* Related */}
        {relatedAds.length > 0 && (
          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Anúncios Relacionados</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedAds.map((a) => {
                const aFotos = a.fotos?.sort((x, y) => x.ordem - y.ordem) || [];
                return (
                  <Link key={a.id} to={`/announcements/${a.id}`} className="rounded-lg border bg-card overflow-hidden card-hover">
                    <div className="aspect-video overflow-hidden bg-muted">
                      {aFotos[0] && <img src={aFotos[0].url} alt={a.titulo} className="h-full w-full object-cover" loading="lazy" />}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium line-clamp-1">{a.titulo}</h4>
                      {a.gratuito ? (
                        <p className="text-sm font-bold text-green-600">Doação / Voluntário</p>
                      ) : a.preco != null ? (
                        <p className="text-sm font-bold text-primary">R$ {a.preco.toLocaleString('pt-BR')}</p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementDetailPage;
