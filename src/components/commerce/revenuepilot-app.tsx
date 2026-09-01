"use client";

import { useEffect, useMemo, useState } from "react";

import { formatPaise } from "@/lib/money";

type Recommendation = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  priceInPaise: number;
  inventoryQuantity: number;
  score: number;
  reason: string;
};

type CartSummary = {
  id: string;
  currency: string;
  subtotalInPaise: number;
  totalInPaise: number;
  itemCount: number;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPriceInPaise: number;
    totalPriceInPaise: number;
  }>;
};

type CheckoutValidation = {
  valid: boolean;
  errors: string[];
  totalInPaise: number;
};

type Metrics = {
  conversations: number;
  productSearches: number;
  recommendations: number;
  addToCartEvents: number;
  checkoutValidations: number;
  approvals: number;
  conversions: number;
  conversionRatePercent: number;
  revenueInfluencedInPaise: number;
  averageOrderValueInPaise: number;
  label: string;
};

const DEFAULT_PROMPT = "I need wireless headphones for remote work under ₹8,000";

export function RevenuePilotApp() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [agentModeLabel, setAgentModeLabel] = useState("Demo AI — deterministic synthetic-data mode");
  const [interpretation, setInterpretation] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [agentMessage, setAgentMessage] = useState<string>("");
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [checkout, setCheckout] = useState<CheckoutValidation | null>(null);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  async function readJsonOrThrow(response: Response) {
    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      const errorData = payload.error as { message?: string } | undefined;
      throw new Error(errorData?.message ?? "Request failed");
    }
    return payload;
  }

  const cartTotalLabel = useMemo(() => {
    if (!cart) {
      return formatPaise(0);
    }
    return formatPaise(cart.totalInPaise, cart.currency);
  }, [cart]);

  async function ensureCart() {
    if (cart?.id) {
      return cart.id;
    }

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerExternalReference: "cust_demo_001" }),
    });

    const created = (await readJsonOrThrow(response)) as CartSummary;
    setCart(created);
    return created.id;
  }

  async function refreshCart(cartId: string) {
    const response = await fetch(`/api/cart/${cartId}`);
    const payload = (await readJsonOrThrow(response)) as CartSummary;
    setCart(payload);
  }

  async function refreshMetrics() {
    const response = await fetch("/api/metrics");
    const payload = (await readJsonOrThrow(response)) as Metrics;
    setMetrics(payload);
  }

  useEffect(() => {
    void refreshMetrics().catch(() => undefined);
  }, []);

  async function handleAskAgent() {
    setError("");
    setLoading(true);

    try {
      const cartId = await ensureCart();
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          cartId,
          customerExternalReference: "cust_demo_001",
        }),
      });

      const payload = (await readJsonOrThrow(response)) as {
        modeLabel: string;
        interpretation: {
          category?: string;
          maxBudgetInPaise?: number;
          quantity: number;
          keywords: string[];
        };
        recommendations: Recommendation[];
        message: string;
      };

      setAgentModeLabel(payload.modeLabel);
      setRecommendations(payload.recommendations);
      setAgentMessage(payload.message);
      setInterpretation(
        `Category: ${payload.interpretation.category ?? "general"} | Qty: ${payload.interpretation.quantity} | Budget: ${payload.interpretation.maxBudgetInPaise ? formatPaise(payload.interpretation.maxBudgetInPaise) : "not specified"}`,
      );

      await refreshMetrics();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to process request");
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(productId: string, quantity = 1) {
    if (!cart) {
      return;
    }
    setError("");
    try {
      const response = await fetch(`/api/cart/${cart.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const payload = (await readJsonOrThrow(response)) as CartSummary;
      setCart(payload);
      setApprovalId(null);
      setCheckout(null);
      setPaymentMessage("");
      await refreshMetrics();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Add to cart failed");
    }
  }

  async function updateItem(itemId: string, quantity: number) {
    if (!cart) {
      return;
    }

    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const response = await fetch(`/api/cart/${cart.id}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const payload = (await readJsonOrThrow(response)) as CartSummary;
      setCart(payload);
      setApprovalId(null);
      setCheckout(null);
      setPaymentMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function removeItem(itemId: string) {
    if (!cart) {
      return;
    }

    try {
      const response = await fetch(`/api/cart/${cart.id}/items/${itemId}`, { method: "DELETE" });
      const payload = (await readJsonOrThrow(response)) as CartSummary;
      setCart(payload);
      setApprovalId(null);
      setCheckout(null);
      setPaymentMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed");
    }
  }

  async function clearAll() {
    if (!cart) {
      return;
    }

    try {
      const response = await fetch(`/api/cart/${cart.id}`, { method: "DELETE" });
      const payload = (await readJsonOrThrow(response)) as CartSummary;
      setCart(payload);
      setApprovalId(null);
      setCheckout(null);
      setPaymentMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Clear cart failed");
    }
  }

  async function validateCheckout() {
    if (!cart) {
      return;
    }

    try {
      const response = await fetch("/api/checkout/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          customerExternalReference: "cust_demo_001",
        }),
      });

      const payload = (await response.json()) as CheckoutValidation | { error?: { message?: string } };
      if (!response.ok && !("valid" in payload)) {
        throw new Error(payload.error?.message ?? "Checkout validation failed");
      }

      const validation = payload as CheckoutValidation;
      setCheckout(validation);
      if (!validation.valid) {
        setApprovalId(null);
      }
      await refreshMetrics();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout validation failed");
    }
  }

  async function approveCheckout() {
    if (!cart) {
      return;
    }

    try {
      const response = await fetch("/api/checkout/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          customerExternalReference: "cust_demo_001",
          reason: "Customer explicitly approved checkout amount",
        }),
      });

      const payload = (await readJsonOrThrow(response)) as { id: string };
      setApprovalId(payload.id);
      await refreshMetrics();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approval failed");
    }
  }

  async function executePayment() {
    if (!cart || !approvalId) {
      return;
    }

    try {
      const response = await fetch("/api/payment/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          approvalId,
          customerExternalReference: "cust_demo_001",
        }),
      });

      const payload = (await readJsonOrThrow(response)) as { message: string; modeLabel: string };
      setPaymentMessage(`${payload.modeLabel} ${payload.message}`);
      await refreshCart(cart.id);
      await refreshMetrics();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment execution failed");
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
      <section className="space-y-6">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">DEMO MODE — Synthetic merchant data. No real payments.</p>
          <p className="mt-1">Merchant: NovaCart Electronics · Agent Mode: {agentModeLabel}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">AI Shopping Assistant</h2>
          <p className="mt-1 text-sm text-slate-600">
            Describe what you need. The agent interprets intent and recommends products from the live catalog.
          </p>
          <textarea
            className="mt-4 h-24 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none ring-blue-500 focus:ring"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <button
            type="button"
            onClick={() => void handleAskAgent()}
            disabled={loading}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Ask RevenuePilot AI"}
          </button>
          {interpretation ? <p className="mt-4 text-sm text-slate-700">Interpretation: {interpretation}</p> : null}
          {agentMessage ? <p className="mt-2 text-sm text-blue-700">{agentMessage}</p> : null}
          {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Recommendations</h3>
          {recommendations.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No recommendations yet. Ask the assistant to start.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {recommendations.map((item) => (
                <article key={item.productId} className="rounded-lg border border-slate-200 p-3">
                  <h4 className="font-semibold text-slate-900">{item.name}</h4>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.category}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatPaise(item.priceInPaise)}</p>
                  <p className="mt-1 text-xs text-emerald-700">In stock: {item.inventoryQuantity}</p>
                  <p className="mt-2 text-xs text-blue-700">{item.reason}</p>
                  <button
                    type="button"
                    className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                    onClick={() => void addToCart(item.productId, 1)}
                  >
                    Add to Cart
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Cart</h3>
          {!cart ? (
            <button
              type="button"
              className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm"
              onClick={() =>
                void ensureCart().then((cartId) => {
                  void refreshCart(cartId);
                })
              }
            >
              Create Cart
            </button>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-500">Items: {cart.itemCount}</p>
              <div className="mt-3 space-y-3">
                {cart.items.length === 0 ? (
                  <p className="text-sm text-slate-500">Your cart is empty.</p>
                ) : (
                  cart.items.map((item) => (
                    <div key={item.id} className="rounded-md border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">{item.productName}</p>
                      <p className="text-xs text-slate-500">
                        {formatPaise(item.unitPriceInPaise)} each · Line: {formatPaise(item.totalPriceInPaise)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded border px-2 py-1 text-xs"
                          onClick={() => void updateItem(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="rounded border px-2 py-1 text-xs"
                          onClick={() => void updateItem(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto rounded border border-rose-200 px-2 py-1 text-xs text-rose-600"
                          onClick={() => void removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">Total: {cartTotalLabel}</p>
              <button
                type="button"
                className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-xs"
                onClick={() => void clearAll()}
              >
                Clear Cart
              </button>
            </>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Checkout Safety Flow</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            <li>Review Cart</li>
            <li>Validate Checkout</li>
            <li>Explicit Human Approval</li>
            <li>Payment Boundary</li>
          </ol>
          <button
            type="button"
            className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            onClick={() => void validateCheckout()}
            disabled={!cart}
          >
            Validate Checkout
          </button>
          {checkout ? (
            <div className="mt-3 rounded-md border border-slate-200 p-3 text-sm">
              <p className={checkout.valid ? "text-emerald-700" : "text-rose-600"}>
                {checkout.valid ? "Checkout validated." : "Checkout rejected."}
              </p>
              {!checkout.valid && checkout.errors.length > 0 ? (
                <ul className="mt-2 list-disc pl-4 text-xs text-rose-600">
                  {checkout.errors.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-60"
            onClick={() => void approveCheckout()}
            disabled={!checkout?.valid}
          >
            Approve Exact Amount
          </button>
          {approvalId ? <p className="mt-2 text-xs text-blue-700">Approval ID: {approvalId}</p> : null}

          <button
            type="button"
            className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            onClick={() => void executePayment()}
            disabled={!approvalId}
          >
            Execute Demo/Test Payment
          </button>
          {paymentMessage ? <p className="mt-2 text-xs text-slate-700">{paymentMessage}</p> : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Business Metrics</h3>
          {!metrics ? (
            <p className="mt-2 text-sm text-slate-500">Loading metrics...</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
              <p>Conversations: {metrics.conversations}</p>
              <p>Searches: {metrics.productSearches}</p>
              <p>Recommendations: {metrics.recommendations}</p>
              <p>Add-to-cart: {metrics.addToCartEvents}</p>
              <p>Validations: {metrics.checkoutValidations}</p>
              <p>Approvals: {metrics.approvals}</p>
              <p>Conversions: {metrics.conversions}</p>
              <p>Conv. rate: {metrics.conversionRatePercent}%</p>
              <p>Revenue influenced: {formatPaise(metrics.revenueInfluencedInPaise)}</p>
              <p>AOV: {formatPaise(metrics.averageOrderValueInPaise)}</p>
              <p className="col-span-2 text-[11px] text-slate-500">{metrics.label}</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
