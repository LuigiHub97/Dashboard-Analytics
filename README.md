# Dashboard Analytics

Rastreador pessoal de finanças (gastos/receitas) com dashboard de gráficos. MVP.

## Stack

- **Frontend**: React + TypeScript (Vite), React Router, Recharts, Axios
- **Backend**: Node.js + Express + TypeScript, Prisma ORM
- **DB**: PostgreSQL (via Prisma)
- **Auth**: JWT (access token, 7 dias), senha com bcrypt

## Rodando localmente

Precisa de um PostgreSQL acessível (local, Docker, ou uma instância gratuita como a do Render/Neon) — defina a `DATABASE_URL` em `backend/.env` a partir de `backend/.env.example`.

### Backend

```bash
cd backend
npm install
npx prisma migrate deploy
npm run dev
```

API sobe em `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App sobe em `http://localhost:5173`. Configure `frontend/.env` (a partir de `frontend/.env.example`) com a URL da API.

## Estrutura

```
dashboard-analytics/
├── backend/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── config/
│       └── utils/
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        ├── context/
        └── types/
```

## API

Todas as rotas de `/api/transactions`, `/api/categories` e `/api/dashboard/*` exigem header `Authorization: Bearer <token>` e retornam apenas dados do usuário autenticado.

- `POST /api/auth/register` — `{ email, password, name? }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/categories`
- `POST /api/categories` — `{ name, type }`
- `GET /api/transactions?startDate&endDate&categoryId&minValue&maxValue&page&limit`
- `POST /api/transactions` — `{ type, amount, date, description?, categoryId }`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET /api/dashboard/summary?month=YYYY-MM`
- `GET /api/dashboard/by-category?month=YYYY-MM`
- `GET /api/dashboard/trend?months=6`
- `GET /api/recurring-transactions`
- `POST /api/recurring-transactions` — `{ type, amount, dayOfMonth, categoryId, description? }`
- `PUT /api/recurring-transactions/:id` — mesmos campos, mais `active` para pausar/retomar
- `DELETE /api/recurring-transactions/:id`

Uma despesa/receita recorrente gera automaticamente a transação do mês corrente (no dia configurado, ou no último dia do mês se ele for menor) na primeira requisição autenticada feita naquele mês — sem necessidade de cron externo. Cada regra gera no máximo uma transação por mês.

## Deploy

### Backend — Render

O repositório inclui `render.yaml` na raiz (Blueprint): cria automaticamente um Postgres free e o web service da API, já com `DATABASE_URL` e `JWT_SECRET` conectados.

1. No [Render Dashboard](https://dashboard.render.com), **New > Blueprint**, aponte para este repositório.
2. Render lê o `render.yaml`, cria o banco `dashboard-analytics-db` e o serviço `dashboard-analytics-api`.
3. Após o primeiro deploy, edite a env var `CORS_ORIGIN` do serviço para a URL do frontend (ex.: `https://seu-app.vercel.app`).
4. A API fica em algo como `https://dashboard-analytics-api.onrender.com`. Teste com `GET /health`.

O `buildCommand` já roda `prisma migrate deploy`, aplicando as migrations em `backend/prisma/migrations` no Postgres do Render.

### Frontend — Vercel

1. No [Vercel Dashboard](https://vercel.com), **Add New > Project**, importe este repositório.
2. **Root Directory**: `frontend` (framework Vite é detectado automaticamente).
3. Env var: `VITE_API_URL` = `https://<sua-api>.onrender.com/api`.
4. Deploy. O `frontend/vercel.json` já cuida do rewrite de rotas do React Router.
5. Volte no Render e atualize `CORS_ORIGIN` com a URL que a Vercel gerou.
