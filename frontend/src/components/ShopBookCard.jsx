import { useState } from "react";
import { accentFor, formatPrice } from "../utils.js";

export default function ShopBookCard({ book, onAddToCart }) {
  const accent = accentFor(book.title || book._id);
  const [qty, setQty] = useState(1);
  const outOfStock = (book.qty ?? 0) <= 0;

  function clampQty(value) {
    const max = Math.max(book.qty ?? 0, 1);
    setQty(Math.min(Math.max(1, value), max));
  }

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-black/40">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${accent}`} />
      <div className="flex flex-1 flex-col gap-3 p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            {book.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
              outOfStock
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {outOfStock ? "out of stock" : `${book.qty} in stock`}
          </span>
        </div>
        {book.desc ? (
          <p className="line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{book.desc}</p>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-600">No description yet.</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {formatPrice(book.price)}
          </span>
          {!outOfStock && (
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => clampQty(qty - 1)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm text-slate-700 dark:text-slate-300">
                  {qty}
                </span>
                <button
                  onClick={() => clampQty(qty + 1)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => onAddToCart(book, qty)}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Add to cart
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
