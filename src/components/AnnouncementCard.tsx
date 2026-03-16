import { Link } from 'react-router-dom';
import { MapPin, Eye, AlertTriangle, Heart, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import type { Anuncio } from '@/types';

interface AnnouncementCardProps {
  anuncio: Anuncio;
}

const AnnouncementCard = ({ anuncio }: AnnouncementCardProps) => {
  const { favoritos, toggleFavorito } = useStore();
  const isFav = favoritos.includes(anuncio.id);

  return (
    <Link
      to={`/announcements/${anuncio.id}`}
      className="group block rounded-lg border bg-card overflow-hidden card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {anuncio.fotos[0] ? (
          <img
            src={anuncio.fotos[0]}
            alt={anuncio.titulo}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sem foto
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {anuncio.urgente && (
            <Badge className="bg-secondary text-secondary-foreground gap-1">
              <AlertTriangle className="h-3 w-3" />
              Urgente
            </Badge>
          )}
          {anuncio.gratuito && (
            <Badge className="bg-green-600 text-white gap-1">
              <Gift className="h-3 w-3" />
              Grátis
            </Badge>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorito(anuncio.id);
          }}
          className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-colors ${
            isFav ? 'text-secondary' : 'text-muted-foreground'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-display text-sm font-semibold leading-tight line-clamp-2 text-foreground">
          {anuncio.titulo}
        </h3>
        {anuncio.gratuito ? (
          <p className="mt-1 font-display text-base font-bold text-green-600">
            Doação / Voluntário
          </p>
        ) : anuncio.preco != null ? (
          <p className="mt-1 font-display text-base font-bold text-primary">
            R$ {anuncio.preco.toLocaleString('pt-BR')}
          </p>
        ) : null}
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{anuncio.localizacao_texto}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{anuncio.usuario?.nome}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {anuncio.visualizacoes}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AnnouncementCard;
