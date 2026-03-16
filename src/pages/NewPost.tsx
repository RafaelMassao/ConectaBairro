import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Megaphone, Briefcase, SearchIcon } from 'lucide-react';

const postTypes = [
  {
    type: 'anuncio',
    label: 'Anúncio',
    description: 'Venda, troca ou doe produtos e serviços',
    icon: ShoppingBag,
    color: 'bg-primary/10 text-primary',
    route: '/novo/anuncio',
  },
  {
    type: 'aviso',
    label: 'Aviso',
    description: 'Informe sobre eventos, alertas ou comunicados do bairro',
    icon: Megaphone,
    color: 'bg-amber-500/10 text-amber-600',
    route: '/novo/aviso',
  },
  {
    type: 'vaga',
    label: 'Vaga',
    description: 'Divulgue oportunidades de emprego ou freelance',
    icon: Briefcase,
    color: 'bg-blue-500/10 text-blue-600',
    route: '/novo/vaga',
  },
  {
    type: 'perdido',
    label: 'Perdido / Encontrado',
    description: 'Publique sobre objetos ou animais perdidos ou encontrados',
    icon: SearchIcon,
    color: 'bg-rose-500/10 text-rose-600',
    route: '/novo/perdido',
  },
];

const NewPostPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-20 md:pb-8 animate-fade-in">
      <div className="page-container py-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="font-display text-lg font-bold">O que você quer publicar?</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {postTypes.map(({ type, label, description, icon: Icon, color, route }) => (
            <button
              key={type}
              onClick={() => navigate(route)}
              className="flex items-start gap-4 rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:border-primary/30 group"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color} transition-transform group-hover:scale-110`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">{label}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewPostPage;
