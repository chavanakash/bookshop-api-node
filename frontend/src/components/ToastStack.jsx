export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-6 sm:items-end">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex max-w-sm animate-toast-in items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
            t.tone === "error"
              ? "border-rose-200 bg-rose-50/95 text-rose-700 dark:border-rose-900 dark:bg-rose-950/90 dark:text-rose-300"
              : "border-emerald-200 bg-emerald-50/95 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-300"
          }`}
        >
          <span>{t.tone === "error" ? "⚠️" : "✅"}</span>
          <span>{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-1 opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
