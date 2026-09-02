# Dashboard Analytics

Rastreador pessoal de finanças (gastos/receitas) com dashboard de gráficos. MVP.

## Stack

- **Frontend**: React + TypeScript (Vite), React Router, Recharts, Axios
- **Backend**: Node.js + Express + TypeScript, Prisma ORM
- **DB**: SQLite em desenvolvimento (via Prisma). Migração para PostgreSQL é trocar o `provider` e a `DATABASE_URL` (ver seção abaixo)
- **Auth**: JWT (access token, 7 dias), senha com bcrypt

## Rodando localmente

### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

API sobe em `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App sobe em `http://localhost:5173`.

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

## Migrando para PostgreSQL

1. Suba um Postgres (Docker: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`).
2. Em `backend/prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
3. Em `backend/.env`, troque `DATABASE_URL` para algo como `postgresql://postgres:postgres@localhost:5432/dashboard_analytics`.
4. Rode `npx prisma migrate dev`.
