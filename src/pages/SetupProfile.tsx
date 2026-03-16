import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { useEffect } from 'react';

const SetupProfilePage = () => {
  const { user, profile, setProfile } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [regioes, setRegioes] = useState<{ id: string; nome: string }[]>([]);

  const [nome, setNome] = useState(profile?.nome || user?.user_metadata?.full_name || '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [regiaoId, setRegiaoId] = useState(profile?.regiao_id || '');

  useEffect(() => {
    supabase.from('regioes').select('id, nome').eq('ativa', true).then(({ data }) => {
      if (data) setRegioes(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error('Informe seu nome');
      return;
    }
    if (!whatsapp.trim()) {
      toast.error('Informe seu WhatsApp');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        bio: bio.trim() || null,
        regiao_id: regiaoId || null,
      })
      .eq('id', user!.id)
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error('Erro ao salvar perfil: ' + error.message);
      return;
    }

    setProfile(data);
    toast.success('Perfil configurado com sucesso!');
    navigate('/home');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <span className="text-2xl font-bold text-primary-foreground font-display">CB</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Configure seu Perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete seus dados para começar a usar o ConectaBairro</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar placeholder */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
                  onClick={() => toast.info('Upload de foto será implementado em breve')}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                placeholder="(11) 99999-9999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regiao">Região</Label>
              <Select value={regiaoId} onValueChange={setRegiaoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua região" />
                </SelectTrigger>
                <SelectContent>
                  {regioes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Sobre você</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar e Continuar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupProfilePage;
