// localStorage wrapper for demo persistence

const STORAGE_PREFIX = 'recruiter_ai_';

export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) return JSON.parse(stored) as T;
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function removeStoredData(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
}

export function clearAllStoredData(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

