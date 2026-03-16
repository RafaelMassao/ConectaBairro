import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notificacao {
  id: string;
  anuncio_id: string | null;
  tipo: string;
  titulo: string;
  mensagem: string | null;
  lida: boolean;
  criado_em: string;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user, setUnreadNotifications } = useStore();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false });
    if (data) {
      setNotificacoes(data);
      setUnreadNotifications(data.filter((n) => !n.lida).length);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    setUnreadNotifications(notificacoes.filter((n) => !n.lida && n.id !== id).length);
  };

  const clearAll = async () => {
    if (!user) return;
    await supabase.from('notificacoes').delete().eq('usuario_id', user.id);
    setNotificacoes([]);
    setUnreadNotifications(0);
    toast.success('Notificações limpas');
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-xl font-bold">Notificações</h1>
          </div>
          {notificacoes.length > 0 && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-1" /> Limpar tudo
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notificacoes.map((n) => (
              <div
                key={n.id}
                className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                  n.lida ? 'bg-card opacity-60' : 'bg-card border-primary/30'
                }`}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.anuncio_id) navigate(`/announcements/${n.anuncio_id}`);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{n.titulo}</p>
                    {n.mensagem && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.mensagem}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(n.criado_em)}</span>
                </div>
                {!n.lida && (
                  <div className="mt-1.5">
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Novo</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
