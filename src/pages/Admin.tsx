import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Trash2, Edit, Ban, CheckCircle, Eye, Users, Megaphone, Shield, Crown, ShieldCheck, Plus, MapPin, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  ativo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pausado: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  expirado: 'bg-muted text-muted-foreground',
  removido: 'bg-destructive/10 text-destructive',
  inativo: 'bg-muted text-muted-foreground',
  bloqueado: 'bg-destructive/10 text-destructive',
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  user: 'bg-muted text-muted-foreground',
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin } = useStore();

  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [regioes, setRegioes] = useState<any[]>([]);
  const [bairros, setBairros] = useState<any[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [searchAds, setSearchAds] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [loadingAds, setLoadingAds] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [editAd, setEditAd] = useState<any>(null);
  const [editCategoriaId, setEditCategoriaId] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // CRUD dialogs
  const [newRegiaoOpen, setNewRegiaoOpen] = useState(false);
  const [newRegiaoNome, setNewRegiaoNome] = useState('');
  const [newBairroOpen, setNewBairroOpen] = useState(false);
  const [newBairroNome, setNewBairroNome] = useState('');
  const [newBairroRegiaoId, setNewBairroRegiaoId] = useState('');
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatNome, setNewCatNome] = useState('');
  const [newSubcatOpen, setNewSubcatOpen] = useState(false);
  const [newSubcatNome, setNewSubcatNome] = useState('');
  const [newSubcatCatId, setNewSubcatCatId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/home');
      return;
    }
    fetchAnuncios();
    fetchUsuarios();
    fetchConfig();
    fetchAvaliacoes();
  }, [isAdmin]);

  const fetchConfig = async () => {
    const [catRes, subRes, regRes, baiRes] = await Promise.all([
      supabase.from('categorias').select('*').order('ordem'),
      supabase.from('subcategorias').select('*').order('ordem'),
      supabase.from('regioes').select('*').order('nome'),
      supabase.from('bairros').select('*').order('nome'),
    ]);
    if (catRes.data) setCategorias(catRes.data);
    if (subRes.data) setSubcategorias(subRes.data);
    if (regRes.data) setRegioes(regRes.data);
    if (baiRes.data) setBairros(baiRes.data);
  };

  const fetchAvaliacoes = async () => {
    const { data } = await supabase
      .from('avaliacoes')
      .select('*, usuario:profiles!avaliacoes_usuario_id_fkey(nome), anunciante:profiles!avaliacoes_anunciante_id_fkey(nome)')
      .order('criado_em', { ascending: false })
      .limit(100);
    if (data) setAvaliacoes(data);
  };

  const fetchAnuncios = async () => {
    setLoadingAds(true);
    const { data } = await supabase
      .from('anuncios')
      .select('*, profiles:usuario_id(nome, email), categorias:categoria_id(nome), fotos(url, ordem)')
      .order('criado_em', { ascending: false })
      .limit(200);
    if (data) setAnuncios(data);
    setLoadingAds(false);
  };

  const fetchUsuarios = async () => {
    setLoadingUsers(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(200);
    if (data) setUsuarios(data);

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');
    if (roles) {
      const map: Record<string, string[]> = {};
      roles.forEach((r: any) => {
        if (!map[r.user_id]) map[r.user_id] = [];
        map[r.user_id].push(r.role);
      });
      setUserRoles(map);
    }
    setLoadingUsers(false);
  };

  const handleDeleteAd = async (id: string) => {
    await supabase.from('fotos').delete().eq('anuncio_id', id);
    const { error } = await supabase.from('anuncios').delete().eq('id', id);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Anúncio excluído'); fetchAnuncios(); }
  };

  const handleUpdateAd = async () => {
    if (!editAd) return;
    const { error } = await supabase.from('anuncios').update({
      categoria_id: editCategoriaId,
      status: editStatus as any,
    }).eq('id', editAd.id);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Anúncio atualizado'); setEditAd(null); fetchAnuncios(); }
  };

  const handleBlockUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'bloqueado' ? 'ativo' : 'bloqueado';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success(newStatus === 'bloqueado' ? 'Usuário bloqueado' : 'Usuário desbloqueado'); fetchUsuarios(); }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' as any });
    if (error) {
      if (error.code === '23505') toast.info('Usuário já é admin');
      else toast.error('Erro: ' + error.message);
    } else {
      toast.success('Usuário promovido a Admin');
      fetchUsuarios();
    }
  };

  const handleDemoteAdmin = async (userId: string) => {
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin' as any);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Privilégio de admin removido'); fetchUsuarios(); }
  };

  const getUserHighestRole = (userId: string): string => {
    const roles = userRoles[userId] || [];
    if (roles.includes('super_admin')) return 'super_admin';
    if (roles.includes('admin')) return 'admin';
    return 'user';
  };

  // CRUD handlers
  const handleAddRegiao = async () => {
    if (!newRegiaoNome.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('regioes').insert({ nome: newRegiaoNome.trim() });
    setSaving(false);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Região criada'); setNewRegiaoOpen(false); setNewRegiaoNome(''); fetchConfig(); }
  };

  const handleDeleteRegiao = async (id: string) => {
    const { error } = await supabase.from('regioes').delete().eq('id', id);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Região removida'); fetchConfig(); }
  };

  const handleAddBairro = async () => {
    if (!newBairroNome.trim() || !newBairroRegiaoId) return;
    setSaving(true);
    const { error } = await supabase.from('bairros').insert({ nome: newBairroNome.trim(), regiao_id: newBairroRegiaoId });
    setSaving(false);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Bairro criado'); setNewBairroOpen(false); setNewBairroNome(''); setNewBairroRegiaoId(''); fetchConfig(); }
  };

  const handleDeleteBairro = async (id: string) => {
    const { error } = await supabase.from('bairros').delete().eq('id', id);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Bairro removido'); fetchConfig(); }
  };

  const handleAddCategoria = async () => {
    if (!newCatNome.trim()) return;
    setSaving(true);
    const slug = newCatNome.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { error } = await supabase.from('categorias').insert({ nome: newCatNome.trim(), slug });
    setSaving(false);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Categoria criada'); setNewCatOpen(false); setNewCatNome(''); fetchConfig(); }
  };

  const handleDeleteCategoria = async (id: string) => {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Categoria removida'); fetchConfig(); }
  };

  const handleAddSubcategoria = async () => {
    if (!newSubcatNome.trim() || !newSubcatCatId) return;
    setSaving(true);
    const slug = newSubcatNome.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { error } = await supabase.from('subcategorias').insert({ nome: newSubcatNome.trim(), slug, categoria_id: newSubcatCatId });
    setSaving(false);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Subcategoria criada'); setNewSubcatOpen(false); setNewSubcatNome(''); setNewSubcatCatId(''); fetchConfig(); }
  };

  const handleDeleteSubcategoria = async (id: string) => {
    const { error } = await supabase.from('subcategorias').delete().eq('id', id);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Subcategoria removida'); fetchConfig(); }
  };

  const handleDeleteAvaliacao = async (id: string) => {
    const { error } = await supabase.from('avaliacoes').delete().eq('id', id);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Avaliação removida'); fetchAvaliacoes(); }
  };

  const filteredAds = anuncios.filter((a) =>
    a.titulo.toLowerCase().includes(searchAds.toLowerCase()) ||
    a.profiles?.nome?.toLowerCase().includes(searchAds.toLowerCase()) ||
    a.profiles?.email?.toLowerCase().includes(searchAds.toLowerCase())
  );

  const filteredUsers = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4 space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-bold">Painel Admin</h1>
            {isSuperAdmin && (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                <Crown className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-card p-3 text-center">
            <Megaphone className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="font-display text-xl font-bold">{anuncios.length}</p>
            <p className="text-xs text-muted-foreground">Anúncios</p>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="font-display text-xl font-bold">{usuarios.length}</p>
            <p className="text-xs text-muted-foreground">Usuários</p>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="font-display text-xl font-bold">{anuncios.filter((a) => a.status === 'ativo').length}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <Ban className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="font-display text-xl font-bold">{usuarios.filter((u) => u.status === 'bloqueado').length}</p>
            <p className="text-xs text-muted-foreground">Bloqueados</p>
          </div>
        </div>

        <Tabs defaultValue="anuncios">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="anuncios" className="text-xs">Anúncios</TabsTrigger>
            <TabsTrigger value="usuarios" className="text-xs">Usuários</TabsTrigger>
            <TabsTrigger value="config" className="text-xs">Regiões</TabsTrigger>
            <TabsTrigger value="categorias" className="text-xs">Categorias</TabsTrigger>
            <TabsTrigger value="avaliacoes" className="text-xs">Avaliações</TabsTrigger>
          </TabsList>

          {/* Anúncios Tab */}
          <TabsContent value="anuncios" className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por título, autor ou email..." value={searchAds} onChange={(e) => setSearchAds(e.target.value)} className="pl-9" />
            </div>

            {loadingAds ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredAds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum anúncio encontrado.</p>
            ) : (
              <div className="space-y-2">
                {filteredAds.map((ad) => (
                  <div key={ad.id} className="rounded-lg border bg-card p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted">
                        {ad.fotos?.[0] && <img src={ad.fotos.sort((a: any, b: any) => a.ordem - b.ordem)[0].url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{ad.titulo}</p>
                        <p className="text-xs text-muted-foreground">{ad.profiles?.nome} • {ad.profiles?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-[10px] ${statusColors[ad.status] || ''}`}>{ad.status}</Badge>
                          <span className="text-[10px] text-muted-foreground">{ad.categorias?.nome}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Eye className="h-3 w-3" /> {ad.visualizacoes}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditAd(ad); setEditCategoriaId(ad.categoria_id); setEditStatus(ad.status); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir anúncio</AlertDialogTitle>
                              <AlertDialogDescription>Excluir permanentemente "{ad.titulo}"?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAd(ad.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Usuários Tab */}
          <TabsContent value="usuarios" className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou email..." value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)} className="pl-9" />
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum usuário encontrado.</p>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => {
                  const highestRole = getUserHighestRole(u.id);
                  const isUserSuperAdmin = highestRole === 'super_admin';
                  const isUserAdmin = highestRole === 'admin';

                  return (
                    <div key={u.id} className="rounded-lg border bg-card p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground overflow-hidden shrink-0">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.nome} className="h-full w-full object-cover" />
                          ) : (
                            u.nome?.charAt(0)?.toUpperCase() || '?'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{u.nome || 'Sem nome'}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={`text-[10px] ${statusColors[u.status] || ''}`}>{u.status}</Badge>
                            <Badge variant="outline" className={`text-[10px] ${roleColors[highestRole] || ''}`}>
                              {isUserSuperAdmin && <Crown className="h-2.5 w-2.5 mr-0.5" />}
                              {isUserAdmin && <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />}
                              {highestRole === 'super_admin' ? 'Super Admin' : highestRole === 'admin' ? 'Admin' : 'Usuário'}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">⭐ {u.rating}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/user/${u.id}`)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          
                          {isSuperAdmin && !isUserSuperAdmin && (
                            isUserAdmin ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" title="Remover admin">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover privilégio admin</AlertDialogTitle>
                                    <AlertDialogDescription>Remover o papel de administrador de "{u.nome}"?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDemoteAdmin(u.id)}>Confirmar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Promover a admin">
                                    <Shield className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Promover a Admin</AlertDialogTitle>
                                    <AlertDialogDescription>Promover "{u.nome}" a administrador?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handlePromoteToAdmin(u.id)}>Promover</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )
                          )}

                          {!isUserSuperAdmin && (
                            <Button
                              variant={u.status === 'bloqueado' ? 'default' : 'ghost'}
                              size="icon"
                              className={`h-8 w-8 ${u.status !== 'bloqueado' ? 'text-destructive' : ''}`}
                              onClick={() => handleBlockUser(u.id, u.status)}
                            >
                              {u.status === 'bloqueado' ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Regiões & Bairros Tab */}
          <TabsContent value="config" className="mt-4 space-y-4">
            {/* Regiões */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-sm font-semibold">Regiões</h3>
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setNewRegiaoOpen(true)}>
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              <div className="space-y-1">
                {regioes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border bg-card p-2.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm">{r.nome}</span>
                      {!r.ativa && <Badge variant="outline" className="text-[10px]">Inativa</Badge>}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover região</AlertDialogTitle>
                          <AlertDialogDescription>Remover "{r.nome}"? Anúncios vinculados podem ser afetados.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRegiao(r.id)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>

            {/* Bairros */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-sm font-semibold">Bairros</h3>
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setNewBairroOpen(true)}>
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              <div className="space-y-1">
                {bairros.map((b) => {
                  const reg = regioes.find((r) => r.id === b.regiao_id);
                  return (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card p-2.5">
                      <div>
                        <span className="text-sm">{b.nome}</span>
                        <span className="text-xs text-muted-foreground ml-2">({reg?.nome || '?'})</span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover bairro</AlertDialogTitle>
                            <AlertDialogDescription>Remover "{b.nome}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBairro(b.id)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Categorias Tab */}
          <TabsContent value="categorias" className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-sm font-semibold">Categorias</h3>
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setNewCatOpen(true)}>
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              <div className="space-y-1">
                {categorias.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border bg-card p-2.5">
                    <div>
                      <span className="text-sm font-medium">{c.nome}</span>
                      <span className="text-xs text-muted-foreground ml-2">({c.slug})</span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover categoria</AlertDialogTitle>
                          <AlertDialogDescription>Remover "{c.nome}"?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategoria(c.id)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-sm font-semibold">Subcategorias</h3>
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setNewSubcatOpen(true)}>
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              <div className="space-y-1">
                {subcategorias.map((s) => {
                  const cat = categorias.find((c) => c.id === s.categoria_id);
                  return (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border bg-card p-2.5">
                      <div>
                        <span className="text-sm">{s.nome}</span>
                        <span className="text-xs text-muted-foreground ml-2">({cat?.nome || '?'})</span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover subcategoria</AlertDialogTitle>
                            <AlertDialogDescription>Remover "{s.nome}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSubcategoria(s.id)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Avaliações Tab */}
          <TabsContent value="avaliacoes" className="mt-4 space-y-3">
            {avaliacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma avaliação encontrada.</p>
            ) : (
              avaliacoes.map((av) => (
                <div key={av.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{av.usuario?.nome || '?'}</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="font-medium">{av.anunciante?.nome || '?'}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= av.rating ? 'fill-secondary text-secondary' : 'text-muted'}`} />
                        ))}
                      </div>
                      {av.comentario && <p className="text-xs text-muted-foreground mt-1">{av.comentario}</p>}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0"><Trash2 className="h-3 w-3" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover avaliação</AlertDialogTitle>
                          <AlertDialogDescription>Remover esta avaliação? A nota do anunciante será recalculada.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAvaliacao(av.id)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Ad Dialog */}
        <Dialog open={!!editAd} onOpenChange={(open) => !open && setEditAd(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Anúncio</DialogTitle>
              <DialogDescription>Altere a categoria ou status do anúncio.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={editAd?.titulo || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={editCategoriaId} onValueChange={setEditCategoriaId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="removido">Removido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleUpdateAd}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Região Dialog */}
        <Dialog open={newRegiaoOpen} onOpenChange={setNewRegiaoOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Nova Região</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={newRegiaoNome} onChange={(e) => setNewRegiaoNome(e.target.value)} placeholder="Nome da região" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleAddRegiao} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Bairro Dialog */}
        <Dialog open={newBairroOpen} onOpenChange={setNewBairroOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Novo Bairro</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={newBairroNome} onChange={(e) => setNewBairroNome(e.target.value)} placeholder="Nome do bairro" />
              </div>
              <div className="space-y-2">
                <Label>Região</Label>
                <Select value={newBairroRegiaoId} onValueChange={setNewBairroRegiaoId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {regioes.filter(r => r.ativa !== false).map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleAddBairro} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Categoria Dialog */}
        <Dialog open={newCatOpen} onOpenChange={setNewCatOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={newCatNome} onChange={(e) => setNewCatNome(e.target.value)} placeholder="Nome da categoria" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleAddCategoria} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Subcategoria Dialog */}
        <Dialog open={newSubcatOpen} onOpenChange={setNewSubcatOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Nova Subcategoria</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={newSubcatNome} onChange={(e) => setNewSubcatNome(e.target.value)} placeholder="Nome da subcategoria" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={newSubcatCatId} onValueChange={setNewSubcatCatId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categorias.filter(c => c.ativa !== false).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleAddSubcategoria} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPage;
