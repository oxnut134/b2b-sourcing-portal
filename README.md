# B2B Sourcing Portal

A full-stack B2B procurement SaaS application built with Next.js 16, TypeScript, and Supabase. Clients submit RFQs (Requests for Quotation), admins respond with quotes, and payments are processed securely via Stripe Elements — all within a polished dark-themed dashboard.

---

## Features

### Client Portal
- **RFQ Submission** — structured form with category, quantity, target price, delivery date, and shipping address
- **Quote Review** — view admin-issued quotes and accept with one click
- **Stripe Payments** — embedded Stripe Elements card form; no redirect to an external checkout page
- **Order Tracking** — real-time order status from `pending_payment` through `delivered`
- **Dashboard** — unified view of recent RFQs, quotes awaiting action, and active orders

### Admin Dashboard
- **RFQ Management** — list and review all incoming client RFQs with status filtering
- **Quote Builder** — issue quotes with unit price, total, lead time, validity window, and terms
- **Order Management** — update order status and add tracking numbers / carrier info
- **Client Directory** — overview of all registered client accounts

### Platform
- JWT-based authentication with email + password (NextAuth.js v4)
- Role-based access control (`client` / `admin`) enforced at layout and API level
- Stripe webhook handler for reliable payment confirmation
- Demo/trial mode with one-click auto-login

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4, Radix UI primitives |
| Auth | NextAuth.js v4 · JWT strategy · Credentials provider |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM + `pg` driver |
| Payments | Stripe Elements (`@stripe/react-stripe-js` v6, Stripe SDK v22) |
| Forms | react-hook-form v7 + Zod v4 |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Stripe](https://stripe.com) account (test mode)

### 1. Clone and install

```bash
git clone https://github.com/your-username/b2b-sourcing-portal.git
cd b2b-sourcing-portal
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` — see [Environment Variables](#environment-variables) below.

### 3. Push database schema

```bash
npm run db:push
```

This pushes the Drizzle schema to your Supabase PostgreSQL database.

### 4. Seed the database

```bash
npm run db:seed
```

Creates an admin account and a demo client account with sample RFQ, quote, and order data.

Override admin credentials via environment variables if needed:

```bash
SEED_ADMIN_EMAIL=you@company.com SEED_ADMIN_PASSWORD=secure123 npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Access

A protected trial page auto-logs in as the demo client — no manual login required.

**Trial URL:**
```
http://localhost:3000/trial?token=b2b-demo-2026
```

| Role | Email | Password |
|---|---|---|
| Client (demo) | `demo@example.com` | `demo2026` |
| Admin | `admin@example.com` | `admin1234` |

> The demo account has pre-seeded RFQs, a quote, and a pending order so the dashboard is populated on first visit.

---

## Environment Variables

```env
# Database — Supabase PostgreSQL connection string
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# NextAuth — generate secret with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Seed (optional — defaults shown)
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=admin1234
SEED_ADMIN_NAME=Admin
```

To test Stripe webhooks locally, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/            # Sign-in page
│   │   └── register/         # New account registration
│   ├── (client)/             # Client portal (role-guarded layout)
│   │   ├── dashboard/        # Overview: RFQs, quotes, orders
│   │   ├── rfq/              # RFQ list + detail
│   │   ├── rfq/new/          # Submit a new RFQ
│   │   ├── quotes/           # Quotes list
│   │   ├── orders/           # Order list + detail
│   │   └── payment/[id]/     # Stripe Elements payment page
│   ├── (admin)/              # Admin dashboard (role-guarded layout)
│   │   └── admin/
│   │       ├── rfqs/         # RFQ management + quote builder
│   │       ├── quotes/       # Quotes overview
│   │       ├── orders/       # Order management
│   │       └── clients/      # Client directory
│   ├── api/
│   │   ├── auth/             # NextAuth + registration endpoint
│   │   ├── rfq/              # RFQ CRUD
│   │   ├── quotes/           # Quote CRUD
│   │   ├── orders/           # Order CRUD
│   │   └── payments/         # Stripe create-intent, confirm, webhook
│   ├── trial/                # Demo auto-login page
│   └── page.tsx              # Landing page
├── components/
│   ├── admin/                # Quote form, order update form
│   ├── client/               # Accept-quote button, pay-now button, payment form
│   ├── layout/               # Navbar, sidebar
│   └── ui/                   # Shared primitives (Button, Input, Badge, Card, …)
├── db/
│   ├── schema.ts             # Drizzle table definitions + TypeScript types
│   ├── index.ts              # Drizzle client instance
│   └── seed.ts               # Database seeding script
└── lib/
    ├── auth.ts               # NextAuth config (providers, JWT/session callbacks)
    ├── stripe.ts             # Stripe server + client initialisation
    └── utils.ts              # cn(), formatCurrency(), formatDate(), status label maps
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Accounts with `role` (`client` \| `admin`), company, phone |
| `accounts` | NextAuth OAuth account links |
| `sessions` | NextAuth session tokens |
| `rfqs` | Client requests: category, quantity, target price, delivery date |
| `quotes` | Admin responses: unit price, total, lead time, validity, terms |
| `orders` | Created when a quote is accepted; holds Stripe payment intent ID |
| `order_history` | Append-only log of order status changes |

---

## Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint

npm run db:push       # Push schema changes to database
npm run db:generate   # Generate Drizzle migration files
npm run db:migrate    # Apply generated migrations
npm run db:studio     # Open Drizzle Studio (visual DB browser)
npm run db:seed       # Seed admin + demo data
```

---

## License

MIT
