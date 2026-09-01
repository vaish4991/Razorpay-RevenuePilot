import Link from "next/link";

export function TopNav() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">RevenuePilot AI</p>
          <h1 className="text-lg font-semibold text-slate-900">Turn conversations into conversions.</h1>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link className="hover:text-blue-700" href="/">
            Assistant
          </Link>
          <Link className="hover:text-blue-700" href="/products">
            Products
          </Link>
          <Link className="hover:text-blue-700" href="/activity">
            Activity
          </Link>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            DEMO MODE
          </span>
        </nav>
      </div>
    </header>
  );
}
