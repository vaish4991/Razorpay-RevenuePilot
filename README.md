# Razorpay RevenuePilot

AI-powered commerce and growth platform foundation for the **Razorpay AI Builder Internship 2026 (Track 1: AI Growth & Agentic Commerce)**.

## Project overview
Razorpay RevenuePilot is being built as a working, production-minded platform where customers discover and buy merchant products through a conversational AI experience, while all financial actions remain deterministic, auditable, and server-controlled.

## Problem statement
Modern commerce funnels lose conversions when product discovery, recommendations, and checkout feel fragmented. This project aims to unify:
- conversational product discovery,
- explainable AI recommendations,
- deterministic cart and pricing logic,
- explicit user approval before payment,
- Razorpay test-mode payment orchestration,
- merchant-facing analytics and auditability.

## Proposed solution
This repository now contains a clean application foundation that separates UI, agent orchestration boundaries, business services, validation, API routes, and database modules. It is designed for incremental delivery of guarded financial workflows rather than direct LLM-controlled transactions.

## Architecture overview
Initial architecture (implemented now):
- **Next.js App Router + TypeScript** base app shell.
- **Tailwind CSS** for UI styling.
- **API health-check route** at `GET /api/health`.
- **Safety-focused env handling** in `src/lib/env.ts` and `.env.example`.
- **Domain-oriented folder structure**:
  - `src/app` → UI routes and API handlers
  - `src/components/ui` → reusable UI primitives
  - `src/agent` → agent interfaces/orchestration boundary
  - `src/services` → business logic/services
  - `src/database` → DB access layer entrypoints
  - `src/validation` → schemas and deterministic policy validation
  - `tests` → automated test suites (Vitest)

Planned runtime design (next iterations):
- LLM tool/function calling with explicit action allowlists.
- Server-side deterministic policy layer for cart total, payment amount, idempotency, and approval checks.
- Prisma + PostgreSQL for products, carts, orders, payments, analytics, and audit logs.
- Razorpay test-mode order/payment integration behind service boundaries.

## Planned features (incremental)
1. Synthetic product catalog + searchable APIs.
2. Conversational shopping flow with tool-called catalog search.
3. Cart create/update flows with validated totals.
4. Explicit checkout approval gate before payment initiation.
5. Razorpay test-mode order creation and payment status handling.
6. Merchant analytics dashboard (orders, conversion, AOV, upsell acceptance, payment success, incremental revenue estimate).
7. Audit trail for agent decisions and financial events.

## Technology stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint
- Prettier
- Vitest
- PostgreSQL + Prisma (planned in next step)
- Razorpay test-mode APIs (planned in next step)

## Security principles
- Never expose secrets to client-side code.
- Keep all financial actions server-side.
- Require explicit customer approval before payment actions.
- Enforce deterministic validation/guardrails at every financial boundary.
- Use strict allowlisted tool/actions for agent behavior.
- Maintain auditable logs for critical decisions and money movement events.

## Local setup
### Prerequisites
- Node.js 20+
- npm 10+

### Install
```bash
npm install
```

### Configure environment
```bash
cp .env.example .env.local
```
Then fill values in `.env.local` with **test/synthetic** credentials only.

### Run development server
```bash
npm run dev
```

### Validation commands
```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run format
```

## Current status
✅ Foundation complete (app shell, structure, lint/format/test/build tooling, health endpoint).

⏭️ Next: implement synthetic catalog + guarded service layer before any payment code.
