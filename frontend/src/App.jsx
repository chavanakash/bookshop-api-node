import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import { useToasts } from "./hooks/useToasts.js";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import BookCard from "./components/BookCard.jsx";
import EmptyState from "./components/EmptyState.jsx";
import SkeletonGrid from "./components/SkeletonGrid.jsx";
import AddBookPanel from "./components/AddBookPanel.jsx";
import ToastStack from "./components/ToastStack.jsx";
import FloatingAddButton from "./components/FloatingAddButton.jsx";

function getInitialTheme() {
  const stored = window.localStorage.getItem("booknook-theme");
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const { toasts, push, dismiss } = useToasts();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("booknook-theme", theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    api
      .list()
      .then(data => {
        if (!cancelled) setBooks(data);
      })
      .catch(err => {
        if (!cancelled) push(err.message || "Could not load books.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [push]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      b => b.title?.toLowerCase().includes(q) || b.desc?.toLowerCase().includes(q)
    );
  }, [books, query]);

  async function handleAdd(payload) {
    setSubmitting(true);
    try {
      const saved = await api.add(payload);
      setBooks(current => [saved, ...current]);
      push(`"${saved.title}" added to the shelf.`);
      setPanelOpen(false);
    } catch (err) {
      push(err.message || "Could not add that book.", "error");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const previous = books;
    setDeletingId(id);
    setBooks(current => current.filter(b => b._id !== id));
    try {
      await api.remove(id);
      push("Book removed.");
    } catch (err) {
      setBooks(previous);
      push(err.message || "Could not remove that book.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <Header
        count={books.length}
        theme={theme}
        onToggleTheme={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
      />
      <Hero query={query} onQueryChange={setQuery} />

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState hasQuery={query.trim().length > 0} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(book => (
              <BookCard
                key={book._id}
                book={book}
                onDelete={handleDelete}
                deleting={deletingId === book._id}
              />
            ))}
          </ul>
        )}
      </main>

      <FloatingAddButton onClick={() => setPanelOpen(true)} />
      <AddBookPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSubmit={handleAdd}
        submitting={submitting}
      />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
