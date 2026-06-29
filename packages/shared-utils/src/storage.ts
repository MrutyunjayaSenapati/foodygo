type StorageType = "localStorage" | "sessionStorage";

function getStorage(type: StorageType): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return type === "localStorage" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function getItem<T = string>(key: string, type: StorageType = "localStorage"): T | null {
  const storage = getStorage(type);
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem(key: string, value: unknown, type: StorageType = "localStorage"): void {
  const storage = getStorage(type);
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function removeItem(key: string, type: StorageType = "localStorage"): void {
  const storage = getStorage(type);
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Unavailable
  }
}

export function clear(type: StorageType = "localStorage"): void {
  const storage = getStorage(type);
  if (!storage) return;
  try {
    storage.clear();
  } catch {
    // Unavailable
  }
}

export const session = {
  get<T = string>(key: string) {
    return getItem<T>(key, "sessionStorage");
  },
  set(key: string, value: unknown) {
    setItem(key, value, "sessionStorage");
  },
  remove(key: string) {
    removeItem(key, "sessionStorage");
  },
  clear() {
    clear("sessionStorage");
  },
};
