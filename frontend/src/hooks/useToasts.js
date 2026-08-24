import { useCallback, useRef, useState } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback(id => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = "success") => {
      const id = ++counter.current;
      setToasts(current => [...current, { id, message, tone }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return { toasts, push, dismiss };
}
