# Handmade & Art Toy Platform

A niche e-commerce marketplace connecting buyers with independent handmade goods and art toy creators. Supports pre-orders, custom requests, multi-vendor checkout, and escrow-based vendor payouts.

## System Architecture

The platform is a monorepo split into three independently deployable subsystems:

| Subsystem | Path | Stack | Purpose |
|---|---|---|---|
| API | [`backend/`](backend) | NestJS, Prisma, PostgreSQL | Pure REST API, zero UI. Auth, catalog, orders, escrow wallet logic. |
| Buyer Storefront | [`frontend-buyer/`](frontend-buyer) | Next.js 15 (App Router) | SEO/SSR-optimized storefront. Browsing, cart, checkout. |
| Vendor & Admin Dashboard | [`frontend-analytics/`](frontend-analytics) | React (Vite) | Unified dashboard for vendors and super admins, gated by JWT role claims. |

All three communicate exclusively over the API exposed by `backend/` — no subsystem queries the database directly except `backend`.

## Tech Stack

**Backend**
- NestJS (TypeScript), Controller-Service-Repository layering
- PostgreSQL via Prisma ORM (hosted on Supabase)
- JWT auth via Passport (local, Google, Facebook strategies)
- Standardized response envelope: `{ success, data, error }`

**Frontend (Buyer)**
- Next.js 15 App Router, TypeScript strict mode
- TailwindCSS + shadcn/ui
- TanStack Query for data fetching, Zustand for auth state
- React Hook Form + Zod for forms
- Vitest + React Testing Library

**Frontend (Analytics)**
- React + Vite
- Role-based access (`vendor` / `admin`) via JWT claims

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL database (e.g. a Supabase project)

### 1. Backend (`backend/`)

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, OAuth keys, etc.
npm run prisma:generate
npm run prisma:migrate
npm run start:dev       # runs on http://localhost:3001
```

### 2. Buyer Storefront (`frontend-buyer/`)

```bash
cd frontend-buyer
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL to the backend URL
npm run dev              # runs on http://localhost:3000
```

### 3. Vendor & Admin Dashboard (`frontend-analytics/`)

Not yet scaffolded.

## Core Domain Rules

- Three user roles: `buyer`, `vendor`, `admin`.
- Multi-vendor cart auto-splits into per-shop sub-orders with independent shipping.
- Vendor funds are held in escrow until delivery is confirmed, then released via withdrawal request.
- Tenant isolation: vendor-scoped endpoints derive `shop_id` from the JWT, never from client input.
