export default function EmptyState({ hasQuery }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <span className="text-4xl">{hasQuery ? "🔎" : "📚"}</span>
      <p className="font-display text-lg font-semibold text-slate-700 dark:text-slate-200">
        {hasQuery ? "No matches on the shelf" : "The shelf is empty"}
      </p>
      <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
        {hasQuery
          ? "Try a different search term, or clear it to see everything."
          : "Add your first title to start building your catalog."}
      </p>
    </div>
  );
}
