/**
 * useGuestInfo
 * Persists { name, phone, email } for returning guests (90-day expiry).
 * Never stores CPF, payment data, or tokens.
 */

const KEY = 'pastita_guest_info';
const TTL_MS = 90 * 24 * 60 * 60 * 1000;

function read() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.expires_at || Date.now() > parsed.expires_at) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function save(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify({
      v: 1,
      expires_at: Date.now() + TTL_MS,
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
    }));
  } catch {
    // localStorage unavailable
  }
}

function clear() {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function readGuestInfoStatic() { return read(); }

export default function useGuestInfo() {
  return {
    readGuestInfo: () => read(),
    saveGuestInfo: (data) => save(data),
    clearGuestInfo: () => clear(),
  };
}
