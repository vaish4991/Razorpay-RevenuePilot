"use client";

import { useEffect, useState } from "react";

import { formatPaise } from "@/lib/money";

type EventRecord = {
  id: string;
  actorType: string;
  action: string;
  entityType: string;
  entityId: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
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

export function ActivityFeed() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [eventsResponse, metricsResponse] = await Promise.all([
          fetch("/api/activity?limit=120"),
          fetch("/api/metrics"),
        ]);

        const eventsPayload = (await eventsResponse.json()) as { events: EventRecord[]; error?: { message?: string } };
        const metricsPayload = (await metricsResponse.json()) as Metrics | { error?: { message?: string } };

        if (!eventsResponse.ok) {
          throw new Error(eventsPayload.error?.message ?? "Unable to load activity");
        }
        if (!metricsResponse.ok) {
          throw new Error((metricsPayload as { error?: { message?: string } }).error?.message ?? "Unable to load metrics");
        }

        setEvents(eventsPayload.events);
        setMetrics(metricsPayload as Metrics);
      } catch (eventError) {
        setError(eventError instanceof Error ? eventError.message : "Unable to load activity feed");
      }
    }

    void load();
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Audit Activity</h2>
        <p className="mt-1 text-sm text-slate-600">Observable and auditable commerce actions from agent, user, and system boundaries.</p>
      </div>

      {metrics ? (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:grid-cols-2 lg:grid-cols-5">
          <p>Conversations: {metrics.conversations}</p>
          <p>Searches: {metrics.productSearches}</p>
          <p>Recommendations: {metrics.recommendations}</p>
          <p>Add to cart: {metrics.addToCartEvents}</p>
          <p>Validations: {metrics.checkoutValidations}</p>
          <p>Approvals: {metrics.approvals}</p>
          <p>Conversions: {metrics.conversions}</p>
          <p>Conv. rate: {metrics.conversionRatePercent}%</p>
          <p>Revenue: {formatPaise(metrics.revenueInfluencedInPaise)}</p>
          <p>AOV: {formatPaise(metrics.averageOrderValueInPaise)}</p>
          <p className="sm:col-span-2 lg:col-span-5 text-xs text-slate-500">{metrics.label}</p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            No activity yet. Interact with the assistant and checkout flow to generate events.
          </p>
        ) : (
          events.map((event) => (
            <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{event.action}</p>
                <p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Actor: {event.actorType} · Entity: {event.entityType} ({event.entityId})
              </p>
              {event.reason ? <p className="mt-2 text-xs text-slate-700">Reason: {event.reason}</p> : null}
              {event.metadata ? (
                <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-[11px] text-slate-700">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
