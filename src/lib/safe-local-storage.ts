/**
 * localStorage / sessionStorage that never throw (blocked storage, private mode, quota).
 * Reads return null and writes are skipped when storage is unavailable.
 */
function safeStorage(pick: () => Storage) {
  return {
    getItem(key: string): string | null {
      try {
        return pick().getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string): void {
      try {
        pick().setItem(key, value);
      } catch {
        // ignore
      }
    },
    removeItem(key: string): void {
      try {
        pick().removeItem(key);
      } catch {
        // ignore
      }
    },
  };
}

export const safeLocalStorage = safeStorage(() => window.localStorage);
export const safeSessionStorage = safeStorage(() => window.sessionStorage);
