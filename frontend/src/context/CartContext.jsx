import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

function readStored() {
  try {
    const raw = window.localStorage.getItem("booknook-cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStored);

  useEffect(() => {
    window.localStorage.setItem("booknook-cart", JSON.stringify(items));
  }, [items]);

  function addItem(book, qty) {
    setItems(current => {
      const existing = current.find(i => i.bookId === book._id);
      if (existing) {
        return current.map(i =>
          i.bookId === book._id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...current,
        { bookId: book._id, title: book.title, price: book.price, qty }
      ];
    });
  }

  function removeItem(bookId) {
    setItems(current => current.filter(i => i.bookId !== bookId));
  }

  function clear() {
    setItems([]);
  }

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
