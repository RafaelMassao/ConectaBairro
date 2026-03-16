import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EditAnnouncementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useStore();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categorias, setCategorias] = useState<{ id: string; nome: string }[]>([]);
  const [subcategorias, setSubcategorias] = useState<{ id: string; nome: string; categoria_id: string }[]>([]);
  const [regioes, setRegioes] = useState<{ id: string; nome: string }[]>([]);
  const [bairros, setBairros] = useState<{ id: string; nome: string; regiao_id: string }[]>([]);

  const [existingPhotos, setExistingPhotos] = useState<{ id: string; url: string }[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    urgente: false,
    categoria_id: '',
    subcategoria_id: '',
    regiao_id: '',
    bairro_id: '',
    localizacao_texto: '',
  });

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (!id || !user) return;

    Promise.all([
      supabase.from('categorias').select('id, nome').eq('ativa', true).order('ordem'),
      supabase.from('subcategorias').select('id, nome, categoria_id').eq('ativa', true).order('ordem'),
      supabase.from('regioes').select('id, nome').eq('ativa', true),
      supabase.from('bairros').select('id, nome, regiao_id').eq('ativo', true),
      supabase.from('anuncios').select('*').eq('id', id).eq('usuario_id', user.id).single(),
      supabase.from('fotos').select('id, url').eq('anuncio_id', id).order('ordem'),
    ]).then(([catRes, subRes, regRes, baiRes, adRes, fotosRes]) => {
      if (catRes.data) setCategorias(catRes.data);
      if (subRes.data) setSubcategorias(subRes.data);
      if (regRes.data) setRegioes(regRes.data);
      if (baiRes.data) setBairros(baiRes.data);
      if (fotosRes.data) setExistingPhotos(fotosRes.data);

      if (adRes.data) {
        const ad = adRes.data;
        setForm({
          titulo: ad.titulo,
          descricao: ad.descricao,
          preco: ad.preco?.toString() || '',
          urgente: ad.urgente,
          categoria_id: ad.categoria_id,
          subcategoria_id: ad.subcategoria_id || '',
          regiao_id: ad.regiao_id,
          bairro_id: ad.bairro_id || '',
          localizacao_texto: ad.localizacao_texto || '',
        });
      } else {
        toast.error('Anúncio não encontrado');
        navigate('/profile');
      }
      setLoading(false);
    });
  }, [id, user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = existingPhotos.length - photosToDelete.length + newFiles.length;
    const remaining = 10 - totalPhotos;
    const added = files.slice(0, remaining);
    setNewFiles((prev) => [...prev, ...added]);
    setNewPreviews((prev) => [...prev, ...added.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingPhoto = (photoId: string) => {
    setPhotosToDelete((prev) => [...prev, photoId]);
  };

  const removeNewPhoto = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user || !id) return;
    if (!form.titulo.trim()) { toast.error('Informe o título'); return; }
    if (!form.descricao.trim()) { toast.error('Informe a descrição'); return; }
    if (!form.categoria_id) { toast.error('Selecione uma categoria'); return; }
    if (!form.regiao_id) { toast.error('Selecione uma região'); return; }

    setSaving(true);
    try {
      // Update announcement
      const { error } = await supabase
        .from('anuncios')
        .update({
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          preco: form.preco ? parseFloat(form.preco) : null,
          urgente: form.urgente,
          categoria_id: form.categoria_id,
          subcategoria_id: form.subcategoria_id || null,
          regiao_id: form.regiao_id,
          bairro_id: form.bairro_id || null,
          localizacao_texto: form.localizacao_texto.trim(),
        })
        .eq('id', id);

      if (error) throw error;

      // Delete removed photos
      for (const photoId of photosToDelete) {
        const photo = existingPhotos.find((p) => p.id === photoId);
        if (photo) {
          const path = photo.url.split('/storage/v1/object/public/anuncios/')[1];
          if (path) await supabase.storage.from('anuncios').remove([path]);
        }
        await supabase.from('fotos').delete().eq('id', photoId);
      }

      // Upload new photos
      const currentCount = existingPhotos.length - photosToDelete.length;
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${id}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage.from('anuncios').upload(path, file);
        if (uploadError) { console.error(uploadError); continue; }

        const { data: urlData } = supabase.storage.from('anuncios').getPublicUrl(path);
        await supabase.from('fotos').insert({
          anuncio_id: id,
          url: urlData.publicUrl,
          ordem: currentCount + i,
        });
      }

      toast.success('Anúncio atualizado com sucesso!');
      navigate('/profile');
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err.message || 'Tente novamente'));
    } finally {
      setSaving(false);
    }
  };

  const filteredSubcats = subcategorias.filter((s) => s.categoria_id === form.categoria_id);
  const filteredBairros = bairros.filter((b) => b.regiao_id === form.regiao_id);
  const visibleExisting = existingPhotos.filter((p) => !photosToDelete.includes(p.id));
  const totalPhotos = visibleExisting.length + newFiles.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-lg font-bold">Editar Anúncio</h1>
        </div>

        <div className="space-y-6">
          {/* Photos */}
          <div>
            <Label className="mb-2 block">Fotos ({totalPhotos}/10)</Label>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            <div className="grid grid-cols-4 gap-3">
              {visibleExisting.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => removeExistingPhoto(photo.id)} className="absolute top-1 right-1 rounded-full bg-card/80 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {newPreviews.map((url, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => removeNewPhoto(i)} className="absolute top-1 right-1 rounded-full bg-card/80 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {totalPhotos < 10 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-[10px]">Adicionar</span>
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input maxLength={150} value={form.titulo} onChange={(e) => update('titulo', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea maxLength={5000} rows={5} value={form.descricao} onChange={(e) => update('descricao', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Preço (opcional)</Label>
              <Input type="number" placeholder="R$ 0,00" value={form.preco} onChange={(e) => update('preco', e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="urgente" checked={form.urgente} onCheckedChange={(v) => update('urgente', v)} />
              <Label htmlFor="urgente" className="text-sm">Marcar como urgente</Label>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={form.categoria_id} onValueChange={(v) => { update('categoria_id', v); update('subcategoria_id', ''); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {filteredSubcats.length > 0 && (
              <div className="space-y-2">
                <Label>Subcategoria</Label>
                <Select value={form.subcategoria_id} onValueChange={(v) => update('subcategoria_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {filteredSubcats.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Região *</Label>
              <Select value={form.regiao_id} onValueChange={(v) => { update('regiao_id', v); update('bairro_id', ''); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {regioes.map((r) => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {filteredBairros.length > 0 && (
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Select value={form.bairro_id} onValueChange={(v) => update('bairro_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {filteredBairros.map((b) => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Localização específica</Label>
              <Input value={form.localizacao_texto} onChange={(e) => update('localizacao_texto', e.target.value)} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/profile')}>
              Cancelar
            </Button>
            <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAnnouncementPage;
