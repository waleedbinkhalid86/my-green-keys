/**
 * Device-local kiosk UI state only. The real device credential is the httpOnly
 * mgk_kiosk cookie set by /api/kid-login/kiosk/setup, which JS cannot read.
 */
const KIOSK_DEVICE_KEY = "kioskDevice";
const KIOSK_CLASS_NAME_KEY = "kioskClassName";
const KIOSK_NEEDS_SETUP_KEY = "kioskNeedsSetup";
/** Pre-Stage-2 key: a bare class id that no longer works anywhere. */
const LEGACY_KIOSK_CLASS_ID_KEY = "kioskClassId";

export type KioskStorageState = {
  isKiosk: boolean;
  className: string | null;
  needsSetup: boolean;
};

/** Also migrates old tablets: a legacy class id is removed and flagged as needing setup. */
export function readKioskStateFromStorage(): KioskStorageState {
  const empty = { isKiosk: false, className: null, needsSetup: false };
  if (typeof window === "undefined") return empty;
  try {
    if (localStorage.getItem(LEGACY_KIOSK_CLASS_ID_KEY)) {
      localStorage.removeItem(LEGACY_KIOSK_CLASS_ID_KEY);
      if (!localStorage.getItem(KIOSK_DEVICE_KEY)) {
        localStorage.removeItem(KIOSK_CLASS_NAME_KEY);
        localStorage.setItem(KIOSK_NEEDS_SETUP_KEY, "1");
      }
    }
    return {
      isKiosk: localStorage.getItem(KIOSK_DEVICE_KEY) === "1",
      className: localStorage.getItem(KIOSK_CLASS_NAME_KEY),
      needsSetup: localStorage.getItem(KIOSK_NEEDS_SETUP_KEY) === "1",
    };
  } catch {
    return empty;
  }
}

export function writeKioskDeviceToStorage(className: string): void {
  try {
    localStorage.setItem(KIOSK_DEVICE_KEY, "1");
    localStorage.setItem(KIOSK_CLASS_NAME_KEY, className);
    localStorage.removeItem(KIOSK_NEEDS_SETUP_KEY);
  } catch {
    /* ignore */
  }
}

export function writeKioskClassNameToStorage(className: string): void {
  try {
    localStorage.setItem(KIOSK_CLASS_NAME_KEY, className);
  } catch {
    /* ignore */
  }
}

/** Device token was revoked or expired: stop acting as a kiosk and show the setup message. */
export function markKioskNeedsSetup(): void {
  try {
    localStorage.removeItem(KIOSK_DEVICE_KEY);
    localStorage.removeItem(KIOSK_CLASS_NAME_KEY);
    localStorage.setItem(KIOSK_NEEDS_SETUP_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearKioskFromStorage(): void {
  try {
    localStorage.removeItem(KIOSK_DEVICE_KEY);
    localStorage.removeItem(KIOSK_CLASS_NAME_KEY);
    localStorage.removeItem(KIOSK_NEEDS_SETUP_KEY);
    localStorage.removeItem(LEGACY_KIOSK_CLASS_ID_KEY);
  } catch {
    /* ignore */
  }
}

export function isKioskDevice(): boolean {
  return readKioskStateFromStorage().isKiosk;
}
