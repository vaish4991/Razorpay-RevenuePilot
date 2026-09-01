# RevenuePilot AI

**Turn conversations into conversions.**

RevenuePilot AI is a working Track 1 submission for the **Razorpay AI Builder Internship 2026**. It demonstrates a full deterministic commerce flow with agent-guided discovery, carting, checkout validation, explicit approval, payment boundary handling, auditability, and metrics.

## Track selection
- **Track**: AI Growth & Agentic Commerce (Track 1)
- **Merchant (synthetic)**: NovaCart Electronics
- **Mode**: Demo-first, with optional Razorpay test-mode boundary when credentials are configured

## Problem
Merchants lose growth when discovery, recommendations, cart, and checkout are disconnected and hard to optimize.

## Solution
RevenuePilot AI unifies these stages through a constrained agentic workflow:

Conversation → intent extraction → catalog search → explainable recommendations → cart operations → checkout validation → explicit human approval → payment boundary → audit events → metrics.

## Business impact focus
The product tracks and surfaces growth-significant events:
- conversations
- product searches
- recommendations
- add-to-cart actions
- checkout validations
- approvals
- conversions
- conversion rate
- revenue influenced
- average order value

Metrics are derived from recorded demo activity and orders, labeled as synthetic demo metrics.

## Architecture

Client → API Routes → Validation → Deterministic Services → Prisma/PostgreSQL

### Core services
- `catalog-service`: merchant-scoped search/filter/pagination/sort and product lookup
- `cart-service`: create/get/add/update/remove/clear/recalculate with authoritative pricing and inventory checks
- `checkout-service`: eligibility validation, approval creation, approval verification
- `payment-service`: demo payment provider + optional Razorpay test order provider
- `audit-service`: typed audit event recording for critical actions
- `activity-service`: audit feed retrieval
- `metrics-service`: business metric aggregation

### Agent architecture
- Agent implementation under `src/agent/`
- Deterministic intent parser and recommendation scorer
- Tool allowlist (`searchProducts`, `getProduct`, `createCart`, `getCart`, `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart`, `validateCheckout`, `requestCheckoutApproval`)
- Agent cannot execute SQL, bypass approval, alter prices, alter inventory, or access unrestricted merchant/customer resources

### Tool safety and trust boundaries
- LLM/direct AI does not get raw DB access
- API inputs are validated
- Monetary arithmetic uses integer paise only
- Product price/inventory are read from DB as source of truth
- Approval must match exact cart amount/currency and cart snapshot state
- Cart mutation invalidates prior approval

### Checkout approval boundary
Approvals are stored in `CheckoutApproval` and bound to:
- merchant
- cart
- customer (optional)
- exact amount in paise
- currency
- cart `updatedAt` snapshot
- approval status lifecycle (`APPROVED`, `INVALIDATED`, `CONSUMED`)

### Payment boundary
- **DemoPaymentProvider** (default): no real money charged, creates internal order and audit events
- **Razorpay test provider** (optional): creates Razorpay test-mode order if credentials exist

## Auditability
Audit events capture agent/user/system action trails including cart lifecycle, validation, approval, invalidation, and payment boundary outcomes.

## Synthetic data
Seeded dataset includes:
- one merchant: NovaCart Electronics
- 33 products across categories (headphones, keyboards, mice, webcams, microphones, laptop stands, USB hubs, monitors, chargers, accessories)
- related-product metadata for cross-sell reasoning
- synthetic customers for demo checkout/metrics flows

## Tech stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma 6.19.3
- Vitest
- ESLint
- Prettier

## Security principles
- server-side secrets only
- deterministic service boundaries
- no floating-point money math
- merchant isolation
- inventory and checkout validation before payment boundary
- explicit customer approval before payment execution
- audit logging for financial and agent-critical actions

## Environment setup
Create `.env.local` from `.env.example`.

Required baseline:
- `DATABASE_URL` (PostgreSQL)
- `DEMO_MERCHANT_SLUG` (defaults to `novacart-electronics`)

Optional:
- `LLM_API_KEY` (for optional provider mode label; deterministic tools remain enforced)
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (for Razorpay test order creation boundary)

## PostgreSQL and Prisma
```bash
npm install
npm run prisma:validate
npm run prisma:generate
npm run db:seed
```

Apply migrations against a live PostgreSQL instance as usual:
```bash
npx prisma migrate deploy
```

## Development
```bash
npm run dev
```

## Tests
```bash
npm run test
```

## Lint/type/build
```bash
npm run lint
npm run typecheck
npm run build
```

## Demo walkthrough
1. Open `/`
2. Enter prompt: **"I need wireless headphones for remote work under ₹8,000"**
3. Review interpretation + recommendations
4. Add products to cart and adjust quantities
5. Click validate checkout
6. Explicitly approve exact amount
7. Execute demo/test payment boundary
8. Open `/activity` to inspect audit events
9. Open `/products` for deterministic catalog exploration

## Demo mode vs Razorpay test mode vs production
- **Demo Mode**: deterministic synthetic data, demo payment provider, no real money
- **Razorpay Test Mode**: optional external test order creation if credentials are configured
- **Production**: not implemented in this submission (auth, real payment settlement, and operational hardening required)

## Limitations
- No production authentication/authorization layer yet (demo merchant context only)
- No semantic vector search/embeddings yet
- Optional LLM mode currently remains deterministic and tool-constrained
- Real payment capture/verification workflow beyond test-boundary order creation is out of scope

## Future improvements
- Production auth and tenant isolation
- Stronger order/payment reconciliation workflows
- atomic inventory decrement during confirmed order/payment state transitions
- richer recommendation strategies and online learning loops
- observability dashboards and merchant cohort analytics
