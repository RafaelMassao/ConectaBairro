import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, MessageCircle, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

interface PublicProfile {
  id: string;
  nome: string;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  total_avaliacoes: number;
  criado_em: string;
  regioes: { nome: string } | null;
}

interface UserAnuncio {
  id: string;
  titulo: string;
  preco: number | null;
  localizacao_texto: string;
  visualizacoes: number;
  criado_em: string;
  fotos: { url: string; ordem: number }[];
}

interface Avaliacao {
  id: string;
  rating: number;
  comentario: string | null;
  criado_em: string;
  profiles: { id: string; nome: string; avatar_url: string | null } | null;
}

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user, isAdmin } = useStore();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [anuncios, setAnuncios] = useState<UserAnuncio[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Review form
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    Promise.all([
      supabase
        .from('profiles')
        .select('id, nome, avatar_url, bio, rating, total_avaliacoes, criado_em, regioes!profiles_regiao_id_fkey(nome)')
        .eq('id', userId)
        .single(),
      supabase
        .from('anuncios')
        .select('id, titulo, preco, localizacao_texto, visualizacoes, criado_em, fotos(url, ordem)')
        .eq('usuario_id', userId)
        .eq('status', 'ativo')
        .order('criado_em', { ascending: false }),
      supabase
        .from('avaliacoes')
        .select('id, rating, comentario, criado_em, profiles!avaliacoes_usuario_id_fkey(id, nome, avatar_url)')
        .eq('anunciante_id', userId)
        .order('criado_em', { ascending: false }),
    ]).then(([profileRes, anunciosRes, avaliacoesRes]) => {
      setProfile(profileRes.data as PublicProfile | null);
      setAnuncios((anunciosRes.data as UserAnuncio[] | null) || []);
      setAvaliacoes((avaliacoesRes.data as Avaliacao[] | null) || []);
      setLoading(false);
    });
  }, [userId]);

  const handleSubmitReview = async () => {
    if (!user || !userId) return;
    if (isOwnProfile) {
      toast.error('Você não pode avaliar a si mesmo');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('avaliacoes').insert({
      usuario_id: user.id,
      anunciante_id: userId,
      rating: reviewRating,
      comentario: reviewComment.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      toast.error('Erro ao enviar avaliação: ' + error.message);
      return;
    }

    toast.success('Avaliação enviada com sucesso!');
    setReviewOpen(false);
    setReviewComment('');
    setReviewRating(5);

    // Refresh reviews and profile
    const [avalRes, profRes] = await Promise.all([
      supabase
        .from('avaliacoes')
        .select('id, rating, comentario, criado_em, profiles!avaliacoes_usuario_id_fkey(id, nome, avatar_url)')
        .eq('anunciante_id', userId)
        .order('criado_em', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, nome, avatar_url, bio, rating, total_avaliacoes, criado_em, regioes!profiles_regiao_id_fkey(nome)')
        .eq('id', userId)
        .single(),
    ]);
    if (avalRes.data) setAvaliacoes(avalRes.data as Avaliacao[]);
    if (profRes.data) setProfile(profRes.data as PublicProfile);
  };

  const handleDeleteReview = async (reviewId: string) => {
    const { error } = await supabase.from('avaliacoes').delete().eq('id', reviewId);
    if (error) {
      toast.error('Erro ao excluir avaliação: ' + error.message);
      return;
    }
    toast.success('Avaliação excluída');
    // Refresh reviews and profile
    const [avalRes, profRes] = await Promise.all([
      supabase
        .from('avaliacoes')
        .select('id, rating, comentario, criado_em, profiles!avaliacoes_usuario_id_fkey(id, nome, avatar_url)')
        .eq('anunciante_id', userId!)
        .order('criado_em', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, nome, avatar_url, bio, rating, total_avaliacoes, criado_em, regioes!profiles_regiao_id_fkey(nome)')
        .eq('id', userId!)
        .single(),
    ]);
    if (avalRes.data) setAvaliacoes(avalRes.data as Avaliacao[]);
    if (profRes.data) setProfile(profRes.data as PublicProfile);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container py-12 text-center">
        <p className="text-muted-foreground">Usuário não encontrado.</p>
        <Link to="/home" className="mt-4 inline-block text-primary hover:underline">Voltar ao início</Link>
      </div>
    );
  }

  const initials = profile.nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = new Date(profile.criado_em).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4 space-y-5">
        {/* Back */}
        <Link to="/home" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        {/* Profile header */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.nome} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold text-foreground">{profile.nome}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="font-medium">{Number(profile.rating).toFixed(1)}</span>
                  <span className="text-muted-foreground">({profile.total_avaliacoes} avaliações)</span>
                </div>
              </div>
              {profile.regioes && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.regioes.nome}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Membro desde {memberSince}</p>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>
          )}

          {/* Actions */}
          {!isOwnProfile && (
            <div className="mt-4 flex gap-3">
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Star className="h-4 w-4" /> Avaliar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Avaliar {profile.nome}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Nota</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setReviewRating(n)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-7 w-7 ${n <= reviewRating ? 'fill-secondary text-secondary' : 'text-muted-foreground'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Comentário (opcional)</Label>
                      <Textarea
                        placeholder="Conte sua experiência..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleSubmitReview} disabled={submitting} className="w-full">
                      {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="font-display text-xl font-bold text-foreground">{anuncios.length}</p>
            <p className="text-xs text-muted-foreground">Anúncios Ativos</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="font-display text-xl font-bold text-foreground">{Number(profile.rating).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Nota Média</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="font-display text-xl font-bold text-foreground">{profile.total_avaliacoes}</p>
            <p className="text-xs text-muted-foreground">Avaliações</p>
          </div>
        </div>

        {/* Announcements */}
        <div>
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Anúncios de {profile.nome.split(' ')[0]}
          </h2>
          {anuncios.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">Nenhum anúncio ativo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {anuncios.map((a) => {
                const foto = a.fotos?.sort((x, y) => x.ordem - y.ordem)[0];
                return (
                  <Link key={a.id} to={`/announcements/${a.id}`} className="rounded-lg border bg-card overflow-hidden card-hover">
                    <div className="aspect-video overflow-hidden bg-muted">
                      {foto ? (
                        <img src={foto.url} alt={a.titulo} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem foto</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium line-clamp-1">{a.titulo}</h3>
                      {a.preco != null && (
                        <p className="text-sm font-bold text-primary">R$ {a.preco.toLocaleString('pt-BR')}</p>
                      )}
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.localizacao_texto}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.visualizacoes}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Avaliações ({avaliacoes.length})
          </h2>
          {avaliacoes.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {avaliacoes.map((av) => (
                <div key={av.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground overflow-hidden">
                      {av.profiles?.avatar_url ? (
                        <img src={av.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        av.profiles?.nome?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{av.profiles?.nome || 'Usuário'}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-3 w-3 ${n <= av.rating ? 'fill-secondary text-secondary' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(av.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir avaliação</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta avaliação de {av.profiles?.nome || 'usuário'}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReview(av.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  {av.comentario && <p className="text-sm text-foreground">{av.comentario}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
