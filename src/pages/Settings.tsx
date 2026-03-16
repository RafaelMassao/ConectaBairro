import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Palette, Shield, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout, profile } = useStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    toast.info('Exclusão de conta será implementada em breve.');
  };

  const handleChangePassword = async () => {
    if (!profile?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email);
    if (error) {
      toast.error('Erro ao enviar email: ' + error.message);
    } else {
      toast.success('Email de redefinição enviado para ' + profile.email);
    }
  };

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4 space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-xl font-bold">Configurações</h1>
        </div>

        {/* Notificações */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold">Notificações</h2>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notificações por email</p>
              <p className="text-xs text-muted-foreground">Receba atualizações sobre seus anúncios</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Novas avaliações</p>
              <p className="text-xs text-muted-foreground">Seja notificado quando receber uma avaliação</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Mensagens de interessados</p>
              <p className="text-xs text-muted-foreground">Receba alertas de novos contatos</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        {/* Segurança */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold">Segurança</h2>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alterar senha</p>
              <p className="text-xs text-muted-foreground">Enviaremos um email para redefinição</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleChangePassword}>
              Alterar
            </Button>
          </div>
        </div>

        {/* Aparência */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold">Aparência</h2>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Modo escuro</p>
              <p className="text-xs text-muted-foreground">Alterne entre tema claro e escuro</p>
            </div>
            <Switch />
          </div>
        </div>

        {/* Privacidade */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold">Privacidade</h2>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Perfil público</p>
              <p className="text-xs text-muted-foreground">Permitir que outros vejam seu perfil</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Mostrar WhatsApp</p>
              <p className="text-xs text-muted-foreground">Exibir número nos seus anúncios</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        {/* Ações da conta */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Sair da conta
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full gap-2 text-destructive hover:bg-destructive/5">
                <Trash2 className="h-4 w-4" /> Excluir minha conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir conta</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza? Esta ação é irreversível. Todos os seus anúncios e dados serão removidos permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
