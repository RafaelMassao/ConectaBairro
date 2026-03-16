# ConectaBairro

Aplicação web construída com React, TypeScript e Vite.

## Requisitos

- Node.js 18+
- npm

## Como rodar localmente

```sh
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:8080`.

## Scripts disponíveis

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera a versão de produção.
- `npm run preview`: executa a build localmente.
- `npm run lint`: executa lint.
- `npm run test`: executa testes.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Deploy na Vercel

### Opção 1: Deploy pela interface da Vercel (recomendado)

1. Faça push do repositório para GitHub/GitLab/Bitbucket.
2. Entre em [vercel.com](https://vercel.com) com sua conta.
3. Clique em **Add New... > Project**.
4. Importe este repositório.
5. Confirme as configurações (a Vercel deve detectar Vite automaticamente):
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Clique em **Deploy**.

### Opção 2: Deploy via CLI

```sh
npm i -g vercel
vercel login
vercel
```

No primeiro deploy via CLI, confirme:
- Framework: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

Para deploy de produção depois:

```sh
vercel --prod
```

### Variáveis de ambiente

Se seu projeto usar variáveis (`.env`), cadastre em:
**Project Settings > Environment Variables** na Vercel.

### Observações

- Este projeto já possui `vercel.json` com fallback para `index.html`, útil para rotas client-side (SPA).
- Caso use React Router com rotas como `/sobre` ou `/perfil`, esse fallback evita erro 404 ao atualizar a página.

