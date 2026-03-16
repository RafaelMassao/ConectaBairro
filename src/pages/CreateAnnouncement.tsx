import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, X, Check, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

const steps = ['Fotos', 'Informações', 'Categoria', 'Localização', 'Contato', 'Revisão'];

const CreateAnnouncementPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useStore();
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categorias, setCategorias] = useState<{ id: string; nome: string }[]>([]);
  const [subcategorias, setSubcategorias] = useState<{ id: string; nome: string; categoria_id: string }[]>([]);
  const [regioes, setRegioes] = useState<{ id: string; nome: string }[]>([]);
  const [bairros, setBairros] = useState<{ id: string; nome: string; regiao_id: string }[]>([]);

  // Custom subcategory dialog
  const [newSubcatOpen, setNewSubcatOpen] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [creatingSubcat, setCreatingSubcat] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('categorias').select('id, nome').eq('ativa', true).order('ordem'),
      supabase.from('subcategorias').select('id, nome, categoria_id').eq('ativa', true).order('ordem'),
      supabase.from('regioes').select('id, nome').eq('ativa', true),
      supabase.from('bairros').select('id, nome, regiao_id').eq('ativo', true),
    ]).then(([catRes, subRes, regRes, baiRes]) => {
      if (catRes.data) setCategorias(catRes.data);
      if (subRes.data) setSubcategorias(subRes.data);
      if (regRes.data) setRegioes(regRes.data);
      if (baiRes.data) setBairros(baiRes.data);
    });
  }, []);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    urgente: false,
    gratuito: false,
    categoria_id: '',
    subcategoria_id: '',
    regiao_id: '',
    bairro_id: '',
    localizacao_texto: '',
    nome: profile?.nome || '',
    whatsapp: profile?.whatsapp || '',
    fotos: [] as File[],
    fotoPreviews: [] as string[],
  });

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - form.fotos.length;
    const newFiles = files.slice(0, remaining);

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({
      ...prev,
      fotos: [...prev.fotos, ...newFiles],
      fotoPreviews: [...prev.fotoPreviews, ...newPreviews],
    }));

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(form.fotoPreviews[index]);
    setForm((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
      fotoPreviews: prev.fotoPreviews.filter((_, i) => i !== index),
    }));
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcatName.trim() || !form.categoria_id) return;
    setCreatingSubcat(true);

    const slug = newSubcatName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { data, error } = await supabase.from('subcategorias').insert({
      nome: newSubcatName.trim(),
      slug,
      categoria_id: form.categoria_id,
    }).select().single();

    setCreatingSubcat(false);
    if (error) {
      toast.error('Erro ao criar subcategoria: ' + error.message);
    } else if (data) {
      setSubcategorias((prev) => [...prev, { id: data.id, nome: data.nome, categoria_id: data.categoria_id }]);
      update('subcategoria_id', data.id);
      toast.success('Subcategoria criada!');
      setNewSubcatOpen(false);
      setNewSubcatName('');
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    if (!form.titulo.trim()) { toast.error('Informe o título'); return; }
    if (!form.descricao.trim()) { toast.error('Informe a descrição'); return; }
    if (!form.categoria_id) { toast.error('Selecione uma categoria'); return; }
    if (!form.regiao_id) { toast.error('Selecione uma região'); return; }

    setPublishing(true);

    try {
      const { data: anuncio, error: anuncioError } = await supabase
        .from('anuncios')
        .insert({
          usuario_id: user.id,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          preco: form.gratuito ? null : (form.preco ? parseFloat(form.preco) : null),
          urgente: form.urgente,
          gratuito: form.gratuito,
          categoria_id: form.categoria_id,
          subcategoria_id: form.subcategoria_id || null,
          regiao_id: form.regiao_id,
          bairro_id: form.bairro_id || null,
          localizacao_texto: form.localizacao_texto.trim(),
        })
        .select()
        .single();

      if (anuncioError) throw anuncioError;

      for (let i = 0; i < form.fotos.length; i++) {
        const file = form.fotos[i];
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${anuncio.id}/${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('anuncios')
          .upload(path, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage.from('anuncios').getPublicUrl(path);

        await supabase.from('fotos').insert({
          anuncio_id: anuncio.id,
          url: urlData.publicUrl,
          ordem: i,
        });
      }

      toast.success('Anúncio publicado com sucesso!');
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao publicar: ' + (err.message || 'Tente novamente'));
    } finally {
      setPublishing(false);
    }
  };

  const filteredSubcats = subcategorias.filter((s) => s.categoria_id === form.categoria_id);
  const filteredBairros = bairros.filter((b) => b.regiao_id === form.regiao_id);

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => (step === 0 ? navigate('/novo') : prev())} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Voltar' : 'Anterior'}
          </button>
          <h1 className="font-display text-lg font-bold">Novo Anúncio</h1>
          <span className="text-xs text-muted-foreground">{step + 1} de {steps.length}</span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex gap-1 mb-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            {steps.map((s, i) => (
              <span key={i} className={i === step ? 'text-primary font-medium' : ''}>{s}</span>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {step === 0 && (
            <div>
              <h2 className="font-display text-base font-semibold mb-1">Adicione Fotos</h2>
              <p className="text-xs text-muted-foreground mb-4">Mínimo 1, máximo 10</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="grid grid-cols-3 gap-3">
                {form.fotoPreviews.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 rounded-full bg-card/80 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {form.fotos.length < 10 && (
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
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input placeholder="Ex: iPhone 12 em ótimo estado" maxLength={150} value={form.titulo} onChange={(e) => update('titulo', e.target.value)} />
                <p className="text-xs text-muted-foreground text-right">{form.titulo.length}/150</p>
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea placeholder="Descreva seu anúncio com detalhes..." maxLength={5000} rows={5} value={form.descricao} onChange={(e) => update('descricao', e.target.value)} />
                <p className="text-xs text-muted-foreground text-right">{form.descricao.length}/5000</p>
              </div>

              {/* Gratuito toggle */}
              <div className="rounded-lg border bg-accent/50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="gratuito" checked={form.gratuito} onCheckedChange={(v) => { update('gratuito', v); if (v) update('preco', ''); }} />
                  <Label htmlFor="gratuito" className="text-sm font-medium">Doação / Voluntário (sem custo)</Label>
                </div>
                <p className="text-xs text-muted-foreground pl-6">Marque se o produto é uma doação ou o serviço é voluntário</p>
              </div>

              {!form.gratuito && (
                <div className="space-y-2">
                  <Label>Preço (opcional)</Label>
                  <Input type="number" placeholder="R$ 0,00" value={form.preco} onChange={(e) => update('preco', e.target.value)} />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox id="urgente" checked={form.urgente} onCheckedChange={(v) => update('urgente', v)} />
                <Label htmlFor="urgente" className="text-sm">Marcar como urgente</Label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={form.categoria_id} onValueChange={(v) => { update('categoria_id', v); update('subcategoria_id', ''); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.categoria_id && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Subcategoria</Label>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={() => setNewSubcatOpen(true)}>
                      <Plus className="h-3 w-3" /> Criar nova
                    </Button>
                  </div>
                  {filteredSubcats.length > 0 ? (
                    <Select value={form.subcategoria_id} onValueChange={(v) => update('subcategoria_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione uma subcategoria" /></SelectTrigger>
                      <SelectContent>
                        {filteredSubcats.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhuma subcategoria disponível. Crie uma nova!</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Região *</Label>
                <Select value={form.regiao_id} onValueChange={(v) => { update('regiao_id', v); update('bairro_id', ''); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma região" /></SelectTrigger>
                  <SelectContent>
                    {regioes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {filteredBairros.length > 0 && (
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Select value={form.bairro_id} onValueChange={(v) => update('bairro_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione um bairro" /></SelectTrigger>
                    <SelectContent>
                      {filteredBairros.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Localização específica *</Label>
                <Input placeholder="Ex: Próximo ao mercado central" value={form.localizacao_texto} onChange={(e) => update('localizacao_texto', e.target.value)} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.nome} onChange={(e) => update('nome', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input placeholder="11999887766" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-display text-base font-semibold">Revisão do Anúncio</h2>
              <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
                <div><span className="text-muted-foreground">Título:</span> <strong>{form.titulo || '—'}</strong></div>
                <div>
                  <span className="text-muted-foreground">Preço:</span>{' '}
                  {form.gratuito ? <span className="text-green-600 font-medium">Doação / Voluntário</span> : form.preco ? `R$ ${form.preco}` : 'Não informado'}
                </div>
                <div><span className="text-muted-foreground">Categoria:</span> {categorias.find(c => c.id === form.categoria_id)?.nome || '—'}</div>
                {form.subcategoria_id && (
                  <div><span className="text-muted-foreground">Subcategoria:</span> {subcategorias.find(s => s.id === form.subcategoria_id)?.nome || '—'}</div>
                )}
                <div><span className="text-muted-foreground">Localização:</span> {form.localizacao_texto || '—'}</div>
                <div><span className="text-muted-foreground">Contato:</span> {form.nome} - {form.whatsapp}</div>
                <div><span className="text-muted-foreground">Urgente:</span> {form.urgente ? 'Sim' : 'Não'}</div>
                <div><span className="text-muted-foreground">Fotos:</span> {form.fotos.length} foto(s)</div>
                {form.fotoPreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {form.fotoPreviews.map((url, i) => (
                      <img key={i} src={url} alt="" className="h-16 w-16 rounded object-cover" />
                    ))}
                  </div>
                )}
                {form.descricao && <div><span className="text-muted-foreground">Descrição:</span><p className="mt-1 text-foreground">{form.descricao}</p></div>}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={prev} className="flex-1 gap-2">
              <ArrowLeft className="h-4 w-4" /> Anterior
            </Button>
          )}
          {step < 5 ? (
            <Button onClick={next} className="flex-1 gap-2">
              Próximo <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} className="flex-1 gap-2" disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {publishing ? 'Publicando...' : 'Publicar Anúncio'}
            </Button>
          )}
        </div>
      </div>

      {/* Create subcategory dialog */}
      <Dialog open={newSubcatOpen} onOpenChange={setNewSubcatOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Criar Subcategoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nome da subcategoria</Label>
              <Input
                placeholder="Ex: Pintura, Jardinagem..."
                value={newSubcatName}
                onChange={(e) => setNewSubcatName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleCreateSubcategory} disabled={creatingSubcat || !newSubcatName.trim()}>
              {creatingSubcat ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateAnnouncementPage;
