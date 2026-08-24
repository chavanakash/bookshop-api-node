import { useState } from "react";

const EMPTY_FORM = { title: "", desc: "", qty: "", price: "" };

export default function AddBookPanel({ open, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    try {
      await onSubmit({
        title: form.title.trim(),
        desc: form.desc.trim(),
        qty: form.qty === "" ? 0 : Number(form.qty),
        price: form.price === "" ? 0 : Number(form.price)
      });
      setForm(EMPTY_FORM);
    } catch {
      // parent already surfaces the error via a toast
    }
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
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform border-l border-slate-200 bg-white p-6 shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-950 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Add a book
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Title</span>
            <input
              value={form.title}
              onChange={e => update("title", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="The Name of the Wind"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Description</span>
            <textarea
              value={form.desc}
              onChange={e => update("desc", e.target.value)}
              rows={3}
              className="resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="A brief blurb…"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">Quantity</span>
              <input
                type="number"
                min="0"
                value={form.qty}
                onChange={e => update("qty", e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder="0"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => update("price", e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholder="0.00"
              />
            </label>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add to shelf"}
          </button>
        </form>
      </aside>
    </>
  );
}
