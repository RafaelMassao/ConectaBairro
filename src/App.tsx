import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

const LandingPage = () => {
  return (
    <main className="page landing-page">
      <header className="hero">
        <p className="eyebrow">Bem-vindo à sua comunidade digital</p>
        <h1>ConectaBairro</h1>
        <p className="subtitle">
          Compre, venda e compartilhe oportunidades no seu bairro com segurança.
        </p>
      </header>

      <div className="actions">
        <Link className="button button-primary" to="/login">
          Entrar
        </Link>
        <a className="button button-ghost" href="#como-funciona">
          Como funciona
        </a>
      </div>

      <section className="features" id="como-funciona">
        <article>
          <h2>Anúncios locais</h2>
          <p>Divulgue produtos e serviços para pessoas perto de você.</p>
        </article>
        <article>
          <h2>Comunidade ativa</h2>
          <p>Conecte moradores, negócios e oportunidades da região.</p>
        </article>
        <article>
          <h2>Mais confiança</h2>
          <p>Interações focadas no seu bairro para trocas mais seguras.</p>
        </article>
      </section>
    </main>
  );
};

const LoginPage = () => {
  return (
    <main className="page login-page">
      <section className="login-card">
        <h1>Entrar no ConectaBairro</h1>
        <p>Use seu acesso para continuar.</p>

        <form className="login-form">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" placeholder="voce@exemplo.com" />

          <label htmlFor="password">Senha</label>
          <input id="password" type="password" placeholder="••••••••" />

          <button type="button" className="button button-primary">
            Entrar
          </button>
        </form>

        <Link className="back-link" to="/">
          ← Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
