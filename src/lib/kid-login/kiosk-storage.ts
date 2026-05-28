/** Device-local class computer config (not auth — Supabase session only for login). */
export const KIOSK_CLASS_ID_KEY = "kioskClassId";
export const KIOSK_CLASS_NAME_KEY = "kioskClassName";

export function readKioskClassFromStorage(): {
  classId: string | null;
  className: string | null;
} {
  if (typeof window === "undefined") {
    return { classId: null, className: null };
  }
  try {
    return {
      classId: localStorage.getItem(KIOSK_CLASS_ID_KEY),
      className: localStorage.getItem(KIOSK_CLASS_NAME_KEY),
    };
  } catch {
    return { classId: null, className: null };
  }
}

export function writeKioskClassToStorage(classId: string, className: string): void {
  localStorage.setItem(KIOSK_CLASS_ID_KEY, classId);
  localStorage.setItem(KIOSK_CLASS_NAME_KEY, className);
}

export function clearKioskClassFromStorage(): void {
  localStorage.removeItem(KIOSK_CLASS_ID_KEY);
  localStorage.removeItem(KIOSK_CLASS_NAME_KEY);
}

export function isKioskDevice(): boolean {
  return !!readKioskClassFromStorage().classId;
}
