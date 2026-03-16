import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, PlusCircle, User } from 'lucide-react';

const navItems = [
  { to: '/home', icon: Home, label: 'Início' },
  { to: '/categories', icon: Grid3X3, label: 'Categorias' },
  { to: '/novo', icon: PlusCircle, label: 'Novo' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors duration-200 ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
