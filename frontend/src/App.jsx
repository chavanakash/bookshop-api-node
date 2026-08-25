import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider, useCart } from "./context/CartContext.jsx";
import { useToasts } from "./hooks/useToasts.js";
import Header from "./components/Header.jsx";
import ToastStack from "./components/ToastStack.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Storefront from "./pages/Storefront.jsx";
import Warehouse from "./pages/Warehouse.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Checkout from "./pages/Checkout.jsx";

function getInitialTheme() {
  const stored = window.localStorage.getItem("booknook-theme");
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function Shell() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [cartOpen, setCartOpen] = useState(false);
  const { toasts, push, dismiss } = useToasts();
  const cart = useCart();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("booknook-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
        cartCount={cart.count}
        onOpenCart={() => setCartOpen(true)}
      />

      <Routes>
        <Route path="/" element={<Storefront pushToast={push} />} />
        <Route path="/warehouse" element={<Warehouse pushToast={push} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<Checkout pushToast={push} />} />
      </Routes>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        removeItem={cart.removeItem}
        total={cart.total}
      />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Shell />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
