import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Camera, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const steps = ['Fotos', 'Informações', 'Localização', 'Contato', 'Revisão'];

const CreateAvisoPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useStore();
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [regioes, setRegioes] = useState<{ id: string; nome: string }[]>([]);
  const [bairros, setBairros] = useState<{ id: string; nome: string; regiao_id: string }[]>([]);
  const [avisoCategoriaId, setAvisoCategoriaId] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('regioes').select('id, nome').eq('ativa', true),
      supabase.from('bairros').select('id, nome, regiao_id').eq('ativo', true),
      supabase.from('categorias').select('id').eq('slug', 'avisos').single(),
    ]).then(([regRes, baiRes, catRes]) => {
      if (regRes.data) setRegioes(regRes.data);
      if (baiRes.data) setBairros(baiRes.data);
      if (catRes.data) setAvisoCategoriaId(catRes.data.id);
    });
  }, []);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    urgente: false,
    data_evento: '',
    regiao_id: '',
    bairro_id: '',
    localizacao_texto: '',
    nome: profile?.nome || '',
    whatsapp: profile?.whatsapp || '',
    fotos: [] as File[],
    fotoPreviews: [] as string[],
  });

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - form.fotos.length;
    const newFiles = files.slice(0, remaining);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, fotos: [...prev.fotos, ...newFiles], fotoPreviews: [...prev.fotoPreviews, ...newPreviews] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(form.fotoPreviews[index]);
    setForm((prev) => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index), fotoPreviews: prev.fotoPreviews.filter((_, i) => i !== index) }));
  };

  const handlePublish = async () => {
    if (!user || !avisoCategoriaId) return;
    if (!form.titulo.trim()) { toast.error('Informe o título'); return; }
    if (!form.descricao.trim()) { toast.error('Informe a descrição'); return; }
    if (!form.regiao_id) { toast.error('Selecione uma região'); return; }

    setPublishing(true);
    try {
      const { data: anuncio, error } = await supabase
        .from('anuncios')
        .insert({
          usuario_id: user.id,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          urgente: form.urgente,
          gratuito: true,
          categoria_id: avisoCategoriaId,
          regiao_id: form.regiao_id,
          bairro_id: form.bairro_id || null,
          localizacao_texto: form.localizacao_texto.trim(),
          data_evento: form.data_evento || null,
        })
        .select()
        .single();
      if (error) throw error;

      for (let i = 0; i < form.fotos.length; i++) {
        const file = form.fotos[i];
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${anuncio.id}/${i}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('anuncios').upload(path, file);
        if (uploadError) continue;
        const { data: urlData } = supabase.storage.from('anuncios').getPublicUrl(path);
        await supabase.from('fotos').insert({ anuncio_id: anuncio.id, url: urlData.publicUrl, ordem: i });
      }

      toast.success('Aviso publicado com sucesso!');
      navigate('/home');
    } catch (err: any) {
      toast.error('Erro ao publicar: ' + (err.message || 'Tente novamente'));
    } finally {
      setPublishing(false);
    }
  };

  const filteredBairros = bairros.filter((b) => b.regiao_id === form.regiao_id);

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => (step === 0 ? navigate('/novo') : prev())} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Voltar' : 'Anterior'}
          </button>
          <h1 className="font-display text-lg font-bold">Novo Aviso</h1>
          <span className="text-xs text-muted-foreground">{step + 1} de {steps.length}</span>
        </div>

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

        <div className="space-y-4">
          {step === 0 && (
            <div>
              <h2 className="font-display text-base font-semibold mb-1">Adicione Fotos</h2>
              <p className="text-xs text-muted-foreground mb-4">Opcional, máximo 10</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
              <div className="grid grid-cols-3 gap-3">
                {form.fotoPreviews.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 rounded-full bg-card/80 p-0.5"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {form.fotos.length < 10 && (
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Camera className="h-6 w-6" /><span className="text-[10px]">Adicionar</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título do aviso *</Label>
                <Input placeholder="Ex: Reunião de moradores sábado" maxLength={150} value={form.titulo} onChange={(e) => update('titulo', e.target.value)} />
                <p className="text-xs text-muted-foreground text-right">{form.titulo.length}/150</p>
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea placeholder="Descreva o aviso com detalhes..." maxLength={5000} rows={5} value={form.descricao} onChange={(e) => update('descricao', e.target.value)} />
                <p className="text-xs text-muted-foreground text-right">{form.descricao.length}/5000</p>
              </div>
              <div className="space-y-2">
                <Label>Data do evento (opcional)</Label>
                <Input type="datetime-local" value={form.data_evento} onChange={(e) => update('data_evento', e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="urgente" checked={form.urgente} onCheckedChange={(v) => update('urgente', v)} />
                <Label htmlFor="urgente" className="text-sm">Marcar como urgente</Label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Região *</Label>
                <Select value={form.regiao_id} onValueChange={(v) => { update('regiao_id', v); update('bairro_id', ''); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma região" /></SelectTrigger>
                  <SelectContent>{regioes.map((r) => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {filteredBairros.length > 0 && (
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Select value={form.bairro_id} onValueChange={(v) => update('bairro_id', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione um bairro" /></SelectTrigger>
                    <SelectContent>{filteredBairros.map((b) => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Localização específica</Label>
                <Input placeholder="Ex: Praça central do bairro" value={form.localizacao_texto} onChange={(e) => update('localizacao_texto', e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.nome} onChange={(e) => update('nome', e.target.value)} /></div>
              <div className="space-y-2"><Label>WhatsApp</Label><Input placeholder="11999887766" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} /></div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-base font-semibold">Revisão do Aviso</h2>
              <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
                <div><span className="text-muted-foreground">Título:</span> <strong>{form.titulo || '—'}</strong></div>
                {form.data_evento && <div><span className="text-muted-foreground">Data do evento:</span> {new Date(form.data_evento).toLocaleString('pt-BR')}</div>}
                <div><span className="text-muted-foreground">Localização:</span> {form.localizacao_texto || '—'}</div>
                <div><span className="text-muted-foreground">Contato:</span> {form.nome} - {form.whatsapp}</div>
                <div><span className="text-muted-foreground">Urgente:</span> {form.urgente ? 'Sim' : 'Não'}</div>
                <div><span className="text-muted-foreground">Fotos:</span> {form.fotos.length} foto(s)</div>
                {form.fotoPreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap">{form.fotoPreviews.map((url, i) => <img key={i} src={url} alt="" className="h-16 w-16 rounded object-cover" />)}</div>
                )}
                {form.descricao && <div><span className="text-muted-foreground">Descrição:</span><p className="mt-1 text-foreground">{form.descricao}</p></div>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-3">
          {step > 0 && <Button variant="outline" onClick={prev} className="flex-1 gap-2"><ArrowLeft className="h-4 w-4" /> Anterior</Button>}
          {step < steps.length - 1 ? (
            <Button onClick={next} className="flex-1 gap-2">Próximo <ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button onClick={handlePublish} className="flex-1 gap-2" disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {publishing ? 'Publicando...' : 'Publicar Aviso'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAvisoPage;
