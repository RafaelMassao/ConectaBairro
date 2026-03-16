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

- O projeto usa o entrypoint padrão do Vite em `index.html`: `"src/main.tsx"`.
- Se o deploy falhar com `Rollup failed to resolve import "./src/main.tsx"` ou `"src/main.tsx"`, verifique se a pasta `src/` e os arquivos `src/main.tsx`, `src/App.tsx` e `src/index.css` estão versionados no repositório.
- Avisos `npm warn deprecated ...` durante instalação não costumam quebrar o build por si só; normalmente são avisos de dependências transitivas.
