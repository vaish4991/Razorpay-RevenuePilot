# RevenuePilot AI — 5 Minute Demo Script

## 0:00–0:30 — Problem
- Merchants lose conversions when discovery, recommendations, and checkout are disconnected.
- Conversational commerce often lacks financial safety and auditability.

## 0:30–1:00 — Solution
- RevenuePilot AI unifies intent-driven product discovery and deterministic checkout controls.
- Tagline: **Turn conversations into conversions.**

## 1:00–2:00 — AI shopping assistant
- Open `/`.
- Show DEMO MODE banner.
- Enter prompt: **"I need wireless headphones for remote work under ₹8,000"**.
- Explain that agent extracts category, budget, and quantity, then calls allowlisted backend tools.

## 2:00–3:00 — Recommendations, cart, and growth value
- Show explainable recommendations with reasons and in-stock status.
- Add items to cart and update quantity.
- Highlight authoritative integer-paise pricing from backend.
- Mention growth metrics: searches, recommendations, add-to-cart.

## 3:00–4:00 — Checkout approval and payment safety
- Click **Validate Checkout** and show deterministic checks.
- Click **Approve Exact Amount**.
- Explain approval is bound to cart + amount + currency + cart snapshot.
- Mutate cart and note that prior approval is invalidated.
- Execute payment boundary.
- In demo mode, show: **Demo Payment — No real money is charged.**

## 4:00–4:30 — Audit trail and metrics
- Open `/activity`.
- Show timeline events: search, recommendations, cart changes, validation, approval, payment outcome.
- Show metrics section and explain synthetic demo metric label.

## 4:30–5:00 — Architecture and Razorpay relevance
- Summarize architecture: Client → API → Validation → Deterministic Services → DB.
- Explain trust model: AI cannot directly touch DB or bypass approvals.
- Mention optional Razorpay test-mode boundary when credentials are configured.

## Extra example prompts
- "Find me a webcam under ₹5,000"
- "Give me 2 webcams under ₹5,000"
- "I need a keyboard and mouse for my home office"
