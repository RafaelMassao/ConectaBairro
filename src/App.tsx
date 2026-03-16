import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AuthPage from "@/pages/Auth";
import SetupProfilePage from "@/pages/SetupProfile";
import HomePage from "@/pages/Home";
import AnnouncementDetailPage from "@/pages/AnnouncementDetail";
import UserProfilePage from "@/pages/UserProfile";
import SettingsPage from "@/pages/Settings";
import CreateAnnouncementPage from "@/pages/CreateAnnouncement";
import NewPostPage from "@/pages/NewPost";
import CreateAvisoPage from "@/pages/CreateAviso";
import CreateVagaPage from "@/pages/CreateVaga";
import CreatePerdidoPage from "@/pages/CreatePerdido";
import EditAnnouncementPage from "@/pages/EditAnnouncement";
import CategoriesPage from "@/pages/Categories";
import ProfilePage from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import NotificationsPage from "@/pages/Notifications";
import AdminPage from "@/pages/Admin";
import LandingPage from "@/pages/Landing";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, profile } = useStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Redirect to setup if profile is incomplete (nome is empty)
  const profileIncomplete = !profile?.nome || profile.nome.trim() === '';
  if (profileIncomplete && location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" replace />;
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      <BottomNav />
    </>
  );
};

const AuthListener = ({ children }: { children: React.ReactNode }) => {
  const { setAuth, setIsAdmin, setIsSuperAdmin, setUnreadNotifications } = useStore();
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId: string) => {
    // Check roles - retry once if empty (session may not be ready)
    let { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    if (!roles || roles.length === 0) {
      await new Promise(r => setTimeout(r, 500));
      const res = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      roles = res.data;
    }
    const roleList = roles?.map(r => r.role) || [];
    setIsAdmin(roleList.includes('admin') || roleList.includes('super_admin'));
    setIsSuperAdmin(roleList.includes('super_admin'));

    // Count unread notifications
    const { count } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .eq('lida', false);
    setUnreadNotifications(count || 0);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setAuth(session.user, profile);
            await loadUserData(session.user.id);
            setLoading(false);
          }, 0);
        } else {
          setAuth(null, null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(async ({ data: profile }) => {
            setAuth(session.user, profile);
            await loadUserData(session.user.id);
            setLoading(false);
          });
      } else {
        setAuth(null, null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};

const SetupRoute = () => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <SetupProfilePage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthListener>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/setup-profile" element={<SetupRoute />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/announcements/:id" element={<ProtectedRoute><AnnouncementDetailPage /></ProtectedRoute>} />
            <Route path="/user/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
            <Route path="/novo" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />
            <Route path="/novo/anuncio" element={<ProtectedRoute><CreateAnnouncementPage /></ProtectedRoute>} />
            <Route path="/novo/aviso" element={<ProtectedRoute><CreateAvisoPage /></ProtectedRoute>} />
            <Route path="/novo/vaga" element={<ProtectedRoute><CreateVagaPage /></ProtectedRoute>} />
            <Route path="/novo/perdido" element={<ProtectedRoute><CreatePerdidoPage /></ProtectedRoute>} />
            <Route path="/create-announcement" element={<Navigate to="/novo/anuncio" replace />} />
            <Route path="/edit-announcement/:id" element={<ProtectedRoute><EditAnnouncementPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthListener>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
