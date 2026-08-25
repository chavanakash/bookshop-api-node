import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import Hero from "../components/Hero.jsx";
import BookCard from "../components/BookCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import AddBookPanel from "../components/AddBookPanel.jsx";
import FloatingAddButton from "../components/FloatingAddButton.jsx";

export default function Warehouse({ pushToast }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .list()
      .then(data => {
        if (!cancelled) setBooks(data);
      })
      .catch(err => {
        if (!cancelled) pushToast?.(err.message || "Could not load books.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pushToast]);

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
      pushToast?.(`"${saved.title}" added to the shelf.`);
      setPanelOpen(false);
    } catch (err) {
      pushToast?.(err.message || "Could not add that book.", "error");
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
      pushToast?.("Book removed.");
    } catch (err) {
      setBooks(previous);
      pushToast?.(err.message || "Could not remove that book.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
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
    </>
  );
}
