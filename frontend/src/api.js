const ROOT = "/api";

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

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  list: () => fetch(`${ROOT}/book/list`).then(handle),
  add: book =>
    fetch(`${ROOT}/book/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book)
    }).then(handle),
  remove: id => fetch(`${ROOT}/book/delete/${id}`, { method: "DELETE" }).then(handle)
};

export const authApi = {
  signup: data =>
    fetch(`${ROOT}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handle),
  login: data =>
    fetch(`${ROOT}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handle)
};

export const orderApi = {
  checkout: (payload, token) =>
    fetch(`${ROOT}/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(payload)
    }).then(handle),
  mine: token => fetch(`${ROOT}/orders/mine`, { headers: authHeaders(token) }).then(handle)
};
