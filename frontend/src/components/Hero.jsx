export default function Hero({ query, onQueryChange }) {
  return (
    <section className="relative overflow-hidden px-6 pb-14 pt-16 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 animate-blob rounded-full bg-violet-400/30 blur-3xl dark:bg-violet-600/20" />
        <div className="absolute -right-16 top-20 h-72 w-72 animate-blob rounded-full bg-fuchsia-400/30 blur-3xl [animation-delay:4s] dark:bg-fuchsia-600/20" />
        <div className="absolute left-1/3 top-40 h-64 w-64 animate-blob rounded-full bg-amber-300/20 blur-3xl [animation-delay:8s] dark:bg-amber-500/10" />
      </div>

      <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
        ✨ your shop's living catalog
      </p>
      <h1 className="font-display mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
        Every book,
        <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
          {" "}
          one cozy shelf.
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-slate-500 dark:text-slate-400">
        Add, browse, and retire titles from your inventory in real time.
      </p>

      <div className="mx-auto mt-8 max-w-md">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm shadow-slate-200/50 backdrop-blur transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-none">
          <span className="text-slate-400">🔍</span>
          <input
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Search by title or description…"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
        </div>
      </div>
    </section>
  );
}
