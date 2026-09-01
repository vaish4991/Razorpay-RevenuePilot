"use client";

import { useEffect, useState } from "react";

import { formatPaise } from "@/lib/money";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  priceInPaise: number;
  inventoryQuantity: number;
  active: boolean;
};

type SearchResult = {
  products: Product[];
  page: number;
  totalPages: number;
  totalCount: number;
};

const CATEGORIES = [
  "headphones",
  "keyboards",
  "mice",
  "webcams",
  "microphones",
  "laptop-stands",
  "usb-hubs",
  "monitors",
  "chargers",
  "accessories",
];

export function ProductsCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchProducts() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "12",
        sortBy,
        sortOrder: "asc",
        activeOnly: "true",
      });

      if (query.trim()) {
        params.set("query", query.trim());
      }
      if (category) {
        params.set("category", category);
      }
      if (minPrice) {
        params.set("minPriceInPaise", String(Number(minPrice) * 100));
      }
      if (maxPrice) {
        params.set("maxPriceInPaise", String(Number(maxPrice) * 100));
      }

      const response = await fetch(`/api/catalog/products?${params.toString()}`);
      const payload = (await response.json()) as SearchResult | { error?: { message?: string } };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to fetch products");
      }

      setResult(payload as SearchResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to fetch products");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchProducts();
  }, [page, sortBy]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Product Explorer</h2>
        <p className="mt-1 text-sm text-slate-600">Browse active products with deterministic filters and pagination.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
          <input
            type="number"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
          <select
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="name">Sort by name</option>
            <option value="price">Sort by price</option>
            <option value="createdAt">Sort by newest</option>
          </select>
        </div>
        <button
          type="button"
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setPage(1);
            void fetchProducts();
          }}
        >
          Apply Filters
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading products...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {result?.products.map((product) => (
          <article key={product.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900">{product.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{product.category}</p>
            <p className="mt-2 text-sm text-slate-600">{product.description}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{formatPaise(product.priceInPaise)}</p>
            <p className="text-xs text-emerald-700">In stock: {product.inventoryQuantity}</p>
          </article>
        ))}
      </div>

      {result ? (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p>
            Page {result.page} of {result.totalPages} · {result.totalCount} products
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border px-3 py-1 disabled:opacity-50"
              disabled={result.page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border px-3 py-1 disabled:opacity-50"
              disabled={result.page >= result.totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
