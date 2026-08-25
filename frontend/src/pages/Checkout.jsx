import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { orderApi } from "../api.js";
import { formatPrice } from "../utils.js";

const EMPTY_CARD = { cardNumber: "", expiry: "", cvv: "", name: "" };

export default function Checkout({ pushToast }) {
  const { isAuthenticated, token } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [card, setCard] = useState(EMPTY_CARD);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (items.length === 0 && !receipt) return <Navigate to="/" replace />;

  function update(field, value) {
    setCard(current => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const order = await orderApi.checkout(
        {
          items: items.map(i => ({ bookId: i.bookId, title: i.title, qty: i.qty })),
          payment: { cardNumber: card.cardNumber.replace(/\s+/g, "") }
        },
        token
      );
      setReceipt(order);
      clear();
      pushToast?.("Payment successful — thanks for your order!");
    } catch (err) {
      setError(err.message || "Payment could not be completed.");
      pushToast?.(err.message || "Payment failed.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <span className="text-4xl">✅</span>
        <h1 className="font-display mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
          Order confirmed
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Transaction {receipt.payment?.transactionId} · {formatPrice(receipt.total)}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90"
        >
          Back to the shop
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
        Checkout
      </h1>

      <ul className="mb-6 space-y-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
        {items.map(item => (
          <li key={item.bookId} className="flex justify-between text-sm">
            <span className="text-slate-700 dark:text-slate-300">
              {item.title} × {item.qty}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {formatPrice(item.price * item.qty)}
            </span>
          </li>
        ))}
        <li className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </li>
      </ul>

      <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
        This is a dummy payment form — no real card is charged. Use any card number, or one
        ending in <span className="font-mono">0002</span> to see a simulated decline.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Name on card</span>
          <input
            required
            value={card.name}
            onChange={e => update("name", e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Card number</span>
          <input
            required
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            value={card.cardNumber}
            onChange={e => update("cardNumber", e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Expiry</span>
            <input
              required
              placeholder="MM/YY"
              value={card.expiry}
              onChange={e => update("expiry", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">CVV</span>
            <input
              required
              inputMode="numeric"
              placeholder="123"
              value={card.cvv}
              onChange={e => update("cvv", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Processing…" : `Pay ${formatPrice(total)}`}
        </button>
      </form>
    </div>
  );
}
