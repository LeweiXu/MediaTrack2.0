const BASE = 'http://localhost:6443';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export const getEntries = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return req(`/entries${qs ? '?' + qs : ''}`);
};

export const getEntry   = (id)       => req(`/entries/${id}`);
export const createEntry = (data)    => req('/entries', { method: 'POST', body: JSON.stringify(data) });
export const updateEntry = (id, data)=> req(`/entries/${id}`, { method: 'PUT',  body: JSON.stringify(data) });
export const deleteEntry = (id)      => req(`/entries/${id}`, { method: 'DELETE' });

export const searchMedia = (title, medium = '') => {
  const qs = new URLSearchParams({ title, ...(medium && { medium }) }).toString();
  return req(`/search?${qs}`);
};

export const getStats = () => req('/stats');
