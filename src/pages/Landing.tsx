import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";

const LandingPage = () => {
  const { isAuthenticated } = useStore();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Projeto ConectaBairro
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            O mural digital da sua comunidade
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Compartilhe avisos, vagas e anúncios locais em um só lugar. O ConectaBairro aproxima
            moradores, fortalece o comércio local e facilita a comunicação do bairro.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/auth">Entrar / Cadastrar</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/home">Explorar comunidade</Link>
            </Button>
          </div>
        </div>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <h2 className="font-semibold">Avisos rápidos</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Informe eventos, comunicados e atualizações importantes para todos os vizinhos.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <h2 className="font-semibold">Oportunidades locais</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Divulgue vagas de emprego, prestação de serviços e oportunidades da região.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <h2 className="font-semibold">Achados e perdidos</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajude a comunidade a encontrar objetos e pets perdidos com mais agilidade.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
