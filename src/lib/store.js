// localStorage helpers that never throw (private mode, blocked storage).
export const load = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
};
export const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
