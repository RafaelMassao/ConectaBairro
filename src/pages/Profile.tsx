import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Star, Settings, LogOut, Edit, Pause, Play, Trash2, Eye } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';

import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, profile, logout, favoritos, setProfile, isAdmin } = useStore();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [regioes, setRegioes] = useState<{ id: string; nome: string }[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [favAds, setFavAds] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('active');

  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [regiaoId, setRegiaoId] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAds = myAds.filter((a) => a.status === 'ativo');
  const pausedAds = myAds.filter((a) => a.status === 'pausado');

  const refreshAds = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('anuncios')
      .select('*, fotos(url, ordem)')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false });
    if (data) {
      setMyAds(data.map((a) => ({
        ...a,
        fotos: (a.fotos || []).sort((x: any, y: any) => x.ordem - y.ordem).map((f: any) => f.url),
      })));
    }
  };

  const handleTogglePause = async (adId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'pausado' : 'ativo';
    const { error } = await supabase
      .from('anuncios')
      .update({ status: newStatus })
      .eq('id', adId);
    if (error) {
      toast.error('Erro ao alterar status: ' + error.message);
    } else {
      toast.success(newStatus === 'pausado' ? 'Anúncio pausado' : 'Anúncio reativado');
      refreshAds();
    }
  };

  const handleDeleteAd = async (adId: string) => {
    const { data: fotos } = await supabase.from('fotos').select('id, url').eq('anuncio_id', adId);
    if (fotos) {
      for (const foto of fotos) {
        const path = foto.url.split('/storage/v1/object/public/anuncios/')[1];
        if (path) await supabase.storage.from('anuncios').remove([path]);
      }
      await supabase.from('fotos').delete().eq('anuncio_id', adId);
    }
    const { error } = await supabase.from('anuncios').delete().eq('id', adId);
    if (error) {
      toast.error('Erro ao excluir: ' + error.message);
    } else {
      toast.success('Anúncio excluído');
      refreshAds();
    }
  };

  useEffect(() => {
    if (!user) return;

    supabase
      .from('regioes')
      .select('id, nome')
      .eq('ativa', true)
      .order('nome')
      .then(({ data }) => {
        if (data) setRegioes(data);
      });

    supabase
      .from('anuncios')
      .select('*, fotos(url, ordem)')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const ads = data.map((a) => ({
            ...a,
            fotos: (a.fotos || []).sort((x: any, y: any) => x.ordem - y.ordem).map((f: any) => f.url),
          }));
          setMyAds(ads);
        }
      });

    if (favoritos.length > 0) {
      supabase
        .from('anuncios')
        .select('*, fotos(url, ordem)')
        .in('id', favoritos)
        .then(({ data }) => {
          if (data) {
            const ads = data.map((a) => ({
              ...a,
              fotos: (a.fotos || []).sort((x: any, y: any) => x.ordem - y.ordem).map((f: any) => f.url),
            }));
            setFavAds(ads);
          }
        });
    } else {
      setFavAds([]);
    }

    supabase
      .from('avaliacoes')
      .select('*, usuario:profiles!avaliacoes_usuario_id_fkey(nome, avatar_url)')
      .eq('anunciante_id', user.id)
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        if (data) setAvaliacoes(data);
      });
  }, [user, favoritos]);

  useEffect(() => {
    if (!profile) return;

    setNome(profile.nome || '');
    setWhatsapp(profile.whatsapp || '');
    setBio(profile.bio || '');
    setRegiaoId(profile.regiao_id || '');
    setAvatarPreview(profile.avatar_url || null);
  }, [profile, editOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/auth');
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A foto deve ter no máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setAvatarPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.error('Sessão inválida. Faça login novamente.');
      return;
    }

    if (!nome.trim()) {
      toast.error('Informe seu nome');
      return;
    }

    if (!whatsapp.trim()) {
      toast.error('Informe seu WhatsApp');
      return;
    }

    setSavingProfile(true);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        bio: bio.trim() || null,
        regiao_id: regiaoId || null,
        avatar_url: avatarPreview,
      })
      .eq('id', user.id)
      .select()
      .single();

    setSavingProfile(false);

    if (error) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
      return;
    }

    setProfile(data);
    toast.success('Perfil atualizado com sucesso!');
    setEditOpen(false);
  };

  const initials =
    profile?.nome
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US';

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Meu Perfil</h1>
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Profile card */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground font-display overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`Foto de perfil de ${profile?.nome || 'usuário'}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold">{profile?.nome}</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                <span>{profile?.rating}</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="hover:text-primary hover:underline transition-colors"
                >
                  ({profile?.total_avaliacoes} avaliações)
                </button>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditOpen(true)}>
              <Edit className="h-3.5 w-3.5" /> Editar
            </Button>
          </div>
        </div>

        {/* Stats - clickable */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Anúncios', sublabel: 'Totais', value: myAds.length, tab: 'active' },
            { label: 'Ativos', sublabel: 'Agora', value: activeAds.length, tab: 'active' },
            { label: 'Avaliações', sublabel: '', value: profile?.total_avaliacoes || 0, tab: 'reviews' },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => setActiveTab(stat.tab)}
              className="rounded-lg border bg-card p-3 text-center hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {stat.sublabel && <p className="text-[10px] text-muted-foreground">{stat.sublabel}</p>}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Ativos ({activeAds.length})</TabsTrigger>
            <TabsTrigger value="paused">Pausados ({pausedAds.length})</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos ({favAds.length})</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>

          {/* Reusable ad list for active and paused */}
          {['active', 'paused'].map((tab) => {
            const ads = tab === 'active' ? activeAds : pausedAds;
            const emptyMsg = tab === 'active' ? 'Nenhum anúncio ativo.' : 'Nenhum anúncio pausado.';
            return (
              <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
                {ads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">{emptyMsg}</p>
                ) : (
                  ads.map((ad) => (
                    <div key={ad.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                      <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                        {ad.fotos[0] && <img src={ad.fotos[0]} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/announcements/${ad.id}`} className="text-sm font-medium hover:text-primary line-clamp-1">
                          {ad.titulo}
                        </Link>
                        {ad.gratuito ? (
                          <p className="text-xs font-bold text-green-600">Doação / Voluntário</p>
                        ) : ad.preco != null ? (
                          <p className="text-xs font-bold text-primary">R$ {ad.preco.toLocaleString('pt-BR')}</p>
                        ) : null}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Eye className="h-3 w-3" /> {ad.visualizacoes}
                          {ad.status === 'pausado' && (
                            <span className="ml-1 text-amber-500 font-medium">• Pausado</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/edit-announcement/${ad.id}`)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTogglePause(ad.id, ad.status)}
                        >
                          {ad.status === 'ativo' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-green-600" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir anúncio</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir "{ad.titulo}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAd(ad.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            );
          })}

          <TabsContent value="favorites" className="mt-4 space-y-3">
            {favAds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum favorito salvo.</p>
            ) : (
              favAds.map((ad) => (
                <Link key={ad.id} to={`/announcements/${ad.id}`} className="flex items-center gap-3 rounded-lg border bg-card p-3 card-hover">
                  <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {ad.fotos[0] && <img src={ad.fotos[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{ad.titulo}</p>
                    {ad.gratuito ? (
                      <p className="text-xs font-bold text-green-600">Doação / Voluntário</p>
                    ) : ad.preco != null ? (
                      <p className="text-xs font-bold text-primary">R$ {ad.preco.toLocaleString('pt-BR')}</p>
                    ) : null}
                  </div>
                </Link>
              ))
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-3">
            {avaliacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma avaliação recebida ainda.</p>
            ) : (
              avaliacoes.map((av) => (
                <div key={av.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground overflow-hidden">
                      {av.usuario?.avatar_url ? (
                        <img src={av.usuario.avatar_url} alt={av.usuario.nome} className="h-full w-full object-cover" />
                      ) : (
                        av.usuario?.nome?.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{av.usuario?.nome}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= av.rating ? 'fill-secondary text-secondary' : 'text-muted'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {av.comentario && <p className="text-sm text-muted-foreground">{av.comentario}</p>}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar perfil</DialogTitle>
              <DialogDescription>Atualize seus dados pessoais e sua foto.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Pré-visualização da foto de perfil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-display text-xl font-bold text-muted-foreground">{initials}</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome completo *</Label>
                <Input id="edit-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" value={profile?.email || ''} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-whatsapp">WhatsApp *</Label>
                <Input
                  id="edit-whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-regiao">Região</Label>
                <Select value={regiaoId} onValueChange={setRegiaoId}>
                  <SelectTrigger id="edit-regiao">
                    <SelectValue placeholder="Selecione sua região" />
                  </SelectTrigger>
                  <SelectContent>
                    {regioes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bio">Sobre você</Label>
                <Textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Admin panel link */}
        {isAdmin && (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate('/admin')}
          >
            <Settings className="h-4 w-4" /> Painel de Administração
          </Button>
        )}

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> Sair da conta
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
