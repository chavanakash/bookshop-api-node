import { accentFor, formatPrice } from "../utils.js";

export default function BookCard({ book, onDelete, deleting }) {
  const accent = accentFor(book.title || book._id);

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-black/40">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${accent}`} />
      <div className="flex flex-1 flex-col gap-3 p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            {book.title}
          </h3>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            qty {book.qty ?? 0}
          </span>
        </div>
        {book.desc ? (
          <p className="line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{book.desc}</p>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-600">No description yet.</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {formatPrice(book.price)}
          </span>
          <button
            onClick={() => onDelete(book._id)}
            disabled={deleting}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/50"
          >
            {deleting ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </li>
  );
}
