export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Razorpay RevenuePilot</h1>
      <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
        AI-powered commerce and growth platform foundation for the Razorpay AI Builder Internship 2026 submission.
      </p>
      <section className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Foundation status</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Initial architecture, guardrail-ready folder structure, and health endpoint are set up. Payment and agent execution logic will be added incrementally.
        </p>
      </section>
    </main>
  );
}
