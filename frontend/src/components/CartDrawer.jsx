import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils.js";

export default function CartDrawer({ open, onClose, items, removeItem, total }) {
  const navigate = useNavigate();

  function goToCheckout() {
    onClose();
    navigate("/checkout");
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm transform flex-col border-l border-slate-200 bg-white p-6 shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-950 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Your cart
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="flex-1 text-sm text-slate-500 dark:text-slate-400">
            Your cart is empty. Add a few books from the shop.
          </p>
        ) : (
          <ul className="flex-1 space-y-3 overflow-y-auto">
            {items.map(item => (
              <li
                key={item.bookId}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.qty} × {formatPrice(item.price)}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.bookId)}
                  className="text-xs font-medium text-rose-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
            <span className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              {formatPrice(total)}
            </span>
          </div>
          <button
            onClick={goToCheckout}
            disabled={items.length === 0}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proceed to checkout
          </button>
        </div>
      </aside>
    </>
  );
}
