# Razorpay RevenuePilot

AI-powered commerce and growth platform for the **Razorpay AI Builder Internship 2026 (Track 1: AI Growth & Agentic Commerce)**.

## Project overview
Razorpay RevenuePilot is being built incrementally as a production-minded system where customer shopping journeys are AI-assisted, but financial actions are deterministic, auditable, and server-controlled.

## Current implementation status
- ✅ Stage 1: Next.js + TypeScript + Tailwind foundation
- ✅ Stage 2: Database foundation with Prisma + PostgreSQL schema and deterministic synthetic catalog seed
- ⏭️ Next stages: agent orchestration, cart/checkout APIs, Razorpay test-mode order flow, analytics, and audit workflows

## Database architecture (implemented)
Prisma schema is defined in `prisma/schema.prisma` with these core models:

- `Merchant`
- `Product`
- `Customer`
- `Order`
- `OrderItem`
- `Cart`
- `CartItem`
- `AuditEvent`

Enums implemented:
- `OrderStatus`
- `CartStatus`
- `AuditActorType`

Design rules implemented:
- All money fields use integer paise (`Int`) only.
- Product/order/cart items preserve unit and total line pricing for historical correctness.
- Unique constraints and indexes are added for merchant/product slugs, customer references, status queries, and entity audit lookups.
- No Razorpay secrets, card data, or payment credentials are stored in database models.

## Synthetic commerce seed (implemented)
`prisma/seed.ts` creates deterministic demo data for one merchant:
- Merchant: **NovaCart Electronics**
- 30+ products across realistic categories (headphones, keyboards, mice, webcams, microphones, laptop stands, USB hubs, monitors, chargers, accessories)
- Related-product metadata links for future recommendation testing
- Multiple synthetic customers for future conversion/order analytics scenarios

## Server-only database client
- Prisma client entrypoint: `src/database/client.ts`
- Uses `server-only` to prevent accidental client-side imports in React components
- Re-exported from `src/database/index.ts`

## Validation utilities and tests
Commerce validation helpers in `src/validation/commerce.ts` enforce:
- integer paise money values
- non-negative prices
- positive integer quantities
- integer-safe cart/order total calculations

Tests in `tests/validation/commerce.test.ts` cover these rules.

## Technology stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Vitest
- ESLint
- Prettier

## Local setup
### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL (required for running migrations and seeding against a real DB)

### Install dependencies
```bash
npm install
```

### Configure environment
```bash
cp .env.example .env.local
```
Set `DATABASE_URL` to your PostgreSQL instance.

### Prisma commands
```bash
npm run prisma:validate
npm run prisma:generate
npm run db:seed
```

### App quality checks
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Security principles
- Financial actions remain server-side only.
- LLM actions will be constrained via explicit tool/function boundaries.
- Deterministic validation guardrails are required at financial boundaries.
- Important decisions and financial events are designed to be auditable.
