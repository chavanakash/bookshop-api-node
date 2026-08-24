const BASE = "/api/book";

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body && body.error) message = body.error;
    } catch {
      // response had no JSON body; keep the generic message
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  list: () => fetch(`${BASE}/list`).then(handle),
  add: book =>
    fetch(`${BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book)
    }).then(handle),
  remove: id => fetch(`${BASE}/delete/${id}`, { method: "DELETE" }).then(handle)
};
