import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import Hero from "../components/Hero.jsx";
import ShopBookCard from "../components/ShopBookCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SkeletonGrid from "../components/SkeletonGrid.jsx";

export default function Storefront({ pushToast }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { addItem } = useCart();

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

  function handleAddToCart(book, qty) {
    addItem(book, qty);
    pushToast?.(`Added ${qty} × "${book.title}" to your cart.`);
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
              <ShopBookCard key={book._id} book={book} onAddToCart={handleAddToCart} />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
