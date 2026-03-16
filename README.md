# ConectaBairro

Aplicação web para comunicação da comunidade local, com foco em anúncios, avisos, vagas e publicações de achados e perdidos.

## Tecnologias

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS
- Supabase

## Como executar localmente

Pré-requisitos:

- Node.js 18+
- npm 9+

Passos:

```bash
# 1) Clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2) Entre na pasta do projeto
cd ConectaBairro

# 3) Instale as dependências
npm install

# 4) Execute em modo desenvolvimento
npm run dev
```

## Scripts principais

- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: gera o build de produção
- `npm run preview`: serve o build localmente
- `npm run lint`: executa lint
- `npm run test`: executa os testes

## Estrutura principal

- `src/pages`: páginas da aplicação
- `src/components`: componentes reutilizáveis
- `src/integrations/supabase`: cliente e tipos de integração
- `src/store`: estado global com Zustand
- `supabase/migrations`: migrações do banco
