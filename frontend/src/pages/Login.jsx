import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="font-display mb-1 text-2xl font-semibold text-slate-900 dark:text-white">
        Welcome back
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Log in to buy books from the shop.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => update("email", e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Password</span>
          <input
            type="password"
            required
            value={form.password}
            onChange={e => update("password", e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        New here?{" "}
        <Link to="/signup" className="font-medium text-violet-600 hover:underline dark:text-violet-400">
          Create an account
        </Link>
      </p>
    </div>
  );
}
