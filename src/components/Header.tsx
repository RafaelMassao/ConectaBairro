import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, Bell, Heart, LogOut, Menu, X, PlusCircle, Shield } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, logout, searchQuery, setSearchQuery, isAdmin, unreadNotifications, clearFilters } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/auth');
  };

  const handleLogoClick = () => {
    clearFilters();
    navigate('/home');
  };

  const initials = profile?.nome
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="page-container flex h-14 items-center gap-3">
        {/* Logo */}
        <button onClick={handleLogoClick} className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">CB</span>
          </div>
          <span className="hidden font-display text-lg font-bold text-foreground sm:block">
            ConectaBairro
          </span>
        </button>

        {/* Search - desktop */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar anúncios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="hidden md:flex items-center gap-1">
          {isAdmin && (
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate('/admin')}>
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          )}
          <Button variant="default" size="sm" className="gap-1.5" onClick={() => navigate('/novo')}>
            <PlusCircle className="h-4 w-4" />
            Novo
          </Button>
          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Profile avatar */}
        <Link
          to="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shrink-0 overflow-hidden"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.nome} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </Link>

        {/* Mobile menu toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t bg-card px-4 py-3 md:hidden animate-fade-in">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar anúncios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          {isAdmin && (
            <Button variant="ghost" className="w-full justify-start mb-1" onClick={() => { navigate('/admin'); setMenuOpen(false); }}>
              <Shield className="h-4 w-4 mr-2" />
              Painel Admin
            </Button>
          )}
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
