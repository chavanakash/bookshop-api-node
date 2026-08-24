export default function FloatingAddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Add a book"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl text-white shadow-xl shadow-violet-500/40 transition hover:scale-105 active:scale-95"
    >
      +
    </button>
  );
}
